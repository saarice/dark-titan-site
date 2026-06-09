import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Section wrapper: optional readability scrim + scroll-reveal (respects reduced motion via CSS). */
export default function Section({
  id,
  children,
  className = "",
  scrim = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  scrim?: boolean;
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      {scrim && (
        <div
          className="pointer-events-none absolute inset-0 -z-[1]"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 50%, rgba(10,10,12,0.86), rgba(10,10,12,0) 75%)",
          }}
        />
      )}
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}
