import { motion } from "framer-motion";
import Section from "../Section";

/**
 * Beat 6 (v2) — Better control over agent behavior, as ONE governance console
 * (not a 4-card grid). The four controls compose into a single instrument:
 *   · Model per stage  → a per-stage selector strip
 *   · Concurrency      → N parallel lanes running at once
 *   · Financial limits → a spend bar that hard-stops at a ceiling
 *   · Security guardrails → the dashed boundary that frames (contains) the rest
 * Each animates its meaning on scroll-enter; reduced-motion lands on final state.
 */
const STAGE_MODELS = [
  { stage: "implement", model: "frontier" },
  { stage: "review", model: "balanced" },
  { stage: "loop", model: "fast" },
  { stage: "pause", model: "—" },
  { stage: "ship", model: "fast" },
];

// illustrative parallel lanes (target fill %, varied → reads as concurrent work)
const LANES = [72, 54, 88, 43, 66, 50];

export default function AgentControl() {
  return (
    <Section id="agents" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Agent governance
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            Better control over agent behavior
          </h2>
        </div>

        {/* the console */}
        <motion.div
          className="overflow-hidden rounded-2xl border border-steel bg-charcoal/80 shadow-2xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* title bar */}
          <div className="flex items-center justify-between border-b border-slate px-5 py-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              darktitan · governance
            </span>
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-sig-green">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-sig-green" />
              policy enforced
            </span>
          </div>

          {/* guardrail-framed body — the dashed boundary IS the security control */}
          <div className="relative p-5 sm:p-7">
            <div className="pointer-events-none absolute inset-3 rounded-xl border border-dashed border-violet/30 sm:inset-4" />
            {/* corner ticks */}
            {["left-3 top-3 sm:left-4 sm:top-4", "right-3 top-3 sm:right-4 sm:top-4", "left-3 bottom-3 sm:left-4 sm:bottom-4", "right-3 bottom-3 sm:right-4 sm:bottom-4"].map(
              (pos) => (
                <span key={pos} className={`pointer-events-none absolute ${pos} h-2.5 w-2.5 border-violet/60`} style={{ borderTopWidth: pos.includes("top") ? 1.5 : 0, borderBottomWidth: pos.includes("bottom") ? 1.5 : 0, borderLeftWidth: pos.includes("left") ? 1.5 : 0, borderRightWidth: pos.includes("right") ? 1.5 : 0 }} />
              ),
            )}
            <span className="absolute left-1/2 top-1 -translate-x-1/2 bg-charcoal px-2 font-mono text-[9px] uppercase tracking-[0.3em] text-violet/70 sm:top-1.5">
              Security guardrails
            </span>

            <div className="relative space-y-8 px-2 py-4 sm:px-4">
              {/* 01 · Model per stage */}
              <div>
                <Label n="01" title="Model per stage" desc="Match capability and cost to each job." />
                <div className="mt-3 flex flex-wrap gap-2">
                  {STAGE_MODELS.map((s, i) => (
                    <motion.div
                      key={s.stage}
                      className="flex items-center gap-2 rounded-lg border border-steel bg-obsidian/60 px-3 py-2"
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.45 }}
                    >
                      <span className="font-mono text-[11px] text-cloud">{s.stage}</span>
                      <span className="rounded border border-violet/40 bg-violet/10 px-1.5 py-0.5 font-mono text-[10px] text-lavender">
                        {s.model} ▾
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 02 · Concurrency */}
              <div>
                <Label n="02" title="Concurrency" desc="Explicit — you decide how much runs in parallel." right={`× ${LANES.length} lanes`} />
                <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
                  {LANES.map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet to-lavender"
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${w}%` }}
                          viewport={{ once: true, margin: "-10%" }}
                          transition={{ delay: 0.2 + i * 0.07, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 03 · Financial limits */}
              <div>
                <Label n="03" title="Financial limits" desc="Hard spend ceilings per flow — governance built in." right="hard ceiling" rightTone="amber" />
                <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet to-lavender"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "80%" }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="absolute inset-y-[-3px] left-[84%] w-[2px] bg-sig-amber shadow-[0_0_8px_1px_rgba(255,177,0,0.6)]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function Label({ n, title, desc, right, rightTone }: { n: string; title: string; desc: string; right?: string; rightTone?: "amber" }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet">{n}</span>
        <h3 className="font-display text-base text-cloud">{title}</h3>
        <span className="hidden text-xs text-muted sm:inline">— {desc}</span>
      </div>
      {right && (
        <span className={`font-mono text-[9px] uppercase tracking-[0.14em] ${rightTone === "amber" ? "text-sig-amber" : "text-faint"}`}>
          {right}
        </span>
      )}
    </div>
  );
}
