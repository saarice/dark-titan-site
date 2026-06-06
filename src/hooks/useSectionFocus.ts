import { useEffect, useRef } from "react";

/** One stop on the monolith's journey: which section, and where the stone sits
 *  (in world X) while that section owns the frame, on desktop.
 *  Positive = right of centre, negative = left, 0 = centred. */
export type TrackStop = { id: string; x: number };

/** On phones every section is a single full-width column, so sliding the stone
 *  across would drop its glow behind the copy. Instead it parks just off the
 *  right edge as a subtle accent the whole way down. */
const MOBILE_PARK = 2.2;

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
    const compute = () => {
      if (window.innerWidth < 768) {
        x.current = MOBILE_PARK;
        return;
      }
      const vh = window.innerHeight;
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
        xsum += cover * t.x;
      }
      // Any viewport not covered by a tracked section pulls toward centre (0).
      const rest = Math.max(0, 1 - wsum);
      wsum += rest;
      x.current = wsum > 0 ? xsum / wsum : 0;
    };
    // Throttle to one read per animation frame. Scroll events can fire many
    // times per frame, and reading layout right after the page mutates the DOM
    // on scroll forces a synchronous reflow each time (layout thrash). Batching
    // into a single rAF keeps it to one clean layout read per frame.
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [track]);
  return x;
}
