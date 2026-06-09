import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Full-bleed pillar divider — the big statement beat that opens each value pillar
 * (Beat 4 As Infrastructure, Beat 11 As an Ecosystem). The solid monolith sits
 * behind it as "the infrastructure you own". Content is passed in (verbatim PDF).
 */
export default function PillarDivider({
  id,
  eyebrow,
  title,
  sub,
  pills,
  visual,
}: {
  id: string;
  eyebrow: string;
  title: string;
  sub: string;
  pills: string[];
  visual?: ReactNode;
}) {
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

      <div className="mx-auto w-full max-w-[1100px]">
        <motion.p
          className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-violet"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.6 }}
        >
          {eyebrow}
        </motion.p>

        <motion.h2
          className="font-display text-h1 leading-[0.95] tracking-tight text-cloud"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textShadow: "0 0 36px rgba(155,109,255,0.25)" }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {sub}
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap gap-2.5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {pills.map((p) => (
            <span
              key={p}
              className="rounded-full border border-steel px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted"
            >
              {p}
            </span>
          ))}
        </motion.div>

        {visual && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {visual}
          </motion.div>
        )}
      </div>
    </section>
  );
}
