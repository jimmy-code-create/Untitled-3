"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Heart,
  Phone,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useLiveRates } from "@/components/providers/LiveRatesProvider";
import { useWishlist } from "@/store/cart";
import {
  approxPrice,
  catalogueProducts,
  categoryCounts,
  enquiryMessage,
  occasions,
  purities,
  weightBounds,
  type CatalogueProduct,
} from "@/lib/catalogue";
import { CATALOGUE_FLAGS, DESIGN_REFERENCE_NOTE, LIVE_PRICE_NOTE, PRICE_NOTE } from "@/lib/catalogue-config";
import { inr } from "@/lib/pricing";
import { SHOP, cn, telLink, waLink } from "@/lib/utils";

/**
 * Catalogue browser.
 *
 * Two columns on a phone (minmax(0,1fr) so nothing can push the page wider),
 * 24 pieces at a time with an IntersectionObserver that also has a button for
 * slower connections. Every figure on screen is real: the count is the number
 * of files behind the catalogue, prices only appear when the sheet has a
 * weight, and nothing is badged as hallmark or scarce unless the shop turns
 * those flags on.
 */

const PAGE_SIZE = 24;

type SortKey = "featured" | "code" | "weight";

function rateOf(product: CatalogueProduct, rates: Record<string, number>) {
  return approxPrice(product, rates);
}

function Card({
  product,
  onOpen,
  priority = false,
}: {
  product: CatalogueProduct;
  onOpen: (product: CatalogueProduct) => void;
  priority?: boolean;
}) {
  const live = useLiveRates();
  const wishlist = useWishlist();
  const [loaded, setLoaded] = useState(false);
  const price = rateOf(product, live.rates);
  const saved = wishlist.items.some((item) => item.slug === product.code);
  const showHallmark = CATALOGUE_FLAGS.showHallmark || Boolean(product.hallmark);
  const showScarcity = CATALOGUE_FLAGS.showScarcity && typeof product.scarcity === "number";

  return (
    <article className="flex min-w-0 flex-col">
      <div className="relative w-full overflow-hidden rounded-photo border border-white/10 bg-blush">
        <button
          type="button"
          onClick={() => onOpen(product)}
          className="group relative block aspect-[4/5] w-full overflow-hidden"
          aria-label={`Open ${product.name}`}
        >
          {!loaded ? <span className="skeleton absolute inset-0 block" aria-hidden /> : null}
          <Image
            src={product.thumb}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            priority={priority}
            placeholder="blur"
            blurDataURL={product.blur}
            onLoad={() => setLoaded(true)}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        </button>

        <button
          type="button"
          onClick={() =>
            wishlist.toggle({
              slug: product.code,
              name: product.name,
              image: product.thumb,
              price: price ?? 0,
              metal: product.metal,
            })
          }
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from saved pieces` : `Save ${product.name}`}
          className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-burgundy shadow-sm backdrop-blur transition-colors hover:bg-white/[0.04]"
        >
          <Heart className={cn("h-[18px] w-[18px]", saved && "fill-burgundy")} strokeWidth={1.5} />
        </button>

        {showHallmark ? (
          <span className="absolute left-0 top-2 bg-white px-2 py-1 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-black">
            BIS Hallmark
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col pt-2.5">
        <h3 className="line-clamp-2 break-words text-[13px] leading-snug text-ink">{product.name}</h3>
        <p className="mt-0.5 break-words text-[10px] uppercase tracking-[0.1em] text-bodygrey">
          {product.code}
          {product.hasWeight && product.weightG ? ` · ${product.purity} · ${product.weightG} g` : ` · ${product.purity}`}
        </p>

        <div className="mt-1.5 min-w-0">
          {price ? (
            <>
              <p className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">Approx. price</p>
              <p className="rate-digits break-words text-[15px] font-semibold leading-tight text-ink">{inr(price)}</p>
              <p className="text-[9px] text-bodygrey">{LIVE_PRICE_NOTE}</p>
            </>
          ) : (
            <p className="text-[12px] font-medium text-ink">Price on request</p>
          )}
        </div>

        {showScarcity ? (
          <p className="mt-1 bg-gold-light/35 py-1 text-center text-[9px] uppercase tracking-[0.12em] text-gold-dark">
            Only {product.scarcity} left
          </p>
        ) : null}

        <p className="mt-1 text-[9px] leading-snug text-bodygrey/90">{DESIGN_REFERENCE_NOTE}</p>

        <a
          href={waLink(enquiryMessage(product, price))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-control border border-burgundy px-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-burgundy transition-colors hover:bg-white hover:text-black"
        >
          Enquire on WhatsApp
        </a>
      </div>
    </article>
  );
}

function ProductSheet({
  product,
  onClose,
  onSelect,
}: {
  product: CatalogueProduct;
  onClose: () => void;
  onSelect: (product: CatalogueProduct) => void;
}) {
  const live = useLiveRates();
  const price = rateOf(product, live.rates);
  const similar = useMemo(
    () =>
      catalogueProducts
        .filter((item) => item.category === product.category && item.code !== product.code)
        .slice(0, 8),
    [product],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={product.name}>
      <button type="button" aria-label="Close details" onClick={onClose} className="absolute inset-0 bg-ink/55 backdrop-blur-sm" />

      <div className="relative flex max-h-[92svh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[20px] bg-black shadow-popup sm:max-h-[88vh] sm:rounded-card">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-ink">{product.name}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-bodygrey">
              {product.code} · {product.purity}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-burgundy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto bg-blush/50">
            <div className="relative aspect-[4/5] w-full shrink-0 snap-center">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 520px"
                placeholder="blur"
                blurDataURL={product.blur}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.12em] text-bodygrey">
                {product.categoryLabel}
                {product.subtype ? ` · ${product.subtype}` : ""}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                {price ? (
                  <>
                    <span className="rate-digits font-serif text-[26px] leading-none text-ink">{inr(price)}</span>
                    <span className="text-[10px] uppercase tracking-[0.1em] text-bodygrey">Approx.</span>
                  </>
                ) : (
                  <span className="font-serif text-[22px] text-ink">Price on request</span>
                )}
              </div>
              {price ? <p className="mt-1 text-[10.5px] text-bodygrey">{PRICE_NOTE}</p> : null}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-white/10 py-3 text-[11.5px]">
              <div>
                <dt className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">Code</dt>
                <dd className="text-ink">{product.code}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">Purity</dt>
                <dd className="text-ink">{product.purity}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">Weight</dt>
                <dd className="text-ink">{product.weightG ? `${product.weightG} g` : "To be confirmed"}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">Occasion</dt>
                <dd className="text-ink">{product.occasion ?? "—"}</dd>
              </div>
            </dl>

            <p className="text-[10.5px] leading-relaxed text-bodygrey">{DESIGN_REFERENCE_NOTE}</p>

            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href={waLink(enquiryMessage(product, price))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-black transition-colors hover:bg-burgundy-dark"
              >
                Enquire on WhatsApp
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={telLink(SHOP.phones[0])}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-white/20 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-burgundy transition-colors hover:border-burgundy"
              >
                <Phone className="h-3.5 w-3.5" />
                Call store
              </a>
            </div>
          </div>

          {similar.length ? (
            <div className="border-t border-white/10 px-4 py-4">
              <p className="label mb-2">Similar pieces</p>
              <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-1">
                {similar.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="w-[104px] shrink-0 snap-start text-left"
                  >
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04]">
                      <Image
                        src={item.thumb}
                        alt={item.name}
                        fill
                        sizes="104px"
                        placeholder="blur"
                        blurDataURL={item.blur}
                        className="object-cover"
                      />
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-ink">{item.code}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CatalogueBrowser({
  categories,
  initialQuery = "",
}: {
  /** Categories this page is limited to; undefined means the whole catalogue. */
  categories?: string[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [purity, setPurity] = useState("");
  const [occasion, setOccasion] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);
  const [open, setOpen] = useState<CatalogueProduct | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const scoped = useMemo(
    () => (categories ? catalogueProducts.filter((product) => categories.includes(product.category)) : catalogueProducts),
    [categories],
  );

  const chips = useMemo(() => categoryCounts(scoped), [scoped]);
  const purityOptions = useMemo(() => purities(scoped), [scoped]);
  const occasionOptions = useMemo(() => occasions(scoped), [scoped]);
  const bounds = useMemo(() => weightBounds(scoped), [scoped]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const min = Number.parseFloat(minWeight);
    const max = Number.parseFloat(maxWeight);

    const list = scoped.filter((product) => {
      if (category && product.category !== category) return false;
      if (purity && product.purity !== purity) return false;
      if (occasion && product.occasion !== occasion) return false;
      if (Number.isFinite(min) && (!product.weightG || product.weightG < min)) return false;
      if (Number.isFinite(max) && (!product.weightG || product.weightG > max)) return false;
      if (needle) {
        const haystack = `${product.code} ${product.name} ${product.categoryLabel} ${product.subtype ?? ""} ${product.occasion ?? ""}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sort === "weight") return (b.weightG ?? 0) - (a.weightG ?? 0);
      if (sort === "featured") return Number(b.featured) - Number(a.featured) || a.code.localeCompare(b.code);
      return a.code.localeCompare(b.code);
    });
  }, [scoped, query, category, purity, occasion, minWeight, maxWeight, sort]);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [query, category, purity, occasion, minWeight, maxWeight, sort]);

  const visible = filtered.slice(0, limit);
  const hasMore = visible.length < filtered.length;
  const activeFilters = [category, purity, occasion, minWeight, maxWeight].filter(Boolean).length;

  const loadMore = useCallback(() => {
    setLimit((current) => current + PAGE_SIZE);
  }, []);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, visible.length, hasMore]);

  const reset = () => {
    setQuery("");
    setCategory("");
    setPurity("");
    setOccasion("");
    setMinWeight("");
    setMaxWeight("");
    setSort("featured");
  };

  if (!catalogueProducts.length) {
    return (
      <div className="container-x pb-20">
        <div className="rounded-card border border-white/10 bg-white/[0.04] px-6 py-14 text-center">
          <p className="font-serif text-2xl text-ink">The catalogue is being photographed</p>
          <p className="mx-auto mt-2 max-w-[46ch] text-[12.5px] leading-relaxed text-bodygrey">
            Every piece will be listed here with its code as the photographs come in. Until then, tell us what you are
            looking for on WhatsApp and we will send pictures of what is in the store.
          </p>
          <a
            href={waLink("Namaste JMD Gems & Jewellery. Please share pictures of pieces available in the store.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-copper mt-6 inline-flex"
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x pb-20">
      {/* Search + count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bodygrey" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by code, e.g. R-001"
            aria-label="Search catalogue by code or name"
            className="min-h-11 w-full rounded-control border border-white/15 bg-white/[0.04] pl-9 pr-9 text-[12.5px] text-ink placeholder:text-bodygrey/70 focus:border-burgundy focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-bodygrey"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </label>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="inline-flex items-baseline gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-bodygrey">
            <span className="text-[10px] uppercase tracking-[0.1em]">Showing</span>
            <span className="rate-digits text-[13px] font-semibold text-burgundy">{visible.length}</span>
            <span className="text-bodygrey/70">/</span>
            <span className="rate-digits text-[13px] font-semibold text-ink">{filtered.length}</span>
          </p>
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            aria-expanded={showFilters}
            className="inline-flex min-h-10 items-center gap-2 rounded-control border border-white/15 bg-white/[0.04] px-3 text-[10px] uppercase tracking-[0.1em] text-charcoal/80"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilters ? (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[9px] text-black">
                {activeFilters}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Category chips — the only row that scrolls sideways */}
      <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setCategory("")}
          aria-pressed={!category}
          className={cn(
            "shrink-0 snap-start whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] transition-colors",
            !category ? "border-burgundy bg-white text-black" : "border-white/15 bg-white text-charcoal/80",
          )}
        >
          All <span className={cn("ml-1 text-[10px]", !category ? "text-cream/70" : "text-bodygrey")}>{scoped.length}</span>
        </button>
        {chips.map((chip) => (
          <button
            key={chip.slug}
            type="button"
            onClick={() => setCategory((current) => (current === chip.slug ? "" : chip.slug))}
            aria-pressed={category === chip.slug}
            className={cn(
              "shrink-0 snap-start whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] transition-colors",
              category === chip.slug
                ? "border-burgundy bg-white text-black"
                : "border-white/15 bg-white/[0.04] text-charcoal/80",
            )}
          >
            {chip.label}{" "}
            <span className={cn("ml-1 text-[10px]", category === chip.slug ? "text-cream/70" : "text-bodygrey")}>
              {chip.count}
            </span>
          </button>
        ))}
      </div>

      {showFilters ? (
        <div className="mt-3 grid gap-3 rounded-card border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">Purity</span>
            <select
              value={purity}
              onChange={(event) => setPurity(event.target.value)}
              className="mt-1 min-h-10 w-full rounded-control border border-white/15 bg-white/[0.04] px-2 text-[12px] text-ink"
            >
              <option value="">All</option>
              {purityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">Occasion</span>
            <select
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
              className="mt-1 min-h-10 w-full rounded-control border border-white/15 bg-white/[0.04] px-2 text-[12px] text-ink"
            >
              <option value="">All</option>
              {occasionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">
              Weight (g){bounds ? ` · ${bounds.min}–${bounds.max}` : ""}
            </span>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={minWeight}
                onChange={(event) => setMinWeight(event.target.value)}
                placeholder="Min"
                aria-label="Minimum weight in grams"
                disabled={!bounds}
                className="min-h-10 w-full rounded-control border border-white/15 bg-white/[0.04] px-2 text-[12px] text-ink disabled:bg-blush/40"
              />
              <span className="text-bodygrey">–</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={maxWeight}
                onChange={(event) => setMaxWeight(event.target.value)}
                placeholder="Max"
                aria-label="Maximum weight in grams"
                disabled={!bounds}
                className="min-h-10 w-full rounded-control border border-white/15 bg-white/[0.04] px-2 text-[12px] text-ink disabled:bg-blush/40"
              />
            </div>
            {!bounds ? <p className="mt-1 text-[9.5px] text-bodygrey">No weights in this selection yet.</p> : null}
          </div>

          <label className="block">
            <span className="text-[9px] uppercase tracking-[0.1em] text-bodygrey">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="mt-1 min-h-10 w-full rounded-control border border-white/15 bg-white/[0.04] px-2 text-[12px] text-ink"
            >
              <option value="featured">Featured</option>
              <option value="code">Code</option>
              <option value="weight">Heaviest</option>
            </select>
          </label>

          {activeFilters ? (
            <button type="button" onClick={reset} className="justify-self-start text-[10px] uppercase tracking-[0.1em] text-burgundy underline underline-offset-4 lg:col-span-4">
              Clear all filters
            </button>
          ) : null}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-card border border-white/10 bg-white/[0.04] px-6 py-14 text-center">
          <p className="font-serif text-xl text-ink">No pieces match this search</p>
          <p className="mt-2 text-[12px] text-bodygrey">Try another code, or ask us on WhatsApp — the piece may still be in the store.</p>
          <button type="button" onClick={reset} className="btn-outline mt-5">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 [grid-template-columns:repeat(2,minmax(0,1fr))] sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {visible.map((product, index) => (
            <Card key={product.code} product={product} onOpen={setOpen} priority={index < 4} />
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="mt-6 flex flex-col items-center gap-2">
          <div ref={sentinel} aria-hidden className="h-1 w-full" />
          <button type="button" onClick={loadMore} className="btn-outline min-h-11 px-6">
            Load more ({filtered.length - visible.length} left)
          </button>
        </div>
      ) : null}

      {open ? <ProductSheet product={open} onClose={() => setOpen(null)} onSelect={setOpen} /> : null}
    </div>
  );
}
