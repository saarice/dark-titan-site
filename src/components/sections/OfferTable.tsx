import { motion } from "framer-motion";
import Section from "../Section";

// Beat 16 (§5.13) — the offer at a glance: a scannable recap of every capability
// on the page, grouped Infrastructure / Ecosystem, right before the close.
type Row = { capability: string; delivers: string };
const GROUPS: { label: string; rows: Row[] }[] = [
  {
    label: "Infrastructure",
    rows: [
      { capability: "Process as code", delivers: "Versioned in git · deterministic on every run · wholistic" },
      { capability: "Agent control", delivers: "Model per stage · concurrency · financial limits · security guardrails" },
      { capability: "Runtime control UI", delivers: "Ticket-based · priorities, dependencies, releases · budget-aware" },
      { capability: "Scale on Kubernetes", delivers: "Uniform central environment · massive concurrency · secure" },
      { capability: "One instance", delivers: "Full redundancy · long-term project memory across the team" },
    ],
  },
  {
    label: "Ecosystem",
    rows: [
      { capability: "External integrations", delivers: "SSO · issue tracking · code scanners · environment allocation" },
      { capability: "Pre-baked flows", delivers: "Brownfield · aspect modernization · security hardening · extensible" },
    ],
  },
];

export default function OfferTable() {
  return (
    <Section id="offer-table" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Why DarkTitan
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">The offer at a glance</h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-steel">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <div className="border-b border-steel bg-charcoal/80 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-violet">
                {g.label}
              </div>
              {g.rows.map((r, i) => (
                <motion.div
                  key={r.capability}
                  className="grid grid-cols-1 gap-1 border-b border-slate bg-charcoal px-6 py-5 last:border-b-0 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-6"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-violet-glow shadow-[0_0_10px_2px_rgba(178,138,255,0.6)]" />
                    <span className="font-display text-base text-cloud">{r.capability}</span>
                  </div>
                  <p className="font-mono text-[13px] leading-relaxed text-muted">{r.delivers}</p>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
