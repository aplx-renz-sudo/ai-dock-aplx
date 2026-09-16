import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Menu, Music, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GITHUB_URL, LAUNCH_URL } from "./data";
import { useExplosion } from "./ExplosionContext";
import { useDJ } from "./DJMode";

const EXPLOSION_WAIT_MS = 1500;

/* ---- explosive link: triggers 3-D star burst, then opens link ---- */

function useNavigateAfterExplosion() {
  const trigger = useExplosion();
  const busy = useRef(false);

  const navigate = useCallback(
    (href: string, target = "_blank") => {
      if (busy.current) return;
      busy.current = true;
      trigger();
      setTimeout(() => {
        window.open(href, target, "noopener,noreferrer");
        busy.current = false;
      }, EXPLOSION_WAIT_MS);
    },
    [trigger],
  );
  return navigate;
}

/* --------------------------------- buttons -------------------------------- */

export function LaunchButton({ className }: { className?: string }) {
  const go = useNavigateAfterExplosion();
  return (
    <button
      onClick={() => go(LAUNCH_URL)}
      className={cn(
        "group pointer-events-auto inline-flex items-center gap-2 rounded-full px-7 py-3.5",
        "bg-white text-slate-950 font-semibold tracking-wide",
        "shadow-[0_0_28px_rgba(125,211,252,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]",
        "transition-all duration-300 hover:shadow-[0_0_44px_rgba(125,211,252,0.55)] hover:-translate-y-0.5",
        className,
      )}
    >
      Launch Aplx
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}

export function GithubButton({
  label = "View on GitHub",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const go = useNavigateAfterExplosion();
  return (
    <button
      onClick={() => go(GITHUB_URL)}
      className={cn(
        "group pointer-events-auto inline-flex items-center gap-2 rounded-full px-7 py-3.5",
        "border border-white/20 bg-white/[0.08] backdrop-blur-xl font-medium tracking-wide text-slate-100",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
        "transition-all duration-300 hover:bg-white/[0.16] hover:border-white/35 hover:-translate-y-0.5",
        className,
      )}
    >
      <Github className="h-4 w-4" />
      {label}
      <ExternalLink className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

const INSTALL_WEBSITE_URL = "https://github.com/aplx-renz-sudo/Aplx-Website";
const PREVIEW_URL = "https://aplx-preview.vercel.app/";

export function InstallWebsiteButton({ className }: { className?: string }) {
  const go = useNavigateAfterExplosion();
  return (
    <button
      onClick={() => go(INSTALL_WEBSITE_URL)}
      className={cn(
        "group pointer-events-auto inline-flex items-center gap-2 rounded-full px-6 py-3",
        "border border-cyan-400/30 bg-cyan-500/[0.1] backdrop-blur-xl font-medium tracking-wide text-cyan-200",
        "shadow-[inset_0_1px_0_rgba(34,211,238,0.15)]",
        "transition-all duration-300 hover:bg-cyan-500/[0.2] hover:border-cyan-400/50 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(34,211,238,0.2)]",
        className,
      )}
    >
      Install Website
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}

export function PreviewButton({ className }: { className?: string }) {
  const go = useNavigateAfterExplosion();
  return (
    <button
      onClick={() => go(PREVIEW_URL)}
      className={cn(
        "group pointer-events-auto inline-flex items-center gap-2 rounded-full px-6 py-3",
        "border border-violet-400/30 bg-violet-500/[0.1] backdrop-blur-xl font-medium tracking-wide text-violet-200",
        "shadow-[inset_0_1px_0_rgba(196,181,253,0.15)]",
        "transition-all duration-300 hover:bg-violet-500/[0.2] hover:border-violet-400/50 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(196,181,253,0.2)]",
        className,
      )}
    >
      Preview the new updates
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}

/* ------------------------------- glass panel ------------------------------- */

export function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/15 backdrop-blur-xl",
        "bg-gradient-to-br from-white/[0.13] to-white/[0.05]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_48px_rgba(2,6,23,0.5)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------- section heading ---------------------------- */

export function SectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mx-auto max-w-2xl text-center"
    >
      {kicker && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-slate-300/90 sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* --------------------------------- navbar --------------------------------- */

const NAV_LINKS = [
  { label: "Dock", href: "#dock" },
  { label: "Catalog", href: "#catalog" },
  { label: "Nano", href: "#nano" },
  { label: "Open Source", href: "#source" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const go = useNavigateAfterExplosion();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="pointer-events-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-2 rounded-full border border-white/15 bg-white/[0.09] px-4 py-2.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_36px_rgba(2,6,23,0.5)] sm:px-5">
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-[0.22em] text-white"
          >
            APLX
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <DJNavButton />
            <button
              onClick={() => go(LAUNCH_URL)}
              className="hidden rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-slate-950 transition-shadow hover:shadow-[0_0_24px_rgba(125,211,252,0.5)] sm:inline-flex"
            >
              Launch
            </button>
            <button
              onClick={() => go(GITHUB_URL)}
              aria-label="GitHub repository"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-slate-200 transition-colors hover:bg-white/10"
            >
              <Github className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-slate-200 transition-colors hover:bg-white/10 md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.09] backdrop-blur-xl shadow-[0_18px_48px_rgba(2,6,23,0.6)] md:hidden">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block border-b border-white/[0.06] px-5 py-3 text-sm text-slate-200 last:border-0 hover:bg-white/10"
              >
                {l.label}
              </a>
            ))}
            <MobileDJButton onClose={() => setOpen(false)} />
            <button
              onClick={() => { setOpen(false); go(LAUNCH_URL); }}
              className="block w-full px-5 py-3 text-left text-sm font-semibold text-cyan-300 hover:bg-white/10"
            >
              Launch Aplx →
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

/* -------------------------------- DJ button ------------------------------- */

interface DJNavButtonProps {
  onClose?: () => void;
}

function DJNavButtonBase({ onClose, className }: DJNavButtonProps & { className?: string }) {
  const { active, startDJ, stopDJ } = useDJ();
  const trigger = useExplosion();
  const busy = useRef(false);

  const handleClick = useCallback(() => {
    if (busy.current) return;
    busy.current = true;

    if (!active) {
      // trigger explosion then activate DJ mode after delay
      trigger();
      setTimeout(() => {
        startDJ();
        busy.current = false;
      }, 1400);
    } else {
      stopDJ();
      busy.current = false;
    }
    onClose?.();
  }, [active, trigger, startDJ, stopDJ, onClose]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300",
        active
          ? "border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse"
          : "border border-white/15 bg-white/[0.06] text-slate-300 hover:bg-white/10 hover:border-violet-400/30 hover:text-violet-300",
        className,
      )}
      aria-label="Toggle DJ mode"
    >
      <Music className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">DJ</span>
    </button>
  );
}

function DJNavButton() {
  return <DJNavButtonBase />;
}

function MobileDJButton({ onClose }: { onClose: () => void }) {
  const { active, startDJ, stopDJ } = useDJ();
  const trigger = useExplosion();
  const busy = useRef(false);

  const handleClick = () => {
    if (busy.current) return;
    busy.current = true;
    if (!active) {
      trigger();
      setTimeout(() => {
        startDJ();
        busy.current = false;
      }, 1400);
    } else {
      stopDJ();
      busy.current = false;
    }
    onClose();
  };
  return (
    <button
      onClick={handleClick}
      className="block w-full border-b border-white/[0.06] px-5 py-3 text-left text-sm text-slate-200 last:border-0 hover:bg-white/10 md:hidden"
    >
      <span className="flex items-center gap-2">
        <Music className="h-4 w-4" />
        {active ? "Exit DJ Mode" : "Enter DJ Mode"}
      </span>
    </button>
  );
}
