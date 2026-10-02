import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { PROVIDERS } from "./data";

/* -------------------------------------------------------------------------- */
/*  Letterform geometry                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The APLX monogram is drawn as real extruded geometry rather than loaded as a
 * font: every stroke is a bevelled slab, so the mark keeps hard edges at any
 * angle and there is nothing to download — and nothing that can fail to load.
 */

const STROKE = 0.15; // stroke thickness
const DEPTH = 0.3; // extrusion depth
const BEVEL = 0.022; // edge rounding
const CAP = 1.0; // cap height

type Slab = {
  size: [number, number, number];
  pos: [number, number, number];
  rotZ?: number;
};

type Bowl = {
  radius: number;
  tube: number;
  pos: [number, number, number];
};

/** "A" — two legs and a crossbar. */
const LETTER_A: Slab[] = [
  { size: [STROKE, 1.05, DEPTH], pos: [-0.16, 0, 0], rotZ: -0.3097 },
  { size: [STROKE, 1.05, DEPTH], pos: [0.16, 0, 0], rotZ: 0.3097 },
  { size: [0.4, STROKE, DEPTH], pos: [0, -0.16, 0] },
];

/** "P" — a stem with a half-torus bowl closing on the stem's right edge. */
const LETTER_P_STEM: Slab[] = [{ size: [STROKE, CAP, DEPTH], pos: [0, 0, 0] }];
const LETTER_P_BOWL: Bowl = {
  radius: 0.255,
  tube: STROKE / 2,
  pos: [STROKE / 2, 0.5 - 0.255, 0],
};

/** "L" — a stem with a foot. */
const LETTER_L: Slab[] = [
  { size: [STROKE, CAP, DEPTH], pos: [0, 0, 0] },
  { size: [0.5, STROKE, DEPTH], pos: [0.175, -0.5 + STROKE / 2, 0] },
];

/** "X" — two crossed diagonals. */
const LETTER_X: Slab[] = [
  { size: [STROKE, 1.17, DEPTH], pos: [0, 0, 0], rotZ: -0.5404 },
  { size: [STROKE, 1.17, DEPTH], pos: [0, 0, 0], rotZ: 0.5404 },
];

// Offsets line each letter's optical left edge up on the baseline grid.
const WORDMARK: { slabs: Slab[]; bowls?: Bowl[]; x: number }[] = [
  { slabs: LETTER_A, x: -1.09 },
  { slabs: LETTER_P_STEM, bowls: [LETTER_P_BOWL], x: -0.505 },
  { slabs: LETTER_L, x: 0.175 },
  { slabs: LETTER_X, x: 1.1 },
];

/* -------------------------------------------------------------------------- */
/*  Materials                                                                  */
/* -------------------------------------------------------------------------- */

/** Dark gunmetal: near-black body, hard specular, strong bevel highlights. */
function Gunmetal() {
  return (
    <meshPhysicalMaterial
      color="#0d0d11"
      metalness={0.92}
      roughness={0.24}
      clearcoat={0.6}
      clearcoatRoughness={0.3}
      envMapIntensity={1.2}
    />
  );
}

/** Slightly lighter brushed face for the floating provider chips. */
function ChipMetal() {
  return (
    <meshPhysicalMaterial
      color="#17171c"
      metalness={0.86}
      roughness={0.36}
      envMapIntensity={0.95}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Studio environment                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Builds the image-based lighting in memory with PMREMGenerator instead of
 * loading an HDR file, so metallic surfaces get real reflections with zero
 * network requests. A handful of emissive panels stand in for softboxes: a
 * broad key above, a cool fill on the left, and a narrow emerald strip that
 * rims the letterforms in the brand accent.
 */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new THREE.Scene();

    const background = new THREE.Mesh(
      new THREE.BoxGeometry(12, 12, 12),
      new THREE.MeshBasicMaterial({ color: "#050506", side: THREE.BackSide }),
    );
    room.add(background);

    // Colours above 1 so panels read as light sources, not flat paint.
    const panel = (
      rgb: [number, number, number],
      w: number,
      h: number,
      pos: [number, number, number],
      rot: [number, number, number],
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setRGB(...rgb),
          side: THREE.DoubleSide,
        }),
      );
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      room.add(mesh);
    };

    panel([6, 6, 6.4], 7, 5, [0, 4.6, 1], [-Math.PI / 2, 0, 0]); // soft key above
    panel([1.5, 1.6, 1.9], 3.4, 6, [-4.6, 0.4, 1.4], [0, Math.PI / 2, 0]); // cool left
    panel([1.1, 1.1, 1.2], 2.6, 3, [4.4, 0.8, -2.4], [0, -Math.PI / 2, -0.2]);
    panel([0.12, 2.6, 1.5], 1.5, 7, [1.6, 0.2, -4.4], [0, Math.PI, 0]); // emerald rim
    panel([0.06, 1.1, 0.7], 2.4, 1.1, [-1.9, -2.4, -3.4], [0, Math.PI, 0]);

    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        }
      });
    };
  }, [gl, scene]);

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Layout helpers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Guarantees a first frame in `demand` mode, which is what reduced-motion and
 * off-screen state fall back to. Without this the canvas could stay blank for
 * anyone who has motion reduction enabled.
 */
function RenderOnce() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate]);
  return null;
}

/**
 * Frames the mark identically at every canvas aspect ratio. The wordmark is
 * 2.8 world units wide; solving the camera distance from the viewport's aspect
 * keeps it from cropping on a phone or shrinking on a wide desktop hero.
 */
function Reframe({ worldWidth = 3.5 }: { worldWidth?: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    const aspect = Math.max(size.width / size.height, 0.35);
    const halfFov = (camera.fov * Math.PI) / 360;
    const distance = worldWidth / (2 * Math.tan(halfFov) * aspect);
    camera.position.set(0, 0.14, THREE.MathUtils.clamp(distance, 2.4, 9));
    camera.updateProjectionMatrix();
  }, [camera, size, worldWidth]);

  return null;
}

/** A dot grid fading toward its edges, used as the ground plane. */
function Floor() {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    const step = 32;
    for (let x = step / 2; x < size; x += step) {
      for (let y = step / 2; y < size; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const fade = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    fade.addColorStop(0, "rgba(0,0,0,1)");
    fade.addColorStop(0.5, "rgba(0,0,0,0.45)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;

  return (
    <mesh position={[0, -0.72, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[18, 12]} />
      <meshBasicMaterial map={texture} transparent opacity={0.3} depthWrite={false} />
    </mesh>
  );
}

/** Soft emerald halo sitting behind the letterforms. */
function Halo() {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(52,211,153,0.5)");
    g.addColorStop(0.35, "rgba(52,211,153,0.16)");
    g.addColorStop(1, "rgba(52,211,153,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;

  return (
    <mesh position={[0, -0.02, -3.1]}>
      <planeGeometry args={[8.5, 5.4]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Provider field                                                             */
/* -------------------------------------------------------------------------- */

const CHIP_COUNT = PROVIDERS.length;

/**
 * One chip per docked provider, drifting in the space behind the mark. The
 * count is read from the provider data so the field can never disagree with
 * the catalog below it. Chips sit strictly behind the wordmark, so perspective
 * can never push one out of frame or in front of a letterform.
 */
function ProviderField({ dim }: { dim: boolean }) {
  const field = useRef<THREE.Group>(null);

  const chips = useMemo(() => {
    return Array.from({ length: CHIP_COUNT }, (_, i) => {
      // Even spread across a shallow arc, with alternating depth rows.
      const t = CHIP_COUNT === 1 ? 0.5 : i / (CHIP_COUNT - 1);
      const back = (i * 7) % 4;
      return {
        key: i,
        pos: [
          -1.85 + t * 3.7,
          (i % 2 === 0 ? 0.6 : -0.44) + Math.sin(i * 2.1) * 0.18,
          -0.95 - back * 0.5,
        ] as [number, number, number],
        rot: [0, Math.sin(i) * 0.28, Math.sin(i * 0.9) * 0.05] as [
          number,
          number,
          number,
        ],
      };
    });
  }, []);

  useFrame((state, delta) => {
    const group = field.current;
    if (!group || dim) return;
    const t = state.clock.elapsedTime;
    group.rotation.y += (Math.sin(t * 0.12) * 0.1 - group.rotation.y) * delta * 2;

    group.children.forEach((child, i) => {
      const base = chips[i]?.pos[1] ?? 0;
      child.position.y = base + Math.sin(t * 0.55 + i * 1.1) * 0.05;
      child.rotation.z = Math.sin(t * 0.4 + i) * 0.07;
    });
  });

  return (
    <group ref={field}>
      {chips.map((chip) => (
        <RoundedBox
          key={chip.key}
          args={[0.34, 0.22, 0.05]}
          radius={0.03}
          smoothness={2}
          position={chip.pos}
          rotation={chip.rot}
        >
          <ChipMetal />
        </RoundedBox>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mark                                                                       */
/* -------------------------------------------------------------------------- */

function Mark({ getProgress, dim }: { getProgress?: () => number; dim: boolean }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const progress = getProgress?.() ?? 0;
    const t = state.clock.elapsedTime;

    // Pointer parallax: the mark turns toward the cursor, gently.
    if (!dim) {
      target.current.y = state.pointer.x * 0.34;
      target.current.x = -state.pointer.y * 0.18;
    }

    const idleY = dim ? 0 : Math.sin(t * 0.26) * 0.09;
    const idleX = dim ? 0 : Math.cos(t * 0.38) * 0.025;

    // Frame-rate independent damping toward the target pose.
    const damp = 1 - Math.pow(0.0016, delta);
    const wantY = target.current.y + idleY + progress * 0.7;
    const wantX = target.current.x + idleX + progress * 0.12;

    g.rotation.y += (wantY - g.rotation.y) * damp;
    g.rotation.x += (wantX - g.rotation.x) * damp;
    g.position.y += (0.05 + progress * 0.3 - g.position.y) * damp;
    g.position.z += (progress * 0.45 - g.position.z) * damp;
  });

  return (
    <group ref={group}>
      {WORDMARK.map((letter, i) => (
        <group key={i} position={[letter.x, 0, 0]}>
          {letter.slabs.map((slab, j) => (
            <RoundedBox
              key={j}
              args={slab.size}
              radius={BEVEL}
              smoothness={3}
              position={slab.pos}
              rotation={[0, 0, slab.rotZ ?? 0]}
            >
              <Gunmetal />
            </RoundedBox>
          ))}
          {letter.bowls?.map((bowl, j) => (
            <mesh key={`bowl-${j}`} position={bowl.pos} rotation={[0, 0, -Math.PI / 2]}>
              <torusGeometry args={[bowl.radius, bowl.tube, 14, 44, Math.PI]} />
              <Gunmetal />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Public component                                                           */
/* -------------------------------------------------------------------------- */

export type AplxMark3DProps = {
  /** Reads 0..1 scroll progress for the section that owns the mark. Called
   *  every frame, so it must be allocation-free — a MotionValue getter. */
  getProgress?: () => number;
  className?: string;
};

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

export function AplxMark3D({ getProgress, className }: AplxMark3DProps) {
  const host = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    setSupported(hasWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Phones get a lower device pixel ratio: the mark is decorative, and the
  // smaller canvas already means less to fill.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 767px), (hover: none)");
    const update = () => setLowPower(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Stop the render loop while the mark is off screen. With the capped DPR this
  // keeps a hero canvas from quietly draining a laptop battery further down.
  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "160px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const live = supported === true;
  const animate = live && visible && !reduced;

  return (
    <div ref={host} className={cn("relative w-full select-none", className)} aria-hidden>
      {live ? (
        <Canvas
          frameloop={animate ? "always" : "demand"}
          dpr={[1, lowPower ? 1.25 : 1.75]}
          camera={{ position: [0, 0.14, 4.4], fov: 34 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <StudioEnvironment />
          <Reframe />
          <ambientLight intensity={0.3} />
          <directionalLight position={[3, 5, 4]} intensity={0.9} />
          <pointLight position={[-3.2, 0.6, 2.4]} intensity={7} color="#34d399" />
          <Halo />
          <Floor />
          <ProviderField dim={!animate} />
          <Mark getProgress={getProgress} dim={!animate} />
          <RenderOnce />
        </Canvas>
      ) : supported === false ? (
        <StaticMark />
      ) : null}
    </div>
  );
}

/**
 * Flat stand-in used when WebGL is unavailable, so the hero never collapses to
 * an empty box on an old browser or a headless renderer.
 */
function StaticMark() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="font-display text-5xl font-bold tracking-[0.18em] text-neutral-800 sm:text-7xl">
        APLX
      </span>
    </div>
  );
}

export default AplxMark3D;
