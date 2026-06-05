import { HEALTH } from "../../lib/factoryData";

export default function SystemHealth() {
  return (
    <div className="rounded-xl border border-steel bg-obsidian/60 p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">System Health</p>
      <ul className="space-y-2.5">
        {HEALTH.map((h) => (
          <li key={h.name} className="flex items-center justify-between">
            <span className="font-body text-sm text-cloud">{h.name}</span>
            <span className="font-mono text-[11px] text-sig-green">{h.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
