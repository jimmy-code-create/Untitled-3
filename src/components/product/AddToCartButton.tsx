"use client";

import { ShoppingBag } from "lucide-react";
import { computeBreakup } from "@/lib/pricing";
import { rateKey } from "@/lib/pricing";
import { useLiveRates } from "@/components/providers/LiveRatesProvider";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { useLang } from "@/components/providers/LangProvider";
import { cn } from "@/lib/utils";
import type { ProductView } from "@/lib/repo";

/**
 * Adds the line at the price the customer is looking at (live rate, current
 * weight). The server re-quotes the line in /api/cart/quote and /api/orders,
 * so a stale browser price never becomes an order price.
 */
export function AddToCartButton({
  product,
  size,
  className,
  label,
}: {
  product: ProductView;
  size?: string;
  className?: string;
  label?: string;
}) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const live = useLiveRates();
  const { t } = useLang();

  const onClick = () => {
    const breakup = computeBreakup(
      {
        metal: product.metal,
        purity: product.purity,
        weight: product.weight,
        gemstoneValue: product.gemstoneValue,
        makingPct: product.makingPct,
      },
      live.rates,
    );
    add({
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: breakup.total,
      size: size ?? product.sizes[0] ?? "Free size",
      quantity: 1,
      metal: product.metal,
      purity: product.purity,
      weight: product.weight,
      rateSnapshotId: typeof live.rates[rateKey(product.metal, product.purity)] === "number" ? `live-${live.updatedAt}` : undefined,
    });
    push(`${product.name} added to your bag`);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-white/15 bg-white/[0.04] px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:border-white/40 hover:bg-white hover:text-black",
        className,
      )}
      aria-label={`Add ${product.name} to cart`}
    >
      <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
      {label ?? t("product.addToCart")}
    </button>
  );
}
