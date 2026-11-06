import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-ivory px-6 pt-32 text-center">
      <Logo size="md" />
      <p className="mt-10 text-[10px] uppercase tracking-widest3 text-copper-dark">404</p>
      <h1 className="mt-3 font-serif text-4xl text-navy sm:text-5xl">This piece has moved.</h1>
      <p className="mt-4 max-w-sm text-sm text-stone">
        The page you were looking for isn’t here. Our collections, however, are right where you left them.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-copper">
          Back home
        </Link>
        <Link href="/collections/all" className="btn-outline">
          Browse collections
        </Link>
      </div>
    </div>
  );
}
