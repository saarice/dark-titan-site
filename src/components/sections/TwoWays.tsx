import { motion } from "framer-motion";
import Section from "../Section";

// Beat 3 (§5.2) — orientation: the two ways DarkTitan delivers value. The cards
// let a mixed audience self-select (Infrastructure-minded vs. Ecosystem-minded).
const CARDS = [
  {
    no: "01",
    title: "As Infrastructure",
    body: "The autonomous engine itself — agent pipelines as code in git, with deterministic execution, hard governance, runtime control, and Kubernetes scale.",
    points: ["Process as code", "Control over agent behavior", "Runtime control UI · scale · shared memory"],
    href: "#pillar-infra",
  },
  {
    no: "02",
    title: "As an Ecosystem",
    body: "Infrastructure plus coded methodology — wired into your existing systems and shipped with proven, pre-baked engineering flows.",
    points: ["Integration with external systems", "Pre-baked, reusable flows", "Methodology that compounds over time"],
    href: "#pillar-eco",
  },
];

export default function TwoWays() {
  return (
    <Section id="offer" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            How to read this offer
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            Two ways DarkTitan delivers value
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {CARDS.map((c, i) => (
            <motion.a
              key={c.no}
              href={c.href}
              className="group relative block overflow-hidden rounded-2xl border border-violet/25 bg-charcoal/60 p-8 backdrop-blur-sm transition-colors hover:border-violet/60"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl leading-none text-lavender text-glow-violet">
                  {c.no}
                </span>
                <h3 className="font-display text-2xl leading-tight text-cloud">{c.title}</h3>
              </div>
              <p className="mt-4 text-base leading-relaxed text-muted">{c.body}</p>
              <ul className="mt-6 space-y-2.5 border-t border-slate pt-5">
                {c.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.1em] text-cloud/80"
                  >
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-violet shadow-[0_0_10px_2px_rgba(155,109,255,0.5)]" />
                    {p}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-violet">
                Explore
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </Section>
  );
}
