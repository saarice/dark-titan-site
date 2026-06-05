// Tempo — data model for the auto-playing "build replay" kanban board.
// Illustrative tickets only: abstract engineering work, NOT real projects.

export type LaneId = "planned" | "progress" | "done";
export type TagId = "feature" | "fix" | "perf" | "infra" | "test";

export interface Ticket {
  id: string;
  code: string; // short ref shown as a chip, e.g. "TK-24"
  title: string;
  tag: TagId;
}

export interface BoardState {
  lanes: Record<LaneId, string[]>; // ticket ids, top-to-bottom
  shipped: number; // running "shipped" counter
}

export interface MoveEvent {
  at: number; // ms from loop start
  id: string;
  to: LaneId;
}

export const LANES: { id: LaneId; label: string }[] = [
  { id: "planned", label: "Planned" },
  { id: "progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

// Tag -> a brand/signal color token name (see index.css). Signals are the
// only non-violet accents used inside product UI in this codebase. Consume as
// `rgb(var(<token>))` or with an alpha: `rgb(var(<token>) / 0.18)`.
export const TAG_TOKEN: Record<TagId, string> = {
  feature: "--violet",
  fix: "--sig-red",
  perf: "--sig-amber",
  infra: "--sig-cyan",
  test: "--sig-green",
};

export const TAG_LABEL: Record<TagId, string> = {
  feature: "feature",
  fix: "fix",
  perf: "perf",
  infra: "infra",
  test: "test",
};

export const TICKETS: Ticket[] = [
  { id: "t21", code: "TK-21", title: "Realtime sync engine", tag: "feature" },
  { id: "t22", code: "TK-22", title: "Webhook retry backoff", tag: "fix" },
  { id: "t23", code: "TK-23", title: "Token refresh race", tag: "fix" },
  { id: "t24", code: "TK-24", title: "Audit log export", tag: "feature" },
  { id: "t25", code: "TK-25", title: "Query planner cache", tag: "perf" },
  { id: "t26", code: "TK-26", title: "RBAC policy editor", tag: "feature" },
  { id: "t27", code: "TK-27", title: "Edge cold-start trim", tag: "perf" },
  { id: "t28", code: "TK-28", title: "Migration guardrails", tag: "infra" },
];

export const TICKET_BY_ID: Record<string, Ticket> = Object.fromEntries(
  TICKETS.map((t) => [t.id, t]),
);

// Where the "shipped" counter starts each loop (so the number reads like an
// established team mid-quarter, not a fresh board).
export const SHIPPED_BASE = 116;

export const INITIAL_STATE: BoardState = {
  lanes: {
    planned: ["t24", "t25", "t26", "t27", "t28"],
    progress: ["t23"],
    done: ["t21", "t22"],
  },
  shipped: SHIPPED_BASE,
};

// Scripted ~10s replay. Cards flow planned -> progress -> done with 1-2 in
// flight at any moment, building a steady rhythm.
export const EVENTS: MoveEvent[] = [
  { at: 350, id: "t23", to: "done" },
  { at: 750, id: "t24", to: "progress" },
  { at: 1550, id: "t25", to: "progress" },
  { at: 2450, id: "t24", to: "done" },
  { at: 2950, id: "t26", to: "progress" },
  { at: 3850, id: "t25", to: "done" },
  { at: 4350, id: "t27", to: "progress" },
  { at: 5250, id: "t26", to: "done" },
  { at: 5800, id: "t28", to: "progress" },
  { at: 6700, id: "t27", to: "done" },
  { at: 7700, id: "t28", to: "done" },
];

export const REPLAY_MS = 8500; // last ship + breathing room before the bar fills
export const LOOP_MS = 10000; // total loop length incl. a short rest on "done"

/** Pure: move a ticket to a lane, removing it from wherever it currently sits. */
export function applyMove(state: BoardState, id: string, to: LaneId): BoardState {
  const lanes: Record<LaneId, string[]> = {
    planned: state.lanes.planned.filter((x) => x !== id),
    progress: state.lanes.progress.filter((x) => x !== id),
    done: state.lanes.done.filter((x) => x !== id),
  };
  lanes[to] = [...lanes[to], id];
  return { lanes, shipped: state.shipped + (to === "done" ? 1 : 0) };
}

/** Pure: fold every event in [0, untilMs] over the initial state. */
export function stateAt(untilMs: number): BoardState {
  return EVENTS.filter((e) => e.at <= untilMs).reduce(
    (s, e) => applyMove(s, e.id, e.to),
    INITIAL_STATE,
  );
}

/** Locate a ticket: which lane and which slot index within it. */
export function locate(state: BoardState, id: string): { lane: LaneId; slot: number } {
  for (const { id: lane } of LANES) {
    const slot = state.lanes[lane].indexOf(id);
    if (slot !== -1) return { lane, slot };
  }
  return { lane: "planned", slot: 0 };
}

/** A short activity-log line for an event (newest appended last). */
export function logLine(e: MoveEvent): string {
  const code = TICKET_BY_ID[e.id]?.code ?? e.id;
  if (e.to === "done") return `${code}  acceptance (4/4) ✓  shipped`;
  if (e.to === "progress") return `${code}  build (1/4) running`;
  return `${code}  queued`;
}
