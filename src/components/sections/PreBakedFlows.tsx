import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section from "../Section";

/**
 * Beat 13 (v2) — Pre-baked flows, as a split stage (not 4 equal cards). The flows
 * sit compactly on the left; the selected one is previewed on the right. "Aspect
 * modernization" is the entry point to Beat M — its preview points down into the
 * monolith→microservices set-piece.
 */
const FLOWS: { title: string; body: string; featured?: boolean }[] = [
  {
    title: "Brownfield reverse-engineering",
    body: "Automatically map and document existing, undocumented codebases — turn legacy into understood, navigable systems.",
  },
  {
    title: "Aspect modernization",
    body: "Systematically modernize a chosen aspect across the codebase — frameworks, patterns, dependencies.",
    featured: true,
  },
  {
    title: "Security hardening",
    body: "Drive structured remediation flows that find and close security gaps across the codebase.",
  },
  {
    title: "… and more",
    body: "An extensible library of coded methodologies — add your organization's own proven flows.",
  },
];

export default function PreBakedFlows() {
  const [active, setActive] = useState(1); // default: Aspect modernization (entry to Beat M)
  const flow = FLOWS[active];

  return (
    <Section id="flows" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Coded methodology
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">Pre-baked flows</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_1.1fr] md:gap-12">
          {/* left — the compact, restrained list */}
          <ul className="flex flex-col">
            {FLOWS.map((f, i) => {
              const on = i === active;
              return (
                <li key={f.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-pressed={on}
                    className="group flex w-full items-center gap-3 border-l-2 py-4 pl-4 text-left transition-colors"
                    style={{ borderColor: on ? "rgb(var(--violet))" : "rgb(var(--steel))" }}
                  >
                    <span className={`font-mono text-[11px] ${on ? "text-violet" : "text-faint"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display text-lg leading-tight transition-colors ${
                        on ? "text-cloud" : "text-muted group-hover:text-cloud"
                      }`}
                    >
                      {f.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* right — the live preview of the selected flow */}
          <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-steel bg-charcoal/60 p-8 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet">
                  Flow {String(active + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-2xl leading-tight text-cloud">{flow.title}</h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{flow.body}</p>

                {flow.featured && (
                  <a
                    href="#break"
                    className="group mt-8 inline-flex items-center gap-2 rounded-full border border-violet/40 bg-violet/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-lavender transition-colors hover:border-violet hover:bg-violet/20"
                  >
                    Watch the monolith split
                    <span className="transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}
