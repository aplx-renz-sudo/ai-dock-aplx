/**
 * Aplx orbital dock — the 3D space scene.
 * Central dock core, 11 provider stations with orbiting model nodes,
 * connection lines, stars, nebulae and occasional shooting stars.
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { PROVIDERS } from "./data";
import {
  Galaxy,
  RealisticNebulae,
  DustCloud,
  RealisticStars,
} from "./SpaceEnvironment";
import { DJLasers, DJFloor, DJDiscoBall, DJBeatParticles } from "./DJMode";

export interface SceneQuality {
  stars: number;
  dpr: [number, number];
  shootingStars: boolean;
  motion: boolean;
}

/* ------------------------------- explosion ------------------------------- */

const EXPLOSION_COUNT = 72;
const EXPLOSION_DURATION = 1.5;

function Explosion({ active }: { active: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const time = useRef(0);
  const alive = useRef(false);

  const particles = useMemo(() => {
    const arr: {
      vel: THREE.Vector3;
      start: number;
      life: number;
    }[] = [];
    for (let i = 0; i < EXPLOSION_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 6 + Math.random() * 16;
      arr.push({
        vel: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed * 0.5,
          Math.cos(phi) * speed * 0.4,
        ),
        start: Math.random() * 0.12,
        life: 0.35 + Math.random() * 0.35,
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;

    if (active && !alive.current) {
      alive.current = true;
      time.current = 0;
    }
    if (!alive.current) {
      mesh.visible = false;
      return;
    }

    time.current += dt;
    const t = time.current;
    mesh.visible = true;

    if (t > EXPLOSION_DURATION + 0.3) {
      alive.current = false;
      mesh.visible = false;
      return;
    }

    for (let i = 0; i < EXPLOSION_COUNT; i++) {
      const p = particles[i];
      const lt = t - p.start;
      if (lt < 0 || lt > p.life) {
        dummy.scale.setScalar(0);
      } else {
        const progress = lt / p.life;
        const ease = 1 - progress;
        dummy.position.set(
          p.vel.x * lt * 0.6,
          p.vel.y * lt * 0.6,
          p.vel.z * lt * 0.6,
        );
        const s = 0.06 + ease * 0.14;
        dummy.scale.setScalar(s);
        const bright = Math.floor(ease * 127 + 128);
        color.setRGB(bright / 255, bright / 255, 255 / 255);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, EXPLOSION_COUNT]} visible={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* ---------------------------- scatter stars ------------------------------ */

const SCATTER_COUNT = 120;
const SCATTER_DURATION = 2.0;

function ScatterStars({ active }: { active: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const time = useRef(0);
  const alive = useRef(false);

  const particles = useMemo(() => {
    const arr: {
      vel: THREE.Vector3;
      start: number;
      life: number;
      size: number;
    }[] = [];
    for (let i = 0; i < SCATTER_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 10 + Math.random() * 30;
      arr.push({
        vel: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed * 0.5,
          Math.cos(phi) * speed * 0.35,
        ),
        start: Math.random() * 0.2,
        life: 0.6 + Math.random() * 0.8,
        size: 0.015 + Math.random() * 0.04,
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;

    if (active && !alive.current) {
      alive.current = true;
      time.current = 0;
    }
    if (!alive.current) {
      mesh.visible = false;
      return;
    }

    time.current += dt;
    const t = time.current;
    mesh.visible = true;

    if (t > SCATTER_DURATION + 0.5) {
      alive.current = false;
      mesh.visible = false;
      return;
    }

    for (let i = 0; i < SCATTER_COUNT; i++) {
      const p = particles[i];
      const lt = t - p.start;
      if (lt < 0 || lt > p.life) {
        dummy.scale.setScalar(0);
      } else {
        const progress = lt / p.life;
        const ease = 1 - progress * progress;
        dummy.position.set(
          p.vel.x * lt * 0.7,
          p.vel.y * lt * 0.7,
          p.vel.z * lt * 0.7,
        );
        const s = p.size * ease;
        dummy.scale.setScalar(s);
        const b = Math.floor(ease * 200 + 55);
        color.setRGB(b / 255, b / 255, Math.min(1, (b + 40) / 255));
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, SCATTER_COUNT]} visible={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
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



/* -------------------------------- dock core ------------------------------- */

function DockCore({ motion, explode }: { motion: boolean; explode: boolean }) {
  const glow = useGlowTexture();
  const ringsRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const haloRef = useRef<THREE.Sprite>(null);
  const explTimer = useRef(0);
  const wasExploding = useRef(false);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    // detect explosion start
    if (explode && !wasExploding.current) {
      wasExploding.current = true;
      explTimer.current = 0;
    }
    if (!explode) wasExploding.current = false;

    // core pulsing
    if (coreRef.current) {
      if (wasExploding.current) {
        explTimer.current += dt;
        const et = explTimer.current;
        if (et < 0.35) {
          // flash & expand
          const p = et / 0.35;
          coreRef.current.scale.setScalar(1 + p * 8);
          if (lightRef.current) lightRef.current.intensity = 30 + p * 220;
          if (haloRef.current) haloRef.current.scale.setScalar(4.2 + p * 18);
        } else if (et < 0.8) {
          // collapse
          const p = (et - 0.35) / 0.45;
          coreRef.current.scale.setScalar(9 * (1 - p));
          if (lightRef.current) lightRef.current.intensity = 250 * (1 - p);
          if (haloRef.current) haloRef.current.scale.setScalar(22 * (1 - p));
        } else {
          coreRef.current.scale.setScalar(0);
          if (lightRef.current) lightRef.current.intensity = 0;
          if (haloRef.current) haloRef.current.scale.setScalar(0);
        }
      } else {
        const s = 1 + Math.sin(t * 1.4) * 0.04;
        coreRef.current.scale.setScalar(s);
        if (lightRef.current) lightRef.current.intensity = 30;
        if (haloRef.current) haloRef.current.scale.setScalar(4.2);
      }
    }

    // rings explode outward
    if (ringsRef.current) {
      if (wasExploding.current) {
        const et = explTimer.current;
        const expand = et < 0.5 ? 1 + et * 8 : 5 * Math.max(0, 1 - (et - 0.5));
        ringsRef.current.scale.setScalar(expand);
        ringsRef.current.rotation.y += dt * 2.5;
      } else {
        ringsRef.current.scale.setScalar(1);
        if (motion) {
          ringsRef.current.rotation.y += dt * 0.12;
          ringsRef.current.rotation.x = 0.35 + Math.sin(t * 0.15) * 0.06;
        }
        ringsRef.current.rotation.z = Math.sin(t * 0.1) * 0.08;
      }
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
      <pointLight ref={lightRef} color="#7dd3fc" intensity={30} distance={16} />

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
      <sprite ref={haloRef} scale={[4.2, 4.2, 1]}>
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
  explode: boolean;
  djMode?: boolean;
}

export function DockScene({ hovered, onHover, quality, scrollRef, explode, djMode }: DockSceneProps) {
  return (
    <Canvas
      dpr={quality.dpr}
      camera={{ position: [0, 0.4, 13.2], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[6, 8, 4]} intensity={0.6} color="#c7d2fe" />
      <directionalLight position={[-4, -3, 6]} intensity={0.15} color="#60a5fa" />

      <RealisticStars count={quality.stars} motion={quality.motion} />
      <RealisticNebulae />
      <DustCloud />

      {/* Spiral galaxies in the deep background */}
      <Galaxy
        position={[-30, 12, -70]}
        arms={3}
        count={800}
        radius={12}
        coreBrightness={1.4}
        rotationSpeed={0.008}
        hue={0.62}
        scale={1}
      />
      <Galaxy
        position={[35, -10, -80]}
        arms={4}
        count={600}
        radius={10}
        coreBrightness={1.2}
        rotationSpeed={0.006}
        hue={0.58}
        scale={0.85}
      />
      <Galaxy
        position={[-8, -18, -90]}
        arms={2}
        count={500}
        radius={8}
        coreBrightness={1.6}
        rotationSpeed={0.01}
        hue={0.08}
        scale={0.7}
      />
      <Galaxy
        position={[20, 20, -95]}
        arms={3}
        count={400}
        radius={7}
        coreBrightness={1.0}
        rotationSpeed={0.005}
        hue={0.75}
        scale={0.6}
      />
      <Explosion active={explode} />
      <ScatterStars active={explode} />
      <DockCore motion={quality.motion} explode={explode} />

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

      {/* DJ Mode 3D elements */}
      {djMode && (
        <>
          <DJLasers />
          <DJFloor />
          <DJDiscoBall />
          <DJBeatParticles />
        </>
      )}

      <CameraRig motion={quality.motion} scrollRef={scrollRef} />

      <fog attach="fog" args={["#010308", 30, 80]} />
    </Canvas>
  );
}
