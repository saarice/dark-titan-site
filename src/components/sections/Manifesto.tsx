import { motion } from "framer-motion";

const LINES = [
  "INTELLIGENCE WITHOUT CHAOS.",
  "AUTOMATION WITHOUT SURRENDER.",
  "CONTROL WITHOUT FRICTION.",
];

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative flex min-h-screen items-center overflow-hidden px-6 py-32 md:px-10"
    >
      {/* readability scrim (the seam intentionally does NOT run through here —
          it lives only at the start of the page, through the Factory beat) */}
      <div
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 50%, rgba(10,10,12,0.9), rgba(10,10,12,0.4) 80%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1100px] text-center">
        <div className="space-y-1 md:space-y-2">
          {LINES.map((line, i) => (
            <motion.h2
              key={line}
              className="font-display text-[clamp(1.6rem,6.8vw,4.5rem)] leading-[1.04] tracking-tight text-cloud"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ delay: i * 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {line}
            </motion.h2>
          ))}
          <motion.h2
            className="pt-8 font-display text-[clamp(1.6rem,6.8vw,4.5rem)] leading-[1.04] tracking-tight text-lavender"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ delay: LINES.length * 0.18 + 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ textShadow: "0 0 30px rgba(197,122,255,0.4)" }}
          >
            LIGHTS OFF. CODE{" "}
            {/* "OUT." flickers on like a neon tube and keeps a bright glow */}
            <motion.span
              className="neon-out"
              initial={{ opacity: 0.15 }}
              whileInView={{ opacity: [0.15, 1, 0.25, 1, 0.6, 1] }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{
                delay: LINES.length * 0.18 + 0.55,
                duration: 1.1,
                times: [0, 0.18, 0.32, 0.5, 0.7, 1],
                ease: "easeOut",
              }}
            >
              OUT.
            </motion.span>
          </motion.h2>
        </div>
      </div>
    </section>
  );
}
