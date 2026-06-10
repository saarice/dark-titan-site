import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * The luminous pipeline. A real `flow.yaml` run that EXECUTES ON ITS OWN:
 * when the section comes into view the signal travels the central spine (the
 * monolith seam, extended) over ~9s and each stage node ignites in turn —
 * implement → review → loop → pause → ship. No scroll-scrubbing (Saar,
 * 2026-06-10 — same rule as the Break: animations play, scroll just arrives).
 *
 * Single source of truth: played progress `p` (0..1). `fill` (the signal
 * height) and every node's state are derived from it, so nothing can drift.
 * Reduced motion shows the final, fully-shipped frame.
 */
const DURATION_MS = 9000;

type Stage = {
  key: string;
  icon: string;
  tag: string;
  name: string;
  idle: string;
  run: string;
  done: string;
  label: string;
  sub: string;
  top: number; // 0..1 position along the spine
  tone: "violet" | "loop";
};

const STAGES: Stage[] = [
  {
    key: "implement",
    icon: "01",
    tag: "agent",
    name: "implement",
    idle: "queued",
    run: "running agent…",
    done: "done ✓",
    label: "Stage 01 · implement",
    sub: "",
    top: 0.06,
    tone: "violet",
  },
  {
    key: "review",
    icon: "02",
    tag: "gate · ai",
    name: "review",
    idle: "queued",
    run: "reviewing…",
    done: "flagged",
    label: "Stage 02 · review",
    sub: "",
    top: 0.3,
    tone: "violet",
  },
  {
    key: "loop",
    icon: "↻",
    tag: "max 3",
    name: "loop",
    idle: "queued",
    run: "loop 2/3 ↻",
    done: "passed ✓",
    label: "Gate · loop",
    sub: "",
    top: 0.53,
    tone: "loop",
  },
  {
    key: "pause",
    icon: "❙❙",
    tag: "escalation",
    name: "pause",
    idle: "queued",
    run: "awaiting sign-off",
    done: "approved ✓",
    label: "escalation · pause",
    sub: "",
    top: 0.76,
    tone: "violet",
  },
  {
    key: "ship",
    icon: "✓",
    tag: "promote",
    name: "ship",
    idle: "queued",
    run: "promoting…",
    done: "shipped ✓",
    label: "Shipped",
    sub: "",
    top: 0.96,
    tone: "violet",
  },
];

const INTRO = {
  label: "implement-and-review",
  sub: "",
};

// Beat 5 (v2) — the three "process as code" ideas, folded in as annotations that
// reveal beside the diagram as the signal reaches the stage they explain (the old
// Rivers card row is retired).
const IDEAS: { at: number; title: string; body: string; determinism?: boolean }[] = [
  {
    at: 0,
    title: "In Git",
    body: "Every pipeline — prompts, models, tools, roles — lives in version control. Reviewable, auditable, diffable.",
  },
  {
    at: 2,
    title: "Deterministic",
    body: "Repeatable, predictable runs — not opaque executions that drift between runs.",
    determinism: true,
  },
  {
    at: 4,
    title: "Wholistic",
    body: "Prompt, model, tools and roles packaged per stage — one coherent unit.",
  },
];

type NodeState = "idle" | "lit" | "passed";

export default function Pipeline() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(reduced ? 1 : 0);
  const startedRef = useRef(reduced);

  // Play the run once, when roughly half the section is on screen.
  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;

    const play = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / DURATION_MS);
        setP(t);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio >= 0.45 && !startedRef.current) {
          startedRef.current = true;
          play();
          io.disconnect();
        }
      },
      { threshold: [0.45] },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const fill = reduced ? 1 : Math.min(1, p / 0.92);

  let active = -1;
  for (let i = 0; i < STAGES.length; i++) if (fill >= STAGES[i].top - 0.02) active = i;
  const readout = active < 0 ? INTRO : STAGES[active];

  const stateOf = (i: number): NodeState => {
    const reached = fill >= STAGES[i].top - 0.02;
    const passed = i < STAGES.length - 1 ? fill >= STAGES[i + 1].top - 0.04 : p >= 0.99 || reduced;
    return passed ? "passed" : reached ? "lit" : "idle";
  };
  const statusOf = (s: Stage, st: NodeState) => (st === "passed" ? s.done : st === "lit" ? s.run : s.idle);

  return (
    <section id="process" ref={sectionRef} className="relative">
      {/* readability scrim over the WebGL backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{ background: "radial-gradient(70% 55% at 68% 45%, rgba(10,10,12,0.9), rgba(10,10,12,0) 75%)" }}
      />

      {/* one screen — the run plays on its own; no pinned scroll region */}
      <div>
        <div
          className={
            reduced
              ? "px-6 py-28 md:px-10"
              : "flex min-h-screen flex-col justify-center overflow-hidden px-6 py-20 md:px-10"
          }
        >
          {/* Same centred page grid as every other section (Hero/Factory/Trust
              all wrap content in max-w-[1200px] mx-auto), so the Pipeline aligns
              with the rest of the page instead of bleeding to the viewport edges. */}
          <div className="mx-auto w-full max-w-[1200px]">
          {/* Two columns on desktop: the changing text block on the LEFT (left-
              aligned) in its own column, and the timeline in a separate column on
              the RIGHT. The dark monolith stays behind the text on the left.
              Mobile: stacked (text, then timeline). */}
          <div className="w-full md:flex md:items-center md:gap-10">
          {/* readout — flush left, left-aligned, its own column */}
          <div className="relative z-10 mb-10 w-full text-left md:mb-0 md:w-[40%] md:shrink-0">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-violet">
              Process as code · flow.yaml
            </p>
            <h2
              key={readout.label}
              className="font-display text-h3 tracking-tight text-cloud text-glow-violet md:text-h2"
            >
              {readout.label}
            </h2>

            {/* the three ideas, as annotations that light up with the run */}
            <ul className="mt-8 max-w-xs space-y-5">
              {IDEAS.map((idea) => {
                const on = active >= idea.at;
                return (
                  <li
                    key={idea.title}
                    className="transition-all duration-500"
                    style={{ opacity: on ? 1 : 0.32, transform: on ? "translateX(0)" : "translateX(-6px)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
                        style={{
                          background: on ? "rgb(var(--violet))" : "rgb(var(--steel))",
                          boxShadow: on ? "0 0 10px 2px rgb(var(--violet) / 0.5)" : "none",
                        }}
                      />
                      <h3 className="font-display text-sm uppercase tracking-[0.12em] text-cloud">
                        {idea.title}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{idea.body}</p>
                    {idea.determinism && on && (
                      <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-violet/80">
                        <span className="rounded border border-steel px-1.5 py-0.5">in</span>
                        <span className={reduced ? "" : "animate-pulse"}>→</span>
                        <span className="rounded border border-steel px-1.5 py-0.5">out</span>
                        <span className="text-faint">· identical every run</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* spine + nodes — the timeline, in its own column on the RIGHT */}
          <div className="relative h-[56vh] w-full pl-14 md:flex-1 md:pl-0">
            {/* base spine */}
            <div className="absolute bottom-0 left-14 top-0 w-px -translate-x-1/2 overflow-hidden bg-lavender/15 md:left-1/2">
              {/* signal fill */}
              <div
                className="absolute inset-x-0 top-0"
                style={{
                  height: `${fill * 100}%`,
                  background:
                    "linear-gradient(to bottom, rgb(var(--sig-cyan)), rgb(var(--violet)) 45%, rgb(var(--lavender)))",
                  boxShadow: "0 0 16px 1px rgb(var(--violet) / 0.85)",
                  transition: "height 0.12s linear",
                }}
              />
            </div>

            {STAGES.map((s, i) => {
              const st = stateOf(i);
              const cardRight = i % 2 === 0; // desktop side; mobile always right
              const litTone = s.tone === "loop" ? "var(--sig-amber)" : "var(--violet)";
              return (
                <div
                  key={s.key}
                  className="absolute left-14 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
                  style={{ top: `${s.top * 100}%` }}
                >
                  {/* node dot */}
                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-full border bg-obsidian/90 font-display text-sm transition-all duration-500"
                    style={{
                      borderColor:
                        st === "passed"
                          ? "rgb(var(--sig-green))"
                          : st === "lit"
                            ? `rgb(${litTone})`
                            : "rgb(var(--steel))",
                      color:
                        st === "passed"
                          ? "rgb(var(--sig-green))"
                          : st === "lit"
                            ? "rgb(var(--cloud))"
                            : "rgb(var(--fg-faint))",
                      transform: st === "lit" ? "scale(1.12)" : "scale(1)",
                      boxShadow:
                        st === "lit"
                          ? `0 0 30px 4px rgb(${litTone} / 0.6)`
                          : st === "passed"
                            ? "0 0 18px 1px rgb(var(--sig-green) / 0.4)"
                            : "none",
                    }}
                  >
                    {s.icon}
                  </div>

                  {/* card */}
                  <div
                    className={[
                      // mobile width accounts for: px-6 container pad + the
                      // left-14 node column + ml-5 + right pad (was 7rem — the
                      // cards clipped ~12px off the right edge at 390px)
                      "absolute top-1/2 w-[calc(100vw-8.75rem)] rounded-xl border p-4 backdrop-blur-sm transition-all duration-500",
                      "left-full ml-5", // mobile + even desktop: right
                      cardRight ? "md:left-full md:ml-5 md:right-auto md:mr-0" : "md:left-auto md:right-full md:ml-0 md:mr-5",
                      "md:w-[min(40vw,300px)]",
                    ].join(" ")}
                    style={{
                      borderColor: st === "idle" ? "rgb(var(--steel))" : "rgb(var(--lavender) / 0.5)",
                      background: "linear-gradient(160deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.01))",
                      // Cards aren't drawn until the signal reaches the node; then
                      // they fade + rise into place ("drawn" as you scroll) rather
                      // than sitting ahead of the signal as faint gray placeholders.
                      opacity: st === "idle" ? 0 : 1,
                      transform: st === "idle" ? "translateY(calc(-50% + 16px))" : "translateY(-50%)",
                      pointerEvents: st === "idle" ? "none" : "auto",
                      boxShadow: st === "lit" ? `0 16px 50px -24px rgb(${litTone} / 0.9)` : "none",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[15px] text-cloud">{s.name}</span>
                      <span className="rounded-full border border-steel px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                        {s.tag}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 font-mono text-[11.5px]"
                      style={{
                        color:
                          st === "passed"
                            ? "rgb(var(--sig-green))"
                            : st === "lit"
                              ? s.tone === "loop"
                                ? "rgb(var(--sig-amber))"
                                : "rgb(var(--sig-cyan))"
                              : "rgb(var(--fg-muted))",
                      }}
                    >
                      {statusOf(s, st)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
