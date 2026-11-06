export function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 px-4 ${className ?? ""}`} aria-hidden>
      <span className="h-px flex-1 bg-burgundy/15" />
      <span className="h-2.5 w-2.5 rotate-45 rounded-[1px] border border-burgundy/35" />
      <span className="h-px flex-1 bg-burgundy/15" />
    </div>
  );
}
