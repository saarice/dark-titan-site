// Tempo — data model for the endless "build replay" kanban board.
// A continuous stream of illustrative tickets flows Planned -> In Progress ->
// Done and ages out. Everything is *derived* from elapsed time by the pure
// functions below, so there is no loop seam and nothing can drift.
// Illustrative work only: abstract engineering tickets, NOT real projects.

export type LaneId = "planned" | "progress" | "done";
export type TagId = "feature" | "fix" | "perf" | "infra" | "test";

export interface Card {
  id: string;
  code: string;
  title: string;
  tag: TagId;
  lane: LaneId;
  slot: number; // index within its lane, top-to-bottom
  moving: boolean; // lifted mid-transition
}

export interface BoardSnapshot {
  cards: Card[];
  counts: Record<LaneId, number>;
  shipped: number;
}

export const LANES = [
  { id: "planned", label: "Planned" },
  { id: "progress", label: "In Progress" },
  { id: "done", label: "Done" },
] as const;

// Tag -> a brand/signal color token (see index.css). Signals are the only
// non-violet accents used inside product UI. Consume as `rgb(var(<token>))`.
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

// The stream cycles through this pool of abstract work.
const POOL: { title: string; tag: TagId }[] = [
  { title: "Realtime sync engine", tag: "feature" },
  { title: "Webhook retry backoff", tag: "fix" },
  { title: "Token refresh race", tag: "fix" },
  { title: "Audit log export", tag: "feature" },
  { title: "Query planner cache", tag: "perf" },
  { title: "RBAC policy editor", tag: "feature" },
  { title: "Edge cold-start trim", tag: "perf" },
  { title: "Migration guardrails", tag: "infra" },
  { title: "Rate limiter rewrite", tag: "perf" },
  { title: "Flaky test quarantine", tag: "test" },
  { title: "Secrets rotation job", tag: "infra" },
  { title: "Search index sharding", tag: "feature" },
  { title: "Idempotent webhooks", tag: "fix" },
  { title: "Trace sampling tuner", tag: "perf" },
];

// Timing (ms). A new ticket is born every GAP; ages measured from birth.
// Each card flows Planned -> In Progress -> Done strictly by age, and In Progress
// is the longest single stage so a card visibly *works* in the middle column
// before it ships — it never appears to jump straight from Planned to Done.
export const GAP = 1400; // cadence of new tickets entering Planned
export const T_PROGRESS = 2000; // born -> In Progress (Planned dwell = 2000)
export const T_DONE = 4800; // born -> Done (In Progress dwell = 2800, the prominent stage)
export const T_REMOVE = 9400; // born -> aged out of Done (Done dwell = 4600)
export const LIFT_MS = 760; // how long a card stays "lifted" after a move
export const WARMUP = 7800; // pre-roll so the board starts fully populated (>= T_DONE)
export const SHIPPED_BASE = 116; // counter starts mid-quarter, not from zero
export const MAX_ROWS = 5; // tallest a lane gets (incl. a card aging out)
const MAX_LOG = 14;

/** Deterministic content for the i-th ticket in the stream. */
export function cardMeta(i: number): { code: string; title: string; tag: TagId } {
  const p = POOL[((i % POOL.length) + POOL.length) % POOL.length];
  return { code: `TK-${21 + i}`, title: p.title, tag: p.tag };
}

/** Running "shipped" count: base + every ticket that has reached Done. */
export function shippedAt(rawT: number): number {
  const T = rawT + WARMUP;
  return SHIPPED_BASE + Math.max(0, Math.floor((T - T_DONE) / GAP) + 1);
}

/** Pure: the full board at elapsed time `rawT` (ms since the loop began). */
export function boardAtTime(rawT: number): BoardSnapshot {
  const T = rawT + WARMUP;
  const newest = Math.floor(T / GAP);
  const oldest = Math.max(0, Math.ceil((T - T_REMOVE) / GAP));
  const byLane: Record<LaneId, string[]> = { planned: [], progress: [], done: [] };
  const moving = new Set<string>();
  const meta: Record<string, { code: string; title: string; tag: TagId }> = {};

  for (let i = oldest; i <= newest; i++) {
    const age = T - i * GAP;
    if (age < 0 || age >= T_REMOVE) continue;
    const id = `t${i}`;
    const lane: LaneId = age < T_PROGRESS ? "planned" : age < T_DONE ? "progress" : "done";
    byLane[lane].push(id);
    meta[id] = cardMeta(i);
    const justEnteredProgress = age >= T_PROGRESS && age < T_PROGRESS + LIFT_MS;
    const justShipped = age >= T_DONE && age < T_DONE + LIFT_MS;
    if (justEnteredProgress || justShipped) moving.add(id);
  }

  const cards: Card[] = [];
  for (const { id: lane } of LANES) {
    byLane[lane].forEach((id, slot) => {
      const m = meta[id];
      cards.push({ id, code: m.code, title: m.title, tag: m.tag, lane, slot, moving: moving.has(id) });
    });
  }

  return {
    cards,
    counts: {
      planned: byLane.planned.length,
      progress: byLane.progress.length,
      done: byLane.done.length,
    },
    shipped: shippedAt(rawT),
  };
}

/** Pure: the most recent activity-log lines at elapsed time `rawT`. */
export function logLinesAt(rawT: number): string[] {
  const T = rawT + WARMUP;
  const newest = Math.floor(T / GAP);
  const events: { at: number; line: string }[] = [];
  for (let i = Math.max(0, newest - MAX_LOG); i <= newest; i++) {
    const { code } = cardMeta(i);
    const tProgress = i * GAP + T_PROGRESS;
    const tDone = i * GAP + T_DONE;
    if (tProgress <= T) events.push({ at: tProgress, line: `${code}  build (1/4) running` });
    if (tDone <= T) events.push({ at: tDone, line: `${code}  acceptance (4/4) ✓ shipped` });
  }
  events.sort((a, b) => a.at - b.at);
  return events.slice(-MAX_LOG).map((e) => e.line);
}
