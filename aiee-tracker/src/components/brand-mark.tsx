type Props = { size?: "sm" | "md" | "lg" };

// Placeholder AIEE mark — the stacked-triangle motif from the AZ GenAI Guidance
// cover, hand-drawn in SVG. Replace with the official logo file when available.
export function BrandMark({ size = "md" }: Props) {
  const dims = { sm: 28, md: 36, lg: 56 }[size];
  const titleClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size];

  return (
    <div className="flex items-center gap-3">
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 48 48"
        aria-hidden
        className="flex-shrink-0"
      >
        <polygon points="24,4 4,40 44,40" fill="var(--nau-navy)" />
        <polygon points="24,14 11,38 37,38" fill="#cbd5e1" />
        <rect x="6" y="40" width="36" height="4" fill="var(--nau-gold)" />
      </svg>
      <div className="leading-tight">
        <div className={`font-serif font-semibold text-nau-navy ${titleClass}`}>
          AIEE
        </div>
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">
          Coalition Tracker
        </div>
      </div>
    </div>
  );
}
