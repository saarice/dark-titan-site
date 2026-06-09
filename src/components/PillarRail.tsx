import { useEffect, useRef, useState } from "react";

type Item = { label: string; id: string };

/**
 * The pillar progress rail (v2 Beats 4 & 11). The chip words from the divider are
 * demoted to a functional vertical section-nav: a dot column that fills as you
 * scroll the pillar, with the active sub-section highlighted. Labels stay
 * collapsed (dots only) and reveal on hover/focus, so it never collides with the
 * centred content. Shown on wide screens only; the main Nav covers small ones.
 */
export default function PillarRail({ label, items }: { label: string; items: Item[] }) {
  const [active, setActive] = useState(-1);
  const [visible, setVisible] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      const mid = vh * 0.5;
      const rects = items.map((it) => document.getElementById(it.id)?.getBoundingClientRect());
      let best = -1;
      let bestDist = Infinity;
      rects.forEach((r, i) => {
        if (!r) return;
        const c = (r.top + r.bottom) / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      const first = rects[0];
      const last = rects[rects.length - 1];
      setActive(best);
      setVisible(!!first && !!last && first.top < vh * 0.7 && last.bottom > vh * 0.3);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  const fill = active < 0 ? 0 : (active + 1) / items.length;

  return (
    <nav
      aria-label={`${label} sections`}
      className={`fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 xl:block ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="group relative rounded-xl px-3 py-4 transition-colors duration-300 hover:bg-charcoal/70 hover:backdrop-blur-sm focus-within:bg-charcoal/70 focus-within:backdrop-blur-sm">
        <p className="mb-4 pl-1 font-mono text-[9px] uppercase tracking-[0.25em] text-violet/70">{label}</p>
        <div className="relative flex flex-col gap-5">
          {/* track + fill */}
          <span className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-steel" />
          <span
            className="absolute left-[3px] top-1.5 w-px origin-top bg-gradient-to-b from-violet to-lavender transition-transform duration-500"
            style={{ height: "calc(100% - 0.75rem)", transform: `scaleY(${fill})` }}
          />
          {items.map((it, i) => {
            const state = i < active ? "past" : i === active ? "active" : "future";
            return (
              <a key={it.id} href={`#${it.id}`} className="relative z-10 flex items-center gap-3" aria-current={state === "active" ? "step" : undefined}>
                <span
                  className={`h-[7px] w-[7px] flex-none rounded-full ring-2 ring-obsidian transition-all duration-300 ${
                    state === "active"
                      ? "scale-125 bg-lavender shadow-[0_0_10px_2px_rgba(197,122,255,0.7)]"
                      : state === "past"
                        ? "bg-violet"
                        : "bg-steel"
                  }`}
                />
                <span
                  className={`-translate-x-1 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 ${
                    state === "active" ? "text-cloud" : state === "past" ? "text-muted" : "text-faint"
                  }`}
                >
                  {it.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
