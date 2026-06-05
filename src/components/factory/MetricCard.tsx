import { useCountUp } from "../../hooks/useCountUp";
import { TONE_CLASS, type Metric } from "../../lib/factoryData";

export default function MetricCard({ metric }: { metric: Metric }) {
  const { ref, display } = useCountUp(metric.value, { decimals: metric.decimals ?? 0 });
  return (
    <div className="rounded-xl border border-steel bg-obsidian/60 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-faint">{metric.label}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className={`font-display text-3xl leading-none ${TONE_CLASS[metric.tone]}`}>
          <span ref={ref}>{display}</span>
          {metric.suffix ?? ""}
        </p>
        <span className="font-mono text-[11px] text-sig-green">{metric.delta}</span>
      </div>
    </div>
  );
}
