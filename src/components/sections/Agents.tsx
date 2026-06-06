import { motion } from "framer-motion";
import Section from "../Section";

const NODES = [
  { name: "Planner", role: "Turns intent into an executable spec." },
  { name: "Builder", role: "Writes production-grade code." },
  { name: "Reviewer", role: "Enforces standards and catches regressions." },
  { name: "Tester", role: "Proves it works before it ships." },
  { name: "Deployer", role: "Ships and operates it, lights off." },
];

export default function Agents() {
  return (
    <Section id="agents" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">The Agents</p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            An autonomous pipeline you can see.
          </h2>
        </div>

        {/* desktop constellation */}
        <div className="relative hidden md:block">
          {/* connecting line */}
          <motion.div
            className="absolute left-0 right-0 top-[14px] h-px origin-left"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(138,86,247,0.6) 12%, rgba(179,56,255,0.7) 88%, transparent)",
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <ol className="grid grid-cols-5 gap-4">
            {NODES.map((n, i) => (
              <motion.li
                key={n.name}
                className="relative flex flex-col items-start"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ delay: 0.25 + i * 0.13, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="relative mb-6 flex h-7 w-7 items-center justify-center">
                  <span className="absolute h-7 w-7 rounded-full bg-violet/20" />
                  <span className="h-2.5 w-2.5 animate-pulse-dot rounded-full bg-lavender shadow-[0_0_14px_4px_rgba(179,56,255,0.55)]" />
                </span>
                <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-lg text-cloud">{n.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{n.role}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* mobile vertical */}
        <ol className="relative space-y-8 border-l border-steel pl-7 md:hidden">
          {NODES.map((n, i) => (
            <motion.li
              key={n.name}
              className="relative"
              initial={{ opacity: 0, x: 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <span className="absolute -left-[34px] top-1 flex h-3.5 w-3.5 items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-lavender shadow-[0_0_12px_3px_rgba(179,56,255,0.5)]" />
              </span>
              <h3 className="font-display text-lg text-cloud">{n.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{n.role}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
