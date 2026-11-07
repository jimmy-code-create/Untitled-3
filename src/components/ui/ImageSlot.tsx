import Image from "next/image";
import { cn } from "@/lib/utils";
import { ratios } from "@/lib/design-tokens";

type RatioName = keyof typeof ratios;

/**
 * Every image slot has a fixed aspect ratio and real width/height so the page
 * never shifts. If no photo exists yet we render the ivory placeholder the shop
 * owner sees in the admin instead of a stock graphic.
 */
export function ImageSlot({
  src,
  alt,
  ratio = "collection",
  sizes,
  priority = false,
  className,
  imageClassName,
  children,
}: {
  src?: string | null;
  alt: string;
  ratio?: RatioName;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}) {
  const [w, h] = ratios[ratio].split(" / ").map(Number);
  const width = 1200;
  const height = Math.round((width * h) / w);

  return (
    <div className={cn("relative overflow-hidden rounded-photo border border-white/10 bg-blush", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-black px-6 text-center"
          role="img"
          aria-label={`${alt} — photo not uploaded yet`}
        >
          <span className="text-12 uppercase tracking-label text-stone">Photo coming</span>
          <span className="max-w-[24ch] text-12 text-stone">
            Send us a photo on WhatsApp and we will add it here.
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
