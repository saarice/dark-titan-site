import Section from "../Section";
import { useCountUp } from "../../hooks/useCountUp";

// Beat 8 (§5.7) — Infrastructure 4 of 5: Scale on Kubernetes.
const POINTS = [
  {
    title: "Uniform central environment",
    body: "One organization-authorized flow and tool set, in a single governed environment.",
  },
  {
    title: "Massive concurrency",
    body: "Run hundreds of agents at once — the cluster, not the laptop, is the limit.",
  },
  {
    title: "Secure",
    body: "Enterprise-grade isolation and controls on proven cloud-native foundations.",
  },
];

function GiantMetric() {
  const { ref, display } = useCountUp(100, { duration: 1600 });
  return (
    <span
      ref={ref}
      className="font-display text-[clamp(4rem,13vw,8.5rem)] leading-none text-cloud text-glow-violet"
    >
      {display}s
    </span>
  );
}

export default function Scale() {
  return (
    <Section id="scale" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Infrastructure · 4 of 5
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">Scale on Kubernetes</h2>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-[auto_1fr] md:gap-16">
          <div>
            <GiantMetric />
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
              Agents running concurrently
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {POINTS.map((p) => (
              <div key={p.title}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet shadow-[0_0_10px_2px_rgba(155,109,255,0.5)]" />
                  <h3 className="font-display text-base text-cloud">{p.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
