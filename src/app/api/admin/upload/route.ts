import fs from "fs/promises";
import path from "path";
import { fail, ok, requireAdmin } from "@/lib/api";

export const runtime = "nodejs";

async function cloudinaryUpload(buffer: Buffer, filename: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;

  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "jmd-gems",
        public_id: filename.replace(/\.[^.]+$/, ""),
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload failed"));
        else resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorised", 401);

  const form = await req.formData().catch(() => null);
  if (!form) return fail("Expected multipart form data", 400);

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return fail("No files provided", 400);

  const urls: string[] = [];
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) return fail(`${file.name} is larger than 8MB`, 413);
    const isImage = /^image\/(jpeg|png|webp|avif)$/.test(file.type);
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) return fail(`${file.name} must be a JPEG/PNG/WebP image or a PDF`, 415);

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

    const cloudUrl = await cloudinaryUpload(buffer, safeName).catch(() => null);
    if (cloudUrl) {
      urls.push(cloudUrl);
      continue;
    }

    // Local fallback for development when Cloudinary is not configured.
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, safeName), buffer);
    urls.push(`/uploads/${safeName}`);
  }

  return ok({ urls });
}
