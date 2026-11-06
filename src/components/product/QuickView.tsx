"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import type { ProductView } from "@/lib/repo";
import { inr } from "@/lib/pricing";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { cn, waLink } from "@/lib/utils";

export function QuickView({ product, onClose }: { product: ProductView | null; onClose: () => void }) {
  const [size, setSize] = useState<string>(product?.sizes[0] ?? "Free size");
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-end justify-center bg-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="relative grid w-full max-w-3xl grid-cols-1 overflow-hidden bg-ivory shadow-card sm:grid-cols-2"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-charcoal hover:text-copper-dark"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative aspect-[4/5] bg-ivorydim sm:aspect-auto">
              <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 100vw, 380px" className="object-cover" />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <p className="label mb-2">
                {product.purity} {product.metal === "SILVER" ? "Silver" : product.metal.toLowerCase()}
              </p>
              <h3 className="font-serif text-3xl text-navy">{product.name}</h3>
              <p className="mt-1 font-hindi text-[12px] text-stone">{product.nameHi}</p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-stone">{product.subtitle}</p>

              <div className="mt-5 flex items-end gap-3">
                <span className="font-serif text-2xl text-navy">{inr(product.price)}</span>
                <span className="pb-1 text-[11px] text-stone line-through">{inr(product.mrp)}</span>
              </div>
              <p className="mt-1 text-[10px] text-stone">Inclusive of 3% GST · {product.weight} g</p>

              {product.sizes.length > 1 && (
                <div className="mt-5">
                  <p className="label mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={cn(
                          "border px-3 py-1.5 text-[11px] transition-colors",
                          size === s
                            ? "border-copper bg-copper text-white"
                            : "border-copper/30 text-charcoal/70 hover:border-copper",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    add({
                      slug: product.slug,
                      name: product.name,
                      image: product.images[0],
                      price: product.price,
                      size,
                      quantity: 1,
                      metal: product.metal,
                      purity: product.purity,
                      weight: product.weight,
                    });
                    push("Added to cart", product.name);
                    onClose();
                  }}
                  className="btn-copper w-full"
                >
                  Add to cart
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/products/${product.slug}`} className="btn-outline text-[10px]">
                    Full details <ArrowRight className="h-3 w-3" />
                  </Link>
                  <a
                    href={waLink(`Namaste! I'm interested in *${product.name}* (${inr(product.price)}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp text-[10px]"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
