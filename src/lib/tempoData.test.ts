import { describe, it, expect } from "vitest";
import {
  GAP,
  T_PROGRESS,
  T_DONE,
  T_REMOVE,
  WARMUP,
  SHIPPED_BASE,
  MAX_ROWS,
  boardAtTime,
  shippedAt,
  logLinesAt,
  cardMeta,
} from "./tempoData";

describe("tempo endless board model", () => {
  it("starts already populated (WARMUP pre-roll) at t = 0", () => {
    const board = boardAtTime(0);
    expect(board.cards.length).toBeGreaterThan(0);
    // every lane should have something in flight after warmup
    expect(board.counts.planned).toBeGreaterThan(0);
    expect(board.counts.progress).toBeGreaterThan(0);
    expect(board.counts.done).toBeGreaterThan(0);
  });

  it("places a card in the right lane for its age", () => {
    // A ticket born exactly at T=0 (i = WARMUP/GAP) sampled at various offsets.
    const i = Math.floor(WARMUP / GAP);
    const birth = i * GAP - WARMUP; // rawT at which this card's age is 0
    const laneOf = (rawT: number) =>
      boardAtTime(rawT).cards.find((c) => c.id === `t${i}`)?.lane;

    expect(laneOf(birth + 100)).toBe("planned");
    expect(laneOf(birth + T_PROGRESS + 100)).toBe("progress");
    expect(laneOf(birth + T_DONE + 100)).toBe("done");
    // aged out past T_REMOVE — gone from the board
    expect(laneOf(birth + T_REMOVE + 100)).toBeUndefined();
  });

  it("never duplicates a card across lanes", () => {
    const ids = boardAtTime(4321).cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every lane within MAX_ROWS", () => {
    // sample across a wide span of time
    for (let rawT = 0; rawT < 20_000; rawT += 137) {
      const { counts } = boardAtTime(rawT);
      expect(counts.planned).toBeLessThanOrEqual(MAX_ROWS);
      expect(counts.progress).toBeLessThanOrEqual(MAX_ROWS);
      expect(counts.done).toBeLessThanOrEqual(MAX_ROWS);
    }
  });

  it("marks a card as moving briefly after it enters Progress or Done", () => {
    let sawMoving = false;
    for (let rawT = 0; rawT < 6000; rawT += 50) {
      if (boardAtTime(rawT).cards.some((c) => c.moving)) {
        sawMoving = true;
        break;
      }
    }
    expect(sawMoving).toBe(true);
  });

  it("ships monotonically, never decreasing", () => {
    let prev = -Infinity;
    for (let rawT = 0; rawT < 30_000; rawT += 100) {
      const s = shippedAt(rawT);
      expect(s).toBeGreaterThanOrEqual(prev);
      prev = s;
    }
  });

  it("ship count starts at the base and climbs by one per GAP", () => {
    expect(shippedAt(0)).toBe(SHIPPED_BASE + Math.floor((WARMUP - T_DONE) / GAP) + 1);
    const a = shippedAt(0);
    const b = shippedAt(GAP);
    expect(b - a).toBe(1);
  });

  it("board.shipped matches shippedAt at the same time", () => {
    expect(boardAtTime(7777).shipped).toBe(shippedAt(7777));
  });

  it("derives deterministic, cycling content per ticket index", () => {
    expect(cardMeta(0)).toEqual(cardMeta(0));
    expect(cardMeta(3).code).toBe("TK-24");
    // titles cycle through the pool, codes keep climbing
    expect(cardMeta(0).title).toBe(cardMeta(14).title);
    expect(cardMeta(14).code).not.toBe(cardMeta(0).code);
  });

  it("produces newest-last activity-log lines that grow over time", () => {
    const early = logLinesAt(2000);
    const later = logLinesAt(12_000);
    expect(later.length).toBeGreaterThan(0);
    // by 12s the log shows a mix of running and shipped events
    expect(later.some((l) => l.includes("✓ shipped"))).toBe(true);
    expect(later.some((l) => l.includes("build (1/4) running"))).toBe(true);
    // the log is capped, so length never explodes
    expect(later.length).toBeLessThanOrEqual(14);
    expect(early.every((l) => typeof l === "string")).toBe(true);
  });
});
