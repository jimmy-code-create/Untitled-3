"use client";

import Link from "next/link";
import { IconHeart } from "@/components/icons/JmdIcons";
import { useWishlist } from "@/store/cart";
import type { ProductView } from "@/lib/repo";
import { inr } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { ImageSlot } from "@/components/ui/ImageSlot";

/**
 * Product card: 4:5 photo, 1.04 zoom on hover at 300ms, flat square controls.
 * The struck-through "MRP" and the "-18% off" badge were fabricated — a shop
 * that prices by weight does not run a permanent discount — so both are gone.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductView;
  onQuickView?: (p: ProductView) => void;
  priority?: boolean;
  className?: string;
}) {
  const wishlist = useWishlist();
  const saved = wishlist.items.some((i) => i.slug === product.slug);
  const festive = product.badges.find((b) => /festiv|diwali|akshaya|karwa/i.test(b));

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <ImageSlot
            src={product.images[0]}
            alt={`${product.name} — ${product.purity} ${product.metal.toLowerCase()}, ${product.weight} grams`}
            ratio="product"
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        </Link>

        {festive ? (
          <span className="absolute left-2 top-2 rounded-control bg-gold-light px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-burgundy-dark">
            {festive}
          </span>
        ) : null}

        <button
          type="button"
          onClick={() =>
            wishlist.toggle({
              slug: product.slug,
              name: product.name,
              image: product.images[0],
              price: product.price,
              metal: product.metal,
            })
          }
          aria-label={saved ? `Remove ${product.name} from saved pieces` : `Save ${product.name}`}
          aria-pressed={saved}
          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full border border-burgundy/10 bg-white/95 text-burgundy shadow-sm hover:border-burgundy/30"
        >
          <IconHeart size={18} className={cn(saved && "fill-burgundy")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="text-20 leading-tight text-navy">
          <Link href={`/products/${product.slug}`} className="hover:text-copper-dark">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-12 uppercase tracking-label text-stone">
          {product.purity} {product.metal === "SILVER" ? "silver" : product.metal.toLowerCase()} · {product.weight} g
          {product.gemstoneSlug && product.gemstoneSlug !== "diamond"
            ? ` · ${product.gemstoneSlug.replace("-", " ")}`
            : ""}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="text-16 text-navy">{inr(product.price)}</p>
          <p className="text-12 text-stone">{product.inStock ? "At the counter" : "Made to order"}</p>
        </div>
      </div>
    </article>
  );
}
