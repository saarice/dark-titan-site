import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { LANES, MAX_ROWS, boardAtTime, logLinesAt } from "../../lib/tempoData";
import TicketCard, { ROW } from "./TicketCard";
import ActivityLog from "./ActivityLog";

const LANE_GAP = 14;
const HEADER_H = 44; // lane header height inside the field
const FIELD_H = HEADER_H + MAX_ROWS * ROW + 8; // tallest a lane can get + breathing room

// A still frame to show when the visitor prefers reduced motion: far enough in
// that every lane is populated, but frozen.
const STILL_T = 5200;

/** Measure an element's content width, kept current across resizes. */
function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export default function Board() {
  const reduced = useReducedMotion();
  const [fieldRef, fieldW] = useWidth<HTMLDivElement>();

  // Single source of truth: elapsed time since the board began. The whole
  // board, lifted cards, log, and counter are *derived* from this via the pure
  // boardAtTime / logLinesAt, so nothing can drift or double-count. There is no
  // loop seam — tickets are born, flow, and age off forever, all from one clock.
  const [tMs, setTms] = useState(reduced ? STILL_T : 0);

  useEffect(() => {
    if (reduced) return;

    let raf = 0;
    let start = 0;

    const frame = (now: number) => {
      if (!start) start = now;
      // Endless: elapsed grows without bound. (boardAtTime adds WARMUP so the
      // board is already fully populated at t = 0.)
      setTms(now - start);
      raf = requestAnimationFrame(frame);
    };

    // Browsers throttle rAF in background tabs, so a single always-on loop is
    // cheap; no visibility gating needed.
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const t = reduced ? STILL_T : tMs;
  const board = useMemo(() => boardAtTime(t), [t]);
  const log = useMemo(() => logLinesAt(t), [t]);

  const laneW = fieldW > 0 ? (fieldW - LANE_GAP * (LANES.length - 1)) / LANES.length : 0;
  const laneX = (i: number) => i * (laneW + LANE_GAP);
  const laneIndex = (id: (typeof LANES)[number]["id"]) => LANES.findIndex((l) => l.id === id);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* board */}
      <div className="overflow-hidden rounded-2xl border border-steel bg-obsidian/60 p-4 shadow-2xl backdrop-blur-sm">
        {/* live header: pulsing dot + climbing shipped counter */}
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-violet" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet">
              Build replay · live
            </span>
          </span>
          <span className="font-mono text-[11px] tabular-nums text-muted">
            <span className="text-cloud">{board.shipped}</span>
            <span className="text-faint"> shipped this quarter</span>
          </span>
        </div>

        {/* lane field — one positioning context so cards glide across lanes.
            Wrapped in a horizontal scroller with a usable minimum width so the
            lanes/cards stay legible on phones (swipe across) instead of being
            squeezed into truncated slivers; on desktop the 1fr column is wider
            than the minimum so no scrollbar appears. */}
        <div className="-mx-1 overflow-x-auto overflow-y-hidden pb-1">
        <div ref={fieldRef} className="relative mx-1" style={{ height: FIELD_H, minWidth: 470 }}>
          {/* lane columns (chrome) */}
          {LANES.map((lane, i) => {
            const active = lane.id === "progress";
            return (
              <div
                key={lane.id}
                className="absolute top-0 rounded-xl border"
                style={{
                  left: laneX(i),
                  width: laneW,
                  height: FIELD_H,
                  borderColor: active ? "rgb(var(--violet) / 0.45)" : "rgb(var(--slate))",
                  background: active ? "rgb(var(--violet) / 0.06)" : "rgb(var(--charcoal) / 0.4)",
                  boxShadow: active ? "0 0 40px -8px rgb(var(--violet) / 0.4) inset" : "none",
                }}
              >
                <div className="flex items-center justify-between px-3" style={{ height: HEADER_H }}>
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${active ? "animate-pulse-dot" : ""}`}
                      style={{
                        background: active ? "rgb(var(--lavender))" : "rgb(var(--fg-faint))",
                      }}
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                      {lane.label}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-faint">
                    {board.counts[lane.id]}
                  </span>
                </div>
              </div>
            );
          })}

          {/* tickets */}
          {laneW > 0 && (
            <AnimatePresence>
              {board.cards.map((card) => (
                <TicketCard
                  key={card.id}
                  card={card}
                  x={laneX(laneIndex(card.lane)) + 10}
                  y={HEADER_H + card.slot * ROW + 4}
                  width={laneW - 20}
                  moving={card.moving}
                  done={card.lane === "done"}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
        </div>
      </div>

      {/* activity log */}
      <div className="hidden lg:block" style={{ minHeight: FIELD_H + 60 }}>
        <ActivityLog lines={log} />
      </div>
    </div>
  );
}
