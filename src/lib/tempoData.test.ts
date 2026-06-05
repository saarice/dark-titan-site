import { describe, it, expect } from "vitest";
import {
  applyMove,
  stateAt,
  locate,
  INITIAL_STATE,
  EVENTS,
  SHIPPED_BASE,
  TICKETS,
} from "./tempoData";

describe("tempo board model", () => {
  it("moves a ticket to a new lane and removes it from the old one", () => {
    const next = applyMove(INITIAL_STATE, "t23", "done");
    expect(next.lanes.progress).not.toContain("t23");
    expect(next.lanes.done).toContain("t23");
  });

  it("increments shipped only when moving to done", () => {
    expect(applyMove(INITIAL_STATE, "t24", "progress").shipped).toBe(SHIPPED_BASE);
    expect(applyMove(INITIAL_STATE, "t23", "done").shipped).toBe(SHIPPED_BASE + 1);
  });

  it("never duplicates a ticket across lanes", () => {
    const next = applyMove(INITIAL_STATE, "t24", "done");
    const all = [...next.lanes.planned, ...next.lanes.progress, ...next.lanes.done];
    expect(new Set(all).size).toBe(all.length);
  });

  it("at time 0 equals the initial state", () => {
    expect(stateAt(0)).toEqual(INITIAL_STATE);
  });

  it("ships one card per done-event by the end of the replay", () => {
    const final = stateAt(Infinity);
    const doneEvents = EVENTS.filter((e) => e.to === "done").length;
    expect(final.shipped).toBe(SHIPPED_BASE + doneEvents);
  });

  it("keeps every ticket somewhere on the board through the whole replay", () => {
    const final = stateAt(Infinity);
    const all = [...final.lanes.planned, ...final.lanes.progress, ...final.lanes.done];
    expect(all.sort()).toEqual(TICKETS.map((t) => t.id).sort());
  });

  it("locates a ticket's lane and slot", () => {
    expect(locate(INITIAL_STATE, "t21")).toEqual({ lane: "done", slot: 0 });
    expect(locate(INITIAL_STATE, "t25")).toEqual({ lane: "planned", slot: 1 });
  });
});
