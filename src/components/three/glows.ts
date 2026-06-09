import { useMemo } from "react";
import * as THREE from "three";

/**
 * Shared seam/pool glow textures for the Dark Titan obsidian objects, so the
 * crest's central seam reads with the exact same effect as the monolith's slot.
 */

/** A tight, deep SLIT of light for the monolith's straight slot. The texture is
 *  WHITE (just the shape/intensity) — the violet/neon hue comes from the mesh's
 *  material `color`, so it never washes out to white. Sharp bright core, fast
 *  falloff to the sides, luminous along the height, faded only at the ends. */
export function useSlotGlow() {
  return useMemo(() => {
    const w = 64;
    const h = 256;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    // Vertical intensity (white), faded only at the very ends.
    const vg = g.createLinearGradient(0, 0, 0, h);
    vg.addColorStop(0, "rgba(255,255,255,0)");
    vg.addColorStop(0.08, "rgba(255,255,255,1)");
    vg.addColorStop(0.5, "rgba(255,255,255,1)");
    vg.addColorStop(0.92, "rgba(255,255,255,1)");
    vg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = vg;
    g.fillRect(0, 0, w, h);
    // Horizontal: a tight slit — sharp bright core, fast falloff.
    const hg = g.createLinearGradient(0, 0, w, 0);
    hg.addColorStop(0, "rgba(0,0,0,1)");
    hg.addColorStop(0.42, "rgba(0,0,0,0.92)");
    hg.addColorStop(0.5, "rgba(0,0,0,0)");
    hg.addColorStop(0.58, "rgba(0,0,0,0.92)");
    hg.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = hg;
    g.fillRect(0, 0, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** A vertical BLADE of light for the crest: a hot thin core wrapped in a soft
 *  halo, fairly straight down most of its length and tapering to a fine point at
 *  the bottom (and a soft point at the top) — matching the brand crest's split.
 *  WHITE intensity only; the neon-violet hue comes from the material `color`. */
export function useBladeGlow() {
  return useMemo(() => {
    const w = 100;
    const h = 420;
    const cx = w / 2;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    const blade = (halfTop: number, halfMid: number, alpha: number) => {
      g.fillStyle = `rgba(255,255,255,${alpha})`;
      g.beginPath();
      g.moveTo(cx, h * 0.05);
      g.lineTo(cx + halfTop, h * 0.17);
      g.lineTo(cx + halfMid, h * 0.46);
      g.lineTo(cx + 0.8, h * 0.995);
      g.lineTo(cx - 0.8, h * 0.995);
      g.lineTo(cx - halfMid, h * 0.46);
      g.lineTo(cx - halfTop, h * 0.17);
      g.closePath();
      g.fill();
    };
    // soft blurred outer halo
    g.shadowColor = "rgba(255,255,255,0.9)";
    g.shadowBlur = 18;
    blade(w * 0.13, w * 0.16, 0.45);
    // tighter mid glow
    g.shadowBlur = 7;
    blade(w * 0.07, w * 0.085, 0.8);
    // hot sharp core
    g.shadowBlur = 0;
    blade(w * 0.02, w * 0.028, 1);
    // soften the very top so the blade doesn't begin with a hard cap
    const fade = g.createLinearGradient(0, 0, 0, h);
    fade.addColorStop(0, "rgba(0,0,0,1)");
    fade.addColorStop(0.07, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = fade;
    g.fillRect(0, 0, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Soft radial violet pool on the floor under the seam. */
export function usePoolGlow() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(212,187,255,0.8)");
    grad.addColorStop(0.4, "rgba(155,109,255,0.3)");
    grad.addColorStop(1, "rgba(155,109,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}
