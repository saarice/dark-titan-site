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
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-violet">How it works</p>
          <h2 className="font-display text-4xl leading-[0.95] tracking-tight text-cloud md:text-6xl">
            From idea to operated, in one flow.
          </h2>
        </div>

        {/* the river */}
        <div className="relative">
          <svg
            className="pointer-events-none absolute inset-x-0 top-7 hidden h-16 w-full md:block"
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="river-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#6020D9" stopOpacity="0.1" />
                <stop offset="0.5" stopColor="#B338FF" stopOpacity="0.85" />
                <stop offset="1" stopColor="#6020D9" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M0,30 C200,30 200,12 400,12 C600,12 600,48 800,48 C1000,48 1000,30 1200,30"
              fill="none"
              stroke="url(#river-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="2 10"
              className="river-dash"
            />
          </svg>

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
