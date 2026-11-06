import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "navy" | "copper" | "outline" | "outlineLight" | "whatsapp" | "quiet";
type Size = "md" | "sm";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-6 text-12 uppercase tracking-label transition-colors duration-300 disabled:opacity-50";

const variants: Record<Variant, string> = {
  navy: "bg-burgundy-dark text-cream hover:bg-burgundy",
  copper: "border border-burgundy bg-burgundy text-white hover:border-burgundy-dark hover:bg-burgundy-dark",
  outline: "border border-burgundy/40 text-burgundy hover:bg-burgundy hover:text-white",
  outlineLight: "border border-gold-light/50 text-cream hover:bg-gold-light hover:text-burgundy-dark",
  whatsapp: "bg-whatsapp text-white hover:bg-[#0B6231]",
  quiet: "px-0 text-burgundy underline decoration-burgundy/30 underline-offset-4 hover:text-burgundy-dark",
};

const sizes: Record<Size, string> = {
  md: "min-h-12",
  sm: "min-h-11 px-4 text-12",
};

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  href?: string;
  external?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
};

export function Button({
  children,
  variant = "navy",
  size = "md",
  className,
  href,
  external,
  type = "button",
  onClick,
  disabled,
  ...rest
}: Props) {
  const classes = cn(base, variants[variant], variant === "quiet" ? "min-h-0 px-0" : sizes[size], className);

  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {children}
      </a>
    ) : (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
      {children}
    </button>
  );
}
