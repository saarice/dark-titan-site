import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/** Tracks page scroll as 0..1 in a ref (no re-renders). */
function useScrollProgress() {
  const progress = useRef(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return progress;
}

/** Tracks normalized pointer position (-1..1) in a ref. */
function usePointer() {
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

const COUNT = 7000; // particles sculpting the mark

function smoothstep(a: number, b: number, x: number) {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/** A soft round glowing dot, drawn once into a canvas texture. */
function makeDot() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(220,180,255,0.85)");
  g.addColorStop(1, "rgba(168,85,247,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

/**
 * Sample `count` 3D points whose silhouette spells `text`.
 * Renders the glyphs to an offscreen canvas, keeps the filled pixels, then
 * scatters particles across them and extrudes a little depth so the mark
 * reads as a solid object when it rotates.
 */
function sampleTextPoints(text: string, count: number, worldWidth: number, depth: number) {
  const cw = 1024;
  const ch = 512;
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${Math.round(ch * 0.74)}px "Arial Black", "Arial", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cw / 2, ch / 2 + ch * 0.02);

  const data = ctx.getImageData(0, 0, cw, ch).data;
  const filled: number[] = [];
  for (let y = 0; y < ch; y += 2) {
    for (let x = 0; x < cw; x += 2) {
      if (data[(y * cw + x) * 4 + 3] > 128) filled.push(x, y);
    }
  }

  const out = new Float32Array(count * 3);
  const scale = worldWidth / cw;
  const n = filled.length / 2 || 1;
  for (let i = 0; i < count; i++) {
    const idx = (Math.random() * n) | 0;
    const px = filled[idx * 2] ?? cw / 2;
    const py = filled[idx * 2 + 1] ?? ch / 2;
    out[i * 3] = (px - cw / 2) * scale + (Math.random() - 0.5) * scale * 1.6;
    out[i * 3 + 1] = -(py - ch / 2) * scale + (Math.random() - 0.5) * scale * 1.6;
    out[i * 3 + 2] = (Math.random() - 0.5) * depth;
  }
  return out;
}

/**
 * Scroll + mouse driven brand object.
 *   on load  -> particles swarm in and sculpt the "DT" monogram
 *   hero     -> mark holds, rotating gently and following the cursor
 *   scrolling-> mark disperses into a calm field behind the content
 *   footer   -> mark re-forms behind the closing CTA (the bookend)
 */
function BrandMark({ scroll, ptr }: { scroll: React.RefObject<number>; ptr: React.RefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  const rotY = useRef(0);
  const rotX = useRef(0);

  const data = useMemo(() => {
    const dot = makeDot();

    const mark = sampleTextPoints("DT", COUNT, 6.4, 0.4);
    const scatter = new Float32Array(COUNT * 3);
    const cur = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const delay = new Float32Array(COUNT);

    const hub = new THREE.Color("#e9d5ff");
    const base = new THREE.Color("#a855f7");
    const deep = new THREE.Color("#7c3aed");

    for (let i = 0; i < COUNT; i++) {
      const r = 7 + Math.random() * 7;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      scatter[i * 3] = Math.sin(ph) * Math.cos(th) * r * 1.5;
      scatter[i * 3 + 1] = Math.cos(ph) * r;
      scatter[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r - 2;
      delay[i] = Math.random() * 0.35;

      const pick = Math.random();
      const col = pick > 0.85 ? hub : pick > 0.4 ? base : deep;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(cur, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.045,
      map: dot,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);

    const group = new THREE.Group();
    group.add(points);

    return { group, mark, scatter, cur, delay, geo, mat };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (born.current === null) born.current = t;
    const { mark, scatter, cur, delay, geo, mat } = data;

    const s = scroll.current ?? 0;
    const intro = smoothstep(0, 1.7, t - born.current); // assemble on load

    // how "formed" the mark is: held at the hero, dispersed mid, reformed at footer
    const formHero = (1 - smoothstep(0.05, 0.24, s)) * intro;
    const formEnd = smoothstep(0.82, 0.97, s);
    const form = Math.max(formHero, formEnd);

    for (let i = 0; i < COUNT; i++) {
      const o = i * 3;
      const f = smoothstep(delay[i], delay[i] + 0.7, form); // staggered swarm
      for (let c = 0; c < 3; c++) {
        cur[o + c] = scatter[o + c] + (mark[o + c] - scatter[o + c]) * f;
      }
    }
    geo.attributes.position.needsUpdate = true;

    mat.opacity = 0.28 + form * 0.66;
    mat.size = 0.04 + form * 0.018;

    // rotation: gentle sway (never spins edge-on) + scroll turn + cursor parallax
    const p = ptr.current ?? { x: 0, y: 0 };
    const targetY = Math.sin(t * 0.3) * 0.22 + s * 1.1 + p.x * 0.26;
    const targetX = p.y * 0.16;
    rotY.current = THREE.MathUtils.damp(rotY.current, targetY, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, targetX, 3, delta);

    if (groupRef.current) {
      groupRef.current.rotation.y = rotY.current;
      groupRef.current.rotation.x = rotX.current;
      // raised in the hero, centered behind the footer CTA
      groupRef.current.position.y = 1.4 * (1 - smoothstep(0, 0.92, s));
    }

    camera.position.z = THREE.MathUtils.lerp(6.6, 7.4, s);
    camera.lookAt(0, 0, 0);
  });

  return <primitive object={data.group} ref={groupRef} />;
}

export default function Scene3D() {
  const scroll = useScrollProgress();
  const ptr = usePointer();

  return (
    <div className="fixed inset-0" style={{ zIndex: 0, pointerEvents: "none" }} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6.6], fov: 52 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#09080a"]} />
        <fog attach="fog" args={["#09080a", 8, 24]} />

        <BrandMark scroll={scroll} ptr={ptr} />

        <EffectComposer>
          <Bloom
            intensity={1.05}
            luminanceThreshold={0.18}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.65}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
