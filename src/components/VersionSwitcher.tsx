import type { MonolithVersion } from "./three/Scene3D";

const OPTIONS: { id: MonolithVersion; label: string; hint: string }[] = [
  { id: "d", label: "D", hint: "Cinematic" },
  { id: "e", label: "E", hint: "Seal + break" },
];

/**
 * Temporary chooser so the hero monolith can be compared in two directions.
 * Persists the choice in the URL (?v=d|e) so a link reopens the same version.
 */
export default function VersionSwitcher({
  version,
  onChange,
}: {
  version: MonolithVersion;
  onChange: (v: MonolithVersion) => void;
}) {
  const pick = (v: MonolithVersion) => {
    onChange(v);
    const url = new URL(window.location.href);
    url.searchParams.set("v", v);
    window.history.replaceState({}, "", url);
  };

  return (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-steel bg-charcoal/85 p-1 shadow-2xl backdrop-blur-xl">
        <span className="px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Monolith</span>
        {OPTIONS.map((o) => {
          const active = o.id === version;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => pick(o.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                active ? "bg-violet text-obsidian" : "text-muted hover:text-cloud"
              }`}
            >
              <span className="font-display text-sm">{o.label}</span>
              <span className="hidden sm:inline">{o.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
