import { motion } from "framer-motion";
import Section from "../Section";

// Beat 13 (§5.12) — Ecosystem 2 of 2: Pre-baked flows. The "Aspect modernization"
// card is where the monolith→microservices set-piece (Beat 13b) anchors.
const CARDS: { title: string; body: string; anchor?: string }[] = [
  {
    title: "Brownfield reverse-engineering",
    body: "Automatically map and document existing, undocumented codebases — turn legacy into understood, navigable systems.",
  },
  {
    title: "Aspect modernization",
    body: "Systematically modernize a chosen aspect across the codebase — frameworks, patterns, dependencies.",
    anchor: "aspect-modernization",
  },
  {
    title: "Security hardening",
    body: "Drive structured remediation flows that find and close security gaps across the codebase.",
  },
  {
    title: "… and more",
    body: "An extensible library of coded methodologies — add your organization's own proven flows.",
  },
];

export default function PreBakedFlows() {
  return (
    <Section id="flows" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Ecosystem · 2 of 2
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">Pre-baked flows</h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-steel bg-steel sm:grid-cols-2">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              id={c.anchor}
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
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
