import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CardVisual from "./CardVisual";
import Lightbox from "./Lightbox";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [0, 1, 2, 3, 4, 5];

export default function Lab() {
  const section = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const colA = useRef<HTMLDivElement>(null);
  const colB = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        pin: content.current,
        pinSpacing: false,
      });
      gsap.to(colA.current, {
        yPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: true },
      });
      gsap.to(colB.current, {
        yPercent: -38,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: true },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section id="lab" ref={section} className="relative min-h-[300vh] bg-bg/30 backdrop-blur-md">
      {/* pinned center */}
      <div
        ref={content}
        className="z-10 flex h-screen flex-col items-center justify-center px-6 text-center"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-stroke" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted">The lab</span>
          <span className="h-px w-8 bg-stroke" />
        </div>
        <h2 className="font-display text-5xl font-bold tracking-tight text-text-primary md:text-7xl">
          Agent <span className="italic text-accent-hi">playground</span>
        </h2>
        <p className="mt-4 max-w-md text-sm text-muted md:text-base">
          Experiments and prototypes from the factory. Scroll to explore.
        </p>
        <a href="#" className="group relative mt-8 inline-flex rounded-full text-sm">
          <span className="gradient-border-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-stroke bg-surface px-5 py-2.5 text-text-primary">
            View on GitHub <span className="text-accent">↗</span>
          </span>
        </a>
      </div>

      {/* parallax columns */}
      <div
        className="pointer-events-none absolute inset-0 z-20 mx-auto grid max-w-[1400px] grid-cols-2 gap-12 px-6 pt-[40vh] md:gap-40"
        style={{ perspective: 1400 }}
      >
        <div ref={colA} className="flex flex-col gap-12 md:gap-24" style={{ transformStyle: "preserve-3d" }}>
          {ITEMS.filter((_, i) => i % 2 === 0).map((v) => (
            <button
              key={v}
              onClick={() => setOpen(v)}
              style={{ transform: `rotate(${v % 2 ? 3 : -3}deg) rotateY(14deg)` }}
              className="pointer-events-auto relative aspect-square w-full max-w-[320px] justify-self-end overflow-hidden rounded-3xl border border-stroke shadow-2xl shadow-black/50 transition-transform duration-500 hover:scale-105"
            >
              <CardVisual variant={v} />
            </button>
          ))}
        </div>
        <div ref={colB} className="flex flex-col gap-12 pt-24 md:gap-24 md:pt-48" style={{ transformStyle: "preserve-3d" }}>
          {ITEMS.filter((_, i) => i % 2 === 1).map((v) => (
            <button
              key={v}
              onClick={() => setOpen(v)}
              style={{ transform: `rotate(${v % 2 ? -3 : 3}deg) rotateY(-14deg)` }}
              className="pointer-events-auto relative aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl border border-stroke shadow-2xl shadow-black/50 transition-transform duration-500 hover:scale-105"
            >
              <CardVisual variant={v} />
            </button>
          ))}
        </div>
      </div>

      <Lightbox open={open !== null} variant={open ?? 0} onClose={() => setOpen(null)} />
    </section>
  );
}
