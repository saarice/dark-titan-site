import { motion } from "framer-motion";
import Section from "../Section";

// Beat 6 (§5.5) — Infrastructure 2 of 5: Better control over agent behavior.
const CARDS: { title: string; body: string; spend?: boolean }[] = [
  {
    title: "Model per stage",
    body: "Select any model for each stage — match capability and cost to the job at hand.",
  },
  {
    title: "Concurrency",
    body: "Configurable and explicit — you decide how much runs in parallel, never implicit.",
  },
  {
    title: "Financial limits",
    body: "Hard spend ceilings per flow — budget governance is built in, not bolted on.",
    spend: true,
  },
  {
    title: "Security guardrails",
    body: "Enforced boundaries on what agents may touch, run, and reach.",
  },
];

export default function AgentControl() {
  return (
    <Section id="agents" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Infrastructure · 2 of 5
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            Better control over agent behavior
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-steel bg-steel sm:grid-cols-2">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              className="bg-charcoal p-8 transition-colors hover:bg-charcoal/60"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-glow shadow-[0_0_10px_2px_rgba(178,138,255,0.6)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-xl leading-tight text-cloud">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{c.body}</p>

              {/* spend bar that fills then HARD-STOPS at a ceiling marker */}
              {c.spend && (
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.14em]">
                    <span className="text-faint">spend</span>
                    <span className="text-sig-amber">hard ceiling</span>
                  </div>
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-slate">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet to-lavender"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "80%" }}
                      viewport={{ once: true, margin: "-12%" }}
                      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {/* the ceiling it will not cross */}
                    <span className="absolute inset-y-[-2px] left-[84%] w-[2px] bg-sig-amber shadow-[0_0_8px_1px_rgba(255,177,0,0.6)]" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
