import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Builds a SOLID 3D version of the Dark Titan crest by extruding its vector
 * paths (from DARK TITAN_Web vector logo.svg — wordmark text omitted) into a
 * single bevelled mesh, centred at the origin and scaled to the monolith's world
 * height so the two read as the same material/scale of object.
 */

// Crest-only paths from the brand vector logo — the two wings, the inner spikes
// and the central blade. NOT the "DARK TITAN" wordmark text.
const CREST_PATHS = [
  "M117.324 67.5782L142.783 68.9207L184.278 93.7674L182.202 173.295L212.05 201.207L169.236 181.579L155.232 98.4272L117.324 67.5782Z",
  "M380.655 67.5251L355.194 68.8723L313.699 93.719L315.775 173.246L285.956 201.143L328.741 181.53L342.745 98.3787L380.655 67.5251Z",
  "M212.05 201.207L223.461 264.103L117.349 205.678L117.324 67.5782L171.281 98.4249L171.533 178.587L212.05 201.207Z",
  "M274.712 264.008L285.956 201.143L326.436 178.564L326.774 98.5079L380.655 67.5251V91.1792L380.62 205.8L274.712 264.008Z",
  "M337.97 50.8076L322.001 57.6081L296.494 71.6105L257.802 267.98L276.968 47.7326L297.335 38.2793L337.97 50.8076Z",
  "M159.963 50.8122L175.913 57.6081L201.421 71.6105L240.322 268.01L220.949 47.7326L200.582 38.2793L159.963 50.8122Z",
  "M272.375 154.547L257.789 268.077C257.712 268.665 256.818 268.848 256.314 268.871L256.141 205.117L255.838 12.9851L272.673 0.00697327L391.782 0.0185073L337.97 50.8076L308.94 50.9091L283.881 63.8988L272.373 154.547H272.375Z",
  "M240.313 268.01L231.847 202.893L214.101 63.8688L189.062 50.9344L159.961 50.8122L106.258 0.0230681L225.336 0L242.044 13.1119L241.973 152.593L241.744 268.103C241.744 268.744 241.383 268.728 241.187 268.73C240.937 268.732 240.392 268.594 240.315 268.01H240.313Z",
];

const CREST_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 498 396">` +
  CREST_PATHS.map((d) => `<path d="${d}"/>`).join("") +
  `</svg>`;

/**
 * Returns one merged, bevelled, centred BufferGeometry for the crest, standing
 * `targetHeight` tall. The crest is a flat artwork; `depth` (in SVG units) gives
 * it a slab of thickness so it reads as a carved obsidian object, not a decal.
 *
 * NOTE: SVG Y points down, so the geometry is mirrored on Y to stand upright.
 * That flips face winding, so meshes using this geometry must render DoubleSide.
 */
export function buildLogoGeometry(targetHeight = 3.6, depth = 55): THREE.BufferGeometry {
  const loader = new SVGLoader();
  const data = loader.parse(CREST_SVG);

  const parts: THREE.BufferGeometry[] = [];
  for (const path of data.paths) {
    for (const shape of SVGLoader.createShapes(path)) {
      parts.push(
        new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelThickness: 7,
          bevelSize: 5,
          bevelSegments: 2,
          steps: 1,
        }),
      );
    }
  }

  const merged = mergeGeometries(parts, false);
  for (const g of parts) g.dispose();
  if (!merged) throw new Error("Failed to merge crest geometry");

  // SVG y is down, so mirror on Y to stand the crest upright. A mirror reverses
  // triangle winding, which would invert the normals — so we reverse the winding
  // back, then recompute clean outward normals. This lets the crest render
  // FrontSide with correct flat-shaded lighting, exactly like the monolith's
  // RoundedBox (the previous DoubleSide hack lit faces off their inverted normals,
  // which is what made one wing blow out white under the same lights).
  merged.scale(1, -1, 1);
  reverseWinding(merged); // restore CCW after the mirror
  merged.computeBoundingBox();
  const size = new THREE.Vector3();
  merged.boundingBox!.getSize(size);
  const s = targetHeight / size.y;
  merged.scale(s, s, s);
  merged.center();
  merged.computeVertexNormals(); // clean, correct, flat per-face normals
  return merged;
}

/** Reverse triangle winding on a non-indexed geometry by swapping each triangle's
 *  2nd and 3rd vertices (position + uv). Used after a mirror so faces stay
 *  outward-facing for FrontSide rendering. */
function reverseWinding(geom: THREE.BufferGeometry) {
  const swap = (attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, a: number, b: number) => {
    for (let c = 0; c < attr.itemSize; c++) {
      const va = attr.getComponent(a, c);
      attr.setComponent(a, c, attr.getComponent(b, c));
      attr.setComponent(b, c, va);
    }
  };
  const pos = geom.getAttribute("position");
  const uv = geom.getAttribute("uv");
  for (let i = 0; i < pos.count; i += 3) {
    swap(pos, i + 1, i + 2);
    if (uv) swap(uv, i + 1, i + 2);
  }
  pos.needsUpdate = true;
  if (uv) uv.needsUpdate = true;
}
