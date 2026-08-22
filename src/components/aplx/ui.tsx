import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GITHUB_URL, LAUNCH_URL } from "./data";

/* --------------------------------- buttons -------------------------------- */

export function LaunchButton({ className }: { className?: string }) {
  return (
    <a
      href={LAUNCH_URL}
      target="_blank"
      rel="noopener noreferrer"
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
    </a>
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
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
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
    </a>
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
            <a
              href={LAUNCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-slate-950 transition-shadow hover:shadow-[0_0_24px_rgba(125,211,252,0.5)] sm:inline-flex"
            >
              Launch
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-slate-200 transition-colors hover:bg-white/10"
            >
              <Github className="h-4 w-4" />
            </a>
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
            <a
              href={LAUNCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-white/10"
            >
              Launch Aplx →
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
