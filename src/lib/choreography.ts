export function clamp(x: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, x));
}

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

export interface SceneState {
  form: number; // 0..1 monolith assembled (hero/footer high, mid low)
  debris: number; // 0..1 chaos debris visibility
  order: number; // 0..1 seam "slicing"/ordering beat
  constellation: number; // 0..1 agent node graph band
  rivers: number; // 0..1 data-river flow band
  reform: number; // 0..1 footer reform
  cameraZ: number;
  seamOpacity: number;
}

/**
 * Single source of truth for the scroll-driven choreography.
 * `p` is page scroll progress 0..1. Bands match the design spec (§3).
 */
export function sceneStateFor(p: number): SceneState {
  const hero = 1 - smoothstep(0.05, 0.16, p);
  const reform = smoothstep(0.9, 1.0, p);
  const form = Math.max(hero, reform);
  const debris = smoothstep(0.12, 0.2, p) * (1 - smoothstep(0.28, 0.42, p));
  const order = smoothstep(0.28, 0.42, p) * (1 - smoothstep(0.45, 0.6, p));
  const constellation = smoothstep(0.45, 0.6, p) * (1 - smoothstep(0.62, 0.74, p));
  const rivers = smoothstep(0.62, 0.74, p) * (1 - smoothstep(0.78, 0.9, p));
  const cameraZ = 6.4 + p * 1.4;
  // Seam is brightest at the hero, fades through the middle, and does NOT
  // blast back at the footer (only a faint reform glow). Driven by `hero`, not
  // `form`, so the reform bookend stays calm instead of returning stronger.
  const seamOpacity = hero * 0.9 + order * 0.45 + reform * 0.12;
  return { form, debris, order, constellation, rivers, reform, cameraZ, seamOpacity: clamp(seamOpacity) };
}
