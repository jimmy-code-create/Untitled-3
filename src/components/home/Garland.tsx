export function Garland({ className = "" }: { className?: string }) {
  const flowers = Array.from({ length: 19 });
  return (
    <svg
      viewBox="0 0 1200 90"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      role="presentation"
    >
      <defs>
        <linearGradient id="garland-thread" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F29A2E" stopOpacity="0" />
          <stop offset="18%" stopColor="#F29A2E" stopOpacity="0.55" />
          <stop offset="82%" stopColor="#F29A2E" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F29A2E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,18 C200,78 400,78 600,34 C800,78 1000,78 1200,18"
        fill="none"
        stroke="url(#garland-thread)"
        strokeWidth="1.1"
      />
      {flowers.map((_, i) => {
        const t = i / (flowers.length - 1);
        const x = t * 1200;
        const y =
          t < 0.5
            ? 18 + Math.sin(t * Math.PI) * 44
            : 18 + Math.sin((1 - t) * Math.PI) * 44;
        return (
          <g key={i} opacity={0.5 + (i % 3) * 0.12}>
            <circle cx={x} cy={y} r="4.2" fill="none" stroke="#F29A2E" strokeWidth="0.9" />
            <circle cx={x} cy={y} r="1.5" fill="#F29A2E" opacity="0.7" />
            {i % 2 === 0 && (
              <path d={`M${x},${y + 5} l0,7`} stroke="#F29A2E" strokeWidth="0.7" opacity="0.5" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
