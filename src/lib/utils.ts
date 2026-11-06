import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SHOP = {
  name: "JMD Gems & Jewellery",
  short: "JMD",
  tagline: "Where Every Gem Tells a Story",
  address: {
    line1: "Jagdamba Market, Mohan Nagar",
    city: "Hindaun",
    state: "Rajasthan",
    pincode: "322230",
    country: "IN",
  },
  phones: ["7891384376", "6377419074"],
  whatsapp: "917891384376",
  email: "care@jmdgems.in",
  hours: "Mon – Sun · 10:30 AM – 8:30 PM",
  established: 1994,
  mapQuery: "Jagdamba Market, Mohan Nagar, Hindaun, Rajasthan 322230",
} as const;

export const fullAddress = `${SHOP.address.line1}, ${SHOP.address.city}-${SHOP.address.pincode}, ${SHOP.address.state}`;

export function waLink(message: string) {
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string) {
  return `tel:+91${phone}`;
}

export function mapsLink() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP.mapQuery)}`;
}

export function mapsEmbed() {
  return `https://maps.google.com/maps?q=${encodeURIComponent(SHOP.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function orderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  return `JMD-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
