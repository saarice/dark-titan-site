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
 * The scrub's raw progress is written into the SHARED `progress` ref (owned by
 * App): the Break scene reads it for the performance, and the global scene's
 * crest fades in over the exact window this scene's crest fades out — a
 * perfect in-place cross-dissolve, reversing on scroll-up.
 * Reduced-motion shows the resolved end-state.
 */
export default function Break({
  onActiveChange,
  progress,
}: {
  /** true while the section is pinned — the global canvas pauses its frameloop */
  onActiveChange?: (v: boolean) => void;
  /** the scrub progress ref, shared with Scene3D/LogoSolid for the handoff */
  progress: React.RefObject<number>;
}) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(reduced ? 1 : 0);
  const [mounted, setMounted] = useState(reduced);
  const activeRef = useRef(false);

  // Mount the scene a viewport-and-a-half early so shaders compile before the
  // show starts; the scrub itself only moves once the section is pinned.
  useEffect(() => {
    if (reduced) return;
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
        // pause the global backdrop only while the break owns the screen — but
        // RESUME it for the finale (np ≥ 0.95): its crest must be rendering to
        // cross-dissolve in under this canvas during the handoff
        const active = rect.top <= 2 && rect.bottom >= window.innerHeight - 2 && np < 0.95;
        if (active !== activeRef.current) {
          activeRef.current = active;
          onActiveChange?.(active);
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
    };
  }, [reduced, onActiveChange, progress]);

  // Copy + scrim: in as the crest completes (p 0.62→0.8, just before the HOLD),
  // OUT with the handoff (p 0.965→0.995) — the section's last frames show only
  // the crest on the transparent world, so nothing (no black gradient band, no
  // text) lingers while it scrolls out under the next beat.
  const endFade = reduced ? 1 : 1 - Math.min(1, Math.max(0, (p - 0.965) / 0.03));
  const copyOpacity = (reduced ? 1 : Math.min(1, Math.max(0, (p - 0.62) / 0.18))) * endFade;

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
          {/* bottom scrim keeps the copy legible over the constellation — it
              exists only while the copy does (the canvas is transparent now, so
              a constant band would read as a stray black gradient) */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
            style={{
              background: "linear-gradient(to top, rgba(10,10,12,0.92) 14%, rgba(10,10,12,0.55) 50%, rgba(10,10,12,0) 100%)",
              opacity: copyOpacity,
              transition: "opacity 0.25s linear",
            }}
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
                {p < 0.16
                  ? "one legacy codebase · years of coupling"
                  : p < 0.4
                    ? "agents break it along its seams"
                    : p < 0.72
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
