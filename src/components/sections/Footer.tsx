import Logo from "../Logo";

const EMAIL = "saar.cohen@darktitan.develeap.com";
const SOCIALS = [
  { label: "Twitter", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "GitHub", href: "#" },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden px-6 py-28 md:px-10">
      {/* soft scrim only - let the monolith reform behind */}
      <div
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(75% 80% at 50% 30%, rgba(10,10,12,0.55), rgba(10,10,12,0.15) 80%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1100px]">
        {/* closing CTA */}
        <div className="text-center">
          <h2 className="mx-auto max-w-3xl font-display text-4xl leading-[1.02] tracking-tight text-cloud md:text-6xl">
            Let&apos;s turn your vision into{" "}
            <span className="text-lavender" style={{ textShadow: "0 0 30px rgba(179,56,255,0.4)" }}>
              operational reality.
            </span>
          </h2>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-violet px-7 py-3.5 font-mono text-sm text-cloud transition-all hover:bg-violet-dp hover:shadow-[0_0_30px_rgba(138,86,247,0.5)]"
          >
            <span className="h-2 w-2 rounded-full bg-cloud" />
            {EMAIL}
          </a>
        </div>

        {/* footer bar */}
        <div className="mt-28 flex flex-col gap-6 border-t border-slate pt-8 md:flex-row md:items-center md:justify-between">
          <Logo variant="mark" className="h-12 w-12" />

          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-sig-green" />
            Available for new builds
          </div>

          <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-wider text-faint">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} className="transition-colors hover:text-cloud">
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 font-mono text-[11px] text-faint md:flex-row md:items-center md:justify-between">
          <span>darktitan.develeap.com</span>
          <span>&copy; {new Date().getFullYear()} Dark Titan. Control at scale.</span>
        </div>
      </div>
    </footer>
  );
}
