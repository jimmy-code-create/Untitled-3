"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCart, useWishlist } from "@/store/cart";
import { useToast } from "@/store/toast";
import { inr } from "@/lib/pricing";
import { useLang } from "@/components/providers/LangProvider";

export function WishlistView() {
  const { items, remove } = useWishlist();
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const { t, isHi } = useLang();

  if (items.length === 0) {
    return (
      <div className="border border-copper/15 bg-white px-6 py-20 text-center">
        <Heart className="mx-auto h-10 w-10 text-copper/40" strokeWidth={1.1} />
        <h2 className="mt-4 font-serif text-2xl text-navy">{isHi ? "आपकी पसंद खाली है" : "Nothing saved yet"}</h2>
        <p className="mx-auto mt-2 max-w-sm text-[12.5px] text-stone">
          {isHi
            ? "जो पसंद आए, दिल के निशान पर टैप करें — बाद में यहीं मिलेगा।"
            : "Tap the heart on any piece and it will wait for you here."}
        </p>
        <Link href="/collections/all" className="btn-copper mt-6">
          {t("cart.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.slug} className="group border border-copper/15 bg-white">
          <Link href={`/products/${item.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-ivorydim">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          <div className="p-4">
            <p className="text-[9px] uppercase tracking-widest2 text-copper-dark/80">{item.metal}</p>
            <h3 className="mt-1 font-serif text-lg text-navy">
              <Link href={`/products/${item.slug}`}>{item.name}</Link>
            </h3>
            <p className="mt-1 text-[13px] text-navy">{inr(item.price)}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  add({
                    slug: item.slug,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    size: "Free size",
                    quantity: 1,
                    metal: item.metal,
                    purity: "",
                    weight: 0,
                  });
                  push("Added to cart", item.name);
                }}
                className="btn-copper flex-1 px-3 py-2.5 text-[9px]"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> {t("product.addToCart")}
              </button>
              <button
                onClick={() => remove(item.slug)}
                aria-label="Remove"
                className="grid w-10 place-items-center border border-copper/30 text-stone hover:border-ruby/40 hover:text-ruby"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.4} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
