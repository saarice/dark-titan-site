import { useEffect, useRef } from "react";
import gsap from "gsap";
import Logo from "../Logo";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const EMAIL = "saar.cohen@develeap.com";
const SOCIALS = [
  { label: "Twitter", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "GitHub", href: "#" },
];

export default function Footer() {
  const marquee = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !marquee.current) return;
    const ctx = gsap.context(() => {
      gsap.to(marquee.current, {
        xPercent: -50,
        ease: "none",
        duration: 24,
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, [reduced]);

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

        {/* marquee */}
        <div className="relative mt-24 overflow-hidden">
          <div ref={marquee} className="flex whitespace-nowrap will-change-transform">
            {Array.from({ length: 2 }).map((_, i) => (
              <span
                key={i}
                className="font-display text-5xl uppercase tracking-tight text-cloud/[0.06] md:text-7xl"
                aria-hidden={i === 1}
              >
                BRING ORDER TO ENGINEERING CHAOS&nbsp;&bull;&nbsp;BRING ORDER TO ENGINEERING
                CHAOS&nbsp;&bull;&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* footer bar */}
        <div className="mt-20 flex flex-col gap-6 border-t border-slate pt-8 md:flex-row md:items-center md:justify-between">
          <Logo variant="lockup" />

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
