import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// The brand keyword strip (verbatim PDF fragments). The old 4-chip row was folded
// in here (v2 Beat 1) so the hero stays clean and commanding.
const MARQUEE = ["LIGHTS OFF. CODE OUT.", "PROCESS AS CODE", "GOVERNED AT SCALE", "BUILT ON KUBERNETES"];

export default function Hero({ revealed = true }: { revealed?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance is held until the loading doors open (`revealed`), so the copy
    // rises in AS the reveal happens. fromTo's immediateRender hides the elements
    // behind the still-closed doors, so there's no flash.
    if (!revealed) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.4 });
      tl.fromTo(".h-eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 })
        .fromTo(".h-line", { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, "-=0.3")
        .fromTo(".h-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .fromTo(".h-cta", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
        .fromTo(".h-trust", { opacity: 0 }, { opacity: 1, duration: 0.9 }, "-=0.3");
    }, root);
    return () => ctx.revert();
  }, [revealed]);

  return (
    <section
      id="home"
      ref={root}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pt-28 md:px-10"
    >
      {/* left-anchored readability scrim so copy stays crisp over the gateway */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.55) 42%, rgba(10,10,12,0) 70%)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        <div className="max-w-4xl">
          <p className="h-eyebrow mb-6 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Enterprise Value Offer
          </p>

          <h1 className="font-display text-[clamp(2.6rem,9vw,6.75rem)] leading-[0.9] tracking-tight text-cloud">
            <span className="h-line block whitespace-nowrap">LIGHTS OFF.</span>
            <span className="h-line block whitespace-nowrap">
              CODE <span className="text-lavender text-glow-violet">OUT.</span>
            </span>
          </h1>

          <p className="h-sub mt-8 max-w-xl text-base leading-relaxed text-muted">
            The autonomous software pipeline — re-cast as enterprise infrastructure. Define your
            flow, govern your agents, and ship continuously at organizational scale.
          </p>

          {/* primary CTA = Book a demo; secondary = the URL as a quiet text link */}
          <div className="h-cta mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="#contact"
              className="rounded-full bg-violet px-7 py-3.5 font-mono text-sm uppercase tracking-[0.12em] text-obsidian transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-lavender hover:shadow-[0_0_28px_rgba(155,109,255,0.5)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
            >
              Book a demo
            </a>
            <a
              href="https://darktitan.develeap.com"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-cloud focus-visible:text-cloud focus-visible:outline-none"
            >
              darktitan.develeap.com
              <span className="text-violet transition-transform duration-200 group-hover:translate-x-0.5">↗</span>
            </a>
          </div>
        </div>

        {/* brand keyword strip */}
        <div className="h-trust mt-20 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate pt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
          {MARQUEE.map((m, i) => (
            <span key={m} className="flex items-center gap-x-3">
              {i > 0 && <span className="text-violet/50">·</span>}
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
