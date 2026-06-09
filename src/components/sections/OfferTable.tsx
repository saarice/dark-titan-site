import { motion } from "framer-motion";
import Section from "../Section";

/**
 * Beat 16 (v2 archetype G) — the one structured recap, a refined editorial
 * SEMANTIC table. Copy is verbatim from the PDF slide 13 ("Why it matters for the
 * enterprise"): 6 rows, columns CAPABILITY | WHAT THE ENTERPRISE GETS.
 */
const ROWS: { capability: string; gets: string }[] = [
  { capability: "Process as code", gets: "Versioned, deterministic pipelines in git — auditable and repeatable, not opaque." },
  { capability: "Agent control", gets: "Model-per-stage, explicit concurrency, financial limits and security guardrails." },
  { capability: "Runtime control UI", gets: "Ticket-based delivery with priorities, dependencies, releases — continuous and budget-aware." },
  { capability: "Kubernetes scale", gets: "A uniform central environment running 100s of agents concurrently — securely." },
  { capability: "Shared instance", gets: "Full team redundancy + long-term project memory." },
  { capability: "Ecosystem", gets: "External integrations + pre-baked flows (brownfield, modernization, hardening…)." },
];

export default function OfferTable() {
  return (
    <Section id="offer-table" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">The full offer</p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            Why it matters for the enterprise
          </h2>
        </div>

        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Why it matters for the enterprise, by capability</caption>
          <thead>
            <tr className="border-b border-steel">
              <th scope="col" className="w-[38%] py-3 pr-6 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-violet">
                Capability
              </th>
              <th scope="col" className="py-3 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-violet">
                What the enterprise gets
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <motion.tr
                key={r.capability}
                className="border-b border-slate align-top last:border-b-0"
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <th scope="row" className="py-6 pr-6 text-left align-top font-display text-base font-normal text-cloud">
                  {r.capability}
                </th>
                <td className="py-6 align-top font-mono text-[13px] leading-relaxed text-muted">
                  {r.gets}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
