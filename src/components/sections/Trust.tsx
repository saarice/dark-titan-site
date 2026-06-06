import { motion } from "framer-motion";
import Section from "../Section";

const PILLARS: { tag: string; title: string; body: string }[] = [
  {
    tag: "Control",
    title: "A human holds the final say.",
    body: "Promotion to production waits for your sign-off. Nothing ships without a gate you set, and you can pause or stop any agent mid-run.",
  },
  {
    tag: "Security",
    title: "Guardrails, not guesswork.",
    body: "Every agent runs inside the scopes, permissions, and stop conditions you define. Each plan, change, and deploy is logged for a full audit trail.",
  },
  {
    tag: "Scale",
    title: "Many agents, one pane of glass.",
    body: "Run work in parallel across repos and services without losing the thread. The same controls hold whether it is one pipeline or a hundred.",
  },
  {
    tag: "Enterprise",
    title: "Runs in your environment.",
    body: "The factory operates against your repositories and infrastructure, under your identity, access rules, and review process. Your code stays yours.",
  },
];

export default function Trust() {
  return (
    <Section id="trust" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Trust &amp; Control
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            Autonomous, never{" "}
            <span className="text-lavender text-glow-violet">unsupervised.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
            Built for teams that answer to security reviews and change boards. The factory moves at
            machine speed while you keep the controls, the audit trail, and the final call.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-steel bg-steel sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.tag}
              className="group bg-charcoal p-8 transition-colors hover:bg-charcoal/60"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-glow shadow-[0_0_10px_2px_rgba(178,138,255,0.6)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet">
                  {p.tag}
                </span>
              </div>
              <h3 className="font-display text-xl leading-tight text-cloud">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
