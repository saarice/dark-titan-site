import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid, RoundedBox, Edges, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { sceneStateFor, smoothstep } from "../../lib/choreography";

const DEBRIS = 420;

export default function Monolith({
  scroll,
  ptr,
  reduced,
}: {
  scroll: React.RefObject<number>;
  ptr: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const { camera, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const leftSlab = useRef<THREE.Group>(null);
  const rightSlab = useRef<THREE.Group>(null);
  const seam = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.InstancedMesh>(null);
  const rotY = useRef(0);
  const rotX = useRef(0);
  const openCur = useRef(0);
  // Damped channels so every transform glides at the same rate (mixing damped
  // and raw-from-scroll values was what made the monument lurch/reverse).
  const recedeCur = useRef(0);
  const posYCur = useRef(0);
  const posXCur = useRef(0);

  const seamMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#9B6DFF", transparent: true }),
    [],
  );
  // Polished dark metal so the monument catches light/reflections on its faces
  // and bevels instead of reading as a flat black rectangle. Lifted base color +
  // stronger env reflection + a broader specular lobe give the faces a visible
  // violet highlight sweep rather than reading as flat black slabs.
  const slabMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#17131F",
        metalness: 0.8,
        roughness: 0.38,
        envMapIntensity: 3.2,
      }),
    [],
  );

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
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = reduced ? 0 : scroll.current ?? 0;
    const s = sceneStateFor(p);

    // The halves open ONCE as you leave the hero and stay open through the middle
    // of the page, then close for the footer reform. No per-section "breathing"
    // bump (the old debris term made them lunge apart during chaos then pull back
    // in for the factory — that was the back-and-forth). Damped so even fast
    // scrolling glides toward the target instead of snapping section to section.
    const openTarget = (1 - s.form) * 0.65;
    openCur.current = THREE.MathUtils.damp(openCur.current, openTarget, 2.5, delta);
    if (leftSlab.current) leftSlab.current.position.x = -1.0 - openCur.current;
    if (rightSlab.current) rightSlab.current.position.x = 1.0 + openCur.current;

    if (seam.current) {
      seam.current.scale.y = 0.2 + s.seamOpacity * 1.05;
      // Cap the seam so it reads as a soft lit edge, not a harsh neon stick.
      (seam.current.material as THREE.MeshBasicMaterial).opacity = s.seamOpacity * 0.62;
    }

    if (debrisRef.current) {
      const k = s.order;
      const sc = (0.006 + 0.03 * s.debris) * (1 - s.reform);
      for (let i = 0; i < DEBRIS; i++) {
        const h = debrisHome[i];
        dummy.position.set(h.x * (1 - k), h.y * (1 - k * 0.85), h.z * (1 - k));
        dummy.scale.setScalar(Math.max(0.0001, sc));
        // freeze rotation under reduced motion (static, per-instance varied)
        dummy.rotation.set(reduced ? i : t * 0.1 + i, reduced ? i : t * 0.13 + i, 0);
        dummy.updateMatrix();
        debrisRef.current.setMatrixAt(i, dummy.matrix);
      }
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // Read pointer fields directly (no per-frame object allocation in the loop).
    const ptX = reduced ? 0 : ptr.current?.x ?? 0;
    const ptY = reduced ? 0 : ptr.current?.y ?? 0;
    const sway = reduced ? 0 : Math.sin(t * 0.25) * 0.07;
    // Calm rotation so the monument reads centered through the text sections.
    const targetY = sway + p * 0.32 + ptX * 0.16;
    rotY.current = THREE.MathUtils.damp(rotY.current, targetY, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, ptY * 0.08, 3, delta);

    // Recede smoothly during the middle bands, with a tail to 0 for the footer
    // reform (no snap back to full scale). Damped like every other channel.
    const recedeTarget = Math.max(s.constellation, s.rivers) * (1 - s.reform);
    recedeCur.current = THREE.MathUtils.damp(recedeCur.current, recedeTarget, 2.5, delta);

    const heroOnly = 1 - smoothstep(0.05, 0.16, p);
    // On phones the copy is full-width, so keep the monument pushed off to the
    // right edge so it never sits under headlines.
    const isMobile = size.width < 768;
    const posXTarget = isMobile ? 1.5 + heroOnly * 1.7 : heroOnly * 1.9;
    const posYTarget = 0.6 * (1 - smoothstep(0, 0.9, p));
    posXCur.current = THREE.MathUtils.damp(posXCur.current, posXTarget, 3, delta);
    posYCur.current = THREE.MathUtils.damp(posYCur.current, posYTarget, 3, delta);

    if (group.current) {
      group.current.rotation.y = rotY.current;
      group.current.rotation.x = rotX.current;
      group.current.scale.setScalar(1 - recedeCur.current * 0.45);
      group.current.position.y = posYCur.current;
      group.current.position.x = posXCur.current;
    }

    camera.position.z = THREE.MathUtils.damp(camera.position.z, s.cameraZ, 3, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      {/* left half of the monument */}
      <group ref={leftSlab} position={[-1.0, 0, 0]} rotation={[0, 0.16, 0]}>
        <RoundedBox args={[0.98, 3.5, 0.58]} radius={0.05} smoothness={4} material={slabMat}>
          <Edges threshold={18} color="#7C4AF0" />
        </RoundedBox>
      </group>

      {/* right half of the monument */}
      <group ref={rightSlab} position={[1.0, 0, 0]} rotation={[0, -0.16, 0]}>
        <RoundedBox args={[0.98, 3.5, 0.58]} radius={0.05} smoothness={4} material={slabMat}>
          <Edges threshold={18} color="#7C4AF0" />
        </RoundedBox>
      </group>

      {/* the seam */}
      <mesh ref={seam} material={seamMat} position={[0, 0, 0.32]}>
        <boxGeometry args={[0.04, 3.3, 0.04]} />
      </mesh>

      <instancedMesh ref={debrisRef} args={[undefined, undefined, DEBRIS]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#544a78" metalness={0.4} roughness={0.6} envMapIntensity={1} />
      </instancedMesh>

      <Grid
        position={[0, -2.45, 0]}
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

      {/* inline reflection environment (no network fetch) — gives the metal its
          violet/steel highlights so the monument has depth, not a paint-flat face. */}
      <Environment resolution={256} frames={1}>
        {/* Key + fill pulled forward (z ~5) so reflections rake across the front
            faces and create a luminous violet gradient, not a flat black slab. */}
        <Lightformer intensity={4} color="#B28AFF" position={[-2.5, 1.5, 5]} scale={[4, 9, 1]} />
        <Lightformer intensity={2.2} color="#7C4AF0" position={[3, 0, 5]} scale={[3, 8, 1]} />
        <Lightformer intensity={1} color="#AEB4C7" position={[0, 4, -2]} scale={[9, 4, 1]} />
        <Lightformer intensity={0.7} color="#ffffff" position={[2.5, -2, 5]} scale={[2, 3, 1]} />
      </Environment>
    </group>
  );
}
