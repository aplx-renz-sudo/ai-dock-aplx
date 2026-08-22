import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Box,
  Brain,
  ChevronDown,
  Cpu,
  ExternalLink,
  FileCode,
  Github,
  Globe,
  Layers,
  Search,
  Server,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { PROVIDERS, LAUNCH_URL, GITHUB_URL, type AplxProvider } from "@/components/aplx/data";
import {
  detectQuality,
  hasWebGL,
  DockScene,
  type SceneQuality,
} from "@/components/aplx/DockScene";
import {
  GlassPanel,
  LaunchButton,
  GithubButton,
  InstallWebsiteButton,
  Navbar,
  SectionHeading,
} from "@/components/aplx/ui";
import { ExplosionCtx } from "@/components/aplx/ExplosionContext";

/* ----------------------------- helper icons ------------------------------ */

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  openai: <Sparkles className="h-5 w-5" />,
  anthropic: <Brain className="h-5 w-5" />,
  google: <Globe className="h-5 w-5" />,
  meta: <Layers className="h-5 w-5" />,
  mistral: <Zap className="h-5 w-5" />,
  xai: <Box className="h-5 w-5" />,
  deepseek: <Cpu className="h-5 w-5" />,
  cohere: <FileCode className="h-5 w-5" />,
  perplexity: <Search className="h-5 w-5" />,
  groq: <Server className="h-5 w-5" />,
  ollama: <Shield className="h-5 w-5" />,
};

/* ------------------------------ fade in up -------------------------------- */

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" } as const,
  transition: { duration: 0.7, ease: "easeOut" } as const,
};

/* ============================== LANDING ================================== */

export default function Landing() {
  const [hovered3d, setHovered3d] = useState<string | null>(null);
  const [quality, setQuality] = useState<SceneQuality | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [explode, setExplode] = useState(false);
  const scrollRef = useRef(0);
  const triggerExplosion = () => {
    setExplode(true);
    setTimeout(() => setExplode(false), 1800);
  };

  useEffect(() => {
    setQuality(detectQuality());
    setWebgl(hasWebGL());
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = docH > 0 ? window.scrollY / docH : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <ExplosionCtx.Provider value={triggerExplosion}>
    <div className="relative min-h-screen bg-[#060b18] text-slate-100 overflow-x-clip font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* ── radial glow backdrop ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 35%, rgba(34,211,238,0.07) 0%, rgba(139,92,246,0.04) 40%, transparent 75%)",
        }}
      />

      {/* ── 3D canvas ── */}
      {quality && (
        <div className="fixed inset-0 z-[1]">
          {webgl ? (
            <DockScene
              hovered={hovered3d}
              onHover={setHovered3d}
              quality={quality}
              explode={explode}
              scrollRef={scrollRef as React.RefObject<number>}
            />
          ) : (
            <FallbackStars />
          )}
        </div>
      )}

      {/* ── nav ── */}
      <Navbar />

      {/* ── page content ── */}
      <main className="relative z-10">
        {/* ============================================================ HERO */}
        <section
          id="top"
          className="pointer-events-none relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-20 pt-28 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="mx-auto max-w-3xl"
          >
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-500/[0.08] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300/90 backdrop-blur-sm">
              Open-Source AI Dock
            </span>

            <h1 className="font-display text-6xl font-extrabold tracking-[0.14em] text-white sm:text-7xl md:text-8xl lg:text-9xl">
              APLX
            </h1>

            <p className="mt-4 font-display text-2xl font-semibold tracking-tight text-white/95 sm:text-3xl md:text-4xl">
              Your AI.&ensp;One Dock.
            </p>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300/85 sm:text-lg">
              A unified dock connecting multiple AI providers, models, and
              agents through a single interface — bring your own API keys and
              run everything from one place.
            </p>

            <p className="mx-auto mt-3 max-w-lg text-xs text-slate-400/80">
              ~11 providers&ensp;•&ensp;Multiple models&ensp;•&ensp;Open source&ensp;•&ensp;1 M-parameter Nano Model
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <LaunchButton />
              <GithubButton />
              <InstallWebsiteButton />
            </div>
          </motion.div>

          {/* scroll hint */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="pointer-events-auto absolute bottom-8 flex flex-col items-center gap-1 text-slate-500/70"
          >
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </section>

        {/* ============================================================ DOCK FEATURES */}
        <section id="dock" className="relative px-6 py-28 sm:py-36">
          <SectionHeading
            kicker="The Dock"
            title="Everything docks here."
            subtitle="One interface to plug in your API keys, browse the catalog, and run agents across any supported provider."
          />

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Globe className="h-5 w-5 text-cyan-300" />,
                title: "Multiple Providers",
                body: "Connect with approximately 11 AI providers through a single, unified hub.",
              },
              {
                icon: <Layers className="h-5 w-5 text-violet-300" />,
                title: "Multiple Models",
                body: "Browse and switch between models from different providers without leaving the platform.",
              },
              {
                icon: <Cpu className="h-5 w-5 text-sky-300" />,
                title: "One Interface",
                body: "Stop juggling separate platforms — move between providers from one consistent environment.",
              },
              {
                icon: <FileCode className="h-5 w-5 text-teal-300" />,
                title: "Open Source",
                body: "Inspect the source, modify the architecture, and contribute to a community-built dock.",
              },
              {
                icon: <Box className="h-5 w-5 text-indigo-300" />,
                title: "Nano Model",
                body: "Apyx's own 1 M-parameter lightweight model, running locally inside the ecosystem.",
              },
            ].map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
                <GlassPanel className="group h-full p-6 transition-all duration-300 hover:border-white/25 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(125,211,252,0.08)]">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                    {f.icon}
                  </div>
                  <h3 className="font-display text-base font-semibold tracking-tight text-white">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {f.body}
                  </p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============================================================ CATALOG */}
        <ProviderCatalog hovered3d={hovered3d} setHovered3d={setHovered3d} />

        {/* ============================================================ OPEN SOURCE */}
        <section id="source" className="relative px-6 py-28 sm:py-36">
          <SectionHeading
            kicker="Open Source"
            title="Open by design."
            subtitle="Built for transparency, experimentation, and community contribution."
          />

          <motion.div {...fadeUp} className="mx-auto mt-14 grid max-w-5xl items-start gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-base leading-relaxed text-slate-300/85">
                Aplx Dock is fully open source. Every integration, routing layer,
                and agent pipeline is inspectable — designed so teams can
                self-host, customize provider routing, and extend the platform
                without vendor lock-in.
              </p>
              <p className="text-base leading-relaxed text-slate-300/85">
                Fork the repository, build custom provider stacks, or
                contribute upstream. The dock is maintained as a public project
                and shaped by the people who use it.
              </p>
              <GithubButton label="Explore the source" className="mt-2" />
            </div>

            <GlassPanel className="overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-5 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                <span className="ml-2 text-[11px] font-medium text-slate-500">source-core</span>
              </div>
              <div className="space-y-2 px-5 py-4 text-[13px] font-mono text-slate-400/90">
                {[
                  { indent: 0, text: "aplx-dock/" },
                  { indent: 1, text: "├─ providers/        # 11 provider integrations" },
                  { indent: 1, text: "├─ agents/           # agent runner pipelines" },
                  { indent: 1, text: "├─ keys/             # secure key management" },
                  { indent: 1, text: "├─ catalog/          # model catalog & routing" },
                  { indent: 1, text: "├─ nano/             # 1M-param local model" },
                  { indent: 1, text: "└─ web/              # unified dock interface" },
                ].map((line, i) => (
                  <div key={i} style={{ paddingLeft: line.indent * 20 }}>
                    {line.text}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 bg-white/[0.04] px-5 py-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-slate-500">
                  MIT License — github.com/Korentic/Aplx
                </span>
              </div>
            </GlassPanel>
          </motion.div>
        </section>

        {/* ============================================================ NANO MODEL */}
        <section id="nano" className="relative px-6 py-28 sm:py-36">
          <SectionHeading
            kicker="Aplx Nano"
            title="Tiny model. Tiny footprint."
            subtitle="A lightweight 1 M-parameter model built into the dock for local inference and experimentation."
          />

          <motion.div {...fadeUp} className="mx-auto mt-14 grid max-w-5xl items-center gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-base leading-relaxed text-slate-300/85">
                Aplx Dock ships with its own Nano Model — a compact,
                1 M-parameter local component designed for low-latency tasks
                and offline experimentation. It sits alongside the full provider
                ecosystem, giving you a lightweight option when speed and
                footprint matter more than raw capability.
              </p>
              <p className="text-base leading-relaxed text-slate-300/85">
                The contrast is intentional: a vast ecosystem of powerful external
                models orbiting the dock, with a small, efficient model nestled
                at the center.
              </p>
            </div>

            {/* Visual: orbiting rings + nano dot */}
            <div className="relative flex h-64 items-center justify-center sm:h-72">
              <div className="absolute h-56 w-56 rounded-full border border-cyan-400/20 animate-[spin_14s_linear_infinite] sm:h-64 sm:w-64" />
              <div className="absolute h-40 w-40 rounded-full border border-violet-400/25 animate-[spin_9s_linear_infinite_reverse] sm:h-44 sm:w-44" />
              <div className="absolute h-24 w-24 rounded-full border border-sky-300/30 animate-[spin_5s_linear_infinite] sm:h-28 sm:w-28" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-5 w-5 rounded-full bg-violet-400 shadow-[0_0_28px_rgba(139,92,246,0.7)]" />
                <span className="mt-2 text-xs font-medium text-violet-300/80">Nano</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============================================================ CREDITS */}
        <section className="relative px-6 py-28 sm:py-36">
          <SectionHeading
            kicker="Credits"
            title="Built by a 15-year-old."
            subtitle="Aplx Dock is an ongoing project by R3nz — developed with the help of AI and the open-source community."
          />

          <motion.div {...fadeUp} className="mx-auto mt-14 max-w-3xl">
            <GlassPanel className="p-8 sm:p-10">
              {/* developer credit */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/[0.1] text-cyan-300">
                  <span className="font-display text-lg font-bold">R3nz</span>
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-white">
                    R3nz <span className="font-normal text-slate-500">— Developer</span>
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    Aplx Dock is a solo project by a 15-year-old developer, built out of genuine
                    curiosity about what a unified AI dock could look like. It is still actively
                    under development — new providers, models, and features are being added
                    regularly.
                  </p>
                </div>
              </div>

              <div className="my-6 h-px w-full bg-white/[0.07]" />

              {/* tools credit */}
              <div>
                <h4 className="font-display text-sm font-semibold text-white mb-3">
                  Built with
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Claude Opus",
                    "Sonnet 4.6",
                    "Haiku 4.5",
                    "GPT-5.6",
                    "GPT-4",
                    "Gemini 3.7",
                    "Gemini 3.1 Pro",
                    "GitHub Copilot",
                    "Ollama",
                  ].map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-slate-300"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  …and many more tools, models, and community contributions.
                </p>
              </div>
            </GlassPanel>
          </motion.div>
        </section>

        {/* ============================================================ FINAL CTA */}
        <section className="relative px-6 py-28 text-center sm:py-36">
          <motion.div {...fadeUp} className="mx-auto max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Everything you need.<br />One dock.
            </h2>
            <p className="mt-4 text-base text-slate-300/80">
              Connect. Explore. Build.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <LaunchButton />
              <GithubButton label="Explore the source" />
              <InstallWebsiteButton />
            </div>
          </motion.div>
        </section>

        {/* ============================================================ FOOTER */}
        <footer className="relative border-t border-white/[0.07] px-6 py-8 text-center">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <span className="font-display text-sm tracking-[0.18em] text-slate-500">
              APLX DOCK
            </span>
            <FooterLinks />
          </div>
        </footer>
      </main>
    </div>
    </ExplosionCtx.Provider>
  );
}

/* ====================================================================== */
/* PROVIDER CATALOG (searchable)                                           */
/* ====================================================================== */

function ProviderCatalog({
  hovered3d,
  setHovered3d,
}: {
  hovered3d: string | null;
  setHovered3d: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return PROVIDERS;
    return PROVIDERS.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.models.some((m) => m.toLowerCase().includes(term)),
    );
  }, [q]);

  return (
    <section id="catalog" className="relative px-6 py-28 sm:py-36">
      <SectionHeading
        kicker="Provider Catalog"
        title="Browse every docked provider."
        subtitle="Search the catalog to discover available providers, models, and integrations — then launch directly into the dock."
      />

      <motion.div {...fadeUp} className="mx-auto mt-12 max-w-5xl">
        {/* search bar */}
        <div className="relative mx-auto mb-8 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search providers or models…"
            className="w-full rounded-full border border-white/15 bg-white/[0.07] py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 backdrop-blur-xl outline-none transition-all focus:border-cyan-400/40 focus:bg-white/[0.11] focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>

        {/* results */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                active={hovered3d === p.id}
                expanded={expanded === p.id}
                onExpand={() => setExpanded((c) => (c === p.id ? null : p.id))}
                onHoverStart={() => setHovered3d(p.id)}
                onHoverEnd={() => setHovered3d(null)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            No providers match your search.
          </p>
        )}

        {/* total count */}
        <p className="mt-6 text-center text-xs text-slate-600">
          {filtered.length} provider{filtered.length !== 1 && "s"}&ensp;•&ensp;
          {PROVIDERS.reduce((n, p) => n + p.models.length, 0)} models available
        </p>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function ProviderCard({
  provider,
  active,
  expanded,
  onExpand,
  onHoverStart,
  onHoverEnd,
}: {
  provider: AplxProvider;
  active: boolean;
  expanded: boolean;
  onExpand: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <button
        onClick={onExpand}
        className={`group w-full text-left rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 ${
          active
            ? "border-white/30 bg-white/[0.12] shadow-[0_0_32px_rgba(125,211,252,0.1)]"
            : "border-white/[0.1] bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.08]"
        }`}
      >
        {/* header row */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300"
            style={{ color: provider.color }}
          >
            {PROVIDER_ICONS[provider.id] ?? <Sparkles className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h4 className="font-display text-sm font-semibold text-white">
              {provider.name}
            </h4>
            <p className="text-[11px] text-slate-500">
              {provider.models.length} model{provider.models.length !== 1 && "s"}
            </p>
          </div>
          {/* status dot */}
          <div
            className={`h-2 w-2 rounded-full transition-colors ${
              active ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "bg-slate-600"
            }`}
          />
        </div>

        {/* model list (expandable) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-1.5 border-t border-white/[0.08] pt-3">
                {provider.models.map((m) => (
                  <div
                    key={m}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-300 transition-colors hover:bg-white/[0.06]"
                  >
                    <div
                      className="h-1 w-1 rounded-full"
                      style={{ background: provider.color }}
                    />
                    {m}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-cyan-400/80">
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

/* ====================================================================== */
/* FALLBACK (no WebGL)                                                     */
/* ====================================================================== */

function FooterLinks() {
  const trigger = useContext(ExplosionCtx);
  const busy = useRef(false);
  const go = (href: string) => {
    if (busy.current) return;
    busy.current = true;
    trigger();
    setTimeout(() => {
      window.open(href, "_blank", "noopener,noreferrer");
      busy.current = false;
    }, 1500);
  };
  return (
    <div className="flex items-center gap-5 text-xs text-slate-500">
      <button
        onClick={() => go(LAUNCH_URL)}
        className="transition-colors hover:text-white"
      >
        Launch
      </button>
      <button
        onClick={() => go(GITHUB_URL)}
        className="transition-colors hover:text-white"
      >
        GitHub
      </button>
      <span>MIT License</span>
    </div>
  );
}

function FallbackStars() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#060b18]">
      {Array.from({ length: 180 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-px w-px rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.15 + Math.random() * 0.5,
            width: Math.random() > 0.85 ? 2 : 1,
            height: Math.random() > 0.85 ? 2 : 1,
          }}
        />
      ))}
    </div>
  );
}
