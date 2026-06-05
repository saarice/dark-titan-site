import { AGENTS } from "../../lib/factoryData";

export default function AgentStatus() {
  return (
    <div className="rounded-xl border border-steel bg-obsidian/60 p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Agent Status</p>
      <ul className="space-y-2.5">
        {AGENTS.map((a) => (
          <li key={a.name} className="flex items-center justify-between">
            <span className="font-body text-sm text-cloud">{a.name}</span>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] text-sig-green">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-sig-green" />
              {a.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
