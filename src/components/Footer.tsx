import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const SOCIALS = ["Twitter", "LinkedIn", "GitHub"];

export default function Footer() {
  const marquee = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".marquee-track", { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    }, marquee);
    return () => ctx.revert();
  }, []);

  return (
    <footer id="contact" className="relative overflow-hidden pb-8 pt-16 md:pb-12 md:pt-20">
      {/* let the Titan monolith glow through as the finale; scrim keeps text readable */}
      <div className="pointer-events-none absolute inset-0 bg-bg/20" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(58% 46% at 50% 62%, rgba(9,8,10,0.82), rgba(9,8,10,0) 72%)" }}
      />

      {/* marquee */}
      <div ref={marquee} className="relative mb-16 overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="font-display text-5xl font-extrabold uppercase tracking-tight text-text-primary/10 md:text-7xl"
            >
              Building the future •&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6 text-center md:px-10">
        <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold tracking-tight text-text-primary md:text-6xl">
          Let's turn your vision into <span className="italic text-accent-hi">operational reality.</span>
        </h2>
        <a
          href="mailto:saar.cohen@develeap.com"
          className="group relative mt-8 inline-flex rounded-full text-sm"
        >
          <span className="gradient-border-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative rounded-full bg-text-primary px-8 py-4 font-medium text-bg transition-colors group-hover:bg-bg group-hover:text-text-primary">
            saar.cohen@develeap.com
          </span>
        </a>
      </div>

      {/* footer bar */}
      <div className="relative mx-auto mt-20 flex max-w-[1100px] flex-col items-center justify-between gap-4 border-t border-stroke px-6 pt-8 md:flex-row md:px-10">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-accent-hi" />
          Available for new builds
        </div>
        <div className="flex items-center gap-6">
          {SOCIALS.map((s) => (
            <a key={s} href="#" className="font-mono text-xs uppercase tracking-wider text-muted hover:text-text-primary">
              {s}
            </a>
          ))}
        </div>
        <div className="font-mono text-xs uppercase tracking-wider text-faint">
          darktitan.develeap.com
        </div>
      </div>
    </footer>
  );
}
