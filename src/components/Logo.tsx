/**
 * Dark Titan logo — the angular titan crest split by a glowing vertical seam.
 * Single source of truth / swap-point for the designer's final SVG.
 * Do-not rules (per brand board): no stretch, no extra glow, no recolor, no stroke, no rotate.
 */
export default function Logo({
  variant = "lockup",
  className = "",
}: {
  variant?: "mark" | "lockup";
  className?: string;
}) {
  const mark = (
    <svg viewBox="0 0 64 56" width="100%" height="100%" role="img" aria-label="Dark Titan">
      <defs>
        <linearGradient id="dt-seam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6D4FF" />
          <stop offset=".5" stopColor="#8A56F7" />
          <stop offset="1" stopColor="#6020D9" />
        </linearGradient>
        <linearGradient id="dt-slab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#23202b" />
          <stop offset="1" stopColor="#0d0c12" />
        </linearGradient>
      </defs>
      {/* left wing */}
      <polygon points="2,16 14,4 28,4 28,52 14,52 2,40" fill="url(#dt-slab)" stroke="#2A2A33" strokeWidth="1" />
      {/* right wing (mirror) */}
      <polygon points="62,16 50,4 36,4 36,52 50,52 62,40" fill="url(#dt-slab)" stroke="#2A2A33" strokeWidth="1" />
      {/* inner crest shoulders */}
      <polygon points="28,4 36,4 34,20 30,20" fill="#2a2440" />
      {/* glowing seam */}
      <rect className="glow-seam" x="30.5" y="3" width="3" height="50" fill="url(#dt-seam)" />
    </svg>
  );

  if (variant === "mark") {
    return (
      <span className={className} style={{ display: "inline-block" }}>
        {mark}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span style={{ width: 28, height: 24, display: "inline-block" }}>{mark}</span>
      <span className="leading-none">
        <span className="block font-display text-cloud tracking-[0.25em] text-sm">DARK TITAN</span>
        <span className="block font-mono text-violet text-[9px] tracking-[0.3em] mt-0.5">CONTROL AT SCALE</span>
      </span>
    </span>
  );
}
