import { useMemo, useRef, useState } from "react";
import { motion,
  AnimatePresence,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  ArrowRight,
  Box,
  Brain,
  ChevronDown,
  Cpu,
  ExternalLink,
  FileCode,
  Globe,
  KeyRound,
  Layers,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  PROVIDERS,
  TOTAL_MODELS,
  OPEN_PROVIDERS,
  LAUNCH_URL,
  GITHUB_URL,
  type VileDocxProvider,
} from "@/components/viledocx/data";
import {
  GlassPanel,
  DotField,
  DotRule,
  LaunchButton,
  GithubButton,
  InstallWebsiteButton,
  PreviewButton,
  Navbar,
  RenameBanner,
  SectionHeading,
  openLink,
  INSTALL_WEBSITE_URL,
  PREVIEW_URL,
} from "@/components/viledocx/ui";
import { SpendChart } from "@/components/viledocx/CostCharts";
import { ScrollFade, ScrollProgress } from "@/components/viledocx/scroll";

/* ----------------------------- provider icons ---------------------------- */

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  openai: <Sparkles className="h-5 w-5" />,
  anthropic: <Brain className="h-5 w-5" />,
  google: <Globe className="h-5 w-5" />,
  meta: <Layers className="h-5 w-5" />,
  deepseek: <Cpu className="h-5 w-5" />,
  mistral: <Zap className="h-5 w-5" />,
  xai: <Box className="h-5 w-5" />,
  ollama: <Shield className="h-5 w-5" />,
};

/* ------------------------- hero wordmark animation ----------------------- */

/**
 * The orange "X" shatters into a triangular glass mesh: 24 fragments that each
 * drift left, arcing over and under the "DOC" letters, then snap back together
 * with a pulsing bloom behind them.
 *
 * The mesh vertices are shared between neighbouring triangles and the outer
 * edge is pinned to the glyph box, so the union of every shard is still a true
 * partition of the letter — the assembled state reconstructs it exactly.
 */

/** Stable pseudo-random in [-1, 1] so the mesh never re-jitters between renders. */
function shardNoise(a: number, b: number) {
  const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

type XShard = {
  clip: string;
  /** travel in em; negative x sweeps left, around the "DOC" letters */
  tx: number;
  ty: number;
  rotate: number;
  delay: number;
};

const X_SHARDS: XShard[] = (() => {
  const xs = [0, 22, 49, 75, 100];
  const ys = [0, 34, 66, 100];
  const cols = xs.length - 1;
  const rows = ys.length - 1;

  // Jittered grid vertices. Edge vertices stay pinned so the assembled shards
  // still cover the whole glyph box — no clipped letterforms.
  const vx: number[][] = [];
  const vy: number[][] = [];
  for (let c = 0; c <= cols; c++) {
    vx[c] = [];
    vy[c] = [];
    for (let r = 0; r <= rows; r++) {
      const onEdgeX = c === 0 || c === cols;
      const onEdgeY = r === 0 || r === rows;
      vx[c][r] = onEdgeX ? xs[c] : xs[c] + shardNoise(c, r) * 5;
      vy[c][r] = onEdgeY ? ys[r] : ys[r] + shardNoise(c + 9, r + 4) * 4;
    }
  }

  const point = (c: number, r: number) =>
    `${vx[c][r].toFixed(1)}% ${vy[c][r].toFixed(1)}%`;

  const shards: XShard[] = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = point(c, r);
      const b = point(c + 1, r);
      const d = point(c + 1, r + 1);
      const e = point(c, r + 1);
      // Two triangles per cell, split on a shared diagonal — a true partition.
      for (const clip of [`polygon(${a}, ${b}, ${d})`, `polygon(${a}, ${d}, ${e})`]) {
        const j = shardNoise(i + 1, i + 5);
        const j2 = shardNoise(i + 11, i + 2);
        // Everyone sweeps left, over and around the "DOC" letters.
        const reach = 0.9 + Math.abs(j) * 1.6;
        // Top row arcs over the letters, bottom row dips under, middle drifts.
        const dir = r === 0 ? -1 : r === rows - 1 ? 1 : j2 > 0 ? 1 : -1;
        shards.push({
          clip,
          tx: -reach,
          ty: dir * (0.3 + Math.abs(j2) * 0.85),
          rotate: (j > 0 ? 1 : -1) * (35 + Math.abs(j2) * 60),
          delay: c * 0.05 + r * 0.08 + (i % 2) * 0.03,
        });
        i++;
      }
    }
  }
  return shards;
})();

/** em helper so travel keyframes carry the unit the transform needs. */
const em = (n: number) => `${n.toFixed(2)}em`;

function ShatteringX() {
  const reduce = useReducedMotion();
  const glyphStyle: React.CSSProperties = {
    textShadow: "0 0 22px rgba(249,115,22,0.45)",
  };

  return (
    <span
      className="relative inline-block italic text-orange-400"
      style={{ marginLeft: "0.05em" }}
    >
      {/* Layout ghost — sizes the box to the real glyph without painting it. */}
      <span aria-hidden className="invisible">
        X
      </span>

      {/* Bloom that breathes behind the separated shards. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[1.1em] w-[0.95em] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(249,115,22,0.5), transparent 70%)",
          filter: "blur(0.35em)",
          willChange: "opacity, transform",
        }}
        animate={
          reduce
            ? undefined
            : { opacity: [0.35, 0.95, 0.35], scale: [0.9, 1.15, 0.9] }
        }
        transition={
          reduce
            ? undefined
            : { repeat: Infinity, duration: 3.6, ease: "easeInOut" }
        }
      />

      {X_SHARDS.map((s, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute"
          style={{
            top: 0,
            bottom: 0,
            left: "-0.08em",
            right: "-0.08em",
            clipPath: s.clip,
            WebkitClipPath: s.clip,
            willChange: "transform",
            ...glyphStyle,
          }}
          animate={
            reduce
              ? undefined
              : {
                  // Out toward the letters, hold while scattered, glide back.
                  x: ["0em", em(s.tx * 0.55), em(s.tx), em(s.tx), "0em"],
                  y: ["0em", em(s.ty * 0.6), em(s.ty), em(s.ty), "0em"],
                  rotate: [0, s.rotate * 0.45, s.rotate, s.rotate, 0],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  repeat: Infinity,
                  duration: 6.5,
                  times: [0, 0.16, 0.36, 0.62, 0.84],
                  delay: s.delay,
                  ease: "easeInOut",
                }
          }
        >
          X
        </motion.span>
      ))}
    </span>
  );
}

const WAVE_W = 1600;
const WAVE_H = 220;

/**
 * Seamless sine path: four even periods across the viewBox, so translating the
 * path by half the viewBox width lands on an identical waveform.
 */
function wavePath(mid: number, amp: number, phase: number) {
  const period = WAVE_W / 4;
  let d = `M 0 ${mid}`;
  for (let x = 8; x <= WAVE_W; x += 8) {
    const y = mid + Math.sin((x / period) * Math.PI * 2 + phase) * amp;
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

const WAVE_LAYERS = [
  { mid: 74, amp: 16, phase: 0, width: 1.6, opacity: 0.4 },
  { mid: 110, amp: 26, phase: Math.PI / 3, width: 2.4, opacity: 0.85 },
  { mid: 146, amp: 16, phase: (Math.PI * 2) / 3, width: 1.6, opacity: 0.4 },
];

/** Horizontal wave that drifts behind the big DOCX mark. */
function DocxWave() {
  const reduce = useReducedMotion();
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
      preserveAspectRatio="none"
      className="absolute left-0 top-1/2 h-[72%] w-[200%] -translate-y-1/2"
    >
      <defs>
        <linearGradient id="docx-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0" />
          <stop offset="35%" stopColor="#fb923c" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#fdba74" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {WAVE_LAYERS.map((layer, i) => (
        <g key={i} opacity={layer.opacity}>
          <motion.path
            d={wavePath(layer.mid, layer.amp, layer.phase)}
            fill="none"
            stroke="url(#docx-wave)"
            strokeWidth={layer.width}
            strokeLinecap="round"
            style={{ filter: "blur(1.5px)" }}
            animate={reduce ? undefined : { x: [0, -WAVE_W / 2] }}
            transition={
              reduce
                ? undefined
                : { repeat: Infinity, ease: "linear", duration: 8 + i * 2 }
            }
          />
        </g>
      ))}
    </svg>
  );
}

/* ============================== LANDING ================================== */

/* ------------------------- halloween scenery ------------------------- */

/** Low blood-moon glow on the horizon behind the hero mark. */
function HalloweenMoon() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-[4%] right-[6%] h-40 w-40 sm:h-56 sm:w-56"
      animate={
        reduce
          ? undefined
          : { opacity: [0.5, 0.85, 0.5], scale: [1, 1.04, 1] }
      }
      transition={
        reduce ? undefined : {
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
        }
      }
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.55),rgba(251,146,60,0.12)_55%,transparent_72%)] blur-md" />
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_35%_32%,#fde68a_0%,#fb923c_45%,#c2410c_100%)] shadow-[0_0_60px_18px_rgba(251,146,60,0.35)]" />
      {/* craters */}
      <div className="absolute left-[30%] top-[24%] h-4 w-4 rounded-full bg-orange-950/25 blur-[2px]" />
      <div className="absolute left-[52%] top-[46%] h-6 w-6 rounded-full bg-orange-950/20 blur-[3px]" />
      <div className="absolute left-[26%] top-[58%] h-3 w-3 rounded-full bg-orange-950/25 blur-[2px]" />
    </motion.div>
  );
}

const BAT_PATH =
  "M2 10 Q6 5 10 9 Q13 11 16 10 Q19 11 22 9 Q26 5 30 10 Q26 13 22 12 Q19 14 16 13 Q13 14 10 12 Q6 13 2 10 Z";

function Bat({ x, y, scale, delay, drift }: { x: string; y: string; scale: number; delay: number; drift: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 32 20"
      className="absolute"
      style={{ left: x, top: y, width: scale * 32, height: scale * 20 }}
      animate={
        reduce
          ? undefined
          : { x: [0, drift, 0], y: [0, -10, 0], rotate: [0, 4, 0] }
      }
      transition={
        reduce ? undefined : {
          repeat: Infinity,
          duration: 7 + delay,
          ease: "easeInOut",
          delay,
        }
      }
    >
      <path d={BAT_PATH} fill="#18181b" opacity={0.9} />
    </motion.svg>
  );
}

function BatSwarm() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Bat x="14%" y="26%" scale={1.1} delay={0} drift={22} />
      <Bat x="22%" y="16%" scale={0.8} delay={1.2} drift={-16} />
      <Bat x="74%" y="20%" scale={1.25} delay={0.5} drift={26} />
      <Bat x="82%" y="34%" scale={0.7} delay={1.8} drift={-20} />
      <Bat x="50%" y="12%" scale={0.55} delay={2.4} drift={14} />
    </div>
  );
}

/** Bare spooky tree silhouettes on the hero's left/right edges. */
function SpookyTree({ className, flip = false }: { className: string; flip?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 160 260"
      className={`absolute bottom-0 h-[55%] w-auto ${className}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      animate={reduce ? undefined : { rotate: [0, flip ? -1.2 : 1.2, 0] }}
      transition={
        reduce ? undefined : {
          repeat: Infinity,
          duration: 6.5,
          ease: "easeInOut",
        }
      }
    >
      <g fill="#0a0a0a" stroke="#0a0a0a">
        {/* trunk */}
        <path d="M78 260 L82 200 L76 200 L80 140 L74 142 L79 96 L83 100 L86 140 L94 136 L90 200 L96 260 Z" strokeWidth="0.5" />
        {/* left branch + twigs */}
        <path d="M78 120 Q56 102 44 78 Q42 72 46 74 Q54 96 76 110 Z" strokeWidth="0.5" />
        <path d="M50 86 Q38 78 30 60 L33 58 Q42 76 52 84 Z" strokeWidth="0.4" />
        <path d="M46 92 Q40 94 30 90 L31 87 Q40 90 47 89 Z" strokeWidth="0.4" />
        {/* right branch + twigs */}
        <path d="M84 108 Q104 92 118 64 Q120 58 116 62 Q104 84 84 100 Z" strokeWidth="0.5" />
        <path d="M112 70 Q124 58 132 38 L129 36 Q120 54 110 66 Z" strokeWidth="0.4" />
        <path d="M116 78 Q126 82 138 78 L137 74 Q126 78 117 75 Z" strokeWidth="0.4" />
        {/* top twig */}
        <path d="M80 96 Q78 70 68 52 L71 51 Q82 68 84 94 Z" strokeWidth="0.4" />
      </g>
    </motion.svg>
  );
}

/** Rows of jack-o'-lanterns along the hero floor. */
function PumpkinPatch() {
  const pumpkins = [
    { left: "6%", size: 30, jitter: -2 },
    { left: "17%", size: 20, jitter: 3 },
    { left: "68%", size: 24, jitter: 2 },
    { left: "86%", size: 34, jitter: -4 },
    { left: "93%", size: 20, jitter: 5 },
  ] as const;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16">
      {pumpkins.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 48 40"
          className="absolute bottom-0"
          style={{ left: p.left, width: p.size, height: (p.size * 40) / 48 }}
        >
          {/* stem */}
          <path
            d="M23 6 Q22 2 26 1 Q27 4 25 7 Z"
            fill="#3f6212"
          />
          {/* body */}
          <ellipse cx="24" cy="24" rx="15" ry="13" fill="#c2410c" />
          <ellipse cx="17" cy="24" rx="7" ry="12" fill="#ea580c" />
          <ellipse cx="31" cy="24" rx="7" ry="12" fill="#ea580c" />
          <ellipse cx="24" cy="24" rx="4" ry="12" fill="#fb923c" />
          {/* eyes */}
          <path d="M15 19 L19 19 L17 23 Z" fill="#fde047" />
          <path d="M29 19 L33 19 L31 23 Z" fill="#fde047" />
          {/* nose */}
          <path d="M22 24 L26 24 L24 27 Z" fill="#fde047" /> 
          {/* grin */}
          <path d="M15 29 Q24 35 33 29 L32 31 Q24 37 16 31 Z" fill="#fde047" />
          <path d="M19 30 L20 33 L22 30 Z" fill="#c2410c" />
          <path d="M26 30 L28 33 L29 30 Z" fill="#c2410c" />
        </svg>
      ))}
    </div>
  );
}

function HalloweenScenery() {
  return (
    <div
      aria-hidden
      className="vd-halloween pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden"
    >
      <HalloweenMoon />
      <BatSwarm />
      <SpookyTree className="left-[-2%]" />
      <SpookyTree className="right-[-2%]" flip />
      <PumpkinPatch />
    </div>
  );
}

/* ---------------- grand witch-cat tree + scroll-following roots ---------------- */

const PURPLE_DEEP = "#4c1d95";
const PURPLE_MID = "#7c3aed";
const PURPLE_SOFT = "#a78bfa";
const PURPLE_FAINT = "#c4b5fd";

/**
 * THE big tree. Anchored to the right edge of the viewport, its great branch
 * stretches all the way across the screen above the hero. A black cat in a
 * witch hat sleeps on that branch, tail slowly waggling. Pumpkins hang from
 * the twigs and cluster at the trunk. Painted in playful shades of purple
 * rather than black so it feels Halloween-cute, not grim.
 */
function GrandWitchTree() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="vd-halloween pointer-events-none absolute inset-x-0 top-0 z-[1] h-[420px] w-full sm:h-[520px]"
    >
      <motion.svg
        viewBox="0 0 1440 520"
        preserveAspectRatio="xMaxYMin slice"
        className="h-full w-full"
        animate={reduce ? undefined : { rotate: [0, 0.35, 0, -0.35, 0] }}
        transition={
          reduce
            ? undefined
            : { repeat: Infinity, duration: 11, ease: "easeInOut" }
        }
        style={{ transformOrigin: "92% 0%" }}
      >
        <defs>
          <linearGradient id="witch-bark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PURPLE_SOFT} />
            <stop offset="55%" stopColor={PURPLE_MID} />
            <stop offset="100%" stopColor={PURPLE_DEEP} />
          </linearGradient>
          <linearGradient id="witch-branch" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={PURPLE_DEEP} />
            <stop offset="70%" stopColor={PURPLE_MID} />
            <stop offset="100%" stopColor={PURPLE_SOFT} />
          </linearGradient>
        </defs>

        {/* ------- trunk, rooted at the right edge ------- */}
        <path
          d="M1440 520 L1436 380 Q1434 300 1428 240 Q1424 180 1432 120 L1438 40 L1444 40 L1448 130 Q1452 200 1446 260 Q1440 330 1438 400 L1438 520 Z"
          fill="url(#witch-bark)"
        />
        {/* root flares at the trunk base */}
        <path d="M1432 520 Q1396 500 1368 506 Q1400 492 1430 496 Z" fill={PURPLE_DEEP} />
        <path d="M1444 520 L1446 488 Q1470 478 1490 486 Q1462 488 1446 502 Z" fill={PURPLE_DEEP} />

        {/* ------- the great branch: sweeps left across the whole screen ------- */}
        <path
          d="M1436 250 Q1240 200 1020 206 Q800 212 620 232 Q420 254 240 244 Q120 236 28 208 Q18 204 22 198 Q34 194 60 202 Q180 230 300 234 Q470 238 660 218 Q850 198 1060 194 Q1260 190 1434 238 Z"
          fill="url(#witch-branch)"
        />
        {/* drooping twiglets off the great branch */}
        <path d="M300 230 Q292 250 274 264 L270 258 Q288 246 296 228 Z" fill={PURPLE_MID} />
        <path d="M560 226 Q556 248 540 262 L536 256 Q552 244 556 224 Z" fill={PURPLE_MID} opacity="0.9" />
        <path d="M840 206 Q840 228 828 244 L822 240 Q834 226 834 206 Z" fill={PURPLE_MID} opacity="0.85" />
        <path d="M1080 198 Q1084 218 1076 236 L1068 232 Q1078 216 1074 198 Z" fill={PURPLE_MID} opacity="0.9" />
        <path d="M1240 198 Q1252 214 1262 230 L1254 234 Q1244 220 1234 202 Z" fill={PURPLE_MID} opacity="0.8" />

        {/* small hanging pumpkins from the twigs */}
        <g>
          <path d="M274 264 Q273 276 276 284" stroke={PURPLE_MID} strokeWidth="2" fill="none" />
          <ellipse cx="276" cy="296" rx="9" ry="7" fill="#c2410c" />
          <ellipse cx="276" cy="296" rx="3.5" ry="7" fill="#fb923c" />
          <path d="M274 289 Q275 285 278 286 L277 290 Z" fill="#3f6212" />
          <path d="M271 294 L275 294 L273 297 Z M277 294 L281 294 L279 297 Z" fill="#fde047" />
        </g>
        <g>
          <path d="M540 262 Q538 274 542 284" stroke={PURPLE_MID} strokeWidth="2" fill="none" />
          <ellipse cx="542" cy="296" rx="11" ry="8" fill="#c2410c" />
          <ellipse cx="542" cy="296" rx="4" ry="8" fill="#fb923c" />
          <path d="M539 288 Q540 284 544 285 L543 289 Z" fill="#3f6212" />
          <path d="M536 294 L541 294 L538 298 Z M543 294 L548 294 L545 298 Z" fill="#fde047" />
        </g>
        <g>
          <path d="M828 244 Q826 256 830 266" stroke={PURPLE_MID} strokeWidth="2" fill="none" />
          <ellipse cx="830" cy="278" rx="8" ry="6" fill="#c2410c" />
          <ellipse cx="830" cy="278" rx="3" ry="6" fill="#fb923c" />
          <path d="M828 272 Q829 268 832 269 L831 273 Z" fill="#3f6212" />
          <path d="M825 276 L829 276 L827 279 Z M831 276 L835 276 L833 279 Z" fill="#fde047" />
        </g>

        {/* ground pumpkins clustered at the trunk base */}
        <g>
          <ellipse cx="1368" cy="512" rx="14" ry="10" fill="#c2410c" />
          <ellipse cx="1368" cy="512" rx="5" ry="10" fill="#fb923c" />
          <path d="M1365 502 Q1366 497 1370 498 L1369 503 Z" fill="#3f6212" />
          <path d="M1362 509 L1367 509 L1364 513 Z M1370 509 L1375 509 L1372 513 Z" fill="#fde047" />
        </g>
        <g>
          <ellipse cx="1400" cy="516" rx="10" ry="7.5" fill="#c2410c" />
          <ellipse cx="1400" cy="516" rx="3.5" ry="7.5" fill="#fb923c" />
          <path d="M1397 508 Q1398 504 1402 505 L1401 509 Z" fill="#3f6212" />
        </g>

        {/* ------- sleeping cat, curled on the branch near the left third ------- */}
        <g transform="translate(150 176)">
          {/* ---- TAIL (behind body, waggling slowly: lifts, sways, settles) */}
          <motion.g
            animate={
              reduce
                ? undefined
                : { rotate: [0, 6, 9, 5, 0, -4, 0] }
            }
            transition={
              reduce
                ? undefined
                : {
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut",
                    times: [0, 0.22, 0.38, 0.58, 0.74, 0.9, 1],
                  }
            }
            style={{ transformOrigin: "14px 16px" }}
          >
            {/* thick tapered tail sweeping right then curling over its own end */}
            <path
              d="M14 17
                 Q30 22 44 20
                 Q58 18 64 11
                 Q68 7 72 10
                 Q74 13 70 16
                 Q63 21 54 23
                 Q34 27 16 21
                 Q12 19 14 17 Z"
              fill="#312e81"
              strokeWidth="0"
            />
            <path
              d="M66 10 Q70 6 74 9 Q76 12 72 15 Q70 16 68 14 Z"
              fill={PURPLE_SOFT}
              strokeWidth="0"
            />
          </motion.g>

          {/* ---- BODY: proper sleeping loaf, chest at left, haunch at right */}
          <g>
            {/* main body mass */}
            <path
              d="M10 18
                 Q8 8 18 5
                 Q28 2 38 5
                 Q48 8 50 15
                 Q52 20 46 22
                 Q34 25 20 23
                 Q12 22 10 18 Z"
              fill="#312e81"
              strokeWidth="0"
            />
            {/* haunch: rounded hind-leg mound at the rear (right side) */}
            <path
              d="M36 22
                 Q38 12 46 12
                 Q53 12 54 18
                 Q55 23 48 24
                 Q40 25 36 22 Z"
              fill="#3b2f88"
              strokeWidth="0"
            />
            {/* front leg folded under the chest (left side) */}
            <path
              d="M12 20
                 Q14 16 20 17
                 Q24 18 23 21
                 Q20 24 14 23
                 Q11 22 12 20 Z"
              fill="#3b2f88"
              strokeWidth="0"
            />
            {/* paw peeking out from under the leg */}
            <ellipse cx="23" cy="21.5" rx="3" ry="2" fill={PURPLE_SOFT} strokeWidth="0" opacity="0.9" />
            {/* belly highlight */}
            <path
              d="M16 18 Q24 22 36 21 Q28 24 20 22 Q17 21 16 18 Z"
              fill={PURPLE_MID}
              opacity="0.55"
              strokeWidth="0"
            />
            {/* tabby stripes over the back */}
            <path d="M20 4 Q21 8 20 11" stroke={PURPLE_DEEP} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M27 3 Q28 8 27 12" stroke={PURPLE_DEEP} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M34 4 Q35 8 34 11" stroke={PURPLE_DEEP} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />

            {/* ---- HEAD, tucked down toward the chest, facing right */}
            {/* head mass */}
            <path
              d="M32 12
                 Q32 5 39 5
                 Q46 5 47 11
                 Q48 16 43 18
                 Q36 19 33 16
                 Q32 14 32 12 Z"
              fill="#433896"
              strokeWidth="0"
            />
            {/* muzzle: slightly lighter wedge */}
            <path
              d="M42 13
                 Q46 12 47 15
                 Q46 17 43 16
                 Q41 15 42 13 Z"
              fill={PURPLE_SOFT}
              opacity="0.35"
              strokeWidth="0"
            />
            {/* closed eye: gentle downward curve with tiny lashes */}
            <path
              d="M41 10 Q43 11.5 45 10"
              stroke="#ede9fe"
              strokeWidth="0.9"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path d="M41 10 L40.2 9" stroke="#ede9fe" strokeWidth="0.5" opacity="0.5" strokeLinecap="round" />
            <path d="M45 10 L45.8 9" stroke="#ede9fe" strokeWidth="0.5" opacity="0.5" strokeLinecap="round" />
            {/* tiny nose */}
            <path d="M46.6 12.4 L48 12.4 L47.3 13.4 Z" fill="#f0abfc" strokeWidth="0" />
            {/* whiskers */}
            <path d="M47.5 14 L51 13.6" stroke={PURPLE_FAINT} strokeWidth="0.45" opacity="0.6" />
            <path d="M47.5 15.2 L51 15.8" stroke={PURPLE_FAINT} strokeWidth="0.45" opacity="0.6" />
            {/* far ear behind the head */}
            <path d="M36 6 L37 1.5 L40 4 Z" fill="#2c2568" strokeWidth="0" />
            {/* near ear with inner-ear blush */}
            <path d="M41 4.5 L44 0.5 L46 5 Z" fill="#4c3fa8" strokeWidth="0" />
            <path d="M42 4 L43.5 1.8 L44.6 4.2 Z" fill="#f0abfc" opacity="0.4" strokeWidth="0" />

            {/* breathing (subtle body scale) — runs in a separate springy cycle */}

            {/* ---- WITCH HAT sitting over the near ear, tilted for coziness */}
            <g transform="translate(41 -2) rotate(-6)">
              {/* tip folds over to the left, like a well-worn hat */}
              <path
                d="M-4 7
                   Q-2 0 2 -7
                   Q5 -13 1 -18
                   Q-1 -21 3 -22
                   Q7 -21 6 -16
                   Q7 -8 3 0
                   Q1 5 0 7
                   Q-1 8 -4 7 Z"
                fill={PURPLE_DEEP}
                strokeWidth="0"
              />
              {/* brim, wider than the head, upturned at the left edge */}
              <path
                d="M-10 8
                   Q0 3 12 8
                   Q6 12 -2 11
                   Q-7 10 -10 8 Z"
                fill="#312e81"
                strokeWidth="0"
              />
              {/* band + buckle */}
              <path d="M-3 4 Q2 2 6 3 L5.5 6 Q1 6 -2.5 7 Z" fill={PURPLE_MID} strokeWidth="0" />
              <path d="M0 3.6 L3.2 3.2 L2.6 5.6 L-0.2 5.9 Z" fill="#fb923c" strokeWidth="0" opacity="0.9" />
              {/* tip glow star */}
              <path
                d="M2 -24 L3 -21 L6 -20 L3 -19 L2 -16 L1 -19 L-2 -20 L1 -21 Z"
                fill="#fde047"
                opacity="0.85"
                strokeWidth="0"
              />
            </g>

            {/* zZz bubbles drifting off the hat tip */}
            <text x="16" y="-18" fontSize="10" fill={PURPLE_SOFT} opacity="0.85" fontFamily="monospace">z</text>
            <text x="24" y="-28" fontSize="8" fill={PURPLE_SOFT} opacity="0.6" fontFamily="monospace">z</text>
            <text x="31" y="-36" fontSize="6.5" fill={PURPLE_SOFT} opacity="0.45" fontFamily="monospace">z</text>
          </g>
        </g>
      </motion.svg>
    </div>
  );
}

/**
 * The tree's roots: a fixed thin vine on the left edge of the viewport whose
 * length GROWS with the user's scroll progress (scroll-linked, not
 * time-based), like the big tree's roots reaching down past you. At the
 * bottom of the page they curl around the FinalCta's Launch /
 * Read-the-source buttons.
 */
function ScrollRootsWitchCta() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const rootLen = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), {
    stiffness: 70,
    damping: 22,
  });
  const rootY = useTransform(rootLen, (v) => `${v * 100}dvh`);
  const nodeT = [0.2, 0.4, 0.6, 0.8];
  const nodeOps = nodeT.map((t) =>
    useTransform(rootLen, (v) => Math.max(0, Math.min(1, (v - t) / 0.05))),
  );
  const nodeYs = nodeT.map((t) =>
    useTransform(rootLen, (v) => `${Math.max(0, v - t) * 100}dvh`),
  );

  const wrapSpring = useSpring(useTransform(scrollYProgress, [0.8, 0.98], [0, 1]), {
    stiffness: 80,
    damping: 24,
  });
  const wrapOpacity = useTransform(
    wrapSpring,
    (v) => Math.max(0, Math.min(1, v)) * 0.95,
  );
  const wrapY = useSpring(useTransform(scrollYProgress, [0.8, 1], [40, 0]), {
    stiffness: 80,
    damping: 24,
  });

  return (
    <div aria-hidden className="vd-halloween pointer-events-none fixed inset-0 z-0">
      {/* growing main root along the left edge */}
      <motion.div
        className="absolute left-[7px] top-0 w-[7px] origin-top rounded-full"
        style={{
          height: rootY,
          background:
            "linear-gradient(to bottom, rgba(167,139,250,0.7), rgba(124,58,237,0.45) 40%, rgba(76,29,149,0.35))",
        }}
      />
      {/* glowing nodes along the root */}
      {nodeT.map((t, i) => (
        <motion.div
          key={i}
          className="absolute left-[4px] h-3 w-3 rounded-full"
          style={{
            top: nodeYs[i],
            opacity: nodeOps[i],
            background: PURPLE_MID,
            boxShadow: `0 0 12px ${PURPLE_SOFT}`,
          }}
        />
      ))}

      {/* tendrils wrapping around the FinalCta buttons */}
      <motion.svg
        viewBox="0 0 360 90"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[70px] w-full"
        style={{ opacity: wrapOpacity, y: wrapY }}
      >
        <g stroke={PURPLE_DEEP} fill="none" strokeLinecap="round">
          <path d="M-4 40 Q40 34 74 44 Q96 50 118 44 Q136 38 154 46 Q166 52 150 56 Q120 64 92 56 Q60 46 20 52 L-4 50" strokeWidth="6" opacity="0.95" />
          <path d="M70 46 Q86 40 104 46 Q118 52 132 48" strokeWidth="2.5" opacity="0.7" />
          <path d="M60 52 Q74 60 96 58" strokeWidth="1.8" opacity="0.5" />
          <path d="M364 42 Q322 36 286 46 Q264 52 242 46 Q224 40 206 48 Q192 54 210 58 Q240 64 270 57 Q304 48 344 54 L364 52" strokeWidth="6" opacity="0.95" />
          <path d="M298 48 Q282 42 262 48 Q250 54 236 50" strokeWidth="2.5" opacity="0.7" />
          <path d="M306 54 Q292 62 268 60" strokeWidth="1.8" opacity="0.5" />
          <path d="M118 60 Q116 70 108 76" strokeWidth="1.8" opacity="0.5" />
          <path d="M242 60 Q244 70 250 76" strokeWidth="1.8" opacity="0.5" />
          <path d="M154 50 Q164 44 176 48 Q184 51 178 53 Q170 55 160 51" strokeWidth="2.2" opacity="0.6" />
          <path d="M206 52 Q196 46 184 50 Q176 53 182 55 Q190 57 200 53" strokeWidth="2.2" opacity="0.6" />
        </g>
      </motion.svg>
    </div>
  );
}
export default function Landing() {
  return <LandingInner />;
}

function LandingInner() {
  return (
    <div className="vd-shell relative min-h-screen overflow-x-clip font-sans text-neutral-200 selection:bg-orange-400/25 selection:text-white">
      {/* subtle backdrop grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 20%, transparent 75%)",
        }}
      />

      <ScrollProgress />
      <RenameBanner />
      <Navbar />
      {/* The big tree's roots creep down the full page and wrap the FinalCta buttons */}
      <ScrollRootsWitchCta />

      <main className="relative z-10">
        <Hero />
        <ProviderStrip />
        <DockFeatures />
        <HowItWorks />
        <ProviderCatalog />
        <Cost />
        <OpenSource />
        <NanoModel />
        <Maintainer />
        <FinalCta />
        <Footer />
      </main>
    </div>
  );
}

/* ============================================================ HERO */

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Gentle depth: the mock window drifts up faster than the copy, and the
  // hero glow dims away as the section leaves the viewport.
  const shotYRaw = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const shotY = useSpring(shotYRaw, { stiffness: 90, damping: 24, mass: 0.6 });
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0]);

  // Local motion blur on the mock window: it smears while the page is moving
  // fast and sharpens up as the scroll settles, which sells the depth.
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, {
    stiffness: 110,
    damping: 26,
    mass: 0.5,
    restDelta: 0.5,
  });
  const shotBlurRaw = useTransform(smoothVelocity, (v) => {
    const t = Math.min(Math.abs(v) / 2200, 1);
    return t * t * 5;
  });
  const shotBlur = useMotionTemplate`blur(${shotBlurRaw}px)`;
  const shotScale = useTransform(shotBlurRaw, (b) => 1 + (b / 5) * 0.012);

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-16 pt-28 sm:pb-24 sm:pt-32"
    >
      <motion.div
        aria-hidden
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
      >
        <div className="absolute left-1/2 top-[-180px] h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.18),transparent_65%)] blur-2xl" />
      </motion.div>

      {/* Halloween scenery: blood moon, bats, pumpkin patch*/}
      <HalloweenScenery />

      {/* THE big purple witch-cat tree hugging the right edge */}
      <GrandWitchTree />

      <ScrollFade className="relative z-10 w-full" distance={32}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto w-full max-w-4xl text-center"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/[0.08] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-300">
          🎃
          Happy early Halloween! - R3nz
          🎃
        </p>

        <p className="mb-7 flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.34em] text-neutral-500">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/25" />
          V3_SF_01
          <span className="text-white/20">/</span>
          <span className="text-orange-400/90">Swarm Fix BETA</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/25" />
        </p>

        <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          Your AI. One dock.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
          VileDocx Dock brings the major AI providers — OpenAI, Anthropic, Google,
          Meta and more — behind one interface, running on your own API keys.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <PreviewButton />
          <LaunchButton />
          <button
            onClick={() => openLink(GITHUB_URL)}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-white sm:ml-3"
          >
            Read the source
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Derived from the provider data so this line can never drift from the
            catalog below it. Items wrap between entries, never mid-phrase. */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-mono text-[11px] tracking-tight text-neutral-600">
          {[
            `${PROVIDERS.length} providers`,
            `${TOTAL_MODELS}+ models`,
            "V3_SF_01 — Swarm Fix BETA",
            "Dark Mode not done yet",
          ].map((item, i) => (
            <span key={item} className="flex items-center gap-x-2.5">
              {i > 0 && <span className="text-white/15">·</span>}
              <span className="whitespace-nowrap">{item}</span>
            </span>
          ))}
        </div>
        </motion.div>
      </ScrollFade>

      <ScrollFade className="relative z-10 w-full" distance={48}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto mt-4 w-full max-w-4xl"
        >
          <motion.div
            style={{ y: shotY, filter: shotBlur, scale: shotScale }}
            className="will-change-transform"
          >
            <div className="relative flex h-[240px] sm:h-[320px] md:h-[380px] items-center justify-center px-6">
              {/* Horizontal wave drifting behind the mark. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                <DocxWave />
              </div>

              <span
                className="relative inline-block select-none font-display font-bold"
                style={{
                  fontSize: "clamp(3.5rem, 15vw, 8.5rem)",
                  lineHeight: "1",
                  letterSpacing: "0.14em",
                }}
              >
                <span
                  style={{
                    background:
                      "linear-gradient(180deg, #fafafa 0%, #c7c7cc 55%, #4b4b53 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    filter: "drop-shadow(0 14px 30px rgba(249,115,22,0.18))",
                  }}
                >
                  DOC
                </span>
                <ShatteringX />
              </span>
            </div>
          </motion.div>

          {/* The mark floats over the section's own glow, so the orange rim
              reads as light coming off the letters rather than a sticker. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto max-w-3xl px-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-600">
              {PROVIDERS.length} providers docked
            </p>
          </div>
        </motion.div>
      </ScrollFade>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        className="mt-12 flex flex-col items-center gap-1 text-neutral-600"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown className="h-4 w-4" />
      </motion.div>

      <DotRule className="mt-10 w-full max-w-3xl opacity-50" />
    </section>
  );
}

/* ---------------------------------------------------------- provider strip */

/**
 * The integration list that belongs directly under a hero: it answers "does
 * this work with what I already use?" before the reader has to scroll for it.
 */
function ProviderStrip() {
  return (
    <section className="relative border-t border-white/[0.06] px-6 py-7">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
        <p className="shrink-0 pt-0.5 text-[10px] font-medium uppercase tracking-[0.28em] text-neutral-600">
          Docked today
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 sm:justify-start">
          {PROVIDERS.map((p) => (
            <span
              key={p.id}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500 transition-colors hover:text-neutral-300"
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ how it works */

/**
 * The three-step setup, numbered rather than iconographed. Real products
 * explain the path in; leaving it out is what makes a page feel like a
 * brochure instead of a product.
 */
function HowItWorks() {
  const steps = [
    {
      title: "Download the dock",
      body: "Grab the build for your platform. No account to create, no card, no sales call.",
    },
    {
      title: "Connect your own keys",
      body: "Add the provider keys you already own. They stay on your machine, under your control.",
    },
    {
      title: "Work from one place",
      body: "Route prompts and agents across every docked provider without switching tabs.",
    },
  ];

  return (
    <section id="setup" className="relative border-t border-white/[0.06] px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <ScrollFade distance={24}>
          <SectionHeading
            align="left"
            kicker="Setup"
            title="Running in about two minutes."
            subtitle="Installing the dock is most of the work. There is nothing to configure on a server and nothing to subscribe to."
          />
        </ScrollFade>

        <div className="mt-14 grid max-w-5xl gap-x-6 gap-y-10 sm:grid-cols-3">
          {steps.map((step, i) => (
            <ScrollFade key={step.title} delay={i * 0.08}>
              <div className="border-t border-white/10 pt-6">
                <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-orange-400/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-[15px] font-semibold tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {step.body}
                </p>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- product mock window -------------------------- */

function ProductShot() {
  const sidebar = PROVIDERS.slice(0, 6);
  return (
    <div className="vd-window overflow-hidden rounded-2xl border border-white/10 bg-[#070707] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />            <div className="mx-auto flex items-center gap-2 rounded-md border border-white/[0.07] bg-black/40 px-3 py-1 text-[11px] text-neutral-500">
          <Shield className="h-3 w-3 text-orange-400/70" />
          VileDocx Dock — Local
          <span className="ml-0.5 inline-block h-3 w-1 animate-pulse rounded-[1px] bg-orange-400/70" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr]">
        {/* sidebar */}
        <aside className="hidden border-r border-white/[0.07] bg-white/[0.01] p-3 sm:block">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Providers
          </p>
          <div className="space-y-0.5">
            {sidebar.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] ${
                  i === 0 ? "bg-white/[0.06] text-white" : "text-neutral-400"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: i === 0 ? "#fb923c" : p.color }}
                />
                {p.name}
              </div>
            ))}
            <div className="px-2 pt-1 text-[11px] text-neutral-600">
              +{PROVIDERS.length - sidebar.length} more…
            </div>
          </div>
        </aside>

        {/* main surface */}
        <div className="flex min-h-[300px] flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-neutral-300">
                  OpenAI · GPT-4o
                </span>
                <span className="rounded-md border border-orange-400/20 bg-orange-400/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
                  $0
                </span>
              </div>
              <span className="hidden text-[11px] text-neutral-600 sm:block">Keys: 3 connected</span>
            </div>

            <div className="space-y-2.5">
              <div className="max-w-[80%] rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-neutral-300">
                Route this task across every docked provider and compare the outputs.
              </div>
              <div className="ml-auto max-w-[85%] space-y-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
                <div className="h-2 w-3/4 rounded-full bg-white/10" />
                <div className="h-2 w-full rounded-full bg-white/[0.07]" />
                <div className="h-2 w-5/6 rounded-full bg-white/[0.07]" />
                <div className="h-2 w-2/3 rounded-full bg-white/[0.07]" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
            <KeyRound className="h-4 w-4 text-neutral-500" />
            <span className="text-[13px] text-neutral-600">
              Ask anything, or run an agent…
            </span>
            <div className="ml-auto flex h-7 w-7 items-center justify-center rounded-md bg-white text-black">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================================================================== COST */

/**
 * Four non-overlapping facts rather than four ways of writing "$0".
 */
const TERMS = [
  { value: "$0", label: "Licence", note: "MIT, no paid tier" },
  { value: "$0", label: "Markup", note: "you pay providers at cost" },
  { value: "Local", label: "Execution", note: "your keys never leave" },
  { value: "None", label: "Ads or tracking", note: "nothing to opt out of" },
];

function Cost() {
  return (
    <section id="free" className="relative border-t border-white/[0.06] px-6 py-24 sm:py-28">
      <DotField className="opacity-70" />
      <div className="mx-auto max-w-5xl">
        <ScrollFade distance={24}>
          <SectionHeading
            align="left"
            kicker="Cost"
            title="You pay your provider. Nothing else."
            subtitle="VileDocx Dock is a local app under the MIT licence. There is no seat price, no usage markup, and no ad inventory — the only invoice is the one your model provider already sends you."
          />
        </ScrollFade>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {TERMS.map((t, i) => (
            <ScrollFade key={t.label} delay={i * 0.08}>
              <GlassPanel tilt className="h-full p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 sm:text-[11px] sm:tracking-[0.16em]">
                  {t.label}
                </p>
                <div className="mt-2 font-display text-xl font-bold tracking-tight text-orange-400 sm:text-3xl">
                  {t.value}
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">{t.note}</p>
              </GlassPanel>
            </ScrollFade>
          ))}
        </div>

        <ScrollFade className="mt-4">
          <ChartPanel
            title="Software cost over 12 months"
            caption="Cumulative. The grey line models a $20/month subscription — a round number, not a measured competitor."
          >
            <SpendChart />
          </ChartPanel>
        </ScrollFade>

        <ScrollFade className="mt-6 max-w-2xl">
          <p className="text-[13px] leading-relaxed text-neutral-500">
            Model usage is billed by whichever provider you connect, at their
            published rates. VileDocx sits in front of that and adds nothing to it.
          </p>
        </ScrollFade>
      </div>
    </section>
  );
}

function ChartPanel({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-[12px] text-neutral-500">{caption}</p>
        </div>
        <span className="self-start whitespace-nowrap rounded-md border border-orange-400/20 bg-orange-400/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-400">
          MIT · no licence fee
        </span>
      </div>
      {children}
    </div>
  );
}

/* ============================================================ DOCK FEATURES */

function DockFeatures() {
  const features = [
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Every major provider",
      body: "One hub instead of a bookmarks bar full of separate chat apps.",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Famous models, or your own",
      body: "Reach for a flagship when you need it, or an open-weight model when you don't.",
    },
    {
      icon: <KeyRound className="h-5 w-5" />,
      title: "Bring your own keys",
      body: "Your API keys stay yours — connect them once and route freely.",
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      title: "One interface",
      body: "Stop juggling separate platforms. Work from one consistent environment.",
    },
    {
      icon: <FileCode className="h-5 w-5" />,
      title: "Open source",
      body: "Inspect the source, modify the architecture, contribute upstream.",
    },
    {
      icon: <Box className="h-5 w-5" />,
      title: "Nano model",
      body: "A 1M-parameter local model, built right into the dock.",
    },
  ];

  return (
    <section id="dock" className="relative border-t border-white/[0.06] px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
      <ScrollFade distance={24}>
        <SectionHeading
          align="left"
          kicker="The Dock"
          title="One interface for every provider."
          subtitle="Plug in your API keys once, browse the catalog, and run agents across any supported provider without leaving the window."
        />
      </ScrollFade>

      {/* The real interface, shown right under the claim it belongs to. */}
      <ScrollFade className="mx-auto mt-14 max-w-4xl">
        <ProductShot />
      </ScrollFade>      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
            <ScrollFade key={f.title} delay={i * 0.07} className="h-full">
            <GlassPanel tilt className="h-full p-6 hover:border-white/20 hover:bg-white/[0.04]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300">
                {f.icon}
              </div>
              <h3 className="font-display text-[15px] font-semibold tracking-tight text-white">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{f.body}</p>
            </GlassPanel>
          </ScrollFade>
        ))}
      </div>
      </div>
    </section>
  );
}

/* ============================================================ CATALOG */

function ProviderCatalog() {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return PROVIDERS;
    return PROVIDERS.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.models.some((m) => m.toLowerCase().includes(term)),
    );
  }, [q]);

  const modelCount = TOTAL_MODELS;

  return (
    <section id="catalog" className="relative border-t border-white/[0.06] px-6 py-28 sm:py-32">
      <DotField className="opacity-70" />
      <ScrollFade distance={24}>
        <SectionHeading
          kicker="Provider Catalog"
          title="The names you already know."
          subtitle="One flagship model per provider, so the catalog stays readable. Providers marked open publish weights you can run yourself."
        />
      </ScrollFade>

      <div className="mx-auto mt-12 max-w-5xl">
        <ScrollFade distance={24}>
          <div className="relative mx-auto mb-8 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search providers or models…"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-white/25 focus:bg-white/[0.05]"
            />
          </div>
        </ScrollFade>

        <ScrollFade className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                expanded={expanded === p.id}
                onExpand={() => setExpanded((c) => (c === p.id ? null : p.id))}
              />
            ))}
          </AnimatePresence>
        </ScrollFade>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-500">
            No providers match your search.
          </p>
        )}

        <ScrollFade className="mt-6">
          <p className="text-center font-mono text-[11px] tracking-tight text-neutral-600">
            {filtered.length} provider{filtered.length !== 1 && "s"} · {modelCount} models ·{" "}
            {OPEN_PROVIDERS} open-weight
          </p>
        </ScrollFade>
      </div>
    </section>
  );
}

function ProviderCard({
  provider,
  expanded,
  onExpand,
}: {
  provider: VileDocxProvider;
  expanded: boolean;
  onExpand: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onExpand}
        className="group w-full rounded-xl border border-white/10 bg-white/[0.025] p-5 text-left transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.04]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300">
            {PROVIDER_ICONS[provider.id] ?? <Sparkles className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm font-semibold text-white">
                {provider.name}
              </h4>
              {provider.open && (
                <span className="rounded border border-orange-400/25 bg-orange-400/[0.07] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-orange-400/90">
                  Open
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500">
              {provider.open ? "Open weights" : "Hosted API"}
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-neutral-600 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-1.5 border-t border-white/[0.07] pt-3">
                {provider.models.map((m) => (
                  <div
                    key={m}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-neutral-300"
                  >
                    <span className="h-1 w-1 rounded-full bg-orange-400/70" />
                    {m}
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-neutral-600">
                      Flagship
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-neutral-400">
                <ArrowRight className="h-3 w-3" />
                <span>Dock into {provider.name}</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

/* ============================================================ OPEN SOURCE */

function OpenSource() {
  return (
    <section id="source" className="relative border-t border-white/[0.06] px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
      <ScrollFade distance={24}>
        <SectionHeading
          align="left"
          kicker="Open Source"
          title="Read every line before you trust it."
          subtitle="The dock is MIT licensed and developed in public. Every integration, routing rule, and agent pipeline is inspectable — and forkable if you want to run it yourself."
        />
      </ScrollFade>

      <ScrollFade className="mt-14 grid items-start gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-base leading-relaxed text-neutral-400">
            VileDocx Dock is fully open source. Every integration, routing layer, and
            agent pipeline is inspectable — designed so teams can self-host,
            customize provider routing, and extend the platform without vendor
            lock-in.
          </p>
          <p className="text-base leading-relaxed text-neutral-400">
            Fork the repository, build custom provider stacks, or contribute
            upstream. The dock is maintained as a public project and shaped by the
            people who use it.
          </p>
          {/* Developer-facing links live here rather than crowding the hero. */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <GithubButton label="Explore the source" />
            <PreviewButton />
          </div>
        </div>

        <GlassPanel className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.015] px-5 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="ml-2 text-[11px] font-medium text-neutral-500">source-core</span>
          </div>
          {/* The tree is wider than a phone, so it scrolls sideways inside its
              own box rather than pushing the page out of shape. */}
          <div className="space-y-2 overflow-x-auto px-4 py-4 font-mono text-[11px] text-neutral-400 sm:px-5 sm:text-[13px]">
            {[
              "viledocx-dock/",
              `├─ providers/        # ${PROVIDERS.length} provider integrations`,
              "├─ agents/           # agent runner pipelines",
              "├─ keys/             # secure key management",
              "├─ catalog/          # model catalog & routing",
              "├─ nano/             # 1M-param local model",
              "└─ web/              # unified dock interface",
            ].map((line, i) => (
              <div key={i} className="whitespace-pre">
                {line}
              </div>
            ))}
            <div className="flex items-center gap-1 whitespace-nowrap pt-1 text-orange-400/80">
              <span>viledocx-dock $</span>
              <span className="inline-block h-3.5 w-1.5 animate-pulse rounded-[1px] bg-orange-400/80" />
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-white/[0.07] bg-white/[0.015] px-5 py-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            <span className="text-[11px] text-neutral-500">MIT License — free for everyone</span>
          </div>
        </GlassPanel>
      </ScrollFade>
      </div>
    </section>
  );
}

/* ============================================================ NANO MODEL */

function NanoModel() {
  const facts = [
    { k: "Parameters", v: "1 M" },
    { k: "Weights", v: "≈ 4 MB" },
    { k: "Runtime", v: "Local CPU" },
    { k: "Connection", v: "Not required" },
  ];
  return (
    <section id="nano" className="relative border-t border-white/[0.06] px-6 py-24 sm:py-28">
      <ScrollFade distance={24}>
        <SectionHeading
          kicker="VileDocx Nano"
          title="A model that never leaves the machine."
          subtitle="A compact 1M-parameter model bundled with the dock, for low-latency tasks and offline experimentation when a hosted provider is the wrong tool."
        />
      </ScrollFade>

      <ScrollFade className="mx-auto mt-14 grid max-w-5xl items-center gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-base leading-relaxed text-neutral-400">
            VileDocx Dock ships with its own Nano Model — a compact, 1M-parameter
            local component designed for low-latency tasks and offline
            experimentation. It sits alongside the full provider ecosystem,
            giving you a lightweight option when speed and footprint matter more
            than raw capability.
          </p>
          <p className="text-base leading-relaxed text-neutral-400">
            It runs on the same machine as the dock: no request leaves the
            device, and it keeps working with the network unplugged.
          </p>
        </div>

        <GlassPanel className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-orange-400">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-white">VileDocx Nano</p>
              <p className="text-[11px] text-neutral-500">Local inference component</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {facts.map((f) => (
              <div key={f.k} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                <p className="text-[11px] text-neutral-500">{f.k}</p>
                <p className="mt-0.5 font-display text-base font-semibold text-white sm:text-lg">
                  {f.v}
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </ScrollFade>
    </section>
  );
}

/* ============================================================ CREDITS */

function Maintainer() {
  const facts = [
    { k: "Maintainer", v: "R3nz" },
    { k: "Age", v: "15 years old" },
    { k: "Built with", v: "AI-assisted" },
    { k: "Use of AI", v: "By design" },
    { k: "Status", v: "Active" },
    { k: "Licence", v: "MIT" },
    { k: "Contributions", v: "Open" },
  ];
  return (
    <section id="about" className="relative border-t border-white/[0.06] px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <ScrollFade distance={24}>
          <SectionHeading
            align="left"
            kicker="The developer"
            title="Built by a 15-year-old. With AI."
            subtitle="VileDocx Dock is made and maintained in the open by R3nz — a self-taught teenager who used AI tools to build something this large, and ships it in public."
          />
        </ScrollFade>

        <ScrollFade className="mt-14 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <GlassPanel className="p-6 sm:p-8">
            <p className="text-[15px] leading-relaxed text-neutral-300">
              <span className="font-display font-semibold text-white">R3nz is 15 years old.</span>{" "}
              No team, no funding, no studio — just a teenager, a laptop, and a
              stubborn idea: a dozen AI tools shouldn't mean a dozen browser tabs
              and a dozen places for an API key to end up.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-neutral-400">
              It would not exist without AI. Large language models were used
              heavily to plan, write, and debug the codebase — the same tools the
              dock exists to route. Using AI to build an app about using AI is
              the whole point, not a shortcut he is hiding.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-neutral-400">
              Scope is still set in public. Provider integrations ship when they
              are tested against the real API, not when they appear on a roadmap,
              and anything that would require sending your keys to a server is out
              of scope by design.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <InstallWebsiteButton />
              <GithubButton label="Follow the project" className="border-transparent bg-transparent px-0" />
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 sm:p-8">
            <dl className="space-y-4">
              {facts.map((f) => (
                <div
                  key={f.k}
                  className="flex items-baseline justify-between gap-6 border-b border-white/[0.06] pb-4 last:border-b-0 last:pb-0"
                >
                  <dt className="text-[12px] uppercase tracking-[0.16em] text-neutral-500">
                    {f.k}
                  </dt>
                  <dd
                    className={`font-display text-sm font-semibold ${
                      f.k === "Age" ? "text-orange-400" : "text-white"
                    }`}
                  >
                    {f.v}
                  </dd>
                </div>
              ))}
            </dl>
          </GlassPanel>
        </ScrollFade>
      </div>
    </section>
  );
}

/* ============================================================ FINAL CTA */

function FinalCta() {
  return (
    <section className="relative border-t border-white/[0.06] px-6 py-28 text-center sm:py-32">
      <div className="mx-auto max-w-2xl">
        <ScrollFade className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            V3_SF_01 — Swarm Fix BETA. Dark Mode was added to make it look professional. WARNING — this update is not done perfectly yet.
          </p>
        </ScrollFade>
      </div>
      <ScrollFade className="mx-auto max-w-xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          One dock. Your keys. 🎃
        </h2>
        <p className="mt-4 text-base text-neutral-400">
          Download it, connect a provider, and run your first prompt tonight.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <LaunchButton />
          <button
            onClick={() => openLink(GITHUB_URL)}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Read the source
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </button>
        </div>
      </ScrollFade>

      <DotRule className="mt-14 w-full max-w-3xl opacity-50" />
    </section>
  );
}

/* ============================================================ FOOTER */

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Overview", href: "#top" },
      { label: "The dock", href: "#dock" },
      { label: "Setup", href: "#setup" },
      { label: "Provider catalog", href: "#catalog" },
      { label: "VileDocx Nano", href: "#nano" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "Source code", href: GITHUB_URL, external: true },
      { label: "Install guide", href: INSTALL_WEBSITE_URL, external: true },
      { label: "Preview builds", href: PREVIEW_URL, external: true },
      { label: "Open source", href: "#source" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Cost", href: "#free" },
      { label: "Setup", href: "#setup" },
      { label: "About", href: "#about" },
      { label: "Report an issue", href: GITHUB_URL, external: true },
    ],
  },
];

function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 pb-10 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[13px] font-bold text-black">
                V
              </span>
              <span className="font-display text-[15px] font-semibold tracking-tight text-white">
                VileDocx
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-neutral-500">
              A local dock for the AI tools you already pay for. Your keys, your
              machine, no markup.
            </p>
            <p className="mt-2 text-[11px] font-mono tracking-wide text-neutral-600">
              Vile stands for — Virtual Interface &amp; Linking Environment,
              not anything else. 🎃 Happy early Halloween! — R3nz
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span className="text-[11px] font-medium text-neutral-400">
                All systems operational
              </span>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading} className="min-w-0">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <button
                        onClick={() => openLink(link.href)}
                        className="text-[13px] text-neutral-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[13px] text-neutral-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 sm:mt-14 sm:flex-row sm:items-center">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} VileDocx Dock — released under the MIT licence.
          </p>
          <p className="text-xs text-neutral-600">
            Built with the open-source community.
          </p>
        </div>
      </div>
    </footer>
  );
}

