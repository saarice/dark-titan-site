import { motion } from "framer-motion";
import Section from "../Section";

const STOPS = [
  {
    title: "Describe the outcome",
    body: "Hand the factory a goal, a repo, and constraints.",
  },
  {
    title: "The agents build it",
    body: "Spec, code, review, test: coordinated, in parallel.",
  },
  {
    title: "It runs in production",
    body: "Deployed, observed, and operated autonomously.",
  },
];

export default function Rivers() {
  return (
    <Section id="how" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">How it works</p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            From idea to operated, in one flow.
          </h2>
        </div>

        {/* the river */}
        <div className="relative">
          {/* A single straight line threading the three steps. It draws itself in
              from the left when the section scrolls into view. Sits behind the
              cards (shows through the gaps), so it reads as one connected flow. */}
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
            {STOPS.map((s, i) => (
              <motion.li
                key={s.title}
                className="relative rounded-2xl border border-steel bg-charcoal/60 p-6 backdrop-blur-sm"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ delay: i * 0.16, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl text-cloud">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
