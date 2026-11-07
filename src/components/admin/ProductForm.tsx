"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { categories, gemstones } from "@/lib/catalog";
import type { ProductView } from "@/lib/repo";
import { useToast } from "@/store/toast";
import { cn, slugify } from "@/lib/utils";
import type { MetalKind } from "@/lib/pricing";

const METALS = ["GOLD", "SILVER", "DIAMOND", "GEMSTONE"];
const COLORS = ["YELLOW", "WHITE", "ROSE"];
const PURITIES = ["24K", "22K", "18K", "92.5", "99.9"];
const COLLECTIONS = ["gold", "silver", "diamond", "gemstones", "bridal", "gifting"];
const OCCASIONS = ["wedding", "karwa-chauth", "diwali", "akshaya-tritiya", "gifting"];

export function ProductForm({ initial }: { initial?: ProductView }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [certificateUrl, setCertificateUrl] = useState(initial?.certificateUrl ?? "");
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameHi: initial?.nameHi ?? "",
    slug: initial?.slug ?? "",
    subtitle: initial?.subtitle ?? "",
    description: initial?.description ?? "",
    story: initial?.story ?? "",
    metal: initial?.metal ?? "GOLD",
    metalColor: initial?.metalColor ?? "YELLOW",
    purity: initial?.purity ?? "22K",
    weight: initial?.weight ?? 10,
    gemstoneValue: initial?.gemstoneValue ?? 0,
    gemstoneCarats: initial?.gemstoneCarats ?? 0,
    gemstoneSlug: initial?.gemstoneSlug ?? "",
    makingPct: initial?.makingPct ?? 12,
    category: initial?.category ?? "necklace",
    collections: initial?.collections ?? ["gold"],
    occasions: initial?.occasions ?? [],
    sizes: initial?.sizes?.join(", ") ?? "Free size",
    badges: initial?.badges?.join(", ") ?? "",
    certifications: initial?.certifications?.join(", ") ?? "BIS Hallmark",
    certificateNo: initial?.certificateNo ?? "",
    stock: initial?.stock ?? 5,
    featured: initial?.featured ?? false,
    isNew: initial?.isNew ?? true,
    bestseller: initial?.bestseller ?? false,
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const upload = async (files: FileList | null, kind: "image" | "certificate") => {
    if (!files?.length) return;
    setUploading(true);
    const body = new FormData();
    Array.from(files).forEach((f) => body.append("files", f));
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      if (kind === "image") setImages((prev) => [...prev, ...data.urls]);
      else {
        setCertificateUrl(data.urls[0]);
        push("Certificate uploaded", "Attached to this product.");
      }
    } catch (error) {
      push("Upload failed", (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      push("Missing details", "Name and description are required.");
      return;
    }
    if (images.length === 0) {
      push("Add an image", "At least one product photo is needed.");
      return;
    }
    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const payload = {
      ...form,
      slug,
      images,
      certificateUrl,
      weight: Number(form.weight),
      gemstoneValue: Number(form.gemstoneValue),
      gemstoneCarats: Number(form.gemstoneCarats) || undefined,
      makingPct: Number(form.makingPct),
      stock: Number(form.stock),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      badges: form.badges.split(",").map((s) => s.trim()).filter(Boolean),
      certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
      gemstoneSlug: form.gemstoneSlug || undefined,
    };

    const res = await fetch(initial ? `/api/products/${initial.slug}` : "/api/products", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!data.ok) {
      push("Could not save", data.error);
      return;
    }
    push(initial ? "Product updated" : "Product added", form.name);
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        <div className="border border-copper/20 bg-white/[0.04] p-5">
          <h2 className="mb-4 font-serif text-xl text-white">Basic details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="label mb-1.5 block">Product name</span>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className="field" required />
            </label>
            <label>
              <span className="label mb-1.5 block">Name (Hindi)</span>
              <input value={form.nameHi} onChange={(e) => update("nameHi", e.target.value)} className="field font-hindi" />
            </label>
            <label>
              <span className="label mb-1.5 block">URL slug</span>
              <input
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                placeholder={slugify(form.name)}
                className="field"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="label mb-1.5 block">Short line</span>
              <input value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} className="field" />
            </label>
            <label className="sm:col-span-2">
              <span className="label mb-1.5 block">Description</span>
              <textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} className="field resize-none" required />
            </label>
            <label className="sm:col-span-2">
              <span className="label mb-1.5 block">The story</span>
              <textarea rows={2} value={form.story} onChange={(e) => update("story", e.target.value)} className="field resize-none" />
            </label>
          </div>
        </div>

        <div className="border border-copper/20 bg-white/[0.04] p-5">
          <h2 className="mb-4 font-serif text-xl text-white">Metal & making</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label>
              <span className="label mb-1.5 block">Metal</span>
              <select value={form.metal} onChange={(e) => update("metal", e.target.value as MetalKind)} className="field">
                {METALS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label mb-1.5 block">Colour</span>
              <select
                value={form.metalColor}
                onChange={(e) => update("metalColor", e.target.value as "YELLOW" | "WHITE" | "ROSE")}
                className="field"
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label mb-1.5 block">Purity</span>
              <select value={form.purity} onChange={(e) => update("purity", e.target.value)} className="field">
                {PURITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label mb-1.5 block">Weight (g)</span>
              <input type="number" step="0.1" value={form.weight} onChange={(e) => update("weight", Number(e.target.value))} className="field" />
            </label>
            <label>
              <span className="label mb-1.5 block">Making charges (%)</span>
              <input type="number" step="0.5" value={form.makingPct} onChange={(e) => update("makingPct", Number(e.target.value))} className="field" />
            </label>
            <label>
              <span className="label mb-1.5 block">Stock</span>
              <input type="number" value={form.stock} onChange={(e) => update("stock", Number(e.target.value))} className="field" />
            </label>
            <label>
              <span className="label mb-1.5 block">Gemstone</span>
              <select value={form.gemstoneSlug} onChange={(e) => update("gemstoneSlug", e.target.value)} className="field">
                <option value="">None</option>
                <option value="diamond">Diamond</option>
                {gemstones.map((g) => (
                  <option key={g.slug} value={g.slug}>{g.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label mb-1.5 block">Gemstone value (₹)</span>
              <input type="number" value={form.gemstoneValue} onChange={(e) => update("gemstoneValue", Number(e.target.value))} className="field" />
            </label>
            <label>
              <span className="label mb-1.5 block">Carats</span>
              <input type="number" step="0.01" value={form.gemstoneCarats} onChange={(e) => update("gemstoneCarats", Number(e.target.value))} className="field" />
            </label>
          </div>
        </div>

        <div className="border border-copper/20 bg-white/[0.04] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl text-white">Photos</h2>
            <label className="btn-outline cursor-pointer px-3 py-2 text-[9px]">
              <ImagePlus className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files, "image")} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((img, i) => (
              <div key={img + i} className="group relative aspect-[4/5] overflow-hidden bg-ivorydim">
                <Image src={img} alt="" fill sizes="120px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-black/80 text-ruby opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="grid aspect-[4/5] cursor-pointer place-items-center border border-dashed border-copper/40 text-copper-dark hover:bg-copper/5">
              <ImagePlus className="h-5 w-5" />
              <input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files, "image")} />
            </label>
          </div>
          <p className="mt-2 text-[10px] text-stone">First photo is used as the main image. WebP/JPEG up to 8MB each.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="border border-copper/20 bg-white/[0.04] p-5">
          <h2 className="mb-4 font-serif text-xl text-white">Placement</h2>
          <label className="mb-3 block">
            <span className="label mb-1.5 block">Category</span>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className="field">
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>
          <p className="label mb-2">Collections</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {COLLECTIONS.map((c) => {
              const active = form.collections.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    update("collections", active ? form.collections.filter((x) => x !== c) : [...form.collections, c])
                  }
                  className={cn(
                    "border px-2.5 py-1 text-[9.5px] uppercase tracking-wider",
                    active ? "border-copper bg-copper text-white" : "border-copper/30 text-charcoal/60",
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <p className="label mb-2">Occasions</p>
          <div className="flex flex-wrap gap-1.5">
            {OCCASIONS.map((o) => {
              const active = form.occasions.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => update("occasions", active ? form.occasions.filter((x) => x !== o) : [...form.occasions, o])}
                  className={cn(
                    "border px-2.5 py-1 text-[9.5px] uppercase tracking-wider",
                    active ? "border-copper bg-copper text-white" : "border-copper/30 text-charcoal/60",
                  )}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-copper/20 bg-white/[0.04] p-5">
          <h2 className="mb-4 font-serif text-xl text-white">Sizes & badges</h2>
          <label className="mb-3 block">
            <span className="label mb-1.5 block">Sizes (comma separated)</span>
            <input value={form.sizes} onChange={(e) => update("sizes", e.target.value)} className="field" />
          </label>
          <label className="mb-3 block">
            <span className="label mb-1.5 block">Badges</span>
            <input value={form.badges} onChange={(e) => update("badges", e.target.value)} className="field" placeholder="Bestseller, New…" />
          </label>
          <label className="block">
            <span className="label mb-1.5 block">Certifications</span>
            <input value={form.certifications} onChange={(e) => update("certifications", e.target.value)} className="field" />
          </label>
          <label className="mt-3 block">
            <span className="label mb-1.5 block">Certificate number</span>
            <input value={form.certificateNo} onChange={(e) => update("certificateNo", e.target.value)} className="field" />
          </label>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-[10.5px] text-stone">
            <Upload className="h-3.5 w-3.5" /> Upload certificate PDF / image
            <input type="file" accept="application/pdf,image/*" hidden onChange={(e) => upload(e.target.files, "certificate")} />
          </label>
          {certificateUrl && (
            <a href={certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-[10px] text-copper-dark underline">
              {certificateUrl}
            </a>
          )}
        </div>

        <div className="border border-copper/20 bg-white/[0.04] p-5">
          <h2 className="mb-3 font-serif text-xl text-white">Merchandising</h2>
          {[
            { key: "featured" as const, label: "Feature on home page" },
            { key: "isNew" as const, label: "Mark as new" },
            { key: "bestseller" as const, label: "Mark as bestseller" },
          ].map((f) => (
            <label key={f.key} className="mb-2 flex items-center gap-2 text-[11px] text-charcoal/75">
              <input
                type="checkbox"
                checked={form[f.key]}
                onChange={(e) => update(f.key, e.target.checked)}
                className="accent-[#C98B6B]"
              />
              {f.label}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={saving || uploading} className="btn-copper flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : initial ? "Save changes" : "Add product"}
          </button>
          <Link href="/admin/products" className="btn-outline px-4">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
