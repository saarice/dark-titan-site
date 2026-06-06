import type { MonolithVersion } from "./three/Scene3D";

const OPTIONS: { id: MonolithVersion; label: string; hint: string }[] = [
  { id: "main2", label: "Main 2", hint: "Sealed obsidian" },
  { id: "f", label: "Obsidian F", hint: "Breaks apart" },
];

/**
 * Chooser so the hero monolith can be compared across the two live readings.
 * Persists the choice in the URL (?v=main2|f) so a link reopens the same one.
 * A caption names the active reading.
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

  const activeHint = OPTIONS.find((o) => o.id === version)?.hint ?? "";

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] w-[min(92vw,22rem)] -translate-x-1/2">
      <div className="rounded-2xl border border-steel bg-charcoal/85 px-3 py-2 shadow-2xl backdrop-blur-xl">
        <div className="mb-1.5 flex items-baseline justify-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">Monolith</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-lavender">{activeHint}</span>
        </div>
        <div className="flex justify-center gap-1.5">
          {OPTIONS.map((o) => {
            const active = o.id === version;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => pick(o.id)}
                title={o.hint}
                aria-label={`${o.label} - ${o.hint}`}
                aria-pressed={active}
                className={`flex h-8 flex-1 items-center justify-center rounded-lg px-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet ${
                  active ? "bg-violet text-obsidian" : "text-muted hover:bg-slate/60 hover:text-cloud"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
