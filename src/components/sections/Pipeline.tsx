import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * The luminous pipeline. A real `flow.yaml` run, executed as you scroll:
 * a signal travels the central spine (the monolith seam, extended) and each
 * stage node ignites in turn — implement → review → loop → pause → ship.
 *
 * Single source of truth: scroll progress `p` (0..1) over a tall pinned
 * region. `fill` (the signal height) and every node's state are derived from
 * it, so nothing can drift. Reduced motion shows the final, fully-shipped
 * frame with no scroll scrubbing.
 */

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

type NodeState = "idle" | "lit" | "passed";

export default function Pipeline() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = wrapRef.current;
        if (!el) return;
        const total = el.offsetHeight - window.innerHeight;
        const next = total > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total)) : 0;
        setP(next);
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
    <section id="pipeline" className="relative">
      {/* readability scrim over the WebGL backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{ background: "radial-gradient(70% 55% at 68% 45%, rgba(10,10,12,0.9), rgba(10,10,12,0) 75%)" }}
      />

      {/* tall scroll region; pinned stage inside */}
      <div ref={wrapRef} style={{ height: reduced ? "auto" : "440vh" }}>
        <div
          className={
            reduced
              ? "px-6 py-28 md:px-10"
              : "sticky top-0 flex min-h-screen flex-col justify-center overflow-hidden px-6 py-20 md:px-10"
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
          <div className="mb-10 w-full text-left md:mb-0 md:w-[40%] md:shrink-0">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-violet">
              Process as code · flow.yaml
            </p>
            <h2
              key={readout.label}
              className="font-display text-h3 tracking-tight text-cloud text-glow-violet md:text-h2"
            >
              {readout.label}
            </h2>
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
                      "absolute top-1/2 w-[calc(100vw-7rem)] rounded-xl border p-4 backdrop-blur-sm transition-all duration-500",
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
