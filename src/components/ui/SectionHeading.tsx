import { cn } from "@/lib/utils";

/**
 * Section heading primitive. Default alignment is left because the page is
 * editorial — sections do not all share one centred rhythm.
 */
export function SectionHeading({
  kicker,
  title,
  sub,
  align = "left",
  light = false,
  action,
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:mb-12",
        align === "center" ? "items-center text-center" : "items-start text-left",
        action && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-measure", align === "center" && "mx-auto")}>
        {kicker ? <p className={cn("mb-3", light ? "label-light" : "label")}>{kicker}</p> : null}
        <h2 className={cn("text-28 sm:text-34", light ? "text-ivory" : "text-ink")}>{title}</h2>
        {sub ? (
          <p className={cn("mt-3 text-14", light ? "text-ivory/70" : "text-bodygrey")}>{sub}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
