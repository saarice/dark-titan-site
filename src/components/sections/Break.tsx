import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

// Lazy-load the heavy r3f scene so it only costs when the user nears Beat M.
const BreakScene = lazy(() => import("../three/BreakScene"));

// The resulting microservices that resolve out of the monolith.
const SERVICES = ["gateway", "auth", "payments", "billing", "search", "events"];

/**
 * Beat M (archetype F) — the monolith → microservices → crest break, the
 * centerpiece. SCROLL-SCRUBBED over a pinned ~2-screen runway: the monolith
 * (which receded into the dark at the principle beat) returns from the depth,
 * trembles, shatters, regroups as a service grid and forges the crest — all
 * advancing exactly with the scroll, never before you arrive, rewinding when
 * you scroll back. The scene canvas is TRANSPARENT: the global grid/star
 * backdrop stays part of the world (no black slab).
 *
 * When the forge completes (p ≥ 0.96) it signals `onCrestChange(true)` — the
 * global scene's crest takes over and rides to the bottom of the page.
 * Reduced-motion shows the resolved end-state.
 */
export default function Break({
  onActiveChange,
  onCrestChange,
}: {
  /** true while the section is pinned — the global canvas pauses its frameloop */
  onActiveChange?: (v: boolean) => void;
  /** true once the crest has formed — flips back if the user scrubs upward */
  onCrestChange?: (v: boolean) => void;
}) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(reduced ? 1 : 0);
  const [p, setP] = useState(reduced ? 1 : 0);
  const [mounted, setMounted] = useState(reduced);
  const activeRef = useRef(false);
  const crestRef = useRef(false);

  // Mount the scene a viewport-and-a-half early so shaders compile before the
  // show starts; the scrub itself only moves once the section is pinned.
  useEffect(() => {
    if (reduced) {
      onCrestChange?.(true);
      return () => onCrestChange?.(false);
    }
    const el = sectionRef.current;
    if (!el) return;

    const mountIO = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMounted(true);
          mountIO.disconnect();
        }
      },
      { rootMargin: "150% 0px" },
    );
    mountIO.observe(el);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const np = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        progress.current = np;
        setP(np);
        // pause the global backdrop only while the break owns the screen
        const active = rect.top <= 2 && rect.bottom >= window.innerHeight - 2;
        if (active !== activeRef.current) {
          activeRef.current = active;
          onActiveChange?.(active);
        }
        // the crest is forged — hand the brand to the global scene (and take it
        // back if the user scrubs upward past the forge moment)
        const crest = np >= 0.96;
        if (crest !== crestRef.current) {
          crestRef.current = crest;
          onCrestChange?.(crest);
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      mountIO.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      onActiveChange?.(false);
      onCrestChange?.(false);
    };
  }, [reduced, onActiveChange, onCrestChange]);

  const copyOpacity = reduced ? 1 : Math.min(1, Math.max(0, (p - 0.7) / 0.25));

  return (
    <section
      id="break"
      ref={sectionRef}
      className="relative"
      style={{ height: reduced ? "auto" : "300vh" }}
    >
      <div
        className={
          reduced
            ? "relative min-h-screen overflow-hidden"
            : "sticky top-0 h-screen overflow-hidden"
        }
      >
        {/* 3D layer — transparent canvas, the global backdrop shows through */}
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
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
            style={{ background: "linear-gradient(to top, rgba(10,10,12,0.92) 14%, rgba(10,10,12,0.55) 50%, rgba(10,10,12,0) 100%)" }}
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
                {p < 0.18
                  ? "one legacy codebase · years of coupling"
                  : p < 0.46
                    ? "agents break it along its seams"
                    : p < 0.84
                      ? "independent services · each owned, tested, deployable"
                      : "rebuilt as one: dark titan"}
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
