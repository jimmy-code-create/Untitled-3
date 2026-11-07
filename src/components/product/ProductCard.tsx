"use client";

import Link from "next/link";
import { IconHeart } from "@/components/icons/JmdIcons";
import { useWishlist } from "@/store/cart";
import type { ProductView } from "@/lib/repo";
import { LivePrice } from "@/components/rates/LivePrice";
import { AddToCartButton } from "./AddToCartButton";
import { cn } from "@/lib/utils";
import { ImageSlot } from "@/components/ui/ImageSlot";

/**
 * Catalogue card.
 *
 * Dense two-up mobile grid: 4:5 photo, honest certificate badge (never a
 * "bestseller" or "COD" claim we cannot prove), wishlist heart, two-line name,
 * the live price with the previous-rate price struck through, the per-gram
 * move, a real low-stock line taken from inventory, and add-to-cart.
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
  const badge = product.certifications[0] ?? null;
  const lowStock = product.stock > 0 && product.stock <= 2;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative overflow-hidden bg-peach/40">
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

        {badge ? (
          <span className="absolute left-0 top-2 bg-burgundy px-2 py-1 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-cream">
            {badge}
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
          className="absolute right-1.5 top-1.5 grid h-11 w-11 place-items-center rounded-full text-burgundy transition-colors hover:text-burgundy-dark"
        >
          <IconHeart size={19} className={cn(saved && "fill-burgundy")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-2.5">
        <h3 className="line-clamp-2 text-[13.5px] leading-snug text-ink">
          <Link href={`/products/${product.slug}`} className="hover:text-burgundy">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-bodygrey">
          {product.purity} {product.metal === "SILVER" ? "silver" : product.metal.toLowerCase()} · {product.weight} g
          {product.gemstoneSlug && product.gemstoneSlug !== "diamond"
            ? ` · ${product.gemstoneSlug.replace("-", " ")}`
            : ""}
        </p>

        <LivePrice
          metal={product.metal}
          purity={product.purity}
          weight={product.weight}
          makingPct={product.makingPct}
          gemstoneValue={product.gemstoneValue}
          size="sm"
          className="mt-2"
        />

        {lowStock ? (
          <p className="mt-2 bg-gold-light/35 py-1 text-center text-[9.5px] uppercase tracking-[0.14em] text-gold-dark">
            Only {product.stock} left
          </p>
        ) : null}

        <div className="mt-auto pt-2.5">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
