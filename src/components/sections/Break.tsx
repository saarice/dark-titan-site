import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

// Lazy-load the heavy r3f scene so it only costs when the user nears Beat M.
const BreakScene = lazy(() => import("../three/BreakScene"));

// The resulting microservices that resolve out of the monolith.
const SERVICES = ["gateway", "auth", "payments", "billing", "search", "events"];

/**
 * Beat M (v2 archetype F) — the monolith → microservices break, the centerpiece.
 * A tall pinned region scroll-scrubs the split; the verbatim copy + the resulting
 * services resolve in as the break completes. While pinned, it signals the global
 * Scene3D to pause (never two heavy r3f scenes animating at once). Reduced-motion
 * shows the resolved end-state, no scrub.
 */
export default function Break({ onActiveChange }: { onActiveChange?: (v: boolean) => void }) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const progress = useRef(reduced ? 1 : 0);
  const [p, setP] = useState(reduced ? 1 : 0);
  const [mounted, setMounted] = useState(reduced);
  const activeRef = useRef(false);

  useEffect(() => {
    if (reduced) return; // mounted already initialises to `reduced`
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const np = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        progress.current = np;
        setP(np);
        if (rect.top < window.innerHeight * 1.5 && rect.bottom > -window.innerHeight * 0.5) {
          setMounted(true);
        }
        const active = rect.top <= 2 && rect.bottom >= window.innerHeight - 2;
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      onActiveChange?.(false);
    };
  }, [reduced, onActiveChange]);

  const copyOpacity = reduced ? 1 : Math.min(1, Math.max(0, (p - 0.55) / 0.3));

  return (
    <section id="break" ref={wrapRef} className="relative" style={{ height: reduced ? "auto" : "340vh" }}>
      <div className={reduced ? "relative min-h-screen overflow-hidden" : "sticky top-0 h-screen overflow-hidden"}>
        {/* 3D layer */}
        <div className="absolute inset-0">
          {mounted && (
            <Suspense fallback={null}>
              <BreakScene progress={progress} reduced={reduced} />
            </Suspense>
          )}
        </div>

        {/* overlay — eyebrow up top, copy + resolved services resolve in at the end */}
        <div className="pointer-events-none relative z-10 flex h-full min-h-screen flex-col justify-between px-6 py-20 md:px-10">
          {/* bottom scrim keeps the copy legible over the constellation */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
            style={{ background: "linear-gradient(to top, rgba(10,10,12,0.97) 20%, rgba(10,10,12,0.72) 52%, rgba(10,10,12,0) 100%)" }}
          />

          <div className="relative mx-auto w-full max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet">
              Aspect modernization
            </p>
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
            <p className="max-w-2xl font-display text-h3 leading-[1.06] tracking-tight text-cloud">
              Systematically modernize a chosen aspect across the codebase — frameworks, patterns,
              dependencies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
