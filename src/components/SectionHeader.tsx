import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  subtext: string;
  cta?: string;
  ctaHref?: string;
};

export default function SectionHeader({ eyebrow, title, subtext, cta, ctaHref = "#" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: "-100px" }}
      className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-stroke" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{eyebrow}</span>
        </div>
        <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted md:text-base">{subtext}</p>
      </div>

      {cta && (
        <a
          href={ctaHref}
          className="group relative hidden self-start rounded-full text-sm md:inline-flex md:self-end"
        >
          <span className="gradient-border-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-stroke bg-surface px-5 py-2.5 text-text-primary">
            {cta} <span className="text-accent">→</span>
          </span>
        </a>
      )}
    </motion.div>
  );
}
