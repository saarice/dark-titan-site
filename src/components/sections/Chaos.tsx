import { motion } from "framer-motion";

const LINES = ["MORE NOISE.", "MORE ALERTS.", "MORE TOOLS.", "MORE COMPLEXITY."];

export default function Chaos() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center px-6 py-32 md:px-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="max-w-3xl">
          {LINES.map((l, i) => (
            <motion.p
              key={l}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-h2 leading-[1.04] tracking-tight text-cloud/30"
            >
              {l}
            </motion.p>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="relative mt-12"
          >
            <div
              className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-[1]"
              style={{ background: "radial-gradient(60% 75% at 30% 50%, rgba(10,10,12,0.96), rgba(10,10,12,0) 78%)" }}
            />
            <p
              className="font-display text-h2 leading-[1.04] tracking-tight text-lavender"
              style={{ textShadow: "0 0 28px rgba(197,122,255,0.55), 0 0 60px rgba(155,109,255,0.35)" }}
            >
              We bring order.
            </p>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-muted">
              One factory. Autonomous agents that plan, build, review, test, and operate, so the
              noise collapses into a single line of control.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
