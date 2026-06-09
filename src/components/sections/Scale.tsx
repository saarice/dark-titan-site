import Section from "../Section";
import { useCountUp } from "../../hooks/useCountUp";

// Beat 8 (v2) — Scale on Kubernetes, as a numeric monument. The number owns the
// viewport; the 3 ideas collapse to one quiet line beneath.
const POINTS = ["Uniform central environment", "Massive concurrency", "Secure"];

function GiantMetric() {
  const { ref, display } = useCountUp(100, { duration: 1700 });
  return (
    <span
      ref={ref}
      className="block font-display leading-[0.82] text-cloud text-glow-violet"
      style={{ fontSize: "clamp(4.5rem,19vw,14rem)" }}
    >
      {display}s
    </span>
  );
}

export default function Scale() {
  return (
    <Section id="scale" className="flex min-h-screen items-center px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px] text-center">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-violet">
          Scale on Kubernetes
        </p>

        <GiantMetric />

        <p className="mt-6 font-mono text-sm uppercase tracking-[0.3em] text-lavender">
          Agents running concurrently
        </p>

        <p className="mx-auto mt-10 max-w-2xl font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          {POINTS.map((p, i) => (
            <span key={p}>
              {i > 0 && <span className="px-2 text-violet/50">·</span>}
              {p}
            </span>
          ))}
        </p>
      </div>
    </Section>
  );
}
