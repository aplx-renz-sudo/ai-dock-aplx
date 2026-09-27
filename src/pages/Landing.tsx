import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Box,
  Brain,
  Check,
  ChevronDown,
  Cpu,
  ExternalLink,
  FileCode,
  Globe,
  KeyRound,
  Layers,
  Search,
  Server,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { PROVIDERS, LAUNCH_URL, GITHUB_URL, type AplxProvider } from "@/components/aplx/data";
import {
  GlassPanel,
  LaunchButton,
  GithubButton,
  InstallWebsiteButton,
  PreviewButton,
  Navbar,
  SectionHeading,
  openLink,
  PREVIEW_URL,
} from "@/components/aplx/ui";
import { DownloadChart, RunChart, SetupChart, AdsChart, SpendChart } from "@/components/aplx/CostCharts";
import { DJProvider, DJOverlay, useDJ } from "@/components/aplx/DJMode";
import { ScrollFade } from "@/components/aplx/scroll";

/* ----------------------------- provider icons ---------------------------- */

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

      <Navbar />
      <DJOverlay />

      <main
        className="relative z-10 transition-opacity duration-500"
        style={{ opacity: djActive ? 0 : 1, pointerEvents: djActive ? "none" : "auto" }}
      >
        <Hero />
        <FreeForever />
        <DockFeatures />
        <ProviderCatalog />
        <OpenSource />
        <NanoModel />
        <Credits />
        <FinalCta />
        <Footer />
      </main>
    </div>
  );
}

/* ============================================================ HERO */

function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-24 pt-32"
    >
      <ScrollFade className="w-full" distance={32}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto w-full max-w-4xl text-center"
        >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-neutral-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          APLX version: V2
          <span className="text-white/20">|</span>
          <span className="text-emerald-400">Free forever · 0 ads</span>
        </div>

        <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          Your AI. One dock.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
          APLX Dock unifies 11+ AI providers, their models, and your own API keys
          behind a single, clean interface. Bring your keys, run your agents —
          free to use, free to download, with zero ads.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <LaunchButton />
          <GithubButton />
          <InstallWebsiteButton />
          <PreviewButton />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-neutral-500">
          {["11+ providers", "$0 forever", "0 ads", "Open source", "1M-param Nano"].map((s) => (
            <span key={s} className="inline-flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-400/80" />
              {s}
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
          className="mx-auto mt-16 w-full max-w-4xl"
        >
          <ProductShot />
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
        <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="mx-auto flex items-center gap-2 rounded-md border border-white/[0.07] bg-black/40 px-3 py-1 text-[11px] text-neutral-500">
          <Shield className="h-3 w-3 text-emerald-400/70" />
          aplx.app/dock
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

/* ============================================================ FREE FOREVER */

const STATS = [
  { value: "$0", label: "Cost to download" },
  { value: "$0", label: "Cost to run" },
  { value: "2 min", label: "Setup time" },
  { value: "0", label: "Ads, forever" },
];

function FreeForever() {
  return (
    <section id="free" className="relative border-t border-white/[0.06] px-6 py-28 sm:py-32">
      <ScrollFade distance={24}>
        <SectionHeading
          kicker="Pricing"
          title="APLX V2 is completely free."
          subtitle="APLX is the dock that runs your AI — it costs nothing to download, nothing to run, and gets you set up in a couple of minutes. No subscription, no paywall, no ads."
        />
      </ScrollFade>

      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <ScrollFade key={s.label} delay={i * 0.06}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="font-display text-3xl font-bold tracking-tight text-emerald-400 sm:text-4xl">
                {s.value}
              </div>
              <p className="mt-1 text-[13px] text-neutral-400">{s.label}</p>
            </div>
          </ScrollFade>
        ))}
      </div>

      <ScrollFade className="mx-auto mt-6 grid max-w-5xl gap-4 lg:grid-cols-2">
        <ChartPanel
          title="Cost to download"
          caption="One-time price to get the software (USD)"
        >
          <DownloadChart />
        </ChartPanel>
        <ChartPanel
          title="Cost to run"
          caption="Monthly cost to keep the dock running (USD / month)"
        >
          <RunChart />
        </ChartPanel>
      </ScrollFade>

      <ScrollFade className="mx-auto mt-4 grid max-w-5xl gap-4 lg:grid-cols-2">
        <ChartPanel
          title="Setup time"
          caption="From download to first run — lower is easier (minutes)"
        >
          <SetupChart />
        </ChartPanel>
        <ChartPanel
          title="Ads served"
          caption="Average ads shown per session across free tools"
        >
          <AdsChart />
        </ChartPanel>
      </ScrollFade>

      <ScrollFade className="mx-auto mt-4 max-w-5xl">
        <ChartPanel
          title="12-month spend"
          caption="What running your AI costs over a year with APLX Dock versus a typical paid setup"
        >
          <SpendChart />
        </ChartPanel>
      </ScrollFade>

      <ScrollFade className="mx-auto mt-6 max-w-2xl">
        <p className="text-center text-[13px] text-neutral-500">
          You only ever pay your own model provider for usage — APLX itself adds no
          fee, no markup, and never shows an ad.
        </p>
      </ScrollFade>
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
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-[12px] text-neutral-500">{caption}</p>
        </div>
        <span className="shrink-0 rounded-md border border-emerald-400/20 bg-emerald-400/[0.08] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
          APLX Dock $0
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
      title: "Multiple providers",
      body: "Connect 11+ AI providers through a single, unified hub.",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Multiple models",
      body: "Browse and switch between models without leaving the platform.",
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
    <section id="dock" className="relative border-t border-white/[0.06] px-6 py-28 sm:py-32">
      <ScrollFade distance={24}>
        <SectionHeading
          kicker="The Dock"
          title="Everything docks here."
          subtitle="One interface to plug in your API keys, browse the catalog, and run agents across any supported provider."
        />
      </ScrollFade>

      <div className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <ScrollFade key={f.title} delay={i * 0.05} className="h-full">
            <GlassPanel className="h-full p-6 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.04]">
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

  const modelCount = PROVIDERS.reduce((n, p) => n + p.models.length, 0);

  return (
    <section id="catalog" className="relative border-t border-white/[0.06] px-6 py-28 sm:py-32">
      <ScrollFade distance={24}>
        <SectionHeading
          kicker="Provider Catalog"
          title="Browse every docked provider."
          subtitle="Search the catalog to discover available providers, models, and integrations — then launch directly into the dock."
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
          <p className="text-center text-xs text-neutral-600">
            {filtered.length} provider{filtered.length !== 1 && "s"} · {modelCount} models available
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
  provider: AplxProvider;
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
            <h4 className="font-display text-sm font-semibold text-white">{provider.name}</h4>
            <p className="text-[11px] text-neutral-500">
              {provider.models.length} model{provider.models.length !== 1 && "s"}
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
    <section id="source" className="relative border-t border-white/[0.06] px-6 py-28 sm:py-32">
      <ScrollFade distance={24}>
        <SectionHeading
          kicker="Open Source"
          title="Open by design."
          subtitle="Built for transparency, experimentation, and community contribution."
        />
      </ScrollFade>

      <ScrollFade className="mx-auto mt-14 grid max-w-5xl items-start gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-base leading-relaxed text-neutral-400">
            APLX Dock is fully open source. Every integration, routing layer, and
            agent pipeline is inspectable — designed so teams can self-host,
            customize provider routing, and extend the platform without vendor
            lock-in.
          </p>
          <p className="text-base leading-relaxed text-neutral-400">
            Fork the repository, build custom provider stacks, or contribute
            upstream. The dock is maintained as a public project and shaped by the
            people who use it.
          </p>
          <GithubButton label="Explore the source" className="mt-2" />
        </div>

        <GlassPanel className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.015] px-5 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="ml-2 text-[11px] font-medium text-neutral-500">source-core</span>
          </div>
          <div className="space-y-2 px-5 py-4 font-mono text-[13px] text-neutral-400">
            {[
              "aplx-dock/",
              "├─ providers/        # 11 provider integrations",
              "├─ agents/           # agent runner pipelines",
              "├─ keys/             # secure key management",
              "├─ catalog/          # model catalog & routing",
              "├─ nano/             # 1M-param local model",
              "└─ web/              # unified dock interface",
            ].map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-white/[0.07] bg-white/[0.015] px-5 py-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-neutral-500">MIT License — free for everyone</span>
          </div>
        </GlassPanel>
      </ScrollFade>
    </section>
  );
}

/* ============================================================ NANO MODEL */

function NanoModel() {
  const facts = [
    { k: "Parameters", v: "1 M" },
    { k: "Runs", v: "Locally" },
    { k: "Cost", v: "$0" },
    { k: "Footprint", v: "Tiny" },
  ];
  return (
    <section id="nano" className="relative border-t border-white/[0.06] px-6 py-28 sm:py-32">
      <ScrollFade distance={24}>
        <SectionHeading
          kicker="APLX Nano"
          title="Tiny model. Zero cost."
          subtitle="A lightweight 1M-parameter model built into the dock for local inference and experimentation."
        />
      </ScrollFade>

      <ScrollFade className="mx-auto mt-14 grid max-w-5xl items-center gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-base leading-relaxed text-neutral-400">
            APLX Dock ships with its own Nano Model — a compact, 1M-parameter
            local component designed for low-latency tasks and offline
            experimentation. It sits alongside the full provider ecosystem,
            giving you a lightweight option when speed and footprint matter more
            than raw capability.
          </p>
          <p className="text-base leading-relaxed text-neutral-400">
            Because it runs locally, the Nano model costs nothing to run and
            works without a connection.
          </p>
        </div>

        <GlassPanel className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-emerald-400">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-white">Aplx Nano</p>
              <p className="text-[11px] text-neutral-500">Local inference component</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {facts.map((f) => (
              <div key={f.k} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                <p className="text-[11px] text-neutral-500">{f.k}</p>
                <p className="mt-0.5 font-display text-lg font-semibold text-white">{f.v}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </ScrollFade>
    </section>
  );
}

/* ============================================================ CREDITS */

function Credits() {
  const tools = [
    "Claude Opus",
    "Sonnet 4.6",
    "Haiku 4.5",
    "GPT-5.6",
    "GPT-4",
    "Gemini 3.7",
    "Gemini 3.1 Pro",
    "GitHub Copilot",
    "Ollama",
  ];
  return (
    <section className="relative border-t border-white/[0.06] px-6 py-28 sm:py-32">
      <ScrollFade distance={24}>
        <SectionHeading
          kicker="Credits"
          title="Built by a 15-year-old."
          subtitle="APLX Dock is an ongoing project by R3nz — developed with the help of AI and the open-source community."
        />
      </ScrollFade>

      <ScrollFade className="mx-auto mt-14 max-w-3xl">
        <GlassPanel className="p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] font-display text-base font-bold text-white">
              R3
            </div>
            <div>
              <h4 className="font-display text-base font-semibold text-white">
                R3nz <span className="font-normal text-neutral-500">— Developer</span>
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                APLX Dock is a solo project by a 15-year-old developer, built out
                of genuine curiosity about what a unified AI dock could look like.
                It is still actively under development — new providers, models,
                and features are being added regularly.
              </p>
            </div>
          </div>

          <div className="my-6 h-px w-full bg-white/[0.07]" />

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-white">Built with</h4>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-neutral-300"
                >
                  {tool}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              …and many more tools, models, and community contributions.
            </p>
          </div>
        </GlassPanel>
      </ScrollFade>
    </section>
  );
}

/* ============================================================ FINAL CTA */

function FinalCta() {
  return (
    <section className="relative border-t border-white/[0.06] px-6 py-28 text-center sm:py-32">
      <ScrollFade className="mx-auto max-w-xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Everything you need. One dock.
        </h2>
        <p className="mt-4 text-base text-neutral-400">
          Free to use. Free to download. Zero ads.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LaunchButton />
          <GithubButton label="Explore the source" />
          <InstallWebsiteButton />
          <PreviewButton />
        </div>
      </ScrollFade>
    </section>
  );
}

/* ============================================================ FOOTER */

function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[11px] font-bold text-black">
            A
          </span>
          <span className="font-display text-sm font-medium tracking-tight text-neutral-400">
            APLX V2 · free forever
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-500">
          <button onClick={() => openLink(LAUNCH_URL)} className="transition-colors hover:text-white">
            Launch
          </button>
          <button onClick={() => openLink(GITHUB_URL)} className="transition-colors hover:text-white">
            GitHub
          </button>
          <button onClick={() => openLink(PREVIEW_URL)} className="transition-colors hover:text-white">
            Preview updates
          </button>
          <a href="#free" className="transition-colors hover:text-white">
            Pricing
          </a>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
