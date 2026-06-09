import { motion } from "framer-motion";
import Section from "../Section";

// Beat 12 (§5.11) — Ecosystem 1 of 2: Integration with external systems.
const PILLS = [
  "SSO · Identity",
  "Jira · Issue tracking",
  "Code scanners",
  "Environment allocation",
  "… and more",
];

export default function Integrations() {
  return (
    <Section id="integrations" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1100px]">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
          Ecosystem · 1 of 2
        </p>
        <h2 className="max-w-3xl font-display text-h2 tracking-tight text-cloud">
          Integration with external systems
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          DarkTitan operates inside your existing toolchain — authenticated, ticketed, scanned, and
          provisioned through the systems your organization already trusts.
        </p>

        {/* the toolchain "bus": the systems wire onto the DarkTitan backbone */}
        <div className="relative mt-12">
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-px origin-center -translate-y-1/2 md:block"
            style={{ background: "linear-gradient(90deg, transparent, rgba(155,109,255,0.55) 50%, transparent)" }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            {PILLS.map((p, i) => (
              <motion.span
                key={p}
                className="rounded-full border border-steel bg-charcoal/80 px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.12em] text-cloud/80 backdrop-blur-sm"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {p}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
