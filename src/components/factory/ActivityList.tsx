import { ACTIVITY } from "../../lib/factoryData";

// §5.6 status → signal-token color (the text label is always shown, never color alone).
const STATE_COLOR: Record<string, string> = {
  RUNNING: "text-sig-green",
  QUEUED: "text-lavender",
  BLOCKED: "text-sig-red",
  SHIPPED: "text-violet-glow",
};

export default function ActivityList() {
  return (
    <div className="rounded-xl border border-steel bg-obsidian/60 p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">darktitan · board</p>
      <ul className="divide-y divide-slate">
        {ACTIVITY.map((a) => (
          <li key={a.task} className="flex items-center justify-between gap-3 py-2.5">
            <span className="truncate font-mono text-sm text-cloud">{a.task}</span>
            <span className="flex flex-none items-center gap-3">
              <span className={`font-mono text-[11px] tracking-wide ${STATE_COLOR[a.state] ?? "text-muted"}`}>
                {a.state}
              </span>
              <span className="font-mono text-[10px] text-faint">{a.when}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
