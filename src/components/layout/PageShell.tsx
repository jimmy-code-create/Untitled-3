import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
  tight = false,
}: {
  children: React.ReactNode;
  className?: string;
  tight?: boolean;
}) {
  return (
    <div className={cn("bg-cream pb-20", className)}>{children}</div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest2 text-stone">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {item.href ? (
            <a href={item.href} className="hover:text-copper-dark">
              {item.label}
            </a>
          ) : (
            <span className="text-copper-dark">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="text-copper/40">/</span>}
        </span>
      ))}
    </nav>
  );
}
