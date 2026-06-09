import { motion } from "framer-motion";
import Section from "../Section";

// Beat 5 (§5.4) — Infrastructure 1 of 5: Process as code. The 3 cards give the
// flow.yaml pipeline scene below its argument (deterministic, in git).
const CARDS = [
  {
    title: "In Git",
    body: "Every pipeline — prompts, models, tools, roles — lives in version control. Reviewable, auditable, diffable.",
  },
  {
    title: "Deterministic",
    body: 'Repeatable, predictable runs — unlike opaque, "AI-based TryCycle" approaches that drift between executions.',
    determinism: true,
  },
  {
    title: "Wholistic",
    body: "Prompt, model, tools and roles are all packaged and configurable per stage of the pipeline — one coherent unit.",
  },
];

export default function Rivers() {
  return (
    <Section id="process" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Infrastructure · 1 of 5
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">Process as code</h2>
        </div>

        <div className="relative">
          {/* a straight line threading the three cards, drawn in on scroll */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-10 hidden h-[2px] origin-left md:block"
            style={{
              background: "linear-gradient(90deg, transparent 0%, #C57AFF 50%, transparent 100%)",
              boxShadow: "0 0 8px rgba(179,56,255,0.55)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />

          <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
            {CARDS.map((s, i) => (
              <motion.li
                key={s.title}
                className="relative rounded-2xl border border-steel bg-charcoal/60 p-6 backdrop-blur-sm"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ delay: i * 0.16, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-violet">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet shadow-[0_0_10px_2px_rgba(155,109,255,0.5)]" />
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl text-cloud">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>

                {/* "same input → same output" micro-anim (opacity loop is reduced-safe) */}
                {s.determinism && (
                  <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-violet/80">
                    <span className="rounded border border-steel px-1.5 py-0.5">in</span>
                    <motion.span
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                    <span className="rounded border border-steel px-1.5 py-0.5">out</span>
                    <span className="text-faint">· identical every run</span>
                  </div>
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
