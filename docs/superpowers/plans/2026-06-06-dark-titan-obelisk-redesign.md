# Dark Titan "Obelisk" Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Dark Titan marketing site from scratch as "The Obelisk" — one continuous three.js monolith + glowing seam that transforms across 8 scroll scenes, anchoring a dark monumental brand experience, with a dense interactive Factory dashboard as the centerpiece.

**Architecture:** A single fixed full-screen R3F `<Canvas>` (`z-0`, `pointer-events:none`) renders the monolith/seam/debris and is driven entirely by a scroll-progress ref (0..1) read inside `useFrame` — no autoplay, freezes when the user stops. DOM content sections sit on `relative z-10` above it, each carrying a local scrim for readability. All scene→scene choreography is computed by one pure module (`choreography.ts`) so it is unit-testable. Brand tokens centralize in `index.css` + `tailwind.config.js`.

**Tech Stack:** React 19, Vite 8, TypeScript, Tailwind v3, three.js 0.184 + @react-three/fiber 9 + drei + postprocessing (Bloom), GSAP ScrollTrigger, Framer Motion. Vitest (added in Task 1) for the pure choreography math.

**Verification model (frontend adaptation of TDD):** The pure logic module (`choreography.ts`) gets real Vitest unit tests. Everything visual is gated by (a) `npm run build` (tsc -b + vite build) passing with no type errors, and (b) Playwright screenshots at desktop (1440px) + mobile (390px) and a scroll sweep (progress 0 / .25 / .5 / .75 / 1.0) to confirm choreography and text readability. Commit after each task.

**Brand source of truth:** `docs/superpowers/specs/2026-06-06-dark-titan-obelisk-redesign-design.md`. Do NOT write the brand into the Obsidian vault. Logo = angular titan crest + vertical violet seam (do-not rules: no stretch/extra-glow/recolor/stroke/rotate).

---

## File Structure

**New / rebuilt:**
- `src/styles/tokens` → folded into `src/index.css` + `tailwind.config.js` (brand palette, fonts, motifs)
- `src/lib/choreography.ts` — pure: `sceneStateFor(progress)` → all 3D transform values + per-section opacities. Unit-tested.
- `src/lib/choreography.test.ts` — Vitest tests for the above.
- `src/hooks/useScrollProgress.ts` — ref-based 0..1 scroll tracker (extracted from old Scene3D).
- `src/hooks/usePointer.ts` — ref-based normalized pointer (extracted).
- `src/hooks/useCountUp.ts` — animates a number 0→target when in view (dashboard counters).
- `src/hooks/useReducedMotion.ts` — boolean for `prefers-reduced-motion`.
- `src/components/Logo.tsx` — the crest+seam mark (single swap-point for designer's final SVG) + wordmark variant.
- `src/components/three/Scene3D.tsx` — the `<Canvas>` shell + Bloom.
- `src/components/three/Monolith.tsx` — the monolith geometry + seam, debris field, all `useFrame` choreography.
- `src/components/Nav.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/Chaos.tsx`
- `src/components/sections/Factory.tsx` (+ `src/components/factory/*` sub-parts + `src/lib/factoryData.ts`)
- `src/components/sections/Agents.tsx`
- `src/components/sections/Rivers.tsx`
- `src/components/sections/Proof.tsx`
- `src/components/sections/Manifesto.tsx`
- `src/components/sections/Footer.tsx`
- `src/components/Section.tsx` — wrapper: scrim + scroll-reveal (Framer Motion `whileInView`).
- `src/App.tsx` — compose the above.

**Deleted (old, replaced):** `CardVisual.tsx`, `Journal.tsx`, `Lab.tsx`, `Lightbox.tsx`, `Stats.tsx`, `Tilt3D.tsx`, `Works.tsx`, `SectionHeader.tsx`, `Navbar.tsx`, old `Hero.tsx`, old `Footer.tsx`, old `Scene3D.tsx`. Keep `LoadingScreen.tsx` (re-themed in Task 17), `main.tsx`.

---

## Phase 0 — Foundation

### Task 1: Add Vitest + brand tokens

**Files:**
- Modify: `package.json` (add vitest dep + script)
- Create: `vitest.config.ts`
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Install Vitest**

Run: `npm i -D vitest@^2`
Expected: added to devDependencies, no peer errors.

- [ ] **Step 2: Add test script** to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`:**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
```

- [ ] **Step 4: Replace brand tokens in `src/index.css`** `:root` block and font import. Set the font import to:

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
```

Replace `:root` with the spec palette:

```css
:root {
  --obsidian:  #0A0A0C;   /* page bg */
  --charcoal:  #111216;   /* raised surface */
  --slate:     #1E1E24;   /* hairline border */
  --steel:     #2A2A33;   /* stronger border */
  --violet:    #8A56F7;   /* primary accent */
  --violet-dp: #6020D9;   /* deep accent */
  --lavender:  #B338FF;   /* bright / seam highlight */
  --cloud:     #F7F7F7;   /* primary text */
  --fg-muted:  #9A9AA6;
  --fg-faint:  #6F6F7D;
  /* product-only signal colors */
  --sig-cyan:  #22D3EE;
  --sig-amber: #FFB100;
  --sig-red:   #EF4444;
  --sig-green: #22C55E;
  --seam-glow: rgba(138, 86, 247, 0.45);
}
```

Update `body` to `background: var(--obsidian); color: var(--cloud);` and `::selection { background: var(--violet); color: #0a0a0c; }`. Keep `overflow-x:hidden`. Remove the old `.titan-backdrop`/`.accent-gradient` purple helpers (no longer used) and add:

```css
.seam-line { background: linear-gradient(180deg, transparent, var(--lavender) 30%, #E6D4FF 50%, var(--violet) 70%, transparent); }
.glow-seam { filter: drop-shadow(0 0 6px var(--violet)) drop-shadow(0 0 16px var(--seam-glow)); }
```

- [ ] **Step 5: Rewrite `tailwind.config.js` `colors` + `fontFamily`:**

```js
colors: {
  obsidian: "var(--obsidian)", charcoal: "var(--charcoal)",
  slate: "var(--slate)", steel: "var(--steel)",
  violet: "var(--violet)", "violet-dp": "var(--violet-dp)", lavender: "var(--lavender)",
  cloud: "var(--cloud)", muted: "var(--fg-muted)", faint: "var(--fg-faint)",
  "sig-cyan": "var(--sig-cyan)", "sig-amber": "var(--sig-amber)",
  "sig-red": "var(--sig-red)", "sig-green": "var(--sig-green)",
},
fontFamily: {
  display: ["'Archivo Black'", "system-ui", "sans-serif"],
  body: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
  mono: ["'IBM Plex Mono'", "monospace"],
},
```

Keep the existing `keyframes`/`animation` block; add `pulse-dot` is already there. Keep `tailwindcss-animate` plugin.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: PASS (no type errors). (Old components still reference old `text-primary`/`accent` classes — that's fine until they're deleted in later tasks since `App.tsx` is rewritten in Task 16; if build fails on missing classes, proceed — those files get deleted. If it blocks, temporarily keep the old color aliases. Prefer to do Task 16's App rewrite + deletions early if build breaks.)

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: brand tokens, fonts, vitest setup"
```

> **Note:** the project is not yet a git repo. Step 7 of this task is preceded by a one-time `git init && git add -A && git commit -m "chore: snapshot before redesign"` to capture the current state first. Confirm with the user before `git init`.

---

### Task 2: Choreography module (pure, tested)

**Files:**
- Create: `src/lib/choreography.ts`
- Create: `src/lib/choreography.test.ts`

- [ ] **Step 1: Write the failing test** `src/lib/choreography.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test`
Expected: FAIL ("Cannot find module './choreography'").

- [ ] **Step 3: Implement `src/lib/choreography.ts`:**

```ts
export function clamp(x: number, a = 0, b = 1) { return Math.min(b, Math.max(a, x)); }
export function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t);
}

export interface SceneState {
  form: number;      // 0..1 monolith assembled (hero/footer high, mid low)
  debris: number;    // 0..1 chaos debris visibility
  order: number;     // 0..1 seam "slicing"/ordering beat
  constellation: number; // 0..1 agent node graph
  rivers: number;    // 0..1 data-river flow
  reform: number;    // 0..1 footer reform
  cameraZ: number;
  seamOpacity: number;
}

// scroll bands (see spec §3)
export function sceneStateFor(p: number): SceneState {
  const hero = 1 - smoothstep(0.05, 0.16, p);
  const reform = smoothstep(0.9, 1.0, p);
  const form = Math.max(hero, reform);
  const debris = smoothstep(0.12, 0.2, p) * (1 - smoothstep(0.28, 0.42, p));
  const order = smoothstep(0.28, 0.42, p) * (1 - smoothstep(0.45, 0.6, p));
  const constellation = smoothstep(0.45, 0.6, p) * (1 - smoothstep(0.62, 0.74, p));
  const rivers = smoothstep(0.62, 0.74, p) * (1 - smoothstep(0.78, 0.9, p));
  const cameraZ = 6.4 + p * 1.4;
  const seamOpacity = 0.35 + form * 0.6 + order * 0.4;
  return { form, debris, order, constellation, rivers, reform, cameraZ, seamOpacity: clamp(seamOpacity) };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/choreography.ts src/lib/choreography.test.ts && git commit -m "feat: tested scroll choreography module"
```

---

### Task 3: Ref hooks (scroll, pointer, reduced-motion, count-up)

**Files:**
- Create: `src/hooks/useScrollProgress.ts`, `src/hooks/usePointer.ts`, `src/hooks/useReducedMotion.ts`, `src/hooks/useCountUp.ts`

- [ ] **Step 1: `useScrollProgress.ts`** (ref, no re-renders):

```ts
import { useEffect, useRef } from "react";
export function useScrollProgress() {
  const progress = useRef(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return progress;
}
```

- [ ] **Step 2: `usePointer.ts`:**

```ts
import { useEffect, useRef } from "react";
export function usePointer() {
  const ptr = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return ptr;
}
```

- [ ] **Step 3: `useReducedMotion.ts`:**

```ts
import { useEffect, useState } from "react";
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
```

- [ ] **Step 4: `useCountUp.ts`** (animate to target once visible; respects reduced motion):

```ts
import { useEffect, useRef, useState } from "react";
export function useCountUp(target: number, opts: { duration?: number; decimals?: number } = {}) {
  const { duration = 1200, decimals = 0 } = opts;
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        if (reduced) { setVal(target); return; }
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / duration);
          const e = 1 - Math.pow(1 - k, 3);
          setVal(target * e);
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, display: val.toFixed(decimals) };
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/hooks && git commit -m "feat: ref hooks (scroll, pointer, reduced-motion, count-up)"
```

---

### Task 4: Logo component

**Files:**
- Create: `src/components/Logo.tsx`

- [ ] **Step 1: Implement `Logo.tsx`** — the titan crest + seam as inline SVG, single swap-point. Two props: `variant?: "mark" | "lockup"` and `className?`. The crest = symmetric beveled slabs forming a helmet silhouette; vertical seam gradient down center with `glow-seam`. Honor do-not rules (the SVG itself is the only place the mark is drawn; never apply external stroke/rotate).

```tsx
export default function Logo({ variant = "lockup", className = "" }: { variant?: "mark" | "lockup"; className?: string }) {
  const mark = (
    <svg viewBox="0 0 64 56" width="100%" height="100%" role="img" aria-label="Dark Titan">
      <defs>
        <linearGradient id="dt-seam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6D4FF" /><stop offset=".5" stopColor="#8A56F7" /><stop offset="1" stopColor="#6020D9" />
        </linearGradient>
        <linearGradient id="dt-slab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#23202b" /><stop offset="1" stopColor="#0d0c12" />
        </linearGradient>
      </defs>
      {/* left wing */}
      <polygon points="2,16 14,4 28,4 28,52 14,52 2,40" fill="url(#dt-slab)" stroke="#2A2A33" strokeWidth="1" />
      {/* right wing (mirror) */}
      <polygon points="62,16 50,4 36,4 36,52 50,52 62,40" fill="url(#dt-slab)" stroke="#2A2A33" strokeWidth="1" />
      {/* inner crest shoulders */}
      <polygon points="28,4 36,4 34,20 30,20" fill="#2a2440" />
      {/* glowing seam */}
      <rect className="glow-seam" x="30.5" y="3" width="3" height="50" fill="url(#dt-seam)" />
    </svg>
  );
  if (variant === "mark") return <span className={className} style={{ display: "inline-block" }}>{mark}</span>;
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span style={{ width: 28, height: 24, display: "inline-block" }}>{mark}</span>
      <span className="leading-none">
        <span className="block font-display text-cloud tracking-[0.25em] text-sm">DARK TITAN</span>
        <span className="block font-mono text-violet text-[9px] tracking-[0.3em] mt-0.5">CONTROL AT SCALE</span>
      </span>
    </span>
  );
}
```

- [ ] **Step 2: Verify build** — `npm run build` → PASS.
- [ ] **Step 3: Commit** — `git add src/components/Logo.tsx && git commit -m "feat: Logo (titan crest + seam, lockup + mark)"`

---

## Phase 1 — The 3D layer

### Task 5: Scene3D canvas shell

**Files:**
- Create: `src/components/three/Scene3D.tsx`

- [ ] **Step 1: Implement** the fixed canvas + fog + Bloom, taking `reduced` into account (if reduced, lower bloom + static). It renders `<Monolith>` (Task 6).

```tsx
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Monolith from "./Monolith";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { usePointer } from "../../hooks/usePointer";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export default function Scene3D() {
  const scroll = useScrollProgress();
  const ptr = usePointer();
  const reduced = useReducedMotion();
  return (
    <div className="fixed inset-0" style={{ zIndex: 0, pointerEvents: "none" }} aria-hidden>
      <Canvas camera={{ position: [0, 0, 6.4], fov: 50 }} gl={{ antialias: true, powerPreference: "high-performance" }} dpr={[1, 2]}>
        <color attach="background" args={["#0A0A0C"]} />
        <fog attach="fog" args={["#0A0A0C", 9, 26]} />
        <ambientLight intensity={0.25} />
        <pointLight position={[0, 2, 6]} intensity={18} color="#B338FF" distance={30} />
        <Monolith scroll={scroll} ptr={ptr} reduced={reduced} />
        <EffectComposer>
          <Bloom intensity={reduced ? 0.5 : 1.1} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur radius={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2:** Build will fail until `Monolith` exists — proceed to Task 6 before building.
- [ ] **Step 3: Commit** after Task 6 builds.

---

### Task 6: Monolith + seam + debris (the choreographed object)

**Files:**
- Create: `src/components/three/Monolith.tsx`

This is the richness centerpiece. Build a `THREE.Group` containing: (a) two beveled `BoxGeometry`/`ExtrudeGeometry` slab pylons leaning inward forming the crest gap; (b) an emissive thin box "seam" plane in the gap (violet, high emissive for Bloom); (c) a ground reflective grid (drei `<Grid>` or a large plane with grid texture, faded); (d) an `InstancedMesh` debris field (small dark shards). In `useFrame`, read `sceneStateFor(scroll.current)` and drive: slab separation/assembly by `form`, debris instance scale/opacity by `debris`, debris convergence toward the seam by `order`, group rotation by gentle `sin` sway + `scroll*0.6` + pointer parallax (small factors, never edge-on), seam scale.y by `form`, `camera.position.z` by `cameraZ`. Recede/dim object during `constellation`/`rivers` bands (scale down group, drop seam opacity) so the DOM sections read; reform at footer via `reform`.

- [ ] **Step 1: Implement `Monolith.tsx`:**

```tsx
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { sceneStateFor, smoothstep } from "../../lib/choreography";

const DEBRIS = 900;

export default function Monolith({ scroll, ptr, reduced }:
  { scroll: React.RefObject<number>; ptr: React.RefObject<{ x: number; y: number }>; reduced: boolean }) {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const leftSlab = useRef<THREE.Mesh>(null);
  const rightSlab = useRef<THREE.Mesh>(null);
  const seam = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.InstancedMesh>(null);
  const rotY = useRef(0); const rotX = useRef(0);

  const seamMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#C79BFF", transparent: true }), []);
  const slabMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#15131c", metalness: 0.5, roughness: 0.55 }), []);
  const debrisHome = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < DEBRIS; i++) {
      const r = 4 + Math.random() * 8, th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1);
      arr.push(new THREE.Vector3(Math.sin(ph) * Math.cos(th) * r * 1.4, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r - 2));
    }
    return arr;
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = reduced ? 0 : (scroll.current ?? 0);
    const s = sceneStateFor(p);

    // slab assembly: separated->joined by form; recede during mid bands
    const recede = Math.max(s.constellation, s.rivers);
    const open = (1 - s.form) * 1.2 + s.debris * 0.3;
    if (leftSlab.current) leftSlab.current.position.x = -1.05 - open;
    if (rightSlab.current) rightSlab.current.position.x = 1.05 + open;

    // seam
    if (seam.current) { seam.current.scale.y = 0.2 + s.form * 1.0 + s.order * 0.3; (seam.current.material as THREE.MeshBasicMaterial).opacity = s.seamOpacity; }

    // debris
    if (debrisRef.current) {
      for (let i = 0; i < DEBRIS; i++) {
        const h = debrisHome[i];
        // toward seam (origin) as `order` rises
        const k = s.order;
        dummy.position.set(h.x * (1 - k), h.y * (1 - k * 0.85), h.z * (1 - k));
        const sc = (0.02 + 0.05 * s.debris) * (1 - s.reform);
        dummy.scale.setScalar(Math.max(0.0001, sc));
        dummy.rotation.set(t * 0.1 + i, t * 0.13 + i, 0);
        dummy.updateMatrix();
        debrisRef.current.setMatrixAt(i, dummy.matrix);
      }
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // rotation
    const pt = reduced ? { x: 0, y: 0 } : (ptr.current ?? { x: 0, y: 0 });
    const targetY = Math.sin(t * 0.25) * 0.16 + p * 0.6 + pt.x * 0.18;
    rotY.current = THREE.MathUtils.damp(rotY.current, targetY, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, pt.y * 0.1, 3, delta);
    if (group.current) {
      group.current.rotation.y = rotY.current;
      group.current.rotation.x = rotX.current;
      const scale = 1 - recede * 0.45;
      group.current.scale.setScalar(scale);
      group.current.position.y = 0.6 * (1 - smoothstep(0, 0.9, p));
    }
    camera.position.z = THREE.MathUtils.damp(camera.position.z, s.cameraZ, 3, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      {/* slabs: leaning trapezoidal boxes */}
      <mesh ref={leftSlab} material={slabMat} position={[-1.05, 0, 0]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[1.1, 3.2, 0.5]} />
      </mesh>
      <mesh ref={rightSlab} material={slabMat} position={[1.05, 0, 0]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[1.1, 3.2, 0.5]} />
      </mesh>
      {/* seam */}
      <mesh ref={seam} material={seamMat} position={[0, 0, 0.3]}>
        <boxGeometry args={[0.07, 3.2, 0.07]} />
      </mesh>
      {/* debris */}
      <instancedMesh ref={debrisRef} args={[undefined, undefined, DEBRIS]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#3a3350" metalness={0.3} roughness={0.7} />
      </instancedMesh>
      {/* reflective floor grid */}
      <Grid position={[0, -2.4, 0]} args={[40, 40]} cellSize={0.6} cellThickness={0.6}
        cellColor="#2a2350" sectionSize={3} sectionColor="#3a2f66" fadeDistance={26} fadeStrength={3} infiniteGrid />
    </group>
  );
}
```

- [ ] **Step 2: Wire into Scene3D** (already done in Task 5).
- [ ] **Step 3: Temporary mount** — in `src/App.tsx` render only `<Scene3D/>` (full rewrite comes in Task 16) to verify the canvas: replace App body with `return <Scene3D/>;` importing from `./components/three/Scene3D`.
- [ ] **Step 4: Verify build** — `npm run build` → PASS.
- [ ] **Step 5: Visual check** — `npm run dev`, Playwright screenshot at scroll 0 (gateway formed), and force `window.scrollTo` to 25%/45%/100% via preview eval; confirm: gateway at top, debris mid, reform near bottom, seam glows, no edge-on flat slab. Iterate constants if flat/ugly.
- [ ] **Step 6: Commit** — `git add src/components/three && git commit -m "feat: choreographed three.js monolith, seam, debris, floor"`

---

## Phase 2 — Shell + top sections

### Task 7: Section wrapper + Nav

**Files:**
- Create: `src/components/Section.tsx`, `src/components/Nav.tsx`

- [ ] **Step 1: `Section.tsx`** — reusable wrapper: `id`, optional `scrim` (adds a radial/linear dark scrim behind children for readability), Framer Motion reveal (`initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-15%"}}`), respects reduced motion (skip transform if reduced).

```tsx
import { motion } from "framer-motion";
import type { ReactNode } from "react";
export default function Section({ id, children, className = "", scrim = false }:
  { id?: string; children: ReactNode; className?: string; scrim?: boolean }) {
  return (
    <section id={id} className={`relative ${className}`}>
      {scrim && <div className="pointer-events-none absolute inset-0 -z-[1]"
        style={{ background: "radial-gradient(70% 60% at 50% 50%, rgba(10,10,12,0.86), rgba(10,10,12,0) 75%)" }} />}
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: `Nav.tsx`** — sticky top; transparent over hero, gains `bg-charcoal/80 backdrop-blur` + bottom hairline after `window.scrollY > 40` (listener + state). Left: `<Logo variant="lockup"/>`. Center/right links (mono, tracking): Platform, Solutions, Resources, Company. Right: "Book a Demo" pill (`bg-violet text-obsidian` → hover invert). Mobile: collapse links, keep logo + CTA.
- [ ] **Step 3: Build** → PASS.
- [ ] **Step 4: Commit** — `git add src/components/Section.tsx src/components/Nav.tsx && git commit -m "feat: Section wrapper + sticky Nav"`

---

### Task 8: Hero section

**Files:**
- Create: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Implement** — full-viewport (`min-h-screen`), content on the LEFT half (the 3D gateway occupies the right via the canvas behind). Structure:
  - Real `<h1 className="sr-only">Dark Titan — the AI Agent Factory</h1>` (the visual headline is decorative-large but keep one semantic h1; use the visible headline AS the h1 and drop sr-only — pick one: make the visible headline the h1).
  - Eyebrow (mono, violet, tracking-[0.3em]): "THE AI AGENT FACTORY".
  - Headline (`font-display text-5xl md:text-7xl leading-[0.95] tracking-tight text-cloud`): "BRING ORDER TO ENGINEERING " + `<span className="text-violet">CHAOS.</span>`.
  - Sub (`text-muted max-w-md`): "Builds, runs, and operates software at scale. Intelligence without chaos. Control without friction."
  - CTAs: primary "Start Building" (`bg-violet text-obsidian` pill), secondary "See the Factory" (`border border-steel text-cloud`, anchors to `#factory`).
  - Trust strip (4 items, mono small, top-border hairline, grid/flex): "AKAMAI TMA — Potential Impact", "FIREFLY (INTERNAL) — Autonomous Build", "BUILT FOR CONTROL — Not Demos", "NO HYPE — Just Results".
  - Left-anchored copy gets a soft left-to-right scrim so it stays readable over the canvas.
  - GSAP load reveal: stagger eyebrow → headline lines → sub → CTAs (`gsap.context`, `power3.out`), guarded by reduced motion (skip → just show).
- [ ] **Step 2: Build** → PASS.
- [ ] **Step 3: Commit** — `git add src/components/sections/Hero.tsx && git commit -m "feat: Hero (gateway headline, CTAs, trust strip)"`

---

### Task 9: Chaos section

**Files:**
- Create: `src/components/sections/Chaos.tsx`

- [ ] **Step 1: Implement** — tall (`min-h-screen`), minimal copy centered/left, lets the 3D debris→seam beat (scroll band 0.12–0.42) carry it. Content: big stacked `font-display` lines "MORE NOISE. / MORE ALERTS. / MORE TOOLS. / MORE COMPLEXITY." in `text-cloud/40` (outline/faint), then a punch line in violet: "We bring order." Use GSAP ScrollTrigger to fade each line in as it pins/scrolls (or Framer `whileInView` stagger). Slight scrim only behind the punch line.
- [ ] **Step 2: Build** → PASS.
- [ ] **Step 3: Commit** — `git add src/components/sections/Chaos.tsx && git commit -m "feat: Chaos section (the problem, debris beat)"`

---

## Phase 3 — The Factory dashboard (centerpiece)

### Task 10: Factory data + sub-components

**Files:**
- Create: `src/lib/factoryData.ts`, `src/components/factory/MetricCard.tsx`, `src/components/factory/ThroughputChart.tsx`, `src/components/factory/AgentStatus.tsx`, `src/components/factory/ActivityList.tsx`, `src/components/factory/SystemHealth.tsx`

- [ ] **Step 1: `factoryData.ts`** — typed sample data (explicitly illustrative, no real customers):

```ts
export const METRICS = [
  { label: "Autonomous Tasks", value: 71, delta: "+12.2%", tone: "violet" as const },
  { label: "Tasks Completed", value: 64, delta: "+21.1%", tone: "cyan" as const },
  { label: "Success Rate", value: 98.6, suffix: "%", decimals: 1, delta: "+2.1%", tone: "green" as const },
  { label: "Deployments", value: 12, delta: "+4.1%", tone: "amber" as const },
];
export const AGENTS = ["Planner", "Builder", "Reviewer", "Tester", "Deployer"].map((name) => ({ name, status: "Running" as const }));
export const ACTIVITY = [
  { task: "Order Service Refactor", state: "Completed" as const, when: "2m ago" },
  { task: "Payment Gateway Integration", state: "Completed" as const, when: "5m ago" },
  { task: "User Authentication Module", state: "In Progress" as const, when: "12m ago" },
  { task: "Legacy System Modernization", state: "In Progress" as const, when: "18m ago" },
];
export const HEALTH = ["Compute", "Memory", "Agents", "Network"].map((name) => ({ name, status: "Healthy" as const }));
// throughput: 13 points, smooth-ish curve for an area chart
export const THROUGHPUT = [120, 180, 150, 240, 300, 280, 360, 420, 390, 470, 520, 480, 540];
export const HOURS = ["00:00","02:00","04:00","08:00","12:00","16:00","20:00","24:00"];
```

- [ ] **Step 2: `MetricCard.tsx`** — charcoal card, `border border-steel rounded-xl`, mono uppercase label, big `font-display` value using `useCountUp` (decimals + suffix), delta in `sig-green`. Tone maps to accent color of the value.
- [ ] **Step 3: `ThroughputChart.tsx`** — inline SVG area chart from `THROUGHPUT`; violet gradient fill + stroke; "Live" pill (`sig-cyan` dot). Animate the stroke `stroke-dasharray` draw-in on view (guard reduced motion). X labels from `HOURS`, y gridlines.
- [ ] **Step 4: `AgentStatus.tsx`** — list of AGENTS, each row: name + `Running` in `sig-green` with a pulsing dot (`animate-pulse-dot`).
- [ ] **Step 5: `ActivityList.tsx`** — ACTIVITY rows: task name + state (Completed=`sig-green`, In Progress=`sig-amber`) + `when` in faint mono.
- [ ] **Step 6: `SystemHealth.tsx`** — HEALTH rows: name + `Healthy` (`sig-green`).
- [ ] **Step 7: Build** → PASS.
- [ ] **Step 8: Commit** — `git add src/lib/factoryData.ts src/components/factory && git commit -m "feat: factory dashboard data + widgets"`

---

### Task 11: Factory section assembly

**Files:**
- Create: `src/components/sections/Factory.tsx`

- [ ] **Step 1: Implement** — `id="factory"`. Section intro (eyebrow "THE FACTORY", headline "Watch the factory run.", sub: "A live control surface. Autonomous agents building, running, and operating software in real time."). Then a large product window: `rounded-2xl border border-steel bg-charcoal` with a faux app chrome:
  - Left rail (hidden on mobile): Logo mark + nav items (Overview active, Factory, Agents, Workflows, Codebases, Deployments, Observability, Security, Settings) in mono; bottom: "Alex Morgan — Administrator" with a violet status dot. (Alex Morgan is sample data per the brand board, not a real customer.)
  - Main: top bar "Overview" + "Last 24h" range pill. Grid: 4 `MetricCard`s. Then a 2-col row: `ThroughputChart` (wide) + `AgentStatus`. Then a 2-col row: `ActivityList` + `SystemHealth`.
  - Add a faint "Sample data" mono caption under the window.
  - The whole window sits on a near-solid panel (so signal colors read crisply over the dark canvas).
- [ ] **Step 2: Build** → PASS.
- [ ] **Step 3: Visual check** — Playwright screenshot at the factory section, desktop + mobile; confirm counters animate, chart draws, signal colors only here, layout holds on mobile (rail hides, cards stack).
- [ ] **Step 4: Commit** — `git add src/components/sections/Factory.tsx && git commit -m "feat: Factory dashboard section"`

---

## Phase 4 — Mid sections

### Task 12: Agents (constellation)

**Files:**
- Create: `src/components/sections/Agents.tsx`

- [ ] **Step 1: Implement** — eyebrow "THE AGENTS", headline "An autonomous pipeline you can see." A horizontal constellation: 5 nodes (Planner → Builder → Reviewer → Tester → Deployer) connected by SVG lines that draw in on scroll (`whileInView`, stagger), each node a glowing violet dot + label + one-line role:
  - Planner: "Turns intent into an executable spec."
  - Builder: "Writes production-grade code."
  - Reviewer: "Enforces standards and catches regressions."
  - Tester: "Proves it works before it ships."
  - Deployer: "Ships and operates it, lights off."
  Responsive: horizontal on desktop, vertical stack on mobile (lines rotate accordingly).
- [ ] **Step 2: Build** → PASS.
- [ ] **Step 3: Commit** — `git add src/components/sections/Agents.tsx && git commit -m "feat: Agents constellation section"`

---

### Task 13: Rivers (how it works)

**Files:**
- Create: `src/components/sections/Rivers.tsx`

- [ ] **Step 1: Implement** — eyebrow "HOW IT WORKS", headline "From idea to operated, in one flow." Three stops along a flowing violet "data river" (SVG path with animated gradient stroke). Steps:
  1. "Describe the outcome" — "Hand the factory a goal, a repo, and constraints."
  2. "The agents build it" — "Spec, code, review, test — coordinated, in parallel."
  3. "It runs in production" — "Deployed, observed, and operated autonomously."
  River animates flow (CSS `background-position` / SVG dash) but is subtle and continuous-but-slow (not jarring); pause under reduced motion.
- [ ] **Step 2: Build** → PASS.
- [ ] **Step 3: Commit** — `git add src/components/sections/Rivers.tsx && git commit -m "feat: Rivers (how it works) section"`

---

### Task 14: Proof

**Files:**
- Create: `src/components/sections/Proof.tsx`

- [ ] **Step 1: Implement** — eyebrow "NO HYPE. JUST RESULTS.", headline "Built for control, not demos." Three big-number receipts (mono + `font-display`): "~3 days — to rebuild this site end-to-end", "$30 — total compute cost", "<1 — engineer-week". Use `useCountUp` only where numeric (the "~3" can animate to 3; "<1" static). Supporting line below. These are the approved illustrative proof points; do not invent additional metrics.
- [ ] **Step 2: Build** → PASS.
- [ ] **Step 3: Commit** — `git add src/components/sections/Proof.tsx && git commit -m "feat: Proof section"`

---

## Phase 5 — Close

### Task 15: Manifesto + Footer

**Files:**
- Create: `src/components/sections/Manifesto.tsx`, `src/components/sections/Footer.tsx`

- [ ] **Step 1: `Manifesto.tsx`** — full-bleed (`min-h-screen flex items-center`), the seam runs full height behind giant type (a centered `.seam-line` vertical bar). Giant `font-display` stacked lines: "INTELLIGENCE WITHOUT CHAOS." / "AUTOMATION WITHOUT SURRENDER." / "CONTROL WITHOUT FRICTION." then violet "LIGHTS OFF. CODE OUT." Lines reveal on scroll (stagger; reduced-motion → static). Minimal furniture, maximal contrast.
- [ ] **Step 2: `Footer.tsx`** — `id="contact"`. The monolith reforms behind (scroll band 0.9–1.0), so use only a soft radial scrim (`bg-obsidian/20` + radial) — do NOT fully cover the canvas. Closing CTA headline: "Let's turn your vision into " + violet "operational reality." Big mailto pill `saar.cohen@develeap.com`. Footer bar: status dot ("Available for new builds"), socials (Twitter/LinkedIn/GitHub as `#` placeholders), domain `darktitan.develeap.com`. Slow marquee "BRING ORDER TO ENGINEERING CHAOS •" in `text-cloud/10` (GSAP xPercent loop; pause reduced motion).
- [ ] **Step 3: Build** → PASS.
- [ ] **Step 4: Commit** — `git add src/components/sections/Manifesto.tsx src/components/sections/Footer.tsx && git commit -m "feat: Manifesto + Footer (the bookend)"`

---

### Task 16: Compose App + delete old components

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/LoadingScreen.tsx` (re-theme)
- Delete: `CardVisual.tsx`, `Journal.tsx`, `Lab.tsx`, `Lightbox.tsx`, `Stats.tsx`, `Tilt3D.tsx`, `Works.tsx`, `SectionHeader.tsx`, `Navbar.tsx`, old `src/components/Hero.tsx`, old `src/components/Footer.tsx`, old `src/components/Scene3D.tsx`

- [ ] **Step 1: Rewrite `src/App.tsx`:**

```tsx
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Scene3D from "./components/three/Scene3D";
import Nav from "./components/Nav";
import Hero from "./components/sections/Hero";
import Chaos from "./components/sections/Chaos";
import Factory from "./components/sections/Factory";
import Agents from "./components/sections/Agents";
import Rivers from "./components/sections/Rivers";
import Proof from "./components/sections/Proof";
import Manifesto from "./components/sections/Manifesto";
import Footer from "./components/sections/Footer";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <>
      <AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      <Scene3D />
      <Nav />
      <main className="relative z-10">
        <Hero /><Chaos /><Factory /><Agents /><Rivers /><Proof /><Manifesto /><Footer />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Re-theme `LoadingScreen.tsx`** — dark obsidian bg, centered `<Logo variant="mark"/>` with the seam drawing in + a thin progress bar in violet; calls `onComplete` after ~1.2s (keep existing mechanism, just restyle to brand). Remove any old purple-grid styling.
- [ ] **Step 3: Delete old components** (listed above).
- [ ] **Step 4: Build** → PASS (no dangling imports). Fix any leftover references.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: compose Obelisk site, retire old components"`

---

## Phase 6 — Polish & verification

### Task 17: Reduced-motion + a11y pass

- [ ] **Step 1:** Verify with DevTools "Emulate prefers-reduced-motion": canvas renders a static formed monolith (no scroll morph — `reduced` forces `p=0`), GSAP/Framer reveals resolve to final state, marquee + river animations are paused. Fix any component still autoplaying.
- [ ] **Step 2:** Keyboard + screen-reader sanity: one `<h1>`, logical heading order (h2 per section), `aria-hidden` on the canvas, CTA links focusable with visible focus ring (add `focus-visible:ring-2 ring-violet` utilities). Alt/labels on Logo.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "a11y: reduced-motion fallback + focus states"`

### Task 18: Visual sweep + final build

- [ ] **Step 1:** `npm run dev`; Playwright screenshots at 1440px and 390px for each section, plus a scroll sweep capturing progress 0 / .25 / .5 / .75 / 1.0. Confirm: hero gateway reads, debris→order beat works, Factory crisp + signal colors contained, constellation/rivers legible, manifesto seam spine, footer monolith reforms, all text readable over canvas.
- [ ] **Step 2:** `npm test` → choreography tests PASS. `npm run build` → PASS. `npm run lint` → clean (fix warnings).
- [ ] **Step 3:** Clean any stray screenshot artifacts (`rm -f *.png .playwright-mcp -r` outside `public/`). Do NOT touch the Obsidian vault.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "polish: visual sweep, lint, final build"`

---

## Self-Review notes (planner)

- **Spec coverage:** Nav (T7), Hero gateway + trust strip (T8), Chaos manifesto beat (T9), Factory interactive dashboard incl. all widgets + sample-data labeling (T10–11), Agents constellation (T12), Rivers (T13), Proof receipts (T14), Manifesto + Footer bookend (T15), continuous choreographed monolith/seam/debris with bands matching spec §3 (T2,T6), brand tokens + signal-colors-product-only + fonts + Logo with do-not rules (T1,T4), reduced-motion + WebGL-optional readability (T3,T6,T17), verification (T18). All spec sections mapped.
- **No invented specifics:** customer/proof numbers are the approved illustrative set; dashboard data is labeled sample; no new names/prices added. Brand NOT written to the vault.
- **Type consistency:** `sceneStateFor`/`SceneState` field names (`form/debris/order/constellation/rivers/reform/cameraZ/seamOpacity`) are used identically in T6. `useCountUp` returns `{ref, display}` used in T10/T14. Logo props (`variant`,`className`) consistent across T4/T7/T11/T16.
- **Git note:** project is not yet a repo — Task 1 includes a one-time `git init` snapshot (confirm with user first).
