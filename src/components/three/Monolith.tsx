import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { sceneStateFor, smoothstep } from "../../lib/choreography";

const DEBRIS = 1400;

export default function Monolith({
  scroll,
  ptr,
  reduced,
}: {
  scroll: React.RefObject<number>;
  ptr: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const leftSlab = useRef<THREE.Mesh>(null);
  const rightSlab = useRef<THREE.Mesh>(null);
  const seam = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.InstancedMesh>(null);
  const rotY = useRef(0);
  const rotX = useRef(0);

  const seamMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#C79BFF", transparent: true }), []);
  const slabMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#15131c", metalness: 0.5, roughness: 0.55 }),
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

    const recede = Math.max(s.constellation, s.rivers);
    const open = (1 - s.form) * 1.2 + s.debris * 0.3;
    if (leftSlab.current) leftSlab.current.position.x = -1.05 - open;
    if (rightSlab.current) rightSlab.current.position.x = 1.05 + open;

    if (seam.current) {
      seam.current.scale.y = 0.2 + s.form * 1.0 + s.order * 0.3;
      (seam.current.material as THREE.MeshBasicMaterial).opacity = s.seamOpacity;
    }

    if (debrisRef.current) {
      const k = s.order;
      const sc = (0.015 + 0.085 * s.debris) * (1 - s.reform);
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

    const pt = reduced ? { x: 0, y: 0 } : ptr.current ?? { x: 0, y: 0 };
    const sway = reduced ? 0 : Math.sin(t * 0.25) * 0.16;
    const targetY = sway + p * 0.6 + pt.x * 0.18;
    rotY.current = THREE.MathUtils.damp(rotY.current, targetY, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, pt.y * 0.1, 3, delta);

    if (group.current) {
      group.current.rotation.y = rotY.current;
      group.current.rotation.x = rotX.current;
      group.current.scale.setScalar(1 - recede * 0.45);
      group.current.position.y = 0.6 * (1 - smoothstep(0, 0.9, p));
      // hero: shift the gateway to the right half (copy lives on the left); re-center for the footer bookend
      const heroOnly = 1 - smoothstep(0.05, 0.16, p);
      group.current.position.x = heroOnly * 1.9;
    }

    camera.position.z = THREE.MathUtils.damp(camera.position.z, s.cameraZ, 3, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <mesh ref={leftSlab} material={slabMat} position={[-1.05, 0, 0]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[1.1, 3.2, 0.5]} />
      </mesh>
      <mesh ref={rightSlab} material={slabMat} position={[1.05, 0, 0]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[1.1, 3.2, 0.5]} />
      </mesh>
      <mesh ref={seam} material={seamMat} position={[0, 0, 0.3]}>
        <boxGeometry args={[0.07, 3.2, 0.07]} />
      </mesh>
      <instancedMesh ref={debrisRef} args={[undefined, undefined, DEBRIS]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#3a3350" metalness={0.3} roughness={0.7} />
      </instancedMesh>
      <Grid
        position={[0, -2.4, 0]}
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
    </group>
  );
}
