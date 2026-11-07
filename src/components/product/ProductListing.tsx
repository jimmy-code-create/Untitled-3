"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { QuickView } from "./QuickView";
import { categories, gemstones } from "@/lib/catalog";
import type { ProductView } from "@/lib/repo";
import { useLang } from "@/components/providers/LangProvider";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/pricing";

interface Filters {
  category: string;
  metal: string;
  purity: string;
  gemstone: string;
  maxPrice: number;
  minWeight: number;
  maxWeight: number;
  sort: string;
}

const PAGE_SIZE = 24;

const METALS = ["GOLD", "SILVER", "DIAMOND", "GEMSTONE"];
const PURITIES = ["24K", "22K", "18K", "92.5"];

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-copper/15 py-5">
      <p className="label mb-3">{title}</p>
      {children}
    </div>
  );
}

function RadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center gap-2.5 py-1.5 text-left text-[12px] text-charcoal/75 transition-colors hover:text-copper-dark"
    >
      <span
        className={cn(
          "grid h-3.5 w-3.5 place-items-center rounded-full border transition-colors",
          checked ? "border-copper" : "border-copper/40",
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-copper" />}
      </span>
      {label}
    </button>
  );
}

export function ProductListing({
  initialProducts,
  total: initialTotal,
  collection,
  initialQuery = "",
  initialOccasion = "",
  initialGemstone = "",
}: {
  initialProducts: ProductView[];
  total: number;
  collection: string;
  initialQuery?: string;
  initialOccasion?: string;
  initialGemstone?: string;
}) {
  const { t, isHi } = useLang();
  const [filters, setFilters] = useState<Filters>({
    category: "",
    metal: "",
    purity: "",
    gemstone: initialGemstone,
    maxPrice: 500000,
    minWeight: 0,
    maxWeight: 50,
    sort: "featured",
  });
  const [products, setProducts] = useState<ProductView[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [appending, setAppending] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [quick, setQuick] = useState<ProductView | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (collection && collection !== "all") params.set("collection", collection);
    if (initialQuery) params.set("q", initialQuery);
    if (initialOccasion) params.set("occasion", initialOccasion);
    if (filters.category) params.set("category", filters.category);
    if (filters.metal) params.set("metal", filters.metal);
    if (filters.purity) params.set("purity", filters.purity);
    if (filters.gemstone) params.set("gemstone", filters.gemstone);
    if (filters.maxPrice < 500000) params.set("maxPrice", String(filters.maxPrice));
    if (filters.minWeight > 0) params.set("minWeight", String(filters.minWeight));
    if (filters.maxWeight < 50) params.set("maxWeight", String(filters.maxWeight));
    if (filters.sort) params.set("sort", filters.sort);
    return params;
  }, [collection, initialQuery, initialOccasion, filters]);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      const params = new URLSearchParams(query.toString());
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (append) setAppending(true);
      else setLoading(true);
      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.ok) {
          setProducts((prev) => (append ? [...prev, ...data.products] : data.products));
          setTotal(data.total);
        }
      } finally {
        setLoading(false);
        setAppending(false);
      }
    },
    [query],
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => fetchPage(0, false), 260);
    return () => clearTimeout(timer);
  }, [query, fetchPage]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !appending && products.length < total) {
          fetchPage(products.length, true);
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [products.length, total, loading, appending, fetchPage]);

  const activeCount = [
    filters.category,
    filters.metal,
    filters.purity,
    filters.gemstone,
    filters.maxPrice < 500000 ? "p" : "",
    filters.minWeight > 0 || filters.maxWeight < 50 ? "w" : "",
  ].filter(Boolean).length;

  const reset = () =>
    setFilters({
      category: "",
      metal: "",
      purity: "",
      gemstone: "",
      maxPrice: 500000,
      minWeight: 0,
      maxWeight: 50,
      sort: "featured",
    });

  const sidebar = (
    <div>
      <div className="flex items-center justify-between pb-4">
        <p className="font-serif text-xl text-navy">{t("listing.filters")}</p>
        {activeCount > 0 && (
          <button onClick={reset} className="text-[10px] uppercase tracking-widest2 text-copper-dark underline underline-offset-4">
            {t("listing.clear")}
          </button>
        )}
      </div>

      <FilterGroup title={t("listing.category")}>
        <RadioRow label={isHi ? "सभी" : "All"} checked={!filters.category} onChange={() => setFilters((f) => ({ ...f, category: "" }))} />
        {categories.map((c) => (
          <RadioRow
            key={c.slug}
            label={isHi ? c.nameHi : c.name}
            checked={filters.category === c.slug}
            onChange={() => setFilters((f) => ({ ...f, category: f.category === c.slug ? "" : c.slug }))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t("listing.metal")}>
        <RadioRow label={isHi ? "सभी" : "All"} checked={!filters.metal} onChange={() => setFilters((f) => ({ ...f, metal: "" }))} />
        {METALS.map((m) => (
          <RadioRow
            key={m}
            label={m.charAt(0) + m.slice(1).toLowerCase()}
            checked={filters.metal === m}
            onChange={() => setFilters((f) => ({ ...f, metal: f.metal === m ? "" : m }))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t("listing.purity")}>
        <div className="flex flex-wrap gap-2">
          {PURITIES.map((p) => (
            <button
              key={p}
              onClick={() => setFilters((f) => ({ ...f, purity: f.purity === p ? "" : p }))}
              className={cn(
                "border px-2.5 py-1 text-[10.5px] transition-colors",
                filters.purity === p ? "border-copper bg-copper text-white" : "border-copper/30 text-charcoal/70 hover:border-copper",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t("listing.gemstone")}>
        <RadioRow label={isHi ? "सभी" : "All"} checked={!filters.gemstone} onChange={() => setFilters((f) => ({ ...f, gemstone: "" }))} />
        {gemstones.map((g) => (
          <RadioRow
            key={g.slug}
            label={isHi ? g.nameHi : g.name}
            checked={filters.gemstone === g.slug}
            onChange={() => setFilters((f) => ({ ...f, gemstone: f.gemstone === g.slug ? "" : g.slug }))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t("listing.price")}>
        <input
          type="range"
          min={10000}
          max={500000}
          step={5000}
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
          className="w-full accent-[#C98B6B]"
          aria-label="Maximum price"
        />
        <div className="mt-1.5 flex justify-between text-[10.5px] text-stone">
          <span>₹10,000</span>
          <span className="text-copper-dark">Up to {inr(filters.maxPrice)}</span>
        </div>
      </FilterGroup>

      <FilterGroup title={t("listing.weight")}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={50}
            value={filters.minWeight}
            onChange={(e) => setFilters((f) => ({ ...f, minWeight: Number(e.target.value) }))}
            className="field py-2 text-xs"
            aria-label="Minimum weight"
          />
          <span className="text-stone">–</span>
          <input
            type="number"
            min={0}
            max={50}
            value={filters.maxWeight}
            onChange={(e) => setFilters((f) => ({ ...f, maxWeight: Number(e.target.value) }))}
            className="field py-2 text-xs"
            aria-label="Maximum weight"
          />
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="container-x pb-20">
      <div className="grid gap-10 lg:grid-cols-[248px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto pr-4">{sidebar}</div>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-3 border-b border-copper/15 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawer(true)}
                className="flex items-center gap-2 border border-copper/30 px-3 py-2 text-[10px] uppercase tracking-widest2 text-charcoal/75 lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> {t("listing.filters")}
                {activeCount > 0 && <span className="grid h-4 w-4 place-items-center rounded-full bg-copper text-[9px] text-white">{activeCount}</span>}
              </button>
              <p className="inline-flex items-baseline gap-1.5 rounded-full border border-burgundy/15 bg-white px-3 py-1.5 text-[11px] text-stone shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.1em]">Showing</span>
                <span className="rate-digits text-[13px] font-semibold text-burgundy">{products.length}</span>
                <span className="text-stone/70">/</span>
                <span className="rate-digits text-[13px] font-semibold text-ink">{total}</span>
                {initialQuery && <span className="ml-1">for “{initialQuery}”</span>}
              </p>
            </div>
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest2 text-stone">
              <span className="hidden sm:inline">{t("listing.sort")}</span>
              <select
                aria-label="Sort pieces by"
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                className="border border-copper/25 bg-transparent py-1.5 pl-2 pr-6 text-[11px] text-charcoal focus:border-copper focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="new">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="weight">Heaviest</option>
                <option value="rating">Top rated</option>
              </select>
            </label>
          </div>

          <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            {[{ slug: "", name: isHi ? "सभी" : "All" }, ...categories].map((c) => (
              <button
                key={c.slug || "all"}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, category: c.slug }))}
                aria-pressed={filters.category === c.slug}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] transition-colors",
                  filters.category === c.slug
                    ? "border-burgundy bg-burgundy text-cream"
                    : "border-burgundy/20 bg-white text-charcoal/80 hover:border-burgundy/50",
                )}
              >
                {"nameHi" in c && isHi ? c.nameHi : c.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton aspect-[4/5] w-full" />
                  <div className="border border-copper/10 bg-white p-4">
                    <div className="skeleton h-2 w-16" />
                    <div className="skeleton mt-2 h-4 w-3/4" />
                    <div className="skeleton mt-3 h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-copper/15 bg-white px-6 py-20 text-center">
              <p className="font-serif text-2xl text-navy">{t("listing.empty")}</p>
              <p className="mt-2 text-[12px] text-stone">Try removing a filter, or ask us on WhatsApp — we may have it in the store.</p>
              <button onClick={reset} className="btn-outline mt-6">
                {t("listing.clear")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
                {products.map((p, i) => (
                  <ProductCard key={`${p.slug}-${i}`} product={p} onQuickView={setQuick} priority={i < 3} />
                ))}
              </div>
              <div ref={sentinel} className="h-10" />
              {appending && (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <div className="skeleton aspect-[4/5] w-full" />
                      <div className="skeleton mt-2 h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[85] lg:hidden">
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-ivory p-5">
            <div className="mb-2 flex justify-end">
              <button onClick={() => setDrawer(false)} aria-label="Close filters" className="grid h-9 w-9 place-items-center border border-copper/25">
                <X className="h-4 w-4" />
              </button>
            </div>
            {sidebar}
            <button onClick={() => setDrawer(false)} className="btn-copper mt-6 w-full">
              Show {total} pieces
            </button>
          </div>
        </div>
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
