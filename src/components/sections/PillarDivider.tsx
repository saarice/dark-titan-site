import { motion } from "framer-motion";

/**
 * Full-bleed pillar divider — the big statement beat that opens each value pillar
 * (Beat 4 As Infrastructure, Beat 11 As an Ecosystem). v2: breathing-room
 * typographic statement, monolith solid behind, NO chip row (those words become
 * the PillarRail). A giant outlined index number gives each pillar an asymmetric,
 * magazine-spread composition; `align` mirrors Pillar II so they don't read as copies.
 */
export default function PillarDivider({
  id,
  eyebrow,
  index,
  title,
  sub,
  align = "left",
}: {
  id: string;
  eyebrow: string;
  index: string;
  title: string;
  sub: string;
  align?: "left" | "right";
}) {
  const right = align === "right";
  return (
    <section
      id={id}
      className="relative flex min-h-screen items-center overflow-hidden px-6 py-32 md:px-10"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "radial-gradient(78% 70% at 50% 50%, rgba(10,10,12,0.92), rgba(10,10,12,0.35) 80%)",
        }}
      />

      <div className={`mx-auto w-full max-w-[1100px] ${right ? "text-right" : ""}`}>
        <motion.div
          className="select-none font-display leading-[0.8] text-transparent"
          style={{
            fontSize: "clamp(4.5rem,15vw,12rem)",
            WebkitTextStroke: "1.5px rgba(155,109,255,0.26)",
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {index}
        </motion.div>

        <motion.p
          className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-violet"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {eyebrow}
        </motion.p>

        <motion.h2
          className="mt-3 font-display leading-[0.9] tracking-tight text-cloud"
          style={{ fontSize: "clamp(2.8rem,10vw,7rem)", textShadow: "0 0 36px rgba(155,109,255,0.25)" }}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {title}
        </motion.h2>

        <motion.p
          className={`mt-8 max-w-2xl text-lg leading-relaxed text-muted ${right ? "ml-auto" : ""}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {sub}
        </motion.p>
      </div>
    </section>
  );
}
