import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Beat 2 — The Pain, as a typographic performance (v2 archetype A, kinetic).
 * Each line lands heavier, tighter and bigger than the last, drifting in from
 * alternating sides — visual pressure accumulating — then a hard cut releases to
 * the calm, centred, lit turn line. The contrast is the design.
 */
const LINES = [
  { t: "MORE NOISE.", size: "clamp(1.9rem,6vw,4rem)", tone: "text-cloud/35", from: -60 },
  { t: "MORE ALERTS.", size: "clamp(2.3rem,7.6vw,5.2rem)", tone: "text-cloud/50", from: 48 },
  { t: "MORE TOOLS.", size: "clamp(2.8rem,9.2vw,6.6rem)", tone: "text-cloud/72", from: -40 },
  { t: "MORE COMPLEXITY.", size: "clamp(3.3rem,11vw,8rem)", tone: "text-cloud/95", from: 30 },
];

export default function Chaos() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      // escalating reveals — each line drifts in and settles, building pressure
      gsap.utils.toArray<HTMLElement>(".chaos-line").forEach((el, i) => {
        tl.fromTo(
          el,
          { opacity: 0, x: LINES[i].from, filter: "blur(8px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" },
          i * 0.5,
        );
      });
      // subtle squeeze of the whole stack as it accumulates
      tl.fromTo(".chaos-stack", { scale: 0.98 }, { scale: 1.04, ease: "none", duration: 2 }, 0);
      // HARD CUT: the noise collapses, the turn line resolves in — calm and lit
      tl.to(".chaos-stack", { opacity: 0, scale: 0.9, filter: "blur(10px)", duration: 0.5 }, 2.4);
      tl.fromTo(
        ".chaos-turn",
        { opacity: 0, scale: 0.96, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power2.out" },
        2.7,
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  // Reduced motion: a clean static reading — escalating stack, then the turn line.
  if (reduced) {
    return (
      <section id="chaos" className="relative flex min-h-screen flex-col justify-center px-6 py-32 md:px-10">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="space-y-1">
            {LINES.map((l) => (
              <p
                key={l.t}
                className={`font-display leading-[0.98] tracking-tight ${l.tone}`}
                style={{ fontSize: l.size }}
              >
                {l.t}
              </p>
            ))}
          </div>
          <div className="mt-14">
            <p
              className="font-display text-h2 leading-[1.04] tracking-tight text-lavender"
              style={{ textShadow: "0 0 28px rgba(197,122,255,0.55), 0 0 60px rgba(155,109,255,0.35)" }}
            >
              Infrastructure you control.
            </p>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-muted">
              Not a black box you hand the keys to.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="chaos" ref={root} className="relative h-[240vh]">
      {/* sticky stage holds the performance while the section scrolls past */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 md:px-10">
        <div className="relative mx-auto w-full max-w-[1200px]">
          {/* the accumulating noise */}
          <div className="chaos-stack space-y-1">
            {LINES.map((l) => (
              <p
                key={l.t}
                className={`chaos-line font-display leading-[0.98] tracking-tight ${l.tone}`}
                style={{ fontSize: l.size, willChange: "transform, opacity, filter" }}
              >
                {l.t}
              </p>
            ))}
          </div>

          {/* the release — centred, lit, calm (revealed by the hard cut) */}
          <div className="chaos-turn pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center opacity-0">
            <div
              className="pointer-events-none absolute inset-0 -z-[1]"
              style={{ background: "radial-gradient(55% 60% at 50% 50%, rgba(10,10,12,0.96), rgba(10,10,12,0) 78%)" }}
            />
            <p
              className="font-display text-h1 leading-[1.0] tracking-tight text-lavender"
              style={{ textShadow: "0 0 32px rgba(197,122,255,0.6), 0 0 70px rgba(155,109,255,0.38)" }}
            >
              Infrastructure you control.
            </p>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-muted">
              Not a black box you hand the keys to.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
