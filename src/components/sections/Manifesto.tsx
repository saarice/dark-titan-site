import { motion } from "framer-motion";

/**
 * Beat 10 (v2) — the mid-page typographic CENTERPIECE. Full-viewport, the largest
 * type on the page, near-empty surroundings — a magazine-spread opener. The
 * emotional peak of the solution and the callback to Beat 2's turn. One
 * orchestrated, confident reveal; don't over-animate a statement this strong.
 */
export default function Manifesto() {
  return (
    <section
      id="principle"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32 md:px-10"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 50%, rgba(10,10,12,0.92), rgba(10,10,12,0.35) 82%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1200px] text-center">
        <motion.p
          className="mb-8 font-mono text-xs uppercase tracking-[0.35em] text-violet"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.7 }}
        >
          The Infrastructure Principle
        </motion.p>

        <h2 className="font-display leading-[0.86] tracking-tight text-cloud" style={{ fontSize: "clamp(3rem,13vw,9.5rem)" }}>
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Infrastructure
          </motion.span>
          <motion.span
            className="block text-lavender"
            style={{ textShadow: "0 0 40px rgba(197,122,255,0.5), 0 0 90px rgba(155,109,255,0.32)" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.8, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            you control.
          </motion.span>
        </h2>

        <motion.p
          className="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          Not a black box you hand the keys to.
        </motion.p>
      </div>
    </section>
  );
}
