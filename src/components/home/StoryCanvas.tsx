/**
 * Realtime 3D "A day in a better-powered home" scene.
 * Procedural contemporary Australian single-storey home with roof-mounted
 * solar, a heat pump hot water unit and an outdoor AC unit.
 *
 * One canvas serves the hero AND the three scroll chapters: the parent
 * wrapper owns the scroll progress; this component only reads it.
 */
import { useEffect, useMemo, useRef, type ComponentType, type MutableRefObject, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

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
  { pos: [-5.4, 2.3, 7.6], target: [-4.2, 1.0, 1.6], elevation: 56, azimuth: 5, sunColor: "#fff8ec", sky: "#eef1e9", ambient: 0.78 },
  { pos: [4.2, 2.1, 6.2], target: [0.9, 1.5, -0.6], elevation: 33, azimuth: 35, sunColor: "#ffe9c4", sky: "#ece9da", ambient: 0.65 },
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

/* ------------------------------ scene objects ----------------------------- */

function House({ glowMaterials }: { glowMaterials: RefObject<(THREE.MeshStandardMaterial | null)[]> }) {
  const render = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ece4d4", roughness: 0.92 }),
    [],
  );
  const roofMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#252b27", roughness: 0.55, metalness: 0.15 }),
    [],
  );
  const timber = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a4795a", roughness: 0.8 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1d2320", roughness: 0.6 }), []);
  const glass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#9fb6ad",
        roughness: 0.08,
        metalness: 0.4,
        transparent: true,
        opacity: 0.5,
      }),
    [],
  );
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b322d", roughness: 0.5 }), []);

  // Gable roof as one triangular prism: cross-section in the z/y plane,
  // extruded along x. Clean apex, no crossing planes.
  const roofGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-3.45, 0);
    shape.lineTo(3.45, 0);
    shape.lineTo(0, 1.8);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 7.1, bevelEnabled: false });
    geo.rotateY(-Math.PI / 2);
    geo.translate(3.55, 0, 0);
    return geo;
  }, []);

  const glowSetter = (i: number) => (m: THREE.MeshStandardMaterial | null) => {
    const arr = glowMaterials.current;
    if (arr) arr[i] = m;
  };

  return (
    <group>
      {/* body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow material={render}>
        <boxGeometry args={[6.4, 3, 6.2]} />
      </mesh>
      {/* plinth */}
      <mesh position={[0, 0.09, 0]} material={dark}>
        <boxGeometry args={[6.7, 0.18, 6.5]} />
      </mesh>
      {/* roof */}
      <mesh geometry={roofGeo} position={[0, 2.98, 0]} castShadow material={roofMat} />
      {/* chimney */}
      <mesh position={[2.3, 4.3, -1.3]} castShadow material={render}>
        <boxGeometry args={[0.5, 1.0, 0.5]} />
      </mesh>
      {/* door */}
      <mesh position={[-0.1, 1.06, 3.12]} material={timber}>
        <boxGeometry args={[0.92, 2.12, 0.1]} />
      </mesh>
      {/* windows */}
      <group position={[-2.0, 1.6, 3.13]}>
        <mesh material={glass}>
          <planeGeometry args={[1.7, 1.5]} />
        </mesh>
        <mesh position={[0, 0, 0.01]} material={frameMat}>
          <planeGeometry args={[1.84, 1.64]} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.7, 1.5]} />
          <meshStandardMaterial ref={glowSetter(0)} color="#ffd9a0" emissive="#ffb35c" emissiveIntensity={0} toneMapped={false} />
        </mesh>
      </group>
      <group position={[1.9, 1.55, 3.13]}>
        <mesh material={glass}>
          <planeGeometry args={[2.6, 1.6]} />
        </mesh>
        <mesh position={[0, 0, 0.01]} material={frameMat}>
          <planeGeometry args={[2.74, 1.74]} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.6, 1.6]} />
          <meshStandardMaterial ref={glowSetter(1)} color="#ffd9a0" emissive="#ffb35c" emissiveIntensity={0} toneMapped={false} />
        </mesh>
      </group>
      <group position={[3.22, 1.6, 0.6]} rotation={[0, Math.PI / 2, 0]}>
        <mesh material={glass}>
          <planeGeometry args={[1.4, 1.3]} />
        </mesh>
        <mesh position={[0, 0, 0.01]} material={frameMat}>
          <planeGeometry args={[1.54, 1.44]} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.4, 1.3]} />
          <meshStandardMaterial ref={glowSetter(2)} color="#ffd9a0" emissive="#ffb35c" emissiveIntensity={0} toneMapped={false} />
        </mesh>
      </group>
      {/* timber accent band */}
      <mesh position={[0, 0.32, 3.14]} material={timber}>
        <boxGeometry args={[6.45, 0.22, 0.06]} />
      </mesh>
    </group>
  );
}

function SolarArray() {
  const panelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0e1c2e", roughness: 0.18, metalness: 0.7 }),
    [],
  );
  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#8d9295", roughness: 0.4, metalness: 0.6 }),
    [],
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
          <mesh castShadow material={frameMat}>
            <boxGeometry args={[1.14, 0.07, 1.34]} />
          </mesh>
          <mesh position={[0, 0.045, 0]} material={panelMat}>
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

function HeatPumpUnit() {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#dfe2dd", roughness: 0.35, metalness: 0.3 }),
    [],
  );
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#23282a", roughness: 0.5 }), []);
  return (
    <group position={[-4.35, 0, 1.7]}>
      <mesh position={[0, 0.06, 0]} material={darkMat}>
        <boxGeometry args={[1.15, 0.12, 0.75]} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow material={bodyMat}>
        <boxGeometry args={[1.0, 1.25, 0.62]} />
      </mesh>
      <mesh position={[0.52, 0.85, 0]} rotation={[0, Math.PI / 2, 0]} material={darkMat}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 24]} />
      </mesh>
      <mesh position={[0.9, 0.28, -0.1]} rotation={[0, 0, Math.PI / 2]} material={darkMat}>
        <cylinderGeometry args={[0.045, 0.045, 1.5, 10]} />
      </mesh>
    </group>
  );
}

function AcUnit() {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#e6e6e2", roughness: 0.4, metalness: 0.25 }),
    [],
  );
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a2f2d", roughness: 0.55 }), []);
  return (
    <group position={[4.35, 0, 1.9]}>
      <mesh position={[0, 0.34, 0]} castShadow material={bodyMat}>
        <boxGeometry args={[0.9, 0.68, 0.36]} />
      </mesh>
      <mesh position={[-0.46, 0.34, 0]} rotation={[0, Math.PI / 2, 0]} material={darkMat}>
        <cylinderGeometry args={[0.27, 0.27, 0.03, 24]} />
      </mesh>
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const trunk = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7a5c44", roughness: 0.9 }), []);
  const leaf = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5d8a4a", roughness: 0.85 }), []);
  const leaf2 = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6f9a52", roughness: 0.85 }), []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]} castShadow material={trunk}>
        <cylinderGeometry args={[0.09, 0.14, 1.4, 8]} />
      </mesh>
      <mesh position={[0.25, 1.7, 0.1]} castShadow material={leaf}>
        <icosahedronGeometry args={[0.85, 1]} />
      </mesh>
      <mesh position={[-0.3, 1.45, -0.2]} castShadow material={leaf2}>
        <icosahedronGeometry args={[0.6, 1]} />
      </mesh>
      <mesh position={[0.05, 2.25, -0.05]} castShadow material={leaf}>
        <icosahedronGeometry args={[0.5, 1]} />
      </mesh>
    </group>
  );
}

function Ground() {
  const grass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a9bd91", roughness: 1 }), []);
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: "#cfc5b2", roughness: 0.95 }), []);
  const steps = [];
  for (let i = 0; i < 6; i++) {
    steps.push(
      <mesh
        key={i}
        position={[0.4 + (i % 2) * 0.18, 0.02, 3.6 + i * 0.72]}
        rotation={[0, (i % 2) * 0.06, 0]}
        material={stone}
        receiveShadow
      >
        <boxGeometry args={[1.15, 0.05, 0.5]} />
      </mesh>,
    );
  }
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={grass} receiveShadow>
        <circleGeometry args={[19, 48]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[8.4, 8.2]} />
        <meshStandardMaterial color="#93a682" roughness={1} />
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
  materialRef,
  externalOpacity = 1,
}: {
  points: [number, number, number][];
  color: string;
  progressRef: MutableRefObject<number>;
  window: [number, number];
  speed?: number;
  materialRef?: MutableRefObject<THREE.LineDashedMaterial | null>;
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
    if (materialRef) materialRef.current = mat;
    return l;
  }, [points, color, materialRef]);

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
  const { scene } = useThreeScene();

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
      sun.intensity = 1.1 + (b.elevation / 90) * 1.7;
      sun.target.position.set(0, 1, 0);
      sun.target.updateMatrixWorld();
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.damp(hemiRef.current.intensity, b.ambient, 4, delta);
    }
    if (sunRef.current) {
      sunRef.current.position.set(
        Math.sin(THREE.MathUtils.degToRad(b.azimuth)) * 32,
        Math.sin(THREE.MathUtils.degToRad(b.elevation)) * 32,
        Math.cos(THREE.MathUtils.degToRad(b.azimuth)) * 32 - 4,
      );
      (sunRef.current.material as THREE.MeshBasicMaterial).color.copy(b.sunColor);
    }
    bg.lerp(b.sky, Math.min(1, delta * 2.4));
    if (scene.background instanceof THREE.Color) scene.background.copy(bg);
    else scene.background = bg.clone();
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(bg);
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={["#fdf6e8", "#8fa383", 0.6]} />
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

// tiny wrapper so useThree stays inside the Canvas tree
import { useThree } from "@react-three/fiber";
function useThreeScene() {
  return useThree();
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

/* --------------------------------- scene ---------------------------------- */

export type StoryCanvasProps = { // eslint-disable-line 
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
      <Ground />
      <House glowMaterials={glowMaterials} />
      <SolarArray />
      <HeatPumpUnit />
      <AcUnit />
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
    </Canvas>
  );
}
