import { useEffect, useRef } from "react";

/** One stop on the monolith's journey: which section, and where the stone sits
 *  (in world X) while that section owns the frame. `x` is desktop, `xm` mobile.
 *  Positive = right of centre, negative = left, 0 = centred. */
export type TrackStop = { id: string; x: number; xm: number };

/**
 * Blends a target world-X for the fixed monolith from the sections currently on
 * screen. Each tracked section contributes by how much of the viewport it covers
 * (0..1); uncovered space pulls toward centre. The result is a single ref that
 * glides the stone right -> centre -> left -> centre... as you scroll, so it
 * "travels" behind the page from section to section. No re-renders.
 */
export function useMonolithX(track: TrackStop[]) {
  const x = useRef(track[0]?.x ?? 0);
  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      const mobile = window.innerWidth < 768;
      let wsum = 0;
      let xsum = 0;
      for (const t of track) {
        const el = document.getElementById(t.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const top = Math.max(r.top, 0);
        const bottom = Math.min(r.bottom, vh);
        const cover = Math.max(0, Math.min(1, (bottom - top) / vh));
        if (cover <= 0) continue;
        wsum += cover;
        xsum += cover * (mobile ? t.xm : t.x);
      }
      // Any viewport not covered by a tracked section pulls toward centre (0).
      const rest = Math.max(0, 1 - wsum);
      wsum += rest;
      x.current = wsum > 0 ? xsum / wsum : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [track]);
  return x;
}
