import Logo from "../Logo";

const EMAIL = "darktitan@develeap.com";
const SITE_URL = "darktitan.develeap.com";
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
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-violet">
            Start building on autopilot
          </p>
          <h2 className="mx-auto max-w-3xl font-display text-h2 leading-[1.02] tracking-tight text-cloud">
            Ship while{" "}
            <span className="text-lavender" style={{ textShadow: "0 0 30px rgba(197,122,255,0.45)" }}>
              you sleep.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted">
            Bring DarkTitan into your organization as governed, autonomous engineering
            infrastructure — versioned, deterministic, and under your control.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-3 rounded-full bg-violet px-7 py-3.5 font-mono text-sm text-obsidian transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-lavender hover:shadow-[0_0_30px_rgba(155,109,255,0.55)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
            >
              <span className="h-2 w-2 rounded-full bg-cloud" />
              Book a demo
            </a>
            <a
              href={`https://${SITE_URL}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-muted transition-colors hover:text-cloud focus-visible:text-cloud focus-visible:outline-none"
            >
              {SITE_URL} ↗
            </a>
          </div>
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
              <a
                key={s.label}
                href={s.href}
                className="rounded py-1 transition-colors hover:text-cloud focus-visible:text-cloud focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 font-mono text-[11px] text-faint md:flex-row md:items-center md:justify-between">
          <span className="tracking-[0.15em]">LIGHTS OFF. CODE OUT. · develeap</span>
          <span>&copy; {new Date().getFullYear()} Dark Titan · {SITE_URL}</span>
        </div>
      </div>
    </footer>
  );
}
