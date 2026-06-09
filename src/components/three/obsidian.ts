import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const tx = (p: string) => import.meta.env.BASE_URL + p;

/**
 * The Dark Titan "Obsidian" material: polished near-black volcanic glass with the
 * stone normal/roughness maps. Shared by the monolith and the solid crest logo so
 * the two are visibly the same object/material. Textures are cloned per call so
 * each material can set its own UV repeat without cross-talk; the material and its
 * clones are disposed on unmount.
 */
export function useObsidianMaterial(opts?: {
  side?: THREE.Side;
  repeat?: [number, number];
  /** Override the monolith default (0.16). Higher = more matte / less violet shine. */
  roughness?: number;
  /** Override the monolith default (2.6). Lower = darker, dimmer reflections. */
  envMapIntensity?: number;
  /** Override the monolith default (0.62). Lower = the near-black base dominates,
   *  so bright scene lights barely lift it (keeps faceted shapes dark). */
  metalness?: number;
  /** Override the monolith base colour (#140f20). Darker pulls lit faces below the
   *  bloom threshold so faceted shapes that face the lights head-on stay dark. */
  color?: string;
}) {
  const maps = useTexture({
    map: tx("textures/stone/stone_diff.jpg"),
    normalMap: tx("textures/stone/stone_nor_gl.jpg"),
    roughnessMap: tx("textures/stone/stone_rough.jpg"),
  });

  const side = opts?.side ?? THREE.FrontSide;
  const rx = opts?.repeat?.[0] ?? 1.0;
  const ry = opts?.repeat?.[1] ?? 1.9;
  const roughness = opts?.roughness ?? 0.16;
  const envMapIntensity = opts?.envMapIntensity ?? 2.6;
  const metalness = opts?.metalness ?? 0.62;
  const color = opts?.color ?? "#140f20";

  const material = useMemo(() => {
    const map = maps.map.clone();
    const normalMap = maps.normalMap.clone();
    const roughnessMap = maps.roughnessMap.clone();
    map.colorSpace = THREE.SRGBColorSpace;
    normalMap.colorSpace = THREE.NoColorSpace;
    roughnessMap.colorSpace = THREE.NoColorSpace;
    for (const t of [map, normalMap, roughnessMap]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.needsUpdate = true;
    }
    return new THREE.MeshStandardMaterial({
      map,
      normalMap,
      roughnessMap,
      color: new THREE.Color(color),
      metalness,
      roughness,
      envMapIntensity,
      normalScale: new THREE.Vector2(0.4, 0.4),
      side,
      transparent: true,
      opacity: 1,
    });
  }, [maps, side, rx, ry, roughness, envMapIntensity, metalness, color]);

  useEffect(() => {
    return () => {
      material.map?.dispose();
      material.normalMap?.dispose();
      material.roughnessMap?.dispose();
      material.dispose();
    };
  }, [material]);

  return material;
}
