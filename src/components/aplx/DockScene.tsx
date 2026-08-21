/**
 * Aplx orbital dock — the 3D space scene.
 * Central dock core, 11 provider stations with orbiting model nodes,
 * connection lines, stars, nebulae and occasional shooting stars.
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { PROVIDERS } from "./data";

export interface SceneQuality {
  stars: number;
  dpr: [number, number];
  shootingStars: boolean;
  motion: boolean;
}

/* ---------------------------------- utils --------------------------------- */

export function detectQuality(): SceneQuality {
  if (typeof window === "undefined") {
    return { stars: 1500, dpr: [1, 1.5], shootingStars: true, motion: true };
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile =
    window.matchMedia("(max-width: 768px)").matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4;
  return {
    stars: mobile ? 1200 : 3500,
    dpr: mobile ? [1, 1.25] : [1, 1.75],
    shootingStars: !reduced,
    motion: !reduced,
  };
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/* --------------------------------- nebulae -------------------------------- */

function useGlowTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function Nebulae() {
  const tex = useGlowTexture();
  const clouds = useMemo(
    () => [
      { pos: [-14, 6, -38] as const, scale: 42, color: "#1e3a8a", opacity: 0.22 },
      { pos: [16, -8, -42] as const, scale: 50, color: "#4c1d95", opacity: 0.18 },
      { pos: [4, 12, -50] as const, scale: 60, color: "#0e7490", opacity: 0.12 },
      { pos: [-10, -12, -46] as const, scale: 44, color: "#312e81", opacity: 0.16 },
    ],
    [],
  );
  return (
    <group>
      {clouds.map((c, i) => (
        <mesh key={i} position={c.pos as unknown as THREE.Vector3Tuple}>
          <planeGeometry args={[c.scale, c.scale]} />
          <meshBasicMaterial
            map={tex}
            color={c.color}
            transparent
            opacity={c.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------- dock core ------------------------------- */

function DockCore({ motion }: { motion: boolean }) {
  const glow = useGlowTexture();
  const ringsRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (ringsRef.current) {
      if (motion) {
        ringsRef.current.rotation.y += dt * 0.12;
        ringsRef.current.rotation.x =
          0.35 + Math.sin(t * 0.15) * 0.06;
      }
      ringsRef.current.rotation.z = Math.sin(t * 0.1) * 0.08;
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.04;
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* luminous core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.62, 2]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#38bdf8"
          emissiveIntensity={2.2}
          metalness={0.4}
          roughness={0.15}
        />
      </mesh>
      <pointLight color="#7dd3fc" intensity={30} distance={16} />

      {/* orbital rings */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.35, 0.012, 8, 128]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.55} />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0.5, 0]}>
          <torusGeometry args={[1.75, 0.008, 8, 128]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, -0.4, 0.3]}>
          <torusGeometry args={[2.15, 0.006, 8, 128]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* halo */}
      <sprite scale={[4.2, 4.2, 1]}>
        <spriteMaterial
          map={glow}
          color="#38bdf8"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* Aplx Nano — tiny model orbiting very close to the core */}
      <NanoNode motion={motion} />
    </group>
  );
}

function NanoNode({ motion }: { motion: boolean }) {
  const glow = useGlowTexture();
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    if (motion) {
      ref.current.position.set(
        Math.cos(t * 0.9) * 1.05,
        Math.sin(t * 0.9) * 0.22,
        Math.sin(t * 0.9) * 1.05,
      );
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial
          color="#f5f3ff"
          emissive="#a78bfa"
          emissiveIntensity={3}
        />
      </mesh>
      <sprite scale={[0.7, 0.7, 1]}>
        <spriteMaterial
          map={glow}
          color="#a78bfa"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}

/* ------------------------------ provider node ------------------------------ */

interface ProviderOrbitProps {
  radius: number;
  speed: number;
  tilt: number;
  phase: number;
  incline: number;
  color: string;
  modelCount: number;
  active: boolean;
  motion: boolean;
  onHover: (id: string | null) => void;
  id: string;
}

function ProviderOrbit({
  radius,
  speed,
  tilt,
  phase,
  incline,
  color,
  modelCount,
  active,
  motion,
  onHover,
  id,
}: Omit<ProviderOrbitProps, "index">) {
  const spinner = useRef<THREE.Group>(null);
  const nodeRef = useRef<THREE.Group>(null);
  const modelsRef = useRef<THREE.Group>(null);
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(radius, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    return g;
  }, [radius]);

  useFrame((state, dt) => {
    if (spinner.current && motion) spinner.current.rotation.y += dt * speed;
    if (nodeRef.current) {
      const target = active ? 1.55 : 1;
      const s = THREE.MathUtils.lerp(
        nodeRef.current.scale.x,
        target,
        0.12,
      );
      nodeRef.current.scale.setScalar(s);
    }
    if (modelsRef.current && motion) {
      modelsRef.current.rotation.y -= dt * (speed * 4 + 0.3);
    }
  });

  const initial = useMemo(
    () => new THREE.Euler(tilt, phase, incline),
    [tilt, phase, incline],
  );

  return (
    <group rotation={initial}>
      {/* orbit path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.004, 6, 160]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.5 : 0.14} />
      </mesh>

      <group ref={spinner} rotation={[0, phase, 0]}>
        {/* connection line to the Aplx dock */}
        <line>
          <primitive object={lineGeo} attach="geometry" />
          <lineBasicMaterial
            color={color}
            transparent
            opacity={active ? 0.85 : 0.22}
          />
        </line>

        {/* provider station */}
        <group ref={nodeRef} position={[radius, 0, 0]}>
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(id);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              onHover(null);
              document.body.style.cursor = "auto";
            }}
          >
            <octahedronGeometry args={[0.17, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={active ? 2.6 : 1.1}
              metalness={0.3}
              roughness={0.3}
            />
          </mesh>
          {/* station ring */}
          <mesh rotation={[Math.PI / 2.6, 0.3, 0]}>
            <torusGeometry args={[0.3, 0.006, 6, 48]} />
            <meshBasicMaterial color={color} transparent opacity={active ? 0.9 : 0.45} />
          </mesh>
          <sprite scale={[active ? 1.4 : 0.9, active ? 1.4 : 0.9, 1]}>
            <spriteMaterial
              map={useGlowTexture()}
              color={color}
              transparent
              opacity={active ? 0.75 : 0.35}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>

          {/* model nodes orbiting the station */}
          <group ref={modelsRef}>
            {Array.from({ length: modelCount }).map((_, i) => {
              const a = (i / modelCount) * Math.PI * 2;
              const r = 0.48 + (i % 2) * 0.12;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * r, Math.sin(a * 2) * 0.08, Math.sin(a) * r]}
                >
                  <sphereGeometry args={[0.03, 8, 8]} />
                  <meshBasicMaterial color={color} transparent opacity={0.9} />
                </mesh>
              );
            })}
          </group>
        </group>
      </group>
    </group>
  );
}

/* ----------------------------- shooting stars ----------------------------- */

function ShootingStar({ motion }: { motion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const state = useRef({
    active: false,
    nextSpawn: 4 + Math.random() * 6,
    elapsed: 0,
    duration: 1.6,
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
  });
  const tex = useGlowTexture();

  useFrame((_, dt) => {
    const s = state.current;
    const g = group.current;
    if (!g || !motion) return;

    if (!s.active) {
      s.nextSpawn -= dt;
      if (s.nextSpawn <= 0) {
        s.active = true;
        s.elapsed = 0;
        s.duration = 1.2 + Math.random() * 0.8;
        const y = (Math.random() - 0.35) * 22;
        const z = -28 - Math.random() * 14;
        const dir = Math.random() > 0.5 ? 1 : -1;
        s.from.set(-dir * 26, y, z);
        s.to.set(dir * 26, y - 6 - Math.random() * 5, z);
        g.position.copy(s.from);
        g.lookAt(s.to);
        g.rotateX(Math.PI / 2);
        g.visible = true;
      }
      return;
    }

    s.elapsed += dt;
    const p = s.elapsed / s.duration;
    if (p >= 1) {
      s.active = false;
      g.visible = false;
      s.nextSpawn = 6 + Math.random() * 9;
      return;
    }
    g.position.lerpVectors(s.from, s.to, p);
    const fade = Math.sin(p * Math.PI);
    g.scale.set(1, fade, 1);
  });

  return (
    <group ref={group} visible={false}>
      {/* trail */}
      <mesh>
        <planeGeometry args={[0.05, 4.5]} />
        <meshBasicMaterial
          map={tex}
          color="#e0f2fe"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* head */}
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ------------------------------ camera rig -------------------------------- */

function CameraRig({
  motion,
  scrollRef,
}: {
  motion: boolean;
  scrollRef: React.RefObject<number>;
}) {
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    const cam = state.camera;
    const t = state.clock.elapsedTime;

    // gentle pointer parallax
    pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(1, dt * 2);
    pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(1, dt * 2);

    const progress = scrollRef.current ?? 0;
    // travel: start far outside the station, slowly approach the core
    const targetZ = 13.2 - progress * 4.2;
    const targetY = 0.4 + Math.sin(progress * Math.PI * 2) * 0.5;
    const targetX = Math.sin(progress * Math.PI * 2) * 0.9;

    if (motion) {
      cam.position.z +=
        (targetZ - cam.position.z) * Math.min(1, dt * 1.6);
      cam.position.y +=
        (targetY + pointer.current.y * 0.35 - cam.position.y) *
        Math.min(1, dt * 1.6);
      cam.position.x +=
        (targetX + pointer.current.x * 0.5 - cam.position.x) *
        Math.min(1, dt * 1.6);
      cam.lookAt(0, 0, 0);
    } else {
      cam.position.set(0, 0.4, 12);
      cam.lookAt(0, 0, 0);
    }
    void t;
  });
  return null;
}

/* --------------------------------- scene ---------------------------------- */

export interface DockSceneProps {
  hovered: string | null;
  onHover: (id: string | null) => void;
  quality: SceneQuality;
  scrollRef: React.RefObject<number>;
}

export function DockScene({ hovered, onHover, quality, scrollRef }: DockSceneProps) {
  return (
    <Canvas
      dpr={quality.dpr}
      camera={{ position: [0, 0.4, 13.2], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 8, 4]} intensity={0.5} color="#c7d2fe" />

      <Stars
        radius={90}
        depth={50}
        count={quality.stars}
        factor={3.2}
        saturation={0}
        fade
        speed={quality.motion ? 0.5 : 0}
      />
      <Nebulae />
      <DockCore motion={quality.motion} />

      {PROVIDERS.map((p, i) => (
        <ProviderOrbit
          key={p.id}
          id={p.id}
          radius={p.orbit.radius}
          speed={p.orbit.speed}
          tilt={p.orbit.tilt}
          phase={p.orbit.phase}
          incline={p.orbit.incline}
          color={p.color}
          modelCount={Math.min(p.models.length, 4)}
          active={hovered === p.id}
          motion={quality.motion}
          onHover={onHover}
        />
      ))}

      {quality.shootingStars && <ShootingStar motion={quality.motion} />}
      <CameraRig motion={quality.motion} scrollRef={scrollRef} />

      <fog attach="fog" args={["#020617", 26, 70]} />
    </Canvas>
  );
}
