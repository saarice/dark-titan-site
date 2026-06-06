import { useEffect, useRef } from "react";

/**
 * Tracks how fully a section fills the viewport, as 0..1 in a ref (no re-renders).
 * 1 means the section covers the whole screen height; ramps to 0 as it scrolls
 * past the top or bottom edge. Used to choreograph the fixed WebGL monolith per
 * section (e.g. slide it aside while a section's content takes the frame).
 */
export function useSectionFocus(id: string) {
  const focus = useRef(0);
  useEffect(() => {
    const update = () => {
      const el = document.getElementById(id);
      if (!el) {
        focus.current = 0;
        return;
      }
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const top = Math.max(r.top, 0);
      const bottom = Math.min(r.bottom, vh);
      focus.current = Math.max(0, Math.min(1, (bottom - top) / vh));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [id]);
  return focus;
}
