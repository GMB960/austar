import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Html } from "@react-three/drei";
import * as THREE from "three";
import states from "@/lib/australia-map.json";

type Props = { selected: "NSW" | "VIC"; onSelect: (state: "NSW" | "VIC") => void; progress: React.RefObject<number> };

// Resolve the site's semantic CSS colors to sRGB for WebGL, including oklch.
function tokenColor(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Color();
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  return new THREE.Color(`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`);
}

function Atlas({ selected, onSelect, progress }: Props) {
  const group = useRef<THREE.Group>(null);
  const ready = useRef(false);
  const reduced = useRef(false);
  useEffect(() => { reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches; }, []);
  const materials = useMemo(() => {
    const base = tokenColor("--map-land");
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
        const shade = 0.85 + ((x * 17 + y * 31) % 19) / 100;
        ctx.fillStyle = `#${base.clone().multiplyScalar(shade).getHexString()}`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return {
      land: new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8, metalness: 0.15 }),
      nsw: new THREE.MeshStandardMaterial({ color: tokenColor("--leaf"), roughness: 0.48, metalness: 0.24 }),
      vic: new THREE.MeshStandardMaterial({ color: tokenColor("--amber"), roughness: 0.48, metalness: 0.24 }),
      border: new THREE.LineBasicMaterial({ color: tokenColor("--map-edge"), transparent: true, opacity: 0.5 }),
    };
  }, []);
  const geography = useMemo(() => states.flatMap(state => state.rings.map(ring => {
    const shape = new THREE.Shape();
    ring.forEach((p, i) => { const x = p[0] ?? 0; const y = p[1] ?? 0; if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y); });
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.025 });
    return { name: state.name, geometry, edges: new THREE.EdgesGeometry(geometry, 35) };
  })), []);
  useEffect(() => () => {
    geography.forEach(g => { g.geometry.dispose(); g.edges.dispose(); });
    materials.land.map?.dispose();
    Object.values(materials).forEach(m => m.dispose());
  }, [geography, materials]);
  useFrame((state, delta) => {
    if (!group.current) return;
    const p = progress.current;
    const dt = Math.min(delta, 0.05);
    const lerp = 1 - Math.exp(-5 * dt);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, reduced.current ? -0.12 : -0.22 + p * 0.36, lerp);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, reduced.current ? 0 : -0.18 + p * 0.32 + state.pointer.x * 0.07, lerp);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, reduced.current ? 0 : -0.06 + p * 0.12, lerp);
    if (!ready.current) {
      state.gl.domElement.closest("[data-map-scene]")?.setAttribute("data-scene-ready", "true");
      ready.current = true;
    }
  });
  return <>
    <ambientLight intensity={0.8} />
    <directionalLight position={[-4, 8, 12]} intensity={3} />
    <Environment resolution={64}>
      <Lightformer intensity={2} position={[0, 0, 8]} scale={[12, 12, 1]} />
      <Lightformer intensity={1.2} position={[-6, 1, 3]} rotation-y={Math.PI / 2} scale={[8, 8, 1]} />
    </Environment>
    <group ref={group} position={[0, 0.25, 0]}>
      {geography.map((g, i) => {
        const id = g.name === "New South Wales" ? "NSW" : g.name === "Victoria" ? "VIC" : undefined;
        const elevation = id ? (id === selected ? 0.48 : 0.2) : 0;
        return <group key={`${g.name}-${i}`} position={[0, 0, elevation]}>
          <mesh geometry={g.geometry} material={id === "NSW" ? materials.nsw : id === "VIC" ? materials.vic : materials.land}
            onClick={() => { if (id) onSelect(id); }} />
          <lineSegments geometry={g.edges} material={materials.border} />
        </group>;
      })}
      <Html position={[4.1, -1.95, 0.95]} center className="pointer-events-none">
        <div className="atlas-pin"><span className="atlas-pin-dot" /><span>Sydney<span className="block text-[9px] text-ivory/60">NSW</span></span></div>
      </Html>
      <Html position={[3.05, -3.18, 0.95]} center className="pointer-events-none">
        <div className="atlas-pin atlas-pin-vic"><span className="atlas-pin-dot" /><span>Melbourne<span className="block text-[9px] text-ivory/60">VIC</span></span></div>
      </Html>
    </group>
  </>;
}

export default function ServiceAreaScene(props: Props) {
  return <Canvas camera={{ position: [0, -3.5, 17], fov: 40 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
    <Atlas {...props} />
  </Canvas>;
}