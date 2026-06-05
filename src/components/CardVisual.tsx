// Code-drawn abstract visual used in place of photographic assets.
// Each variant renders a distinct dark/purple composition so cards feel intentional
// even before real images are dropped in.

type Props = {
  variant?: number;
  className?: string;
};

const palettes = [
  { a: "#a855f7", b: "#7c3aed", c: "#c79bff" },
  { a: "#c79bff", b: "#a855f7", c: "#d8b4fe" },
  { a: "#7c3aed", b: "#5b21b6", c: "#a855f7" },
  { a: "#b06bff", b: "#7c3aed", c: "#c79bff" },
  { a: "#a855f7", b: "#9333ea", c: "#d8b4fe" },
  { a: "#c79bff", b: "#a855f7", c: "#b06bff" },
];

export default function CardVisual({ variant = 0, className = "" }: Props) {
  const p = palettes[variant % palettes.length];
  const id = `cv-${variant}`;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg
        className="h-full w-full"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <radialGradient id={`${id}-glow`} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor={p.a} stopOpacity="0.55" />
            <stop offset="45%" stopColor={p.b} stopOpacity="0.18" />
            <stop offset="100%" stopColor="#09080a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={p.a} />
            <stop offset="100%" stopColor={p.c} />
          </linearGradient>
          <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke={p.a} strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="400" height="400" fill="#0c0a10" />
        <rect width="400" height="400" fill={`url(#${id}-grid)`} />
        <rect width="400" height="400" fill={`url(#${id}-glow)`} />

        {/* orbiting nodes + connecting lines */}
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2 + variant;
          const r = 70 + (i % 3) * 38;
          const cx = 200 + Math.cos(angle) * r;
          const cy = 175 + Math.sin(angle) * r * 0.8;
          return (
            <g key={i}>
              <line
                x1="200"
                y1="175"
                x2={cx}
                y2={cy}
                stroke={`url(#${id}-line)`}
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              <circle cx={cx} cy={cy} r={2.5 + (i % 3)} fill={p.a} opacity="0.9" />
            </g>
          );
        })}
        <circle cx="200" cy="175" r="6" fill={p.c} />
        <circle cx="200" cy="175" r="14" fill="none" stroke={p.a} strokeOpacity="0.5" />
      </svg>
      {/* halftone dot overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      />
    </div>
  );
}
