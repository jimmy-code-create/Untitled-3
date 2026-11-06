import { getProduct } from "@/lib/repo";
import { SHOP, fullAddress } from "@/lib/utils";

export const runtime = "nodejs";

const esc = (s: string) =>
  s
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

function buildPdf(lines: { text: string; size: number; y: number; bold?: boolean; color?: string }[]) {
  const content = lines
    .map(
      (l) =>
        `BT /${l.bold ? "F1" : "F2"} ${l.size} Tf ${l.color ?? "0.08 0.07 0.17"} rg 60 ${l.y} Td (${esc(l.text)}) Tj ET`,
    )
    .join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return new Response("Not found", { status: 404 });

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const lines = [
    { text: "JMD GEMS & JEWELLERY", size: 20, y: 760, bold: true },
    { text: "Jagdamba Market, Mohan Nagar, Hindaun - 322230, Rajasthan", size: 9, y: 742 },
    { text: "Phone: +91 7891384376 / +91 6377419074", size: 9, y: 728 },
    { text: "CERTIFICATE OF AUTHENTICITY", size: 14, y: 660, bold: true },
    { text: "------------------------------------------------------------", size: 10, y: 640 },
    { text: `Product: ${product.name}`, size: 12, y: 600, bold: true },
    { text: `Certificate No: ${product.certificateNo}`, size: 11, y: 578 },
    { text: `Metal & Purity: ${product.purity} ${product.metal}`, size: 11, y: 558 },
    { text: `Gross Weight: ${product.weight} grams`, size: 11, y: 538 },
    {
      text: `Gemstone: ${(product.gemstoneSlug ?? "None").toUpperCase()}${
        product.gemstoneCarats ? ` - ${product.gemstoneCarats} carat` : ""
      }`,
      size: 11,
      y: 518,
    },
    { text: `Making Charges: ${product.makingPct}% of metal value`, size: 11, y: 498 },
    { text: `Certifications: ${product.certifications.join(", ")}`, size: 11, y: 478 },
    { text: "------------------------------------------------------------", size: 10, y: 450 },
    { text: "This certifies that the above article has been examined and found", size: 10, y: 415 },
    { text: "to conform to the stated purity and gemstone specifications.", size: 10, y: 400 },
    { text: "Hallmarking as per BIS standards. Gemstone certification by IGI/GIA.", size: 10, y: 385 },
    { text: `Issued on: ${today}`, size: 10, y: 340 },
    { text: "Authorised Signatory", size: 10, y: 300, bold: true },
    { text: "JMD Gems & Jewellery", size: 9, y: 285 },
    { text: `${SHOP.name} · ${fullAddress}`, size: 8, y: 90, color: "0.45 0.4 0.36" },
    { text: "This is a computer generated certificate. Verify at the store with the certificate number.", size: 8, y: 76, color: "0.45 0.4 0.36" },
  ];

  const pdf = buildPdf(lines);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="JMD-${product.slug}-certificate.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
