import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Menu, Music, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GITHUB_URL, LAUNCH_URL } from "./data";
import { useDJ } from "./DJMode";

export const INSTALL_WEBSITE_URL = "https://github.com/aplx-renz-sudo/Aplx-Website";
export const PREVIEW_URL = "https://aplx-preview.vercel.app/";

/* Buttons open their destination immediately — no effects, no delay. */
export function openLink(href: string, target = "_blank") {
  window.open(href, target, "noopener,noreferrer");
}

/* --------------------------------- buttons -------------------------------- */

export function LaunchButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => openLink(LAUNCH_URL)}
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold tracking-tight text-black",
        "transition-colors duration-200 hover:bg-white/90",
        className,
      )}
    >
      Launch Aplx
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
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
  return (
    <button
      onClick={() => openLink(GITHUB_URL)}
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium tracking-tight text-neutral-200",
        "transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.07] hover:text-white",
        className,
      )}
    >
      <Github className="h-4 w-4" />
      {label}
      <ExternalLink className="h-3.5 w-3.5 opacity-50 transition-opacity group-hover:opacity-90" />
    </button>
  );
}

export function InstallWebsiteButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => openLink(INSTALL_WEBSITE_URL)}
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium tracking-tight text-neutral-200",
        "transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.07] hover:text-white",
        className,
      )}
    >
      Install Website
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}

export function PreviewButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => openLink(PREVIEW_URL)}
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium tracking-tight text-neutral-200",
        "transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.07] hover:text-white",
        className,
      )}
    >
      Preview updates
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}

/* -------------------------------- panels ---------------------------------- */

export function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // A faint emerald highlight that tracks the pointer across the panel.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "group/panel relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/panel:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(52,211,153,0.10), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ----------------------------- section heading ---------------------------- */

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "center",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}
    >
      {kicker && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: false, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className={cn(
          "mt-5 block h-px w-20 bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0",
          align === "center" ? "mx-auto" : "origin-left",
        )}
      />
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-neutral-400 sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* --------------------------------- navbar --------------------------------- */

const NAV_LINKS = [
  { label: "Free", href: "#free" },
  { label: "Dock", href: "#dock" },
  { label: "Catalog", href: "#catalog" },
  { label: "Nano", href: "#nano" },
  { label: "Open Source", href: "#source" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[13px] font-bold text-black">
            A
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-white">
            APLX
            <span className="ml-1.5 text-[11px] font-medium text-white/40">V2</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-[13px] text-neutral-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <DJNavButton />
          <button
            onClick={() => openLink(GITHUB_URL)}
            aria-label="GitHub repository"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <Github className="h-4 w-4" />
          </button>
          <button
            onClick={() => openLink(LAUNCH_URL)}
            className="hidden rounded-md bg-white px-3.5 py-1.5 text-[13px] font-semibold text-black transition-colors hover:bg-white/90 sm:inline-flex"
          >
            Launch
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-neutral-300 transition-colors hover:text-white md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/[0.06] bg-black/95 md:hidden">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-white/[0.05] px-5 py-3 text-sm text-neutral-300 hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <MobileDJButton onClose={() => setOpen(false)} />
          <button
            onClick={() => {
              setOpen(false);
              openLink(LAUNCH_URL);
            }}
            className="block w-full px-5 py-3 text-left text-sm font-semibold text-white"
          >
            Launch Aplx →
          </button>
        </div>
      )}
    </header>
  );
}

/* -------------------------------- DJ button ------------------------------- */

function DJNavButton() {
  const { active, startDJ, stopDJ } = useDJ();
  return (
    <button
      onClick={() => (active ? stopDJ() : startDJ())}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-semibold tracking-tight transition-colors",
        active
          ? "border-white/25 bg-white/10 text-white"
          : "border-white/10 text-neutral-300 hover:border-white/25 hover:text-white",
      )}
      aria-label="Toggle DJ mode"
    >
      <Music className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">DJ</span>
    </button>
  );
}

function MobileDJButton({ onClose }: { onClose: () => void }) {
  const { active, startDJ, stopDJ } = useDJ();
  return (
    <button
      onClick={() => {
        active ? stopDJ() : startDJ();
        onClose();
      }}
      className="block w-full border-b border-white/[0.05] px-5 py-3 text-left text-sm text-neutral-300 hover:text-white md:hidden"
    >
      <span className="flex items-center gap-2">
        <Music className="h-4 w-4" />
        {active ? "Exit DJ Mode" : "Enter DJ Mode"}
      </span>
    </button>
  );
}
