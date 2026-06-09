# Dark Titan Site — "The Obelisk" Full Redesign

**Date:** 2026-06-06
**Status:** Approved (direction + section flow locked)
**Project:** `/Users/saar/Desktop/dark-titan-site/` (standalone marketing site, NOT the Obsidian vault)

---

## 1. Goal

A from-scratch redesign of the Dark Titan landing page that is dramatically more
sophisticated and complex than prior iterations, built on the new monolith brand
system. The page must feel like a monument: a single cinematic 3D object (the
Obelisk) anchors the page and transforms as the user scrolls, while the content
proves Dark Titan is a real, working AI agent factory — not a demo.

This replaces the rejected "DT particle monogram" hero and every existing section.

### Success criteria
- The hero reads as the reference render: a gateway monolith with a glowing
  vertical seam beaming down onto a reflective data-grid floor.
- Motion is **scroll-driven** (freezes when the user stops) — never autoplaying
  fast loops. This was the consistent failure of prior versions.
- Text is always readable: the 3D object recedes/dims behind copy; content sits
  on near-solid surfaces or behind scrims.
- One continuous 3D presence carries scene to scene (the "3D scrolling" the user
  asked for), bookended by the monolith at hero and footer.
- The product (the Factory dashboard) is a genuinely dense, interactive-feeling
  surface — the "much more complex" payoff.

### Non-goals
- Do NOT write the new brand into the Obsidian company brain (`Dark Titan/`
  vault). The brand lives in this site project only, for now.
- No fabricated customer names, metrics, prices, or quotes. Placeholder stats are
  marked as such; product dashboard numbers are sample/illustrative.

---

## 2. Brand system (source of truth for this build)

**Logo:** the monolith mark — an **angular titan crest / faceplate** (a symmetric
helmet-like emblem of beveled stone slabs) split by a glowing vertical violet
**seam** down the center. Variations: Primary, Light-BG, Monochrome, Inverse.
Wordmark: spaced `DARK TITAN` with sub-line `CONTROL AT SCALE`. Build behind a
single `<Logo/>` component (SVG approximation now; designer's final asset drops in
one place). Clear space = seam width (X). Min digital size 16px.
**Logo do-not rules (enforce in component + usage):** don't stretch, don't add
extra glow, don't change its colors, don't add a stroke, don't rotate.

**Reference films** (user-supplied, `~/Downloads/Cinematic D Website.mp4` and
`Dark Titan Monogram Reveal Film.mp4`): the target mood is a dark monumental
temple-city — monolith slabs, floating constellation node-graphs, violet data
rivers flowing along a circuit/grid floor, a distant vertical seam of light,
volumetric haze, reflective ground, and the seam cracking the crest open in the
reveal. This is the richness bar for the WebGL layer.

**Tagline:** `LIGHTS OFF. CODE OUT.`
**Hero headline:** `BRING ORDER TO ENGINEERING CHAOS.`
**Positioning:** "The AI Agent Factory that builds, runs, and operates software at
scale. Intelligence without chaos. Control without friction."
**Manifesto:** "More noise. More alerts. More tools. More complexity." →
"Intelligence without chaos. Automation without surrender. Control without friction."

### Color tokens
| Token | Hex | Use |
|---|---|---|
| Obsidian | `#0A0A0C` | page background |
| Charcoal | `#111216` | raised surfaces |
| Titan Violet | `#8A56F7` | primary accent |
| Deep Violet | `#6020D9` | accent shade / gradients |
| Lavender | `#B338FF` | bright accent / seam highlight |
| Cloud White | `#F7F7F7` | primary text |
| Slate | `#1E1E24` | borders / hairlines |
| Steel | `#2A2A33` | stronger borders |
| Cyan (Live) | `#22D3EE` | **product UI only** — live/healthy |
| Amber (Warn) | `#FFB100` | **product UI only** — in-progress/warning |
| Red (Critical)| `#EF4444` | **product UI only** — failure/critical |
| Green (OK) | `#22C55E` | **product UI only** — success/passed |

Signal colors (cyan/amber/red/green) appear ONLY inside the Factory dashboard. The
marketing chrome stays Obsidian + violet.

### Typography
- **Archivo Black** — display / headlines.
- **IBM Plex Sans** — body / UI / paragraphs (weights 400/500/600/700).
- **IBM Plex Mono** — code, data, eyebrows, labels, receipts.

### Visual language motifs
Monoliths (control/strength) · Constellations (coordinated intelligence) ·
Data Rivers (flow/transformation) · The Seam (focus/precision) · Horizons.
Shape language: pill, rectangle, circle, vertical seam, grid.

---

## 3. Architecture

### Stack (existing, keep)
React 19 + Vite + TypeScript + Tailwind v3 + GSAP (ScrollTrigger) + Framer Motion
+ three.js / @react-three/fiber / drei / postprocessing (Bloom).

### The continuous 3D layer
A single fixed full-screen `<Canvas>` (`zIndex 0`, `pointer-events: none`,
`aria-hidden`) behind all content, exactly like the current `Scene3D` shell — but
the object is rebuilt. Scroll progress (0..1) and pointer position are tracked in
refs (no React re-renders) and read inside `useFrame`. Camera, monolith transform,
and particle/seam state are all driven by `scroll.current`, smoothed with
`THREE.MathUtils.damp` and `smoothstep`. Bloom on the seam.

**Monolith implementation: real three.js geometry** (not CSS/SVG) so it matches
the reference render — beveled slab pylons with a bright emissive seam plane,
responding to light, depth, and a subtle ground reflection. Debris = an
`InstancedMesh`/`Points` field that the seam "orders" on scroll.

**Scroll choreography** (single timeline mapped to `scroll`):
- `0.00–0.12` Hero: gateway holds, seam beams to floor; gentle sway + cursor parallax.
- `0.12–0.28` Chaos: debris swarms in front; camera pulls slightly; seam dims.
- `0.28–0.45` Order: seam slices, debris collapses onto it (chaos→order beat).
- `0.45–0.62` Constellation: points redistribute into the agent node graph.
- `0.62–0.78` Rivers: points stream into flowing data-river lines.
- `0.78–0.90` Manifesto: object recedes; seam becomes the full-height spine.
- `0.90–1.00` Footer: monolith re-forms, centered, as the bookend.

Content sections scroll over this layer on `relative z-10`. Each section that
needs readable copy carries a local scrim/near-solid surface.

### Performance & a11y
- `dpr={[1, 2]}`, instanced debris, pause `useFrame` work when canvas off-screen.
- **Reduced motion:** if `prefers-reduced-motion`, render a static hero monolith
  (no scroll morph, no autoplay), keep all content fully usable.
- The page is fully readable and navigable without WebGL (progressive
  enhancement): WebGL is decorative; all meaning is in the DOM.
- Real `<h1>` etc.; the visual logotype has an accessible label.

---

## 4. Components / sections (top to bottom)

Each section is its own component under `src/components/`. Existing files are
replaced. `App.tsx` renders `<Scene3D/>` then `<main className="relative z-10">`
with the sections in order.

1. **Nav** (`Nav.tsx`) — sticky, minimal. Logo + Platform / Solutions / Resources
   / Company + "Book a Demo" button. Transparent over hero, gains a charcoal
   blur background after scroll.

2. **Hero** (`Hero.tsx`) — the gateway. Eyebrow "The AI Agent Factory", headline
   "BRING ORDER TO ENGINEERING **CHAOS.**", positioning line, CTAs **Start
   Building** / **See the Factory**. Below: a 4-item trust strip
   (Akamai TMA / Firefly (internal) / Built for control / No hype). Copy on the
   left half; 3D gateway occupies the right.

3. **Chaos** (`Chaos.tsx`) — the problem. "More noise. More alerts. More tools.
   More complexity." Scroll beat where debris collapses onto the seam. Minimal
   copy; the 3D layer does the talking.

4. **Factory** (`Factory.tsx`) — the live product. A full control surface on a
   charcoal panel: left rail (Overview/Factory/Agents/Workflows/Codebases/
   Deployments/Observability/Security/Settings), Overview metric cards
   (Autonomous Tasks 71 ↑, Completed 64 ↑, Success 98.6% ↑, Deployments 12 ↑),
   a **Factory Throughput** area chart (animated, "Live"), **Agent Status**
   (Planner/Builder/Reviewer/Tester/Deployer — Running), **Workflow Activity**
   (Completed/In Progress rows), **System Health** (Compute/Memory/Agents/Network
   — Healthy). Signal colors used here. Numbers are explicitly sample data.
   Counters animate up and the chart draws when the section scrolls into view.

5. **Agents** (`Agents.tsx`) — constellation. Planner → Builder → Reviewer →
   Tester → Deployer as connected nodes; each node has a short role description.
   Lines wire up on scroll.

6. **Rivers** (`Rivers.tsx`) — how it works. Idea → spec → code → tested →
   deployed → operated as flowing data-river lines; 3 narrative stops along the
   river, staggered reveals.

7. **Proof** (`Proof.tsx`) — no hype, just results. Big-number outcome stats:
   "Rebuilt in ~3 days", "$30 in cost", "<1 engineer-week", rendered as monospace
   "receipts". Supporting line: built for control, not demos. (Stats are the
   approved illustrative proof points; no new numbers invented.)

8. **Manifesto** (`Manifesto.tsx`) — full-bleed. Giant Archivo Black type:
   "Intelligence without chaos. Automation without surrender. Control without
   friction." Closing "LIGHTS OFF. CODE OUT." The seam runs full height as a
   spine behind the type.

9. **Footer** (`Footer.tsx`) — the bookend. Monolith re-forms behind a closing
   CTA "Let's turn your vision into operational reality." Contact
   `saar.cohen@develeap.com`, domain `darktitan.develeap.com`, status dot
   "Available for new builds", marquee, socials.

### Shared building blocks
- `Logo.tsx` — single source for the monolith mark (swap-in point for the
  designer's final SVG).
- `Section.tsx` — wrapper providing the scrim/surface + scroll-reveal.
- `useScrollProgress()` / `usePointer()` — ref hooks (carried from current
  Scene3D, reused).
- Tokens centralized in `tailwind.config.js` + CSS variables in `index.css`
  (rename palette to the new brand values above; signal colors added back, scoped
  to product UI usage).

---

## 5. Error handling / robustness
- WebGL unavailable or context lost → fall back to the static hero monolith image
  treatment; page remains fully functional (content is in the DOM).
- `prefers-reduced-motion` → static, no scroll morph.
- Chart/counters guard against the section never entering the viewport (render
  final state if observed once).

## 6. Testing / verification
- Visual verification via Playwright/preview screenshots at desktop + mobile
  widths for each section, plus a scroll sweep (0, .25, .5, .75, 1.0) to confirm
  the monolith choreography and text readability at every stop.
- `prefers-reduced-motion` pass: confirm no autoplay and full readability.
- Lighthouse sanity check (perf not tanked by WebGL; a11y not regressed).
- Build (`vite build`) must pass with no TS errors.

## 7. Open / deferred
- Final logo SVG comes from the designer; `Logo.tsx` is the single swap point.
- Real customer logos / case data TBD — placeholders clearly marked until
  provided. No invented specifics.
