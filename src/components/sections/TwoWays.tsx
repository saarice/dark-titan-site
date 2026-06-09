import { useState } from "react";
import { motion } from "framer-motion";
import Section from "../Section";

/**
 * Beat 3 (v2) — "Two ways DarkTitan delivers value", as an interactive split
 * stage (not two equal cards). Hovering/focusing a half expands it and dims the
 * other — a real, cinematic choice that lets a mixed audience lean into their
 * track. Reduced-motion / no-hover: both halves shown equally with details.
 */
const CARDS = [
  {
    no: "01",
    title: "As Infrastructure",
    body: "The autonomous engine itself — agent pipelines as code in git, with deterministic execution, hard governance, runtime control, and Kubernetes scale.",
    points: ["Process as code", "Control over agent behavior", "Runtime control · scale · shared memory"],
    href: "#pillar-infra",
  },
  {
    no: "02",
    title: "As an Ecosystem",
    body: "Infrastructure plus coded methodology — wired into your existing systems and shipped with proven, pre-baked engineering flows.",
    points: ["Integration with external systems", "Pre-baked, reusable flows", "Methodology that compounds over time"],
    href: "#pillar-eco",
  },
];

export default function TwoWays() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <Section id="offer" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            How to read this offer
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            Two ways DarkTitan delivers value
          </h2>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:gap-3" onMouseLeave={() => setActive(null)}>
          {CARDS.map((c, i) => {
            const isActive = active === i;
            const isDimmed = active !== null && active !== i;
            return (
              <motion.a
                key={c.no}
                href={c.href}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group relative flex min-h-[400px] flex-col overflow-hidden rounded-2xl border p-8 backdrop-blur-sm focus-visible:outline-none"
                style={{ flexBasis: 0, background: "rgb(var(--charcoal) / 0.6)" }}
                animate={{
                  flexGrow: isActive ? 1.7 : isDimmed ? 0.75 : 1,
                  opacity: isDimmed ? 0.5 : 1,
                  borderColor: isActive ? "rgba(155,109,255,0.7)" : "rgba(155,109,255,0.22)",
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl leading-none text-lavender text-glow-violet">
                    {c.no}
                  </span>
                  <h3 className="font-display text-2xl leading-tight text-cloud md:text-3xl">{c.title}</h3>
                </div>
                <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{c.body}</p>

                {/* details — emphasised as the half expands */}
                <motion.ul
                  className="mt-6 space-y-2.5 border-t border-slate pt-5"
                  animate={{ opacity: isDimmed ? 0.5 : 1 }}
                >
                  {c.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.1em] text-cloud/80"
                    >
                      <span className="h-1.5 w-1.5 flex-none rounded-full bg-violet shadow-[0_0_10px_2px_rgba(155,109,255,0.5)]" />
                      {p}
                    </li>
                  ))}
                </motion.ul>

                <span className="mt-auto inline-flex items-center gap-1.5 pt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-violet">
                  Explore
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
