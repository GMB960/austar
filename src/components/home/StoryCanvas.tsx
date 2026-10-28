/**
 * Realtime 3D "A day in a better-powered home" scene.
 * Procedural contemporary Australian single-storey home with roof-mounted
 * solar, a heat pump hot water unit and an outdoor AC unit.
 *
 * One canvas serves the hero AND the three scroll chapters: the parent
 * wrapper owns the scroll progress; this component only reads it.
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export type HotspotId = "solar" | "hotwater" | "comfort";

const damp = THREE.MathUtils.damp;

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
  { pos: [8.6, 4.6, 10.2], target: [-0.9, 1.3, 0], elevation: 13, azimuth: -55, sunColor: "#ffc37e", sky: "#f3e4cd", ambient: 0.55 },
  { pos: [3.4, 4.9, 7.0], target: [0.4, 3.0, 0.6], elevation: 36, azimuth: -20, sunColor: "#fff2dc", sky: "#eef0e6", ambient: 0.7 },
  { pos: [-4.6, 2.1, 7.2], target: [-4.0, 0.9, 1.6], elevation: 56, azimuth: 5, sunColor: "#fff8ec", sky: "#eef1e9", ambient: 0.78 },
  { pos: [3.6, 1.9, 5.6], target: [0.9, 1.5, -0.6], elevation: 33, azimuth: 35, sunColor: "#ffe9c4", sky: "#ece9da", ambient: 0.65 },
  { pos: [9.4, 3.6, 11.0], target: [-0.6, 1.5, 0], elevation: 7, azimuth: 60, sunColor: "#ff9d62", sky: "#56516a", ambient: 0.4 },
];

const BEAT_T = [0, 0.24, 0.49, 0.74, 1]; // progress stops for the beats

function sampleBeats(p: number) {
  const clamped = Math.min(1, Math.max(0, p));
  let i = 0;
  while (i < BEAT_T.length - 2 && clamped > BEAT_T[i + 1]) i++;
  const t0 = BEAT_T[i];
  const t1 = BEAT_T[i + 1];
  const t = THREE.MathUtils.smoothstep((clamped - t0) / (t1 - t0), 0, 1);
  const a = BEATS[i];
  const b = BEATS[i + 1];
  return {
    pos: new THREE.Vector3(...a.pos).lerp(new THREE.Vector3(...b.pos), t),
    target: new THREE.Vector3(...a.target).lerp(new THREE.Vector3(...b.target), t),
    elevation: THREE.MathUtils.lerp(a.elevation, b.elevation, t),
    azimuth: THREE.MathUtils.lerp(a.azimuth, b.azimuth, t),
    sunColor: new THREE.Color(a.sunColor).lerp(new THREE.Color(b.sunColor), t),
    sky: new THREE.Color(a.sky).lerp(new THREE.Color(b.sky), t),
    ambient: THREE.MathUtils.lerp(a.ambient, b.ambient, t),
  };
}

/* ------------------------------ scene objects ----------------------------- */

function House({ windowGlow }: { windowGlow: React.RefObject<THREE.MeshStandardMaterial | null>[] }) {
  const render = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ece4d4", roughness: 0.92, metalness: 0 }),
    [],
  );
  const roofMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#252b27", roughness: 0.55, metalness: 0.15 }),
    [],
  );
  const timber = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#a4795a", roughness: 0.8 }),
    [],
  );
  const dark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1d2320", roughness: 0.6 }),
    [],
  );
  const glass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#9fb6ad",
        roughness: 0.08,
        metalness: 0.4,
        transparent: true,
        opacity: 0.55,
      }),
    [],
  );

  // Gable roof: ridge along x, two slopes facing +z / -z
  const roofAngle = Math.atan2(1.7, 3.1); // rise over half-depth
  const roofLen = Math.sqrt(1.7 * 1.7 + 3.1 * 3.1);

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
      {/* roof slopes */}
      <group position={[0, 3.85, 0]} rotation={[0, 0, 0]}>
        <mesh rotation={[roofAngle, 0, 0]} position={[0, 0.12, -0]} castShadow material={roofMat}>
          <boxGeometry args={[7.0, 0.14, roofLen + 0.5]} />
        </mesh>
        <mesh rotation={[-roofAngle, 0, 0]} castShadow material={roofMat}>
          <boxGeometry args={[7.0, 0.14, roofLen + 0.5]} />
        </mesh>
        <mesh position={[0, 0.72, 0]} material={roofMat}>
          <boxGeometry args={[7.1, 0.12, 0.24]} />
        </mesh>
      </group>
      {/* gable ends */}
      <mesh position={[-3.2, 3.3, 0]} material={render}>
        <boxGeometry args={[0.16, 1.4, 6.14]} />
      </mesh>
      <mesh position={[3.2, 3.3, 0]} material={render}>
        <boxGeometry args={[0.16, 1.4, 6.14]} />
      </mesh>
      {/* wait: gables handled by triangles below */}
      <GableEnds material={render} />
      {/* chimney */}
      <mesh position={[2.3, 4.35, -1.4]} castShadow material={render}>
        <boxGeometry args={[0.5, 1.1, 0.5]} />
      </mesh>
      {/* door */}
      <mesh position={[-0.1, 1.06, 3.12]} material={timber}>
        <boxGeometry args={[0.92, 2.12, 0.1]} />
      </mesh>
      {/* windows — front */}
      <WindowMesh position={[-2.0, 1.6, 3.13]} size={[1.7, 1.5]} glass={glass} glow={windowGlow[0]} />
      <WindowMesh position={[1.9, 1.55, 3.13]} size={[2.6, 1.6]} glass={glass} glow={windowGlow[1]} />
      {/* side window */}
      <WindowMesh position={[3.22, 1.6, 0.6]} size={[1.4, 1.3]} glass={glass} glow={windowGlow[2]} rotY={Math.PI / 2} />
      {/* timber accent band */}
      <mesh position={[0, 0.32, 3.14]} material={timber}>
        <boxGeometry args={[6.45, 0.22, 0.06]} />
      </mesh>
    </group>
  );
}

function GableEnds({ material }: { material: THREE.Material }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-3.1, 0);
    s.lineTo(3.1, 0);
    s.lineTo(3.1, 0.9);
    s.lineTo(0, 2.0);
    s.lineTo(-3.1, 0.9);
    s.closePath();
    return s;
  }, []);
  const geo = useMemo(() => new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false }), [shape]);
  return (
    <>
      <mesh position={[-3.28, 3.0, -3.07]} material={material} geometry={geo} />
      <mesh position={[3.12, 3.0, -3.07]} material={material} geometry={geo} />
    </>
  );
}

function WindowMesh({
  position,
  size,
  glass,
  glow,
  rotY = 0,
}: {
  position: [number, number, number];
  size: [number, number];
  glass: THREE.Material;
  glow: React.RefObject<THREE.MeshStandardMaterial | null>;
  rotY?: number;
}) {
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b322d", roughness: 0.5 }), []);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh material={glass}>
        <planeGeometry args={size} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[size[0] + 0.14, size[1] + 0.14]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* warm interior pane that lights up at dusk (positioned just inside) */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={size} />
        <meshStandardMaterial
          ref={(m) => {
            if (glow) glow.current = m;
          }}
          color="#ffd9a0"
          emissive="#ffb35c"
          emissiveIntensity={0}
          toneMapped={false}
        />
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
  const roofAngle = Math.atan2(1.7, 3.1);
  const panels = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      panels.push(
        <group
          key={`${row}-${col}`}
          position={[-1.95 + col * 1.28, 0.16, -0.45 + row * 1.5]}
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
  return <group position={[0, 4.0, 1.05]}>{panels}</group>;
}

function HeatPumpUnit() {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#dfe2dd", roughness: 0.35, metalness: 0.3 }),
    [],
  );
  const darkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#23282a", roughness: 0.5 }),
    [],
  );
  return (
    <group position={[-4.35, 0, 1.7]}>
      <mesh position={[0, 0.06, 0]} material={darkMat}>
        <boxGeometry args={[1.15, 0.12, 0.75]} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow material={bodyMat}>
        <boxGeometry args={[1.0, 1.25, 0.62]} />
      </mesh>
      {/* fan grille on the side facing the yard */}
      <mesh position={[0.52, 0.85, 0]} rotation={[0, Math.PI / 2, 0]} material={darkMat}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 24]} />
      </mesh>
      {/* pipework into the house */}
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
  const darkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2a2f2d", roughness: 0.55 }),
    [],
  );
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
  const leaf = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#5d8a4a", roughness: 0.85 }),
    [],
  );
  const leaf2 = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#6f9a52", roughness: 0.85 }),
    [],
  );
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
  const grass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#a9bd91", roughness: 1 }),
    [],
  );
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: "#cfc5b2", roughness: 0.95 }), []);
  const steps = [];
  for (let i = 0; i < 6; i++) {
    steps.push(
      <mesh key={i} position={[0.4 + (i % 2) * 0.18, 0.02, 3.6 + i * 0.72]} rotation={[0, (i % 2) * 0.06, 0]} material={stone} receiveShadow>
        <boxGeometry args={[1.15, 0.05, 0.5]} />
      </mesh>,
    );
  }
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={grass} receiveShadow>
        <circleGeometry args={[19, 48]} />
      </mesh>
      {/* soft darker pad under the house */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[8.4, 8.2]} />
        <meshStandardMaterial color="#93a682" roughness={1} />
      </mesh>
      {steps}
    </group>
  );
}

/* ------------------------------ energy paths ------------------------------ */

function EnergyPath({
  points,
  color,
  progressRef,
  window: win,
  speed = 1.4,
}: {
  points: [number, number, number][];
  color: string;
  progressRef: React.MutableRefObject<number>;
  window: [number, number]; // [start, end] story progress
  speed?: number;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const pts = curve.getPoints(80);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return geo;
  }, [points]);

  useMemo(() => {
    // compute distances after geometry exists (done inline in ref callback)
  }, []);

  const matRef = useRef<THREE.LineDashedMaterial>(null);

  useFrame((state) => {
    const line = lineRef.current;
    const mat = matRef.current;
    if (!line || !mat) return;
    const p = progressRef.current;
    // visibility envelope with soft edges
    const [a, b] = win;
    const fade = THREE.MathUtils.smoothstep(p, a - 0.04, a + 0.06) * (1 - THREE.MathUtils.smoothstep(p, b - 0.06, b + 0.04));
    mat.opacity = fade * 0.9;
    line.visible = fade > 0.01;
    if (line.visible) {
      mat.dashOffset = -(state.clock.elapsedTime * speed) % 1;
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineDashedMaterial
        ref={matRef}
        color={color}
        dashSize={0.34}
        gapSize={0.3}
        transparent
        opacity={0}
        depthWrite={false}
      />
      <primitive
        object={new THREE.Object3D()}
        attach="computeLineDistances"
        // eslint-disable-next-line react/no-unknown-property
      />
      <CallbackOnMount
        onMount={(line) => {
          line.computeLineDistances();
        }}
      />
    </line>
  );
}

/** Tiny helper to run computeLineDistances once the line mounts. */
function CallbackOnMount({
  onMount,
  children,
}: {
  onMount: (obj: THREE.Line) => void;
  children?: never;
}) {
  return null as unknown as React.ReactElement;
}

/* --------------------------------- labels --------------------------------- */

function HotspotLabel({
  id,
  position,
  label,
  active,
  onSelect,
  glassClass,
}: {
  id: HotspotId;
  position: [number, number, number];
  label: string;
  active: boolean;
  onSelect: (id: HotspotId) => void;
  glassClass: string;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const target = active ? 1.18 : 1;
    group.current.scale.setScalar(damp(group.current.scale.x, target, 6, state.clock.getDelta()));
    group.current.position.y = position[1] + Math.sin(t * 1.4 + position[0]) * 0.05;
  });
  return (
    <group ref={group} position={position}>
      <Html center distanceFactor={9} zIndexRange={[20, 0]}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id);
          }}
          className={`${glassClass} whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
            active ? "ring-2 ring-leaf" : ""
          }`}
          aria-pressed={active}
        >
          {label}
        </button>
      </Html>
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={active ? "#68a943" : "#f4c45b"} emissive={active ? "#68a943" : "#f4c45b"} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- sky ----------------------------------- */

function Sun({ beatRef }: { beatRef: React.MutableRefObject<ReturnType<typeof sampleBeats>> }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const { scene } = useThree();
  const bgRef = useRef<THREE.Color>(new THREE.Color("#f3e4cd"));

  useFrame((state, delta) => {
    const b = beatRef.current;
    const sun = lightRef.current;
    if (sun) {
      const elev = THREE.MathUtils.degToRad(b.elevation);
      const azim = THREE.MathUtils.degToRad(b.azimuth);
      const r = 24;
      sun.position.set(Math.sin(azim) * Math.cos(elev) * r, Math.sin(elev) * r, Math.cos(azim) * Math.cos(elev) * r + 2);
      sun.color.lerp(b.sunColor, Math.min(1, delta * 3));
      sun.intensity = 1.1 + (b.elevation / 90) * 1.6;
      sun.target.position.set(0, 1, 0);
      sun.target.updateMatrixWorld();
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = damp(hemiRef.current.intensity, b.ambient, 4, delta);
    }
    if (sunRef.current) {
      sunRef.current.position.set(
        Math.sin(THREE.MathUtils.degToRad(b.azimuth)) * 30,
        Math.sin(THREE.MathUtils.degToRad(b.elevation)) * 30,
        Math.cos(THREE.MathUtils.degToRad(b.azimuth)) * 30 - 4,
      );
      const m = sunRef.current.material as THREE.MeshBasicMaterial;
      m.color.copy(b.sunColor);
    }
    const target = b.sky;
    bgRef.current.lerp(target, Math.min(1, delta * 2.4));
    if (scene.background instanceof THREE.Color) scene.background.copy(bgRef.current);
    else scene.background = bgRef.current.clone();
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(bgRef.current);
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
      {/* soft sun disc */}
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
}: {
  progressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();
  const current = useRef({
    pos: new THREE.Vector3(...BEATS[0].pos),
    target: new THREE.Vector3(...BEATS[0].target),
  });

  useFrame((state, delta) => {
    const b = beatRefSample(progressRef.current);
    const cur = current.current;
    const lambda = 2.6;
    cur.pos.lerp(b.pos, Math.min(1, delta * lambda));
    cur.target.lerp(b.target, Math.min(1, delta * lambda));

    // pointer parallax — at most ~3 degrees
    const px = pointerRef.current.x * 0.052; // rad ≈ 3°
    const py = pointerRef.current.y * 0.03;
    const offset = new THREE.Vector3(px * 4, py * 2.4, 0);

    camera.position.copy(cur.pos).add(offset);
    camera.lookAt(cur.target);
  });
  return null;
}

function beatRefSample(p: number) {
  return sampleBeats(p);
}

/* --------------------------------- scene ---------------------------------- */

export type StorySceneProps = {
  progressRef: React.MutableRefObject<number>;
  activeHotspot: HotspotId | null;
  onSelectHotspot: (id: HotspotId) => void;
  interactive?: boolean;
};

export default function StoryCanvas({ progressRef, activeHotspot, onSelectHotspot, interactive = true }: StorySceneProps) {
  const pointerRef = useRef({ x: 0, y: 0 });
  const beatRef = useRef(sampleBeats(0));
  const glowRefs = [
    useRef<THREE.MeshStandardMaterial | null>(null),
    useRef<THREE.MeshStandardMaterial | null>(null),
    useRef<THREE.MeshStandardMaterial | null>(null),
  ];
  const solarMatRef = useRef<THREE.LineDashedMaterial>(null);

  // update beat sample once per frame for lights
  useSceneTick(progressRef, beatRef, glowRefs, solarMatRef);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 38, position: BEATS[0].pos, near: 0.5, far: 120 }}
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
      className="!absolute inset-0"
    >
      <fog attach="fog" args={["#f3e4cd", 26, 68]} />
      <Sun beatRef={beatRef} />
      <CameraRig progressRef={progressRef} pointerRef={pointerRef} />
      <Ground />
      <House windowGlow={glowRefs.map((r) => r as React.RefObject<THREE.MeshStandardMaterial | null>) as never} />
      <SolarArray />
      <HeatPumpUnit />
      <AcUnit />
      <Tree position={[-7.2, 0, -2.4]} scale={1.25} />
      <Tree position={[7.4, 0, -1.2]} scale={1.05} />
      <Tree position={[6.6, 0, 4.6]} scale={0.85} />
      <Tree position={[-7.8, 0, 4.2]} scale={0.9} />

      {/* energy paths */}
      <EnergyPathGroup progressRef={progressRef} solarMatRef={solarMatRef} />

      <HotspotLabel
        id="solar"
        position={[0, 5.35, 1.0]}
        label="Solar"
        active={activeHotspot === "solar"}
        onSelect={onSelectHotspot}
        glassClass="glass"
      />
      <HotspotLabel
        id="hotwater"
        position={[-4.35, 2.0, 1.7]}
        label="Hot water"
        active={activeHotspot === "hotwater"}
        onSelect={onSelectHotspot}
        glassClass="glass"
      />
      <HotspotLabel
        id="comfort"
        position={[4.35, 1.35, 1.9]}
        label="Indoor comfort"
        active={activeHotspot === "comfort"}
        onSelect={onSelectHotspot}
        glassClass="glass"
      />
    </Canvas>
  );
}

function useSceneTick(
  progressRef: React.MutableRefObject<number>,
  beatRef: React.MutableRefObject<ReturnType<typeof sampleBeats>>,
  glowRefs: React.RefObject<THREE.MeshStandardMaterial | null>[],
  solarMatRef: React.RefObject<THREE.LineDashedMaterial | null>,
) {
  // Runs inside Canvas via a component below
  return <SceneTick progressRef={progressRef} beatRef={beatRef} glowRefs={glowRefs} solarMatRef={solarMatRef} />;
}

function SceneTick({
  progressRef,
  beatRef,
  glowRefs,
  solarMatRef,
}: {
  progressRef: React.MutableRefObject<number>;
  beatRef: React.MutableRefObject<ReturnType<typeof sampleBeats>>;
  glowRefs: React.RefObject<THREE.MeshStandardMaterial | null>[];
  solarMatRef: React.RefObject<THREE.LineDashedMaterial | null>;
}) {
  useFrame(() => {
    beatRef.current = sampleBeats(progressRef.current);
    const p = progressRef.current;
    // dusk factor: 1 near the end of the story
    const dusk = THREE.MathUtils.smoothstep(p, 0.72, 0.98);
    const daylight = 1 - THREE.MathUtils.smoothstep(p, 0.62, 0.92);
    for (const g of glowRefs) {
      const m = g.current;
      if (m) m.emissiveIntensity = dusk * 1.6;
    }
    if (solarMatRef.current) {
      // solar generation fades as daylight ends
      solarMatRef.current.opacity = daylight * 0.9;
    }
  });
  return null;
}

function EnergyPathGroup({
  progressRef,
  solarMatRef,
}: {
  progressRef: React.MutableRefObject<number>;
  solarMatRef: React.RefObject<THREE.LineDashedMaterial | null>;
}) {
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
    <group>
      {/* solar electricity: amber, only while the sun is up */}
      <SolarPath points={solarPoints} solarMatRef={solarMatRef} progressRef={progressRef} />
      {/* ambient heat into the heat pump: sage */}
      <EnergyPath points={heatPoints} color="#8fae7e" progressRef={progressRef} window={[0.34, 0.62]} />
      {/* indoor airflow ribbon: soft sage */}
      <EnergyPath points={airPoints} color="#b7cfb1" progressRef={progressRef} window={[0.6, 0.9]} speed={0.9} />
    </group>
  );
}

function SolarPath({
  points,
  solarMatRef,
  progressRef,
}: {
  points: [number, number, number][];
  solarMatRef: React.RefObject<THREE.LineDashedMaterial | null>;
  progressRef: React.MutableRefObject<number>;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const matRef = useRef<THREE.LineDashedMaterial>(null);

  // expose the material so SceneTick can fade it with daylight
  useEffectOnce(() => {
    const id = setInterval(() => {
      if (matRef.current && !solarMatRef.current) solarMatRef.current = matRef.current;
    }, 100);
    return () => clearInterval(id);
  });

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
  }, [points]);

  useFrame((state) => {
    const line = lineRef.current;
    const mat = matRef.current;
    if (!line || !mat) return;
    const p = progressRef.current;
    const fade =
      THREE.MathUtils.smoothstep(p, 0.06, 0.16) * (1 - THREE.MathUtils.smoothstep(p, 0.6, 0.72));
    mat.opacity = fade * 0.9;
    line.visible = fade > 0.01;
    if (line.visible) mat.dashOffset = -(state.clock.elapsedTime * 1.4) % 1;
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineDashedMaterial ref={matRef} color="#f4c45b" dashSize={0.34} gapSize={0.3} transparent opacity={0} depthWrite={false} />
    </line>
  );
}

function useEffectOnce(effect: () => () => void) {
  const run = useRef(false);
  const cleanup = useRef<(() => void) | null>(null);
  useFrame(() => {
    if (!run.current) {
      run.current = true;
      cleanup.current = effect();
    }
  });
}
