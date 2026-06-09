import { useEffect, useRef, useState } from "react";

/** Animates a number 0 -> target once the element scrolls into view. Respects reduced motion. */
export function useCountUp(target: number, opts: { duration?: number; decimals?: number } = {}) {
  const { duration = 2200, decimals = 0 } = opts;
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          if (reduced) {
            setVal(target);
            return;
          }
          const t0 = performance.now();
          const tick = (t: number) => {
            const k = Math.min(1, (t - t0) / duration);
            const e = 1 - Math.pow(1 - k, 3);
            setVal(target * e);
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, display: val.toFixed(decimals) };
}
