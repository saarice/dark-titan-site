import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

// Lazy-load the heavy r3f scene so it only costs when the user nears Beat M.
const BreakScene = lazy(() => import("../three/BreakScene"));

// The resulting microservices that resolve out of the monolith.
const SERVICES = ["gateway", "auth", "payments", "billing", "search", "events"];

// One viewing: the break plays as a timed performance, not a scroll scrub.
const DURATION_MS = 3400;

/**
 * Beat M (v2 archetype F) — the monolith → microservices break, the centerpiece.
 * A single full-screen beat: when it enters view the break PLAYS ON ITS OWN over
 * ~3.4s (it was a 260vh scroll-scrub before — testers called the scroll tax too
 * high). While mostly on screen it signals the global Scene3D to pause (never two
 * heavy r3f scenes animating at once). Reduced-motion shows the resolved
 * end-state, no animation.
 */
export default function Break({ onActiveChange }: { onActiveChange?: (v: boolean) => void }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(reduced ? 1 : 0);
  const [p, setP] = useState(reduced ? 1 : 0);
  const [mounted, setMounted] = useState(reduced);
  const startedRef = useRef(reduced);
  const activeRef = useRef(false);

  // Drive the performance: mount early, play once when ~half the section shows.
  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;

    const play = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / DURATION_MS);
        progress.current = t;
        setP(t);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const mountIO = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMounted(true);
          mountIO.disconnect();
        }
      },
      // a viewport-and-a-half early: shaders compile before the show starts
      { rootMargin: "150% 0px" },
    );
    mountIO.observe(el);

    const playIO = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.intersectionRatio >= 0.45 && !startedRef.current) {
          startedRef.current = true;
          play();
        }
        // pause the global backdrop while the break owns the screen
        const active = e.intersectionRatio >= 0.5;
        if (active !== activeRef.current) {
          activeRef.current = active;
          onActiveChange?.(active);
        }
      },
      { threshold: [0, 0.45, 0.5, 1] },
    );
    playIO.observe(el);

    return () => {
      mountIO.disconnect();
      playIO.disconnect();
      cancelAnimationFrame(raf);
      onActiveChange?.(false);
    };
  }, [reduced, onActiveChange]);

  const copyOpacity = reduced ? 1 : Math.min(1, Math.max(0, (p - 0.55) / 0.3));

  return (
    <section id="break" ref={sectionRef} className="relative">
      <div className="relative min-h-screen overflow-hidden">
        {/* 3D layer */}
        <div className="absolute inset-0">
          {mounted && (
            <Suspense fallback={null}>
              <BreakScene progress={progress} reduced={reduced} />
            </Suspense>
          )}
        </div>

        {/* overlay — the modernization story is stated UP FRONT (eyebrow + title),
            a stage caption narrates the performance, and the resolved services
            land at the end. */}
        <div className="pointer-events-none relative z-10 flex h-full min-h-screen flex-col justify-between px-6 py-20 md:px-10">
          {/* bottom scrim keeps the copy legible over the constellation */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
            style={{ background: "linear-gradient(to top, rgba(10,10,12,0.97) 20%, rgba(10,10,12,0.72) 52%, rgba(10,10,12,0) 100%)" }}
          />

          <div className="relative mx-auto w-full max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet">
              Legacy modernization
            </p>
            <h2 className="mt-3 max-w-xl font-display text-h3 leading-[1.05] tracking-tight text-cloud md:text-h2">
              Break the monolith into microservices.
            </h2>
            {/* stage caption — narrates what the animation is doing right now */}
            {!reduced && (
              <p className="mt-4 max-w-md font-mono text-xs uppercase tracking-[0.18em] text-lavender">
                {p < 0.35
                  ? "one legacy codebase · years of coupling"
                  : p < 0.7
                    ? "agents carve it along its seams"
                    : "independent services · each owned, tested, deployable"}
              </p>
            )}
          </div>

          <div
            className="relative mx-auto w-full max-w-[1200px]"
            style={{ opacity: copyOpacity, transition: "opacity 0.25s linear" }}
          >
            <div className="mb-5 flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-violet/40 bg-obsidian/70 px-3 py-1.5 font-mono text-[11px] text-lavender backdrop-blur-sm"
                >
                  {s}-svc
                </span>
              ))}
            </div>
            {/* one quiet line — the headline already carries the message, so the
                close stays body-size (full display-size repeat read as too much text) */}
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Agents modernize the chosen aspect across the codebase: frameworks, patterns,
              dependencies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
