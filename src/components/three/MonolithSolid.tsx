import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  useTexture,
  ContactShadows,
  Grid,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { sceneStateFor, smoothstep } from "../../lib/choreography";

/**
 * "Main 2": one whole obsidian monolith that never breaks.
 *
 * The shape is the Main reading (a straight, flat-topped rectangular block,
 * not the F obelisk with a pyramidion), but rendered as a SINGLE upright stone
 * instead of two parting slabs. It stays sealed the whole way down the page,
 * only swaying with the pointer and drifting aside as the hero copy scrolls off.
 *
 * The material is the F "Obsidian" reading: near-black volcanic glass, low
 * roughness and a high environment intensity so the violet/pink lightformers
 * streak across the polished faces.
 *
 * Down the centre there is no bright seam line. Instead the block is split by a
 * narrow vertical GAP: a dark recess behind it reads as shadowed depth, and a
 * soft, blurred violet glow (F's seam colour #D4BBFF, the same family as the
 * shadowed interior) bleeds out of the slot - present, not a laser.
 */

const SLAB_H = 3.7; // monolith height
const HALF_W = 0.62; // width of each half
const DEPTH = 0.62;
const GAP = 0.1; // slot width between the two halves
const HALF_H = SLAB_H / 2;
const HALF_X = GAP / 2 + HALF_W / 2; // x of each half's centre
const DEBRIS = 420; // floating "stars" drifting around the monolith (from Main)

const tx = (p: string) => import.meta.env.BASE_URL + p;

/** Soft pink glow for the slot: bright down the middle, faded at every edge. */
function useSlotGlow() {
  return useMemo(() => {
    const w = 64;
    const h = 256;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    const vg = g.createLinearGradient(0, 0, 0, h);
    vg.addColorStop(0, "rgba(212,187,255,0)");
    vg.addColorStop(0.5, "rgba(212,187,255,1)");
    vg.addColorStop(1, "rgba(212,187,255,0)");
    g.fillStyle = vg;
    g.fillRect(0, 0, w, h);
    // carve the horizontal edges away so the glow is soft, not a hard bar
    const hg = g.createLinearGradient(0, 0, w, 0);
    hg.addColorStop(0, "rgba(0,0,0,1)");
    hg.addColorStop(0.5, "rgba(0,0,0,0)");
    hg.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = hg;
    g.fillRect(0, 0, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Soft radial pink pool on the floor under the slot. */
function usePoolGlow() {
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

export default function MonolithSolid({
  scroll,
  pipeline,
  ptr,
  reduced,
}: {
  scroll: React.RefObject<number>;
  pipeline: React.RefObject<number>;
  ptr: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const { camera, size } = useThree();
  const isMobile = size.width < 768;

  const group = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pool = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.InstancedMesh>(null);

  const slotGlow = useSlotGlow();
  const poolGlow = usePoolGlow();

  // "Stars": tiny octahedrons scattered in a spherical shell around the stone.
  // Kept from the Main scene; here they just drift gently (the stone never
  // breaks, so they stay put rather than exploding outward).
  const debrisHome = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < DEBRIS; i++) {
      const r = 2.6 + Math.random() * 6;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      arr.push(
        new THREE.Vector3(
          Math.sin(ph) * Math.cos(th) * r * 1.5,
          Math.cos(ph) * r * 0.9,
          Math.sin(ph) * Math.sin(th) * r - 1,
        ),
      );
    }
    return arr;
  }, []);
  const debrisScale = useMemo(
    () => Array.from({ length: DEBRIS }, () => 0.012 + Math.random() * 0.02),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // F "Obsidian" material: polished near-black volcanic glass.
  const maps = useTexture({
    map: tx("textures/stone/stone_diff.jpg"),
    normalMap: tx("textures/stone/stone_nor_gl.jpg"),
    roughnessMap: tx("textures/stone/stone_rough.jpg"),
  });

  const material = useMemo(() => {
    maps.map.colorSpace = THREE.SRGBColorSpace;
    for (const t of [maps.map, maps.normalMap, maps.roughnessMap]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1.0, 1.9);
      t.needsUpdate = true;
    }
    maps.normalMap.colorSpace = THREE.NoColorSpace;
    maps.roughnessMap.colorSpace = THREE.NoColorSpace;
    return new THREE.MeshStandardMaterial({
      map: maps.map,
      normalMap: maps.normalMap,
      roughnessMap: maps.roughnessMap,
      color: new THREE.Color("#140f20"),
      metalness: 0.62,
      roughness: 0.16,
      envMapIntensity: 2.6,
      normalScale: new THREE.Vector2(0.4, 0.4),
    });
  }, [maps]);

  useEffect(() => {
    return () => {
      material.map?.dispose();
      material.normalMap?.dispose();
      material.roughnessMap?.dispose();
      material.dispose();
    };
  }, [material]);

  const rotY = useRef(0);
  const rotX = useRef(0);
  const posXCur = useRef(0);
  const posYCur = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = reduced ? 0 : scroll.current ?? 0;
    const s = sceneStateFor(p);

    // Soft pulse on the slot glow + floor pool (whole, never breaks).
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.5 + Math.sin(t * 0.9) * 0.08;
    }
    if (pool.current) {
      (pool.current.material as THREE.MeshBasicMaterial).opacity =
        0.45 + Math.sin(t * 0.9) * 0.05;
      pool.current.scale.setScalar(1.2 + Math.sin(t * 0.8) * 0.05);
    }

    // Drift the "stars": each octahedron holds its home position and bobs/spins
    // slowly. Frozen (no spin/bob) under reduced motion.
    if (debrisRef.current) {
      for (let i = 0; i < DEBRIS; i++) {
        const h = debrisHome[i];
        const bob = reduced ? 0 : Math.sin(t * 0.3 + i) * 0.12;
        dummy.position.set(h.x, h.y + bob, h.z);
        dummy.scale.setScalar(debrisScale[i]);
        dummy.rotation.set(reduced ? i : t * 0.1 + i, reduced ? i : t * 0.13 + i, 0);
        dummy.updateMatrix();
        debrisRef.current.setMatrixAt(i, dummy.matrix);
      }
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // Pointer sway + gentle scroll rotation.
    const ptX = reduced ? 0 : ptr.current?.x ?? 0;
    const ptY = reduced ? 0 : ptr.current?.y ?? 0;
    const sway = reduced ? 0 : Math.sin(t * 0.22) * 0.06;
    rotY.current = THREE.MathUtils.damp(rotY.current, sway + p * 0.28 + ptX * 0.16, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, ptY * 0.07, 3, delta);

    const heroOnly = 1 - smoothstep(0.05, 0.16, p);
    // While the Pipeline section fills the frame, slide the stone aside to the
    // left so the flow diagram owns the right half of the screen.
    const pipe = reduced ? 0 : pipeline.current ?? 0;
    const posXTarget =
      (isMobile ? 1.4 + heroOnly * 1.7 : heroOnly * 1.9) - pipe * (isMobile ? 1.4 : 3);
    const posYTarget = 0.4 * (1 - smoothstep(0, 0.9, p));
    posXCur.current = THREE.MathUtils.damp(posXCur.current, posXTarget, 3, delta);
    posYCur.current = THREE.MathUtils.damp(posYCur.current, posYTarget, 3, delta);

    if (group.current) {
      group.current.rotation.y = rotY.current;
      group.current.rotation.x = rotX.current;
      group.current.position.x = posXCur.current;
      group.current.position.y = posYCur.current;
    }

    camera.position.z = THREE.MathUtils.damp(camera.position.z, s.cameraZ, 3, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      {/* "stars": tiny octahedrons drifting around the stone (kept from Main) */}
      <instancedMesh ref={debrisRef} args={[undefined, undefined, DEBRIS]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#544a78" metalness={0.4} roughness={0.6} envMapIntensity={1} />
      </instancedMesh>

      {/* two obsidian halves with a fixed slot - reads as one sealed stone */}
      <RoundedBox
        args={[HALF_W, SLAB_H, DEPTH]}
        radius={0.05}
        smoothness={4}
        position={[-HALF_X, 0, 0]}
        material={material}
        castShadow
        receiveShadow
      />
      <RoundedBox
        args={[HALF_W, SLAB_H, DEPTH]}
        radius={0.05}
        smoothness={4}
        position={[HALF_X, 0, 0]}
        material={material}
        castShadow
        receiveShadow
      />

      {/* recessed dark backing inside the slot: shadowed depth, not a hole */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[GAP * 0.95, SLAB_H * 0.99, DEPTH * 0.7]} />
        <meshStandardMaterial color="#050308" roughness={1} metalness={0} />
      </mesh>

      {/* soft pink glow bleeding out of the slot (sits just inside the front) */}
      <mesh ref={glowRef} position={[0, 0, DEPTH / 2 - 0.05]}>
        <planeGeometry args={[GAP * 2.6, SLAB_H * 0.97]} />
        <meshBasicMaterial
          map={slotGlow}
          color="#D4BBFF"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* soft pink pool spilling onto the floor */}
      <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} position={[0, -HALF_H + 0.02, 0.12]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial
          map={poolGlow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <ContactShadows
        position={[0, -HALF_H + 0.01, 0]}
        scale={9}
        resolution={isMobile ? 512 : 1024}
        blur={2.6}
        opacity={0.55}
        far={5}
        color="#05040a"
      />

      {/* the "net": infinite violet grid floor (kept from Main) */}
      <Grid
        position={[0, -HALF_H - 0.6, 0]}
        args={[40, 40]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#2a2350"
        sectionSize={3}
        sectionColor="#3a2f66"
        fadeDistance={26}
        fadeStrength={3}
        infiniteGrid
      />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={4} color="#B28AFF" position={[-2.5, 1.5, 5]} scale={[4, 9, 1]} />
        <Lightformer intensity={2.2} color="#7C4AF0" position={[3, 0, 5]} scale={[3, 8, 1]} />
        <Lightformer intensity={1} color="#AEB4C7" position={[0, 4, -2]} scale={[9, 4, 1]} />
        <Lightformer intensity={0.7} color="#ffffff" position={[2.5, -2, 5]} scale={[2, 3, 1]} />
      </Environment>
    </group>
  );
}
