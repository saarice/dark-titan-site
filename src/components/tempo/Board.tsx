import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  EVENTS,
  LANES,
  LOOP_MS,
  REPLAY_MS,
  SHIPPED_BASE,
  TICKETS,
  TICKET_BY_ID,
  locate,
  logLine,
  stateAt,
} from "../../lib/tempoData";
import TicketCard, { ROW } from "./TicketCard";
import ActivityLog from "./ActivityLog";

const LANE_GAP = 14;
const HEADER_H = 44; // lane header height inside the field
const FIELD_H = HEADER_H + 6 * ROW + 8; // tallest a lane can get + breathing room
const LIFT_MS = 760; // how long a card stays "lifted" after its move fires
const MAX_LOG = 14;

const INITIAL_LOG = ["TK-19  ✓ shipped", "TK-20  ✓ shipped"];
const SHIPPED_TOTAL = SHIPPED_BASE + EVENTS.filter((e) => e.to === "done").length;

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

  // Single source of truth for the replay: elapsed time within one loop. The
  // board, lifted cards, log, and counter are all *derived* from this (via the
  // pure stateAt), so nothing can drift or double-count across loops.
  const [tMs, setTms] = useState(reduced ? REPLAY_MS : 0);

  useEffect(() => {
    if (reduced) return;

    let raf = 0;
    let start = 0;

    const frame = (now: number) => {
      if (!start) start = now;
      let elapsed = now - start;
      if (elapsed >= LOOP_MS) {
        start = now;
        elapsed = 0;
      }
      setTms(elapsed);
      raf = requestAnimationFrame(frame);
    };

    // Browsers throttle rAF in background tabs, so a single always-on loop is
    // cheap; no visibility gating needed.
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const board = useMemo(() => stateAt(reduced ? REPLAY_MS : tMs), [tMs, reduced]);
  const movingIds = useMemo(() => {
    if (reduced) return new Set<string>();
    return new Set(EVENTS.filter((e) => e.at <= tMs && e.at > tMs - LIFT_MS).map((e) => e.id));
  }, [tMs, reduced]);
  const log = useMemo(() => {
    const past = EVENTS.filter((e) => e.at <= tMs).map(logLine);
    return [...INITIAL_LOG, ...past].slice(-MAX_LOG);
  }, [tMs]);
  const progress = reduced ? 1 : Math.min(tMs / REPLAY_MS, 1);

  const laneW = fieldW > 0 ? (fieldW - LANE_GAP * (LANES.length - 1)) / LANES.length : 0;
  const laneX = (i: number) => i * (laneW + LANE_GAP);
  const laneIndex = (id: (typeof LANES)[number]["id"]) => LANES.findIndex((l) => l.id === id);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* board */}
      <div className="overflow-hidden rounded-2xl border border-steel bg-obsidian/60 p-4 shadow-2xl backdrop-blur-sm">
        {/* loop progress / tempo bar */}
        <div className="mb-3 flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet">
            Build replay
          </span>
          <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-slate">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-violet"
              style={{ width: `${progress * 100}%`, transition: "width 0.1s linear" }}
            />
          </span>
          <span className="font-mono text-[11px] tabular-nums text-muted">
            <span className="text-cloud">{board.shipped}</span>
            <span className="text-faint"> / {SHIPPED_TOTAL} shipped</span>
          </span>
        </div>

        {/* lane field — one positioning context so cards glide across lanes */}
        <div ref={fieldRef} className="relative" style={{ height: FIELD_H }}>
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
                    {board.lanes[lane.id].length}
                  </span>
                </div>
              </div>
            );
          })}

          {/* tickets */}
          {laneW > 0 &&
            TICKETS.map((t) => {
              const { lane, slot } = locate(board, t.id);
              return (
                <TicketCard
                  key={t.id}
                  ticket={TICKET_BY_ID[t.id]}
                  x={laneX(laneIndex(lane)) + 10}
                  y={HEADER_H + slot * ROW + 4}
                  width={laneW - 20}
                  moving={movingIds.has(t.id)}
                  done={lane === "done"}
                />
              );
            })}
        </div>
      </div>

      {/* activity log */}
      <div className="hidden lg:block" style={{ minHeight: FIELD_H + 60 }}>
        <ActivityLog lines={log} />
      </div>
    </div>
  );
}
