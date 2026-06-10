import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

// The resulting microservices that resolve out of the monolith.
const SERVICES = ["gateway", "auth", "payments", "billing", "search", "events"];

/**
 * Beat M's scroll runway + overlay copy. The 3D performance itself (monolith
 * returns → shatters → service grid → crest) lives in the GLOBAL canvas
 * (three/ForgeStage), driven by the `progress` ref this section writes — so the
 * forged crest is literally the same object that rides to the bottom of the
 * page. This section only pins the viewport for the scrub and narrates it.
 */
export default function Break({
  progress,
}: {
  /** the scrub progress ref, shared with Scene3D's ForgeStage */
  progress: React.RefObject<number>;
}) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;

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
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, progress]);

  // Copy + scrim: in as the crest completes (p 0.62→0.8, just before the HOLD),
  // OUT near the end of the runway — the stage exits clean, and the crest (in
  // the global canvas) simply keeps going.
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
        {/* overlay — the modernization story is stated UP FRONT (eyebrow + title),
            a stage caption narrates the performance, and the resolved services
            land at the end. The 3D plays in the global canvas behind. */}
        <div className="pointer-events-none relative z-10 flex h-full min-h-screen flex-col justify-between px-6 py-20 md:px-10">
          {/* bottom scrim keeps the copy legible over the constellation — it
              exists only while the copy does */}
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
