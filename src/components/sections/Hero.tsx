import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const TRUST = [
  ["SPEC TO PRODUCTION", "One Continuous Flow"],
  ["AGENTS IN PARALLEL", "Coordinated, Not Chaotic"],
  ["BUILT FOR CONTROL", "Not Demos"],
  ["NO HYPE", "Just Results"],
];

export default function Hero({ revealed = true }: { revealed?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hold the entrance until the loading doors open (`revealed`), so the hero
    // copy rises in AS the reveal happens instead of settling behind the overlay.
    // fromTo's immediateRender snaps the elements to opacity:0 right away (still
    // behind the closed doors), so there's no flash when the timeline starts.
    if (!revealed) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      // Base delay ≈ the doors' start, so the first words aren't spent behind a
      // still-closed door.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.4 });
      tl.fromTo(".h-eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 })
        .fromTo(".h-line", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, "-=0.3")
        .fromTo(".h-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .fromTo(".h-cta", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
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
        <div className="max-w-2xl">
          <p className="h-eyebrow mb-6 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            The AI Agent Factory
          </p>

          <h1 className="font-display text-h1 text-cloud">
            <span className="h-line block whitespace-nowrap">CONTROL THE</span>
            <span className="h-line block whitespace-nowrap">
              AI <span className="text-lavender text-glow-violet">CHAOS</span>
            </span>
          </h1>

          <p className="h-sub mt-7 max-w-md text-base leading-relaxed text-muted">
            The AI Agent Factory that builds, runs, and operates software at scale. Intelligence
            without chaos. Control without friction.
          </p>

          <div className="h-cta mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#factory"
              className="rounded-full bg-violet px-7 py-3.5 font-mono text-sm uppercase tracking-[0.12em] text-obsidian transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-lavender hover:shadow-[0_0_28px_rgba(155,109,255,0.5)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
            >
              Start Building
            </a>
            <a
              href="#factory"
              className="rounded-full border border-steel px-7 py-3.5 font-mono text-sm uppercase tracking-[0.12em] text-cloud transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-violet active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
            >
              See the Factory
            </a>
          </div>
        </div>

        <div className="h-trust mt-20 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-slate pt-6 md:grid-cols-4">
          {TRUST.map(([title, sub]) => (
            <div key={title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-cloud">{title}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-faint">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
