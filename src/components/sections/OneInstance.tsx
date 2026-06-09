import { motion } from "framer-motion";
import Section from "../Section";

// Beat 9 (§5.8) — Infrastructure 5 of 5: One instance, the whole team.
const CARDS = [
  {
    title: "Full redundancy",
    body: "Several team members share the same DarkTitan instance. Every developer can essentially support any ticket — no single point of failure, no siloed context.",
  },
  {
    title: "Long-term project memory",
    body: "Persistent, project-based memory that accumulates over time — the instance gets smarter about your codebase with every run.",
  },
];

export default function OneInstance() {
  return (
    <Section id="team" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Infrastructure · 5 of 5
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            One instance, the whole team
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              className="rounded-2xl border border-steel bg-charcoal/60 p-8 backdrop-blur-sm"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-glow shadow-[0_0_10px_2px_rgba(178,138,255,0.6)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-xl leading-tight text-cloud">{c.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
