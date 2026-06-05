import { describe, it, expect } from "vitest";
import { smoothstep, sceneStateFor } from "./choreography";

describe("smoothstep", () => {
  it("clamps below and above", () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 2)).toBe(1);
  });
  it("is 0.5 at midpoint", () => {
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 5);
  });
});

describe("sceneStateFor", () => {
  it("hero is fully formed at progress 0", () => {
    const s = sceneStateFor(0);
    expect(s.form).toBeCloseTo(1, 2);
    expect(s.debris).toBeLessThan(0.1);
  });
  it("debris peaks in the chaos band (~0.2)", () => {
    expect(sceneStateFor(0.2).debris).toBeGreaterThan(0.6);
  });
  it("monolith reforms at the footer (progress 1)", () => {
    expect(sceneStateFor(1).reform).toBeGreaterThan(0.8);
  });
  it("camera z increases monotonically across the page", () => {
    expect(sceneStateFor(1).cameraZ).toBeGreaterThan(sceneStateFor(0).cameraZ);
  });
});
