import { useEffect, useRef } from "react";

/**
 * Streaming activity log — short monospace lines tick down the side, newest at
 * the bottom, auto-scrolled into view. Reinforces the sense of a live system.
 */
export default function ActivityLog({ lines }: { lines: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate bg-charcoal/70">
      <div className="flex items-center gap-2 border-b border-slate px-4 py-3">
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-sig-green" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Activity Log
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden px-4 py-3">
        {/* top fade so older lines dissolve as they scroll up */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8"
          style={{ background: "linear-gradient(rgb(var(--charcoal)), rgba(17,18,22,0))" }}
        />
        <div className="flex flex-col justify-end gap-1.5">
          {lines.map((line, i) => {
            const shipped = line.includes("shipped");
            return (
              <p
                key={`${i}-${line}`}
                className="font-mono text-[11px] leading-snug"
                style={{ color: shipped ? "rgb(var(--sig-green))" : "rgb(var(--fg-faint))" }}
              >
                <span className="text-violet">{">"}</span> {line}
              </p>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}
