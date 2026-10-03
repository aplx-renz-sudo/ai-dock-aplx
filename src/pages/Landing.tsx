import { useMemo, useRef, useState } from "react";import { motion,
  AnimatePresence,
  useMotionTemplate,
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
import { DJProvider, DJOverlay, useDJ } from "@/components/viledocx/DJMode";
import { MotionBlur, ScrollFade, ScrollProgress } from "@/components/viledocx/scroll";

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

/* ============================== LANDING ================================== */

export default function Landing() {
  return (
    <DJProvider>
      <LandingInner />
    </DJProvider>
  );
}

function LandingInner() {
  const { active: djActive } = useDJ();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-black font-sans text-neutral-200 selection:bg-white/15 selection:text-white">
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
      <MotionBlur />
      <RenameBanner />
      <Navbar />
      <div className="pointer-events-none fixed bottom-6 z-[70] mx-auto max-w-md px-4 text-center">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-black/70 px-4 py-2.5 backdrop-blur-xl shadow-[0_0_40px_rgba(251,191,36,0.08)]">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-300/90">
            V3 Alpha has MANY errors in SWARM mode, DO NOT RUN BUILD SWARM MODE, unless you want to.
          </p>
        </div>
      </div>
      <DJOverlay />

      <main
        className="relative z-10 transition-opacity duration-500"
        style={{ opacity: djActive ? 0 : 1, pointerEvents: djActive ? "none" : "auto" }}
      >
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
        <div className="absolute left-1/2 top-[-180px] h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.18),transparent_65%)] blur-2xl" />
      </motion.div>      <ScrollFade className="w-full" distance={32}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto w-full max-w-4xl text-center"
        >
          <p className="mb-7 flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.34em] text-neutral-500">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/25" />
          VileDocx V2
          <span className="text-white/20">/</span>
          <span className="text-emerald-400/90">Free forever</span>
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
          <LaunchButton />
          <PreviewButton />
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
            "1M-param local Nano",
            "MIT licensed",
          ].map((item, i) => (
            <span key={item} className="flex items-center gap-x-2.5">
              {i > 0 && <span className="text-white/15">·</span>}
              <span className="whitespace-nowrap">{item}</span>
            </span>
          ))}
        </div>
        </motion.div>
      </ScrollFade>

      <ScrollFade className="w-full" distance={48}>
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
              <span
                className="relative inline-block font-display font-bold tracking-[0.18em]"
                style={{
                  fontSize: "clamp(4rem, 16vw, 9rem)",
                  fontWeight: "800",
                  lineHeight: "1",
                  letterSpacing: "0.16em",
                  color: "#e4e4e7",
                  textShadow:
                    "0 0 0 rgba(228,228,231,0), 0 10px 50px -20px rgba(228,228,231,0.18), 0 2.5px 0 -0.75px rgba(255,255,255,0.35), 0 -1px 0 -0.75px rgba(0,0,0,0.6) inset",
                }}
              >
                DOCX
              </span>
              <svg
                className="pointer-events-none absolute left-0 top-0 h-full w-full -translate-x-1/2 -translate-y-1/2 overflow-visible"
                aria-hidden
                viewBox="0 0 740 240"
              >
                <defs>
                  <linearGradient id="docxStroke" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f1f1f3" />
                    <stop offset="0.55" stopColor="#c7c7cc" />
                    <stop offset="1" stopColor="#4b4b53"/>
                  </linearGradient>
                  <linearGradient id="docxCrest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fafafa" />
                    <stop offset="1" stopColor="#6b6b72" />
                  </linearGradient>
                  <linearGradient id="docxEmissive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#34d399" stopOpacity="0.55" />
                    <stop offset="0.5" stopColor="#34d399" stopOpacity="0.05" />
                    <stop offset="1" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                  <filter id="docxFX" x="-10%" y="-10%" width="120%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodColor="#ffffff" floodOpacity="0.22" />
                    <feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="#34d399" floodOpacity="0.22"/>
                  </filter>
                </defs>
                <g filter="url(#docxFX)" fill="none">
                  <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="url(#docxStroke)"
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                      fontSize: "12rem",
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      lineHeight: "1",
                    }}
                  >
                    DOCX
                  </text>
                  <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="url(#docxCrest)"
                    opacity={0.55}
                    transform="translateY(-3px)"
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                      fontSize: "12rem",
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      lineHeight: "1",
                    }}
                  >
                    DOCX
                  </text>
                </g>
              </svg>

              {/* Always-visible readable mark behind the SVG so the wordmark is never blank */}
              <span
                className="relative z-10 inline-block font-display font-bold tracking-[0.18em] sm:text-6xl md:text-7xl text-slate-200 select-none"
                style={{
                  fontSize: "clamp(4rem, 16vw, 9rem)",
                  fontWeight: "800",
                  lineHeight: "1",
                  letterSpacing: "0.14em",
                }}
              >
                DOCX
              </span>
            </div>
          </motion.div>

          {/* The mark floats over the section's own glow, so the emerald rim
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
                <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-emerald-400/80">
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070707] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />            <div className="mx-auto flex items-center gap-2 rounded-md border border-white/[0.07] bg-black/40 px-3 py-1 text-[11px] text-neutral-500">
          <Shield className="h-3 w-3 text-emerald-400/70" />
          VileDocx Dock — Local
          <span className="ml-0.5 inline-block h-3 w-1 animate-pulse rounded-[1px] bg-emerald-400/70" />
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
                  style={{ background: i === 0 ? "#34d399" : p.color }}
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
                <span className="rounded-md border border-emerald-400/20 bg-emerald-400/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
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
                <div className="mt-2 font-display text-xl font-bold tracking-tight text-emerald-400 sm:text-3xl">
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
        <span className="self-start whitespace-nowrap rounded-md border border-emerald-400/20 bg-emerald-400/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
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
                <span className="rounded border border-emerald-400/25 bg-emerald-400/[0.07] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400/90">
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
                    <span className="h-1 w-1 rounded-full bg-emerald-400/70" />
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
            <div className="flex items-center gap-1 whitespace-nowrap pt-1 text-emerald-400/80">
              <span>viledocx-dock $</span>
              <span className="inline-block h-3.5 w-1.5 animate-pulse rounded-[1px] bg-emerald-400/80" />
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-white/[0.07] bg-white/[0.015] px-5 py-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-emerald-400">
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
    { k: "Maintained by", v: "R3nz" },
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
            kicker="About"
            title="Small project. Public process."
            subtitle="VileDocx Dock is built and maintained in the open. The roadmap, the issues, and the commit history are all readable in the same place."
          />
        </ScrollFade>

        <ScrollFade className="mt-14 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <GlassPanel className="p-6 sm:p-8">
            <p className="text-[15px] leading-relaxed text-neutral-300">
              The dock started as a personal answer to a mundane problem: a dozen
              AI tools, a dozen browser tabs, a dozen places for an API key to end
              up. It stays deliberately small — a local app that routes to
              providers you already pay for, rather than another platform holding
              your keys and your data.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-neutral-400">
              Scope is set in public. Provider integrations ship when they are
              tested against the real API, not when they appear on a roadmap, and
              anything that would require sending your keys to a server is out of
              scope by design.
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
                  <dd className="font-display text-sm font-semibold text-white">
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
        <ScrollFade className="rounded-2xl border border-amber-500/20 bg-amber-400/5 px-5 py-4 backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300/90">
            V3 Alpha has MANY errors in SWARM mode. DO NOT RUN BUILD SWARM MODE, unless you want to. (THIS ERROR IS ONLY FOR NOW, GIVE IT A FEW DAYS AND THE DEV WILL FIX IT)!
          </p>
        </ScrollFade>
      </div>
      <ScrollFade className="mx-auto max-w-xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          One dock. Your keys.
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
                A
              </span>
              <span className="font-display text-[15px] font-semibold tracking-tight text-white">
                VileDocx
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-neutral-500">
              A local dock for the AI tools you already pay for. Your keys, your
              machine, no markup.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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

