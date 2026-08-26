/**
 * Realistic space environment — spiral galaxies, enhanced nebulae, dust clouds.
 * These sit behind the dock scene to give a deep, cinematic feel.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* -------------------------------- glow texture ------------------------------ */

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.4)");
  g.addColorStop(0.7, "rgba(255,255,255,0.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/* --------------------------------- galaxy ---------------------------------- */

interface GalaxyProps {
  /** Position in world space */
  position: [number, number, number];
  /** Spiral arm count */
  arms: number;
  /** Total particles */
  count: number;
  /** Galaxy radius */
  radius: number;
  /** Core brightness multiplier */
  coreBrightness: number;
  /** Overall rotation speed */
  rotationSpeed: number;
  /** Primary hue (0-1) */
  hue: number;
  /** Billboard size scale */
  scale: number;
}

export function Galaxy({
  position,
  arms,
  count,
  radius,
  coreBrightness,
  rotationSpeed,
  hue,
  scale,
}: GalaxyProps) {
  const ref = useRef<THREE.Points>(null);
  const tex = useMemo(() => makeGlowTexture(), []);

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const baseColor = new THREE.Color().setHSL(hue, 0.55, 0.65);
    const coreColor = new THREE.Color().setHSL(hue + 0.03, 0.3, 0.9);
    const armColor = new THREE.Color().setHSL(hue - 0.02, 0.6, 0.55);

    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * arms);
      const armAngle = (arm / arms) * Math.PI * 2;

      // how far from center (0-1), clustered toward center
      const dist = Math.pow(Math.random(), 0.7);
      const r = dist * radius;

      // spiral: angle increases with distance (logarithmic spiral)
      const spiralAngle = armAngle + dist * 3.5 + (Math.random() - 0.5) * 0.5;

      // thickness increases slightly outward, core is tight
      const thickness = dist < 0.15 ? dist * 0.3 : 0.045 + dist * 0.12;
      const spreadX = (Math.random() - 0.5) * thickness * radius;
      const spreadY = (Math.random() - 0.5) * thickness * radius * 0.5;

      const x = Math.cos(spiralAngle) * r + spreadX;
      const y = spreadY;
      const z = Math.sin(spiralAngle) * r + (Math.random() - 0.5) * thickness * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // color: core is bright white/yellow, arms are blue-purple
      const mix = dist < 0.2 ? dist / 0.2 : 1;
      const c = new THREE.Color().lerpColors(coreColor, armColor, mix);
      // add some warm stars in arms
      if (Math.random() < 0.08) {
        c.lerp(new THREE.Color("#fde68a"), 0.4);
      }
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      // brighter toward center
      const brightness = coreBrightness * (1 - dist * 0.6) + 0.3;
      sz[i] = (0.03 + Math.random() * 0.06) * brightness;
    }

    return { positions: pos, colors: col, sizes: sz };
  }, [count, arms, radius, coreBrightness, hue]);

  useFrame((state) => {
    if (ref.current && rotationSpeed > 0) {
      ref.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          map={tex}
          vertexColors
          transparent
          opacity={0.85}
          size={0.12}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ----------------------------- nebula clouds ------------------------------- */

interface NebulaCloud {
  position: [number, number, number];
  scale: number;
  color: string;
  opacity: number;
  rotation: [number, number, number];
}

export function RealisticNebulae() {
  const tex = useMemo(() => makeGlowTexture(), []);

  const clouds: NebulaCloud[] = useMemo(
    () => [
      // Deep blue-violet cloud — upper left
      { position: [-18, 8, -42], scale: 55, color: "#1e3a8a", opacity: 0.18, rotation: [0.2, 0.3, 0.1] },
      { position: [-15, 9, -44], scale: 38, color: "#312e81", opacity: 0.14, rotation: [0.5, 0.1, 0.4] },
      { position: [-20, 7, -46], scale: 48, color: "#1e40af", opacity: 0.10, rotation: [0.1, 0.6, 0.2] },

      // Teal cyan cloud — upper right
      { position: [20, -6, -48], scale: 60, color: "#0e7490", opacity: 0.12, rotation: [0.3, 0.4, 0.2] },
      { position: [18, -4, -50], scale: 44, color: "#155e75", opacity: 0.09, rotation: [0.7, 0.2, 0.5] },
      { position: [23, -9, -46], scale: 36, color: "#164e63", opacity: 0.11, rotation: [0.4, 0.8, 0.1] },

      // Deep violet-indigo — center background
      { position: [2, 14, -55], scale: 70, color: "#4c1d95", opacity: 0.08, rotation: [0.1, 0.2, 0.3] },
      { position: [5, 16, -58], scale: 50, color: "#5b21b6", opacity: 0.06, rotation: [0.6, 0.1, 0.7] },

      // Warm amber — faint, low
      { position: [-8, -14, -52], scale: 46, color: "#92400e", opacity: 0.07, rotation: [0.3, 0.5, 0.6] },
      { position: [-12, -12, -54], scale: 34, color: "#78350f", opacity: 0.05, rotation: [0.8, 0.3, 0.1] },

      // Rose / pink — scattered
      { position: [10, 4, -60], scale: 58, color: "#9f1239", opacity: 0.05, rotation: [0.2, 0.7, 0.4] },
      { position: [-4, -2, -62], scale: 42, color: "#831843", opacity: 0.04, rotation: [0.5, 0.4, 0.9] },
    ],
    [],
  );

  return (
    <group>
      {clouds.map((c, i) => (
        <mesh
          key={i}
          position={c.position}
          rotation={c.rotation}
        >
          <planeGeometry args={[c.scale, c.scale]} />
          <meshBasicMaterial
            map={tex}
            color={c.color}
            transparent
            opacity={c.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ----------------------------- interstellar dust --------------------------- */

const DUST_COUNT = 300;

export function DustCloud() {
  const ref = useRef<THREE.Points>(null);

  const { positions, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3);
    const sz = new Float32Array(DUST_COUNT);
    const col = new Float32Array(DUST_COUNT * 3);

    for (let i = 0; i < DUST_COUNT; i++) {
      // spread across a wide volume
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = -10 - Math.random() * 60;

      sz[i] = 0.15 + Math.random() * 0.4;

      // subtle cool tones
      const t = Math.random();
      col[i * 3] = 0.12 + t * 0.08;
      col[i * 3 + 1] = 0.14 + t * 0.1;
      col[i * 3 + 2] = 0.22 + t * 0.12;
    }

    return { positions: pos, sizes: sz, colors: col };
  }, []);

  const tex = useMemo(() => makeGlowTexture(), []);

  useFrame((state) => {
    if (ref.current) {
      // very gentle drift
      ref.current.rotation.y = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        vertexColors
        transparent
        opacity={0.12}
        size={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ----------------------------- enhanced stars ------------------------------ */

/**
 * Replaces the drei Stars with a more realistic star field that has
 * varied sizes, warm/cool tinting, and occasional bright stars with halos.
 */
const STAR_COUNT = 4000;

export function RealisticStars({ count, motion, bassLevel = 0 }: { count: number; motion: boolean; bassLevel?: number }) {
  const ref = useRef<THREE.Points>(null);
  const tex = useMemo(() => makeGlowTexture(), []);
  const bassRef = useRef(bassLevel);
  bassRef.current = bassLevel;

  const data = useMemo(() => {
    const actualCount = count || STAR_COUNT;
    const pos = new Float32Array(actualCount * 3);
    const col = new Float32Array(actualCount * 3);
    const sz = new Float32Array(actualCount);

    for (let i = 0; i < actualCount; i++) {
      // distribute on a sphere shell at large distance
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 50 + Math.random() * 80;

      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r;

      // color variety: warm (yellow-orange), neutral (white), cool (blue-white)
      const tint = Math.random();
      let color: THREE.Color;
      if (tint < 0.2) {
        // warm — yellowish
        color = new THREE.Color().setHSL(0.12 + Math.random() * 0.05, 0.5 + Math.random() * 0.3, 0.8 + Math.random() * 0.2);
      } else if (tint < 0.35) {
        // cool — blue-white
        color = new THREE.Color().setHSL(0.58 + Math.random() * 0.06, 0.3 + Math.random() * 0.3, 0.85 + Math.random() * 0.15);
      } else if (tint < 0.42) {
        // rare red giant
        color = new THREE.Color().setHSL(0.02, 0.7, 0.65);
      } else {
        // neutral white
        color = new THREE.Color().setHSL(0, 0, 0.85 + Math.random() * 0.15);
      }

      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      // most stars are tiny, a few are bright
      const isBright = Math.random() < 0.008;
      const isMedium = Math.random() < 0.04;
      sz[i] = isBright ? 0.15 + Math.random() * 0.2 : isMedium ? 0.06 + Math.random() * 0.06 : 0.015 + Math.random() * 0.025;
    }

    return { positions: pos, colors: col, sizes: sz };
  }, [count]);

  const matRef = useRef<THREE.PointsMaterial>(null);

  useFrame((state) => {
    if (ref.current && motion) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.002;
    }
    // pulse star brightness with the beat
    if (matRef.current) {
      const b = bassRef.current;
      matRef.current.opacity = 0.9 + b * 0.6;
      matRef.current.size = 0.1 + b * 0.06;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[data.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        map={tex}
        vertexColors
        transparent
        opacity={0.9}
        size={0.1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
