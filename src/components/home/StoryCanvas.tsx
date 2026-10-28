/**
 * Realtime 3D "A day in a better-powered home" scene.
 * Photoreal-leaning contemporary Australian single-storey brick home: CC0
 * PBR materials (Poly Haven brick, slate roof tiles, grass, pavers), a real
 * sky HDRI for image-based lighting, eaves/gutters/downpipes, framed windows
 * with reflective glass, roof-mounted solar, heat pump and outdoor AC unit.
 *
 * One canvas serves the hero AND the three scroll chapters: the parent
 * wrapper owns the scroll progress; this component only reads it.
 */
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, SMAA, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

import brickDiffuse from "@/assets/tex/brick-diffuse.jpg.asset.json";
import brickNormal from "@/assets/tex/brick-normal.jpg.asset.json";
import brickRough from "@/assets/tex/brick-rough.jpg.asset.json";
import roofDiffuse from "@/assets/tex/roof-diffuse.jpg.asset.json";
import roofNormal from "@/assets/tex/roof-normal.jpg.asset.json";
import roofRough from "@/assets/tex/roof-rough.jpg.asset.json";
import grassDiffuse from "@/assets/tex/grass-diffuse.jpg.asset.json";
import grassNormal from "@/assets/tex/grass-normal.jpg.asset.json";
import grassRough from "@/assets/tex/grass-rough.jpg.asset.json";
import pavingDiffuse from "@/assets/tex/paving-diffuse.jpg.asset.json";
import pavingNormal from "@/assets/tex/paving-normal.jpg.asset.json";
import pavingRough from "@/assets/tex/paving-rough.jpg.asset.json";
import stuccoDiffuse from "@/assets/tex/stucco-diffuse.jpg.asset.json";
import stuccoNormal from "@/assets/tex/stucco-normal.jpg.asset.json";
import stuccoRough from "@/assets/tex/stucco-rough.jpg.asset.json";
import skyEnv from "@/assets/tex/sky-1k.hdr.asset.json";

export type HotspotId = "solar" | "hotwater" | "comfort";

/* ---------------- camera + light keyframes (one per story beat) ------------ */

type Beat = {
  pos: [number, number, number];
  target: [number, number, number];
  elevation: number; // sun elevation, degrees
  azimuth: number; // sun azimuth, degrees
  sunColor: string;
  sky: string;
  ambient: number;
};

// hero(dawn) → solar(morning) → hotwater(midday) → comfort(afternoon) → end(dusk)
const BEATS: Beat[] = [
  { pos: [11.2, 5.0, 12.4], target: [-1.8, 1.5, 0], elevation: 13, azimuth: -55, sunColor: "#ffc37e", sky: "#f3e4cd", ambient: 0.55 },
  { pos: [3.8, 5.8, 8.6], target: [0.5, 3.1, 0.8], elevation: 36, azimuth: -20, sunColor: "#fff2dc", sky: "#eef0e6", ambient: 0.7 },
  { pos: [-8.8, 2.4, 9.8], target: [-5.6, 0.8, 1.4], elevation: 56, azimuth: 5, sunColor: "#fff8ec", sky: "#eef1e9", ambient: 0.78 },
  { pos: [7.8, 2.4, 9.4], target: [2.9, 1.0, 0.6], elevation: 33, azimuth: 35, sunColor: "#ffe9c4", sky: "#ece9da", ambient: 0.65 },
  { pos: [11.6, 4.2, 12.8], target: [-1.4, 1.6, 0], elevation: 7, azimuth: 60, sunColor: "#ff9d62", sky: "#56516a", ambient: 0.4 },
];

const BEAT_T = [0, 0.24, 0.49, 0.74, 1]; // progress stops for the beats

const v3 = (a: [number, number, number]) => new THREE.Vector3(...a);

function sampleBeats(p: number) {
  const clamped = Math.min(1, Math.max(0, p));
  let i = 0;
  while (i < BEAT_T.length - 2 && BEAT_T[i + 1] !== undefined && clamped > BEAT_T[i + 1]!) i++;
  const t = THREE.MathUtils.smoothstep((clamped - BEAT_T[i]!) / (BEAT_T[i + 1]! - BEAT_T[i]!), 0, 1);
  const a = BEATS[i]!;
  const b = BEATS[i + 1]!;
  return {
    pos: v3(a.pos).lerp(v3(b.pos), t),
    target: v3(a.target).lerp(v3(b.target), t),
    elevation: THREE.MathUtils.lerp(a.elevation, b.elevation, t),
    azimuth: THREE.MathUtils.lerp(a.azimuth, b.azimuth, t),
    sunColor: new THREE.Color(a.sunColor).lerp(new THREE.Color(b.sunColor), t),
    sky: new THREE.Color(a.sky).lerp(new THREE.Color(b.sky), t),
    ambient: THREE.MathUtils.lerp(a.ambient, b.ambient, t),
  };
}

export type BeatSample = ReturnType<typeof sampleBeats>;

/* ------------------------------ PBR materials ------------------------------ */

const TEX_URLS = {
  brickD: brickDiffuse.url,
  brickN: brickNormal.url,
  brickR: brickRough.url,
  roofD: roofDiffuse.url,
  roofN: roofNormal.url,
  roofR: roofRough.url,
  grassD: grassDiffuse.url,
  grassN: grassNormal.url,
  grassR: grassRough.url,
  pavD: pavingDiffuse.url,
  pavN: pavingNormal.url,
  pavR: pavingRough.url,
  stD: stuccoDiffuse.url,
  stN: stuccoNormal.url,
  stR: stuccoRough.url,
} as const;

type TexKey = keyof typeof TEX_URLS;

function tile(t: THREE.Texture, rx: number, ry = rx) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  return t;
}

function useMats() {
  const m = useTexture(TEX_URLS);
  return useMemo(() => {
    (Object.keys(TEX_URLS) as TexKey[]).forEach((k) => {
      if (k.endsWith("D")) m[k].colorSpace = THREE.SRGBColorSpace;
      m[k].wrapS = m[k].wrapT = THREE.RepeatWrapping;
    });
    const brick = new THREE.MeshStandardMaterial({
      map: tile(m.brickD, 4.2, 2.2),
      normalMap: tile(m.brickN, 4.2, 2.2),
      roughnessMap: tile(m.brickR, 4.2, 2.2),
      roughness: 1,
    });
    const roof = new THREE.MeshStandardMaterial({
      map: tile(m.roofD, 0.5),
      normalMap: tile(m.roofN, 0.5),
      roughnessMap: tile(m.roofR, 0.5),
      roughness: 1,
    });
    const grass = new THREE.MeshStandardMaterial({
      map: tile(m.grassD, 16),
      normalMap: tile(m.grassN, 16),
      roughnessMap: tile(m.grassR, 16),
      roughness: 1,
    });
    const paving = new THREE.MeshStandardMaterial({
      map: tile(m.pavD, 0.34, 0.2),
      normalMap: tile(m.pavN, 0.34, 0.2),
      roughnessMap: tile(m.pavR, 0.34, 0.2),
      roughness: 1,
    });
    const trim = new THREE.MeshStandardMaterial({
      map: tile(m.stD, 2.5, 1),
      normalMap: tile(m.stN, 2.5, 1),
      roughnessMap: tile(m.stR, 2.5, 1),
      roughness: 1,
      color: "#f2efe6",
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#a9c0b6",
      roughness: 0.05,
      metalness: 0,
      transparent: true,
      opacity: 0.42,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
    const timber = new THREE.MeshStandardMaterial({ color: "#8a6547", roughness: 0.7 });
    const darkMetal = new THREE.MeshStandardMaterial({ color: "#2a2e31", roughness: 0.45, metalness: 0.65 });
    const alu = new THREE.MeshStandardMaterial({ color: "#b9bec3", roughness: 0.35, metalness: 0.8 });
    const revealDark = new THREE.MeshStandardMaterial({ color: "#12171a", roughness: 0.9 });
    return { brick, roof, grass, paving, trim, glass, timber, darkMetal, alu, revealDark };
  }, [m]);
}

type Mats = ReturnType<typeof useMats>;

/* --------------------------- procedural decals ----------------------------- */

function makePanelTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, "#101d31");
  grad.addColorStop(1, "#0a1422");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(120,150,190,0.35)";
  g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke();
    g.beginPath(); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke();
  }
  g.strokeStyle = "rgba(220,230,240,0.25)";
  g.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    g.beginPath(); g.moveTo(i * 64 + 32, 0); g.lineTo(i * 64 + 32, 256); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeGrilleTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 128, 128);
  g.fillStyle = "#22262a";
  g.beginPath(); g.arc(64, 64, 60, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#4a5057";
  g.lineWidth = 3;
  for (const r of [18, 34, 50]) {
    g.beginPath(); g.arc(64, 64, r, 0, Math.PI * 2); g.stroke();
  }
  g.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.beginPath();
    g.moveTo(64 + Math.cos(a) * 10, 64 + Math.sin(a) * 10);
    g.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------ scene objects ----------------------------- */

function Window({
  position,
  rotation = [0, 0, 0],
  w,
  h,
  mats,
  glowSetter,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  w: number;
  h: number;
  mats: Mats;
  glowSetter: (m: THREE.MeshStandardMaterial | null) => void;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* dark reveal box recessed into the wall */}
      <mesh position={[0, 0, -0.03]} material={mats.revealDark}>
        <boxGeometry args={[w + 0.1, h + 0.1, 0.06]} />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0, 0.01]} material={mats.glass}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* mullions */}
      <mesh position={[0, 0, 0.03]} material={mats.darkMetal}>
        <boxGeometry args={[0.05, h, 0.04]} />
      </mesh>
      <mesh position={[0, h * 0.18, 0.03]} material={mats.darkMetal}>
        <boxGeometry args={[w, 0.05, 0.04]} />
      </mesh>
      {/* painted picture-frame surround */}
      <mesh position={[0, h / 2 + 0.05, 0.03]} material={mats.trim} castShadow>
        <boxGeometry args={[w + 0.2, 0.1, 0.1]} />
      </mesh>
      <mesh position={[0, -h / 2 - 0.05, 0.03]} material={mats.trim} castShadow>
        <boxGeometry args={[w + 0.2, 0.1, 0.1]} />
      </mesh>
      <mesh position={[-w / 2 - 0.05, 0, 0.03]} material={mats.trim} castShadow>
        <boxGeometry args={[0.1, h, 0.1]} />
      </mesh>
      <mesh position={[w / 2 + 0.05, 0, 0.03]} material={mats.trim} castShadow>
        <boxGeometry args={[0.1, h, 0.1]} />
      </mesh>
      {/* sill */}
      <mesh position={[0, -h / 2 - 0.11, 0.055]} material={mats.trim} castShadow>
        <boxGeometry args={[w + 0.28, 0.07, 0.15]} />
      </mesh>
      {/* warm interior glow at dusk — between the reveal and the glass */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial ref={glowSetter} color="#37302a" emissive="#ffb35c" emissiveIntensity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

function House({ glowMaterials, mats }: { glowMaterials: RefObject<(THREE.MeshStandardMaterial | null)[]>; mats: Mats }) {
  // Gable roof as one triangular prism: cross-section in the z/y plane,
  // extruded along x. Clean apex, no crossing planes.
  const roofShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-3.45, 0);
    shape.lineTo(3.45, 0);
    shape.lineTo(0, 1.8);
    shape.closePath();
    return shape;
  }, []);
  const roofGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roofShape, { depth: 7.1, bevelEnabled: false });
    geo.rotateY(-Math.PI / 2);
    geo.translate(3.55, 0, 0);
    return geo;
  }, [roofShape]);
  // brick gable infills so the triangular ends read as wall, not tiles
  const gableGeo = useMemo(() => {
    const geo = new THREE.ShapeGeometry(roofShape);
    geo.rotateY(-Math.PI / 2);
    return geo;
  }, [roofShape]);

  const panelTex = useMemo(makePanelTexture, []);
  const glowSetter = (i: number) => (m: THREE.MeshStandardMaterial | null) => {
    const arr = glowMaterials.current;
    if (arr) arr[i] = m;
  };

  return (
    <group>
      {/* brick body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow material={mats.brick}>
        <boxGeometry args={[6.4, 3, 6.2]} />
      </mesh>
      {/* brick gable ends over the tile prism */}
      <mesh geometry={gableGeo} position={[-3.56, 2.98, 0]} material={mats.brick} />
      <mesh geometry={gableGeo} position={[3.56, 2.98, 0]} rotation={[0, Math.PI, 0]} material={mats.brick} />
      {/* plinth */}
      <mesh position={[0, 0.09, 0]} material={mats.darkMetal}>
        <boxGeometry args={[6.7, 0.18, 6.5]} />
      </mesh>
      {/* tiled roof */}
      <mesh geometry={roofGeo} position={[0, 2.98, 0]} castShadow receiveShadow material={mats.roof} />
      {/* ridge capping */}
      <mesh position={[0, 4.79, 0]} material={mats.darkMetal}>
        <boxGeometry args={[7.0, 0.09, 0.3]} />
      </mesh>
      {/* fascia + gutters along both eaves */}
      <mesh position={[0, 2.93, 3.52]} castShadow material={mats.darkMetal}>
        <boxGeometry args={[7.25, 0.15, 0.14]} />
      </mesh>
      <mesh position={[0, 2.93, -3.52]} castShadow material={mats.darkMetal}>
        <boxGeometry args={[7.25, 0.15, 0.14]} />
      </mesh>
      {/* downpipes */}
      <mesh position={[3.42, 1.45, 3.5]} material={mats.darkMetal}>
        <cylinderGeometry args={[0.045, 0.045, 2.85, 10]} />
      </mesh>
      <mesh position={[-3.42, 1.45, 3.5]} material={mats.darkMetal}>
        <cylinderGeometry args={[0.045, 0.045, 2.85, 10]} />
      </mesh>
      {/* brick chimney with cap */}
      <mesh position={[2.3, 4.25, -1.3]} castShadow material={mats.brick}>
        <boxGeometry args={[0.55, 1.35, 0.55]} />
      </mesh>
      <mesh position={[2.3, 4.98, -1.3]} castShadow material={mats.darkMetal}>
        <boxGeometry args={[0.68, 0.09, 0.68]} />
      </mesh>
      {/* front door: painted surround + timber leaf + handle */}
      <group position={[-0.1, 1.06, 3.11]}>
        <mesh material={mats.trim} castShadow>
          <boxGeometry args={[1.08, 2.26, 0.09]} />
        </mesh>
        <mesh position={[0, 0, 0.055]} material={mats.timber}>
          <boxGeometry args={[0.92, 2.12, 0.07]} />
        </mesh>
        <mesh position={[0.33, 0, 0.11]} material={mats.alu}>
          <sphereGeometry args={[0.035, 12, 12]} />
        </mesh>
      </group>
      {/* windows */}
      <Window position={[-2.0, 1.6, 3.11]} w={1.7} h={1.5} mats={mats} glowSetter={glowSetter(0)} />
      <Window position={[1.9, 1.55, 3.11]} w={2.6} h={1.6} mats={mats} glowSetter={glowSetter(1)} />
      <Window position={[3.21, 1.6, 0.6]} rotation={[0, Math.PI / 2, 0]} w={1.4} h={1.3} mats={mats} glowSetter={glowSetter(2)} />
      {/* timber accent band */}
      <mesh position={[0, 0.32, 3.13]} material={mats.timber}>
        <boxGeometry args={[6.45, 0.22, 0.07]} />
      </mesh>
    </group>
  );
}

function SolarArray({ mats, panelTex }: { mats: Mats; panelTex: THREE.Texture }) {
  const panelGlass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0d1a2c", map: panelTex, roughness: 0.1, metalness: 0.85, envMapIntensity: 1.3 }),
    [panelTex],
  );
  const roofAngle = Math.atan2(1.8, 3.45);
  const panels = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      panels.push(
        <group
          key={`${row}-${col}`}
          position={[-1.95 + col * 1.28, 0.16, -0.75 + row * 1.55]}
          rotation={[roofAngle, 0, 0]}
        >
          <mesh castShadow material={mats.alu}>
            <boxGeometry args={[1.14, 0.07, 1.34]} />
          </mesh>
          <mesh position={[0, 0.045, 0]} material={panelGlass}>
            <boxGeometry args={[1.02, 0.03, 1.2]} />
          </mesh>
        </group>,
      );
    }
  }
  return (
    <group position={[0, 3.62, 1.35]} rotation={[roofAngle, 0, 0]}>
      {panels}
    </group>
  );
}

function HeatPumpUnit({ mats, grille }: { mats: Mats; grille: THREE.Texture }) {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#e3e6e1", roughness: 0.35, metalness: 0.3 }),
    [],
  );
  return (
    <group position={[-4.35, 0, 1.7]}>
      <mesh position={[0, 0.06, 0]} material={mats.darkMetal}>
        <boxGeometry args={[1.15, 0.12, 0.75]} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow material={bodyMat}>
        <boxGeometry args={[1.0, 1.25, 0.62]} />
      </mesh>
      <mesh position={[0.52, 0.85, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.darkMetal}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 24]} />
      </mesh>
      <mesh position={[0.556, 0.85, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.58, 0.58]} />
        <meshStandardMaterial map={grille} transparent roughness={0.6} />
      </mesh>
      <mesh position={[0.9, 0.28, -0.1]} rotation={[0, 0, Math.PI / 2]} material={mats.darkMetal}>
        <cylinderGeometry args={[0.045, 0.045, 1.5, 10]} />
      </mesh>
    </group>
  );
}

function AcUnit({ mats, grille }: { mats: Mats; grille: THREE.Texture }) {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#e9e9e5", roughness: 0.4, metalness: 0.25 }),
    [],
  );
  return (
    <group position={[4.35, 0, 1.9]}>
      <mesh position={[0, 0.34, 0]} castShadow material={bodyMat}>
        <boxGeometry args={[0.9, 0.68, 0.36]} />
      </mesh>
      <mesh position={[-0.46, 0.34, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.darkMetal}>
        <cylinderGeometry args={[0.27, 0.27, 0.03, 24]} />
      </mesh>
      <mesh position={[-0.478, 0.34, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.52, 0.52]} />
        <meshStandardMaterial map={grille} transparent roughness={0.6} />
      </mesh>
    </group>
  );
}

// organic foliage blob: jitter keyed off vertex position so shared corners
// of the (non-indexed) icosahedron stay welded
function blobGeo(r: number) {
  const g = new THREE.IcosahedronGeometry(r, 1);
  const pos = g.attributes["position"] as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const h1 = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453) % 1;
    const h2 = Math.abs(Math.sin(x * 93.989 + y * 47.233 + z * 61.719) * 24634.6345) % 1;
    const j = 0.84 + h1 * 0.34;
    pos.setXYZ(i, x * j, y * j * 0.82, z * j * (0.9 + h2 * 0.2));
  }
  g.computeVertexNormals();
  return g;
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const trunk = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6e5340", roughness: 0.95 }), []);
  const leaf = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4f7a3e", roughness: 0.9 }), []);
  const leaf2 = useMemo(() => new THREE.MeshStandardMaterial({ color: "#61914c", roughness: 0.9 }), []);
  const blobs = useMemo(
    () => [blobGeo(0.9), blobGeo(0.62), blobGeo(0.52)] as const,
    [],
  );
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.75, 0]} castShadow material={trunk}>
        <cylinderGeometry args={[0.1, 0.16, 1.5, 8]} />
      </mesh>
      <mesh geometry={blobs[0]} position={[0.25, 1.78, 0.1]} castShadow material={leaf} />
      <mesh geometry={blobs[1]} position={[-0.34, 1.5, -0.2]} castShadow material={leaf2} />
      <mesh geometry={blobs[2]} position={[0.05, 2.32, -0.05]} castShadow material={leaf} />
    </group>
  );
}

function Ground({ mats }: { mats: Mats }) {
  const steps = [];
  for (let i = 0; i < 6; i++) {
    steps.push(
      <mesh
        key={i}
        position={[0.4 + (i % 2) * 0.18, 0.02, 3.6 + i * 0.72]}
        rotation={[0, (i % 2) * 0.06, 0]}
        material={mats.paving}
        receiveShadow
      >
        <boxGeometry args={[1.15, 0.05, 0.5]} />
      </mesh>,
    );
  }
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.grass} receiveShadow>
        <circleGeometry args={[19, 48]} />
      </mesh>
      {steps}
    </group>
  );
}

/* ------------------------------ energy paths ------------------------------ */

/**
 * Animated dashed energy path. `window` is [start, end] story progress;
 * opacity follows a soft envelope inside that window.
 */
function EnergyPath({
  points,
  color,
  progressRef,
  window: win,
  speed = 1.4,
  externalOpacity = 1,
}: {
  points: [number, number, number][];
  color: string;
  progressRef: MutableRefObject<number>;
  window: [number, number];
  speed?: number;
  externalOpacity?: MutableRefObject<number> | number;
}) {
  const line = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(90));
    const mat = new THREE.LineDashedMaterial({
      color,
      dashSize: 0.34,
      gapSize: 0.3,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    l.frustumCulled = false;
    return l;
  }, [points, color]);

  const baseDist = useRef<Float32Array | null>(null);

  useFrame((state) => {
    const p = progressRef.current;
    const [a, b] = win;
    const fade =
      THREE.MathUtils.smoothstep(p, a - 0.04, a + 0.06) * (1 - THREE.MathUtils.smoothstep(p, b - 0.06, b + 0.04));
    const ext = typeof externalOpacity === "number" ? externalOpacity : externalOpacity.current;
    const mat = line.material as THREE.LineDashedMaterial;
    mat.opacity = fade * ext * 0.9;
    line.visible = mat.opacity > 0.01;
    if (line.visible) {
      // LineDashedMaterial has no dashOffset uniform — shift the lineDistance
      // attribute instead so the dashes flow along the path.
      const attr = line.geometry.getAttribute("lineDistance") as THREE.BufferAttribute | undefined;
      if (attr) {
        if (!baseDist.current) baseDist.current = Float32Array.from(attr.array as Float32Array);
        const base = baseDist.current;
        const period = mat.dashSize + mat.gapSize;
        const off = -((state.clock.elapsedTime * speed) % period);
        const arr = attr.array as Float32Array;
        for (let k = 0; k < arr.length; k++) arr[k] = base[k]! + off;
        attr.needsUpdate = true;
      }
    }
  });

  return <primitive object={line} />;
}

/* --------------------------------- labels --------------------------------- */

function HotspotLabel({
  id,
  position,
  label,
  active,
  onSelect,
  interactive,
}: {
  id: HotspotId;
  position: [number, number, number];
  label: string;
  active: boolean;
  onSelect: (id: HotspotId) => void;
  interactive: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const target = active ? 1.2 : 1;
    const s = THREE.MathUtils.damp(group.current.scale.x || 1, target, 6, delta);
    group.current.scale.setScalar(s);
    group.current.position.y = position[1] + Math.sin(t * 1.4 + position[0]) * 0.05;
  });

  return (
    <group ref={group} position={position}>
      <Html center distanceFactor={9} zIndexRange={[20, 0]} pointerEvents={interactive ? "auto" : "none"}>
        <button
          type="button"
          tabIndex={interactive ? 0 : -1}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id);
          }}
          className={`glass whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold text-charcoal transition-shadow ${
            active ? "ring-2 ring-leaf" : ""
          }`}
          aria-pressed={active}
        >
          {label}
        </button>
      </Html>
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color={active ? "#68a943" : "#f4c45b"}
          emissive={active ? "#68a943" : "#f4c45b"}
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------ sun and sky ------------------------------- */

function SunAndSky({ beatRef }: { beatRef: MutableRefObject<BeatSample> }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const bg = useMemo(() => new THREE.Color("#f3e4cd"), []);
  const { scene } = useThree();

  useFrame((_, delta) => {
    const b = beatRef.current;
    const sun = lightRef.current;
    if (sun) {
      const elev = THREE.MathUtils.degToRad(b.elevation);
      const azim = THREE.MathUtils.degToRad(b.azimuth);
      const r = 24;
      sun.position.set(
        Math.sin(azim) * Math.cos(elev) * r,
        Math.sin(elev) * r,
        Math.cos(azim) * Math.cos(elev) * r + 2,
      );
      sun.color.copy(b.sunColor);
      sun.intensity = 1.4 + (b.elevation / 90) * 1.9;
      sun.target.position.set(0, 1, 0);
      sun.target.updateMatrixWorld();
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.damp(hemiRef.current.intensity, b.ambient * 0.45, 4, delta);
    }
    if (sunRef.current) {
      sunRef.current.position.set(
        Math.sin(THREE.MathUtils.degToRad(b.azimuth)) * 32,
        Math.sin(THREE.MathUtils.degToRad(b.elevation)) * 32,
        Math.cos(THREE.MathUtils.degToRad(b.azimuth)) * 32 - 4,
      );
      (sunRef.current.material as THREE.MeshBasicMaterial).color.copy(b.sunColor);
    }
    // IBL strength follows the story's ambient key so dusk feels like dusk
    scene.environmentIntensity = 0.3 + b.ambient * 0.5;
    bg.lerp(b.sky, Math.min(1, delta * 2.4));
    if (scene.background instanceof THREE.Color) scene.background.copy(bg);
    else scene.background = bg.clone();
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(bg);
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={["#fdf6e8", "#8fa383", 0.35]} />
      <directionalLight
        ref={lightRef}
        castShadow
        intensity={1.6}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
      />
      <mesh ref={sunRef}>
        <circleGeometry args={[3.2, 32]} />
        <meshBasicMaterial color="#ffc37e" transparent opacity={0.85} fog={false} depthWrite={false} />
      </mesh>
    </>
  );
}

/* --------------------------------- camera --------------------------------- */

function CameraRig({
  progressRef,
  pointerRef,
  beatRef,
}: {
  progressRef: MutableRefObject<number>;
  pointerRef: MutableRefObject<{ x: number; y: number }>;
  beatRef: MutableRefObject<BeatSample>;
}) {
  const { camera } = useThree();
  const current = useRef({
    pos: v3(BEATS[0]!.pos),
    target: v3(BEATS[0]!.target),
  });
  const offset = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const b = beatRef.current;
    const cur = current.current;
    const lambda = 2.8;
    cur.pos.lerp(b.pos, Math.min(1, delta * lambda));
    cur.target.lerp(b.target, Math.min(1, delta * lambda));
    // pointer parallax — at most ~3 degrees
    offset.set(pointerRef.current.x * 0.2, pointerRef.current.y * 0.12, 0);
    camera.position.copy(cur.pos).add(offset);
    camera.lookAt(cur.target);
  });
  return null;
}

/* -------------------------------- scene tick ------------------------------ */

function SceneTick({
  progressRef,
  beatRef,
  glowMaterials,
}: {
  progressRef: MutableRefObject<number>;
  beatRef: MutableRefObject<BeatSample>;
  glowMaterials: RefObject<(THREE.MeshStandardMaterial | null)[]>;
}) {
  useFrame(() => {
    beatRef.current = sampleBeats(progressRef.current);
    const p = progressRef.current;
    const dusk = THREE.MathUtils.smoothstep(p, 0.72, 0.98);
    const glows = glowMaterials.current;
    if (glows) {
      for (const m of glows) {
        if (m) m.emissiveIntensity = dusk * 1.7;
      }
    }
  });
  return null;
}

/* --------------------------- textured scene body --------------------------- */

function SceneContents({
  progressRef,
  activeHotspot,
  onSelectHotspot,
  interactive,
  glowMaterials,
  daylightRef,
}: {
  progressRef: MutableRefObject<number>;
  activeHotspot: HotspotId | null;
  onSelectHotspot: (id: HotspotId) => void;
  interactive: boolean;
  glowMaterials: RefObject<(THREE.MeshStandardMaterial | null)[]>;
  daylightRef: MutableRefObject<number>;
}) {
  const mats = useMats();
  const panelTex = useMemo(makePanelTexture, []);
  const grille = useMemo(makeGrilleTexture, []);

  const solarPoints = useMemo<[number, number, number][]>(
    () => [
      [0.2, 4.35, 1.05],
      [0.9, 3.6, 1.5],
      [1.6, 2.4, 2.4],
      [1.4, 1.4, 2.9],
      [0.7, 1.1, 3.05],
    ],
    [],
  );
  const heatPoints = useMemo<[number, number, number][]>(
    () => [
      [-6.4, 0.9, 3.6],
      [-5.6, 1.3, 2.6],
      [-4.9, 1.1, 1.9],
      [-4.35, 0.9, 1.7],
    ],
    [],
  );
  const airPoints = useMemo<[number, number, number][]>(
    () => [
      [3.3, 1.5, 3.4],
      [2.6, 1.8, 2.9],
      [2.2, 1.4, 2.5],
      [2.4, 1.0, 3.1],
    ],
    [],
  );

  return (
    <>
      <Ground mats={mats} />
      <House glowMaterials={glowMaterials} mats={mats} />
      <SolarArray mats={mats} panelTex={panelTex} />
      <HeatPumpUnit mats={mats} grille={grille} />
      <AcUnit mats={mats} grille={grille} />
      <Tree position={[-8.6, 0, -3.0]} scale={1.05} />
      <Tree position={[8.8, 0, -2.0]} scale={0.9} />
      <Tree position={[7.8, 0, 5.6]} scale={0.7} />
      <Tree position={[-9.2, 0, 5.0]} scale={0.75} />

      {/* solar electricity: amber; solar generation fades as daylight ends */}
      <EnergyPath
        points={solarPoints}
        color="#f4c45b"
        progressRef={progressRef}
        window={[0.06, 0.74]}
        externalOpacity={daylightRef}
      />
      {/* ambient heat into the heat pump: sage, clearly non-electric */}
      <EnergyPath points={heatPoints} color="#8fae7e" progressRef={progressRef} window={[0.34, 0.62]} />
      {/* indoor airflow ribbon */}
      <EnergyPath points={airPoints} color="#b7cfb1" progressRef={progressRef} window={[0.6, 0.9]} speed={0.9} />

      <HotspotLabel
        id="solar"
        position={[0, 4.9, 1.2]}
        label="Solar"
        active={activeHotspot === "solar"}
        onSelect={onSelectHotspot}
        interactive={interactive}
      />
      <HotspotLabel
        id="hotwater"
        position={[-4.35, 2.05, 1.7]}
        label="Hot water"
        active={activeHotspot === "hotwater"}
        onSelect={onSelectHotspot}
        interactive={interactive}
      />
      <HotspotLabel
        id="comfort"
        position={[4.35, 1.35, 1.9]}
        label="Indoor comfort"
        active={activeHotspot === "comfort"}
        onSelect={onSelectHotspot}
        interactive={interactive}
      />
    </>
  );
}

/* --------------------------------- scene ---------------------------------- */

export type StoryCanvasProps = {
  progressRef: MutableRefObject<number>;
  activeHotspot: HotspotId | null;
  onSelectHotspot: (id: HotspotId) => void;
  interactive?: boolean;
};

export default function StoryCanvas({
  progressRef,
  activeHotspot,
  onSelectHotspot,
  interactive = true,
}: StoryCanvasProps) {
  const pointerRef = useRef({ x: 0, y: 0 });
  const beatRef = useRef<BeatSample>(sampleBeats(0));
  const glowMaterials = useRef<(THREE.MeshStandardMaterial | null)[]>([null, null, null]);
  const daylightRef = useRef(1);

  // daylight envelope for the solar path: fades as the story reaches dusk
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = progressRef.current;
      daylightRef.current = 1 - THREE.MathUtils.smoothstep(p, 0.6, 0.88);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 38, position: BEATS[0]!.pos, near: 0.5, far: 130 }}
      onPointerMove={(e) => {
        if (!interactive) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerRef.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      }}
      onPointerLeave={() => {
        pointerRef.current.x = 0;
        pointerRef.current.y = 0;
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <fog attach="fog" args={["#f3e4cd", 26, 68]} />
      <SceneTick progressRef={progressRef} beatRef={beatRef} glowMaterials={glowMaterials} />
      <SunAndSky beatRef={beatRef} />
      <CameraRig progressRef={progressRef} pointerRef={pointerRef} beatRef={beatRef} />
      <Suspense fallback={null}>
        <Environment files={skyEnv.url} />
        <SceneContents
          progressRef={progressRef}
          activeHotspot={activeHotspot}
          onSelectHotspot={onSelectHotspot}
          interactive={interactive}
          glowMaterials={glowMaterials}
          daylightRef={daylightRef}
        />
      </Suspense>
      {interactive && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.35} luminanceThreshold={0.85} luminanceSmoothing={0.15} />
          <Vignette offset={0.22} darkness={0.32} />
          <SMAA />
        </EffectComposer>
      )}
    </Canvas>
  );
}
