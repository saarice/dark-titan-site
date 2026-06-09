import { motion } from "framer-motion";

/**
 * Beat 10 (§5.9) — The Infrastructure Principle. The solution payoff / emotional
 * peak; a full-bleed statement band, the solid monolith at its most commanding
 * behind it. "you control." is the resolution callback to Beat 2.
 */
export default function Manifesto() {
  return (
    <section
      id="principle"
      className="relative flex min-h-screen items-center overflow-hidden px-6 py-32 md:px-10"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 50%, rgba(10,10,12,0.9), rgba(10,10,12,0.4) 80%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1100px] text-center">
        <motion.p
          className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-violet"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.6 }}
        >
          The Infrastructure Principle
        </motion.p>

        <h2 className="font-display text-[clamp(2.25rem,8vw,5.5rem)] leading-[1.02] tracking-tight text-cloud">
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Infrastructure
          </motion.span>
          <motion.span
            className="block text-lavender"
            style={{ textShadow: "0 0 32px rgba(197,122,255,0.45), 0 0 70px rgba(155,109,255,0.3)" }}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            you control.
          </motion.span>
        </h2>

        <motion.p
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          Versioned in git. Deterministic on every run. Governed by hard limits. Scaled across the
          cluster. Not a black box you hand the keys to.
        </motion.p>
      </div>
    </section>
  );
}
