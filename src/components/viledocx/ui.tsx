import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GITHUB_URL, LAUNCH_URL } from "./data";
import { ThemeSwitcher } from "./theme";
export const INSTALL_WEBSITE_URL = "https://github.com/aplx-renz-sudo/Aplx-Website";
export const PREVIEW_URL = "https://viledocx.ai.studio";

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
        "group inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium tracking-tight text-neutral-200",
        "transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.07] hover:text-white",
        className,
      )}
    >
      Launch VileDocx
      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
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
      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
    </button>
  );
}

export function PreviewButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => openLink(PREVIEW_URL)}
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold tracking-tight text-black",
        "transition-all duration-300 ease-out hover:bg-white/90",
        className,
      )}
    >
      LAUNCH HALLOWEEN VERSION
      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
    </button>
  );
}

/* -------------------------------- panels ---------------------------------- */

export function GlassPanel({
  children,
  className,
  tilt = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Adds a small pointer-tracked 3D rotation. Keep the angle low — this is
   *  depth, not a novelty. */
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Tilt is a pointer affordance. Touch devices get the flat card instead, so a
  // stray tap can never leave a panel stuck at an odd angle.
  const [tiltEnabled, setTiltEnabled] = useState(false);
  useEffect(() => {
    if (!tilt || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setTiltEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [tilt]);

  // A faint orange highlight that tracks the pointer across the panel, plus an
  // optional 3D tilt driven from the same coordinates.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--glow-x", `${x}px`);
    el.style.setProperty("--glow-y", `${y}px`);
    if (tiltEnabled) {
      el.style.setProperty("--rx", `${((y / rect.height) - 0.5) * -6}deg`);
      el.style.setProperty("--ry", `${((x / rect.width) - 0.5) * 6}deg`);
    }
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el || !tiltEnabled) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        tiltEnabled
          ? {
              transform:
                "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
              transition:
                "transform 450ms cubic-bezier(0.16,1,0.3,1), border-color 250ms ease, background-color 250ms ease",
            }
          : undefined
      }
      className={cn(
        "group/panel relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover/panel:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(249,115,22,0.10), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* --------------------------------- dots ----------------------------------- */

/**
 * A very faint dot grid that drifts diagonally. Purely decorative texture —
 * keep it masked and low-opacity so it reads as paper grain, not polka dots.
 */
export function DotField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 animate-[dot-drift_26s_linear_infinite]",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
        maskImage:
          "radial-gradient(ellipse 58% 52% at 50% 50%, #000 12%, transparent 72%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 58% 52% at 50% 50%, #000 12%, transparent 72%)",
      }}
    />
  );
}

/** A single row of dots that fades out toward both ends. */
export function DotRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-2 w-full", className)}
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1.5px)",
        backgroundSize: "8px 8px",
        maskImage:
          "linear-gradient(to right, transparent, #000 28%, #000 72%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 28%, #000 72%, transparent)",
      }}
    />
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
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        y: { type: "spring", stiffness: 110, damping: 22, mass: 0.9 },
        opacity: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        filter: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
      }}
      style={{ willChange: "transform, opacity, filter" }}
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
        transition={{
          scaleX: { type: "spring", stiffness: 70, damping: 18, mass: 0.8, delay: 0.15 },
          opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
        }}
        style={{ originX: align === "center" ? 0.5 : 0 }}
        className={cn(
          "mt-5 block h-px w-20 bg-gradient-to-r from-orange-400/0 via-orange-400 to-orange-400/0",
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
  { label: "Dock", href: "#dock" },
  { label: "Catalog", href: "#catalog" },
  { label: "Cost", href: "#free" },
  { label: "Nano", href: "#nano" },
  { label: "Source", href: "#source" },
];

/* True once the page has been scrolled past `threshold` px. */
export function useScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

/* Shared motion curve so the banner + header move as one piece. */
const HEADER_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export function RenameBanner() {
  const scrolled = useScrolled();

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-[60] h-8 border-b border-white/[0.06] bg-black/90 backdrop-blur-xl transition-all duration-500 motion-reduce:transition-none",
        HEADER_EASE,
        scrolled && "-translate-y-full opacity-0",
      )}
    >
      <div className="mx-auto flex h-8 w-full max-w-6xl items-center justify-center px-5 text-[11px] tracking-tight text-neutral-500 sm:text-[12px]">
        <span>
          APLX has been renamed to{" "}
          <span className="font-medium text-neutral-300">VileDocx</span>
        </span>
      </div>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "pointer-events-auto mx-auto w-full transition-all duration-500 motion-reduce:transition-none",
          HEADER_EASE,
          scrolled
            ? "mt-3 max-w-4xl px-3 sm:px-4"
            : "mt-8 max-w-6xl px-0",
        )}
      >
        <nav
          className={cn(
            "relative flex items-center justify-between transition-all duration-500 motion-reduce:transition-none",
            HEADER_EASE,
            scrolled
              ? "h-12 rounded-full border border-white/15 bg-white/[0.06] bg-gradient-to-b from-white/[0.12] to-white/[0.02] px-2.5 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-150"
              : "h-16 rounded-none border-b border-white/[0.06] bg-black/70 px-5 backdrop-blur-xl",
          )}
        >
          {/* frosted sheen — only visible once the bar condenses into the pill */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent transition-opacity duration-500",
              scrolled ? "opacity-100" : "opacity-0",
            )}
          />

          <a href="#top" className="relative flex items-center gap-2.5">
            <span
              className={cn(
                "flex items-center justify-center rounded-md bg-white font-bold text-black transition-all duration-500",
                HEADER_EASE,
                scrolled ? "h-6 w-6 text-[11px]" : "h-7 w-7 text-[13px]",
              )}
            >
              V
            </span>
            <span
              className={cn(
                "font-display font-semibold tracking-tight text-white transition-all duration-500",
                HEADER_EASE,
                scrolled ? "text-[14px]" : "text-[15px]",
              )}
            >
              VileDocx
            </span>
          </a>

          <div className="relative hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full text-[13px] text-neutral-400 transition-colors hover:text-white",
                  scrolled ? "px-3 py-1" : "px-3 py-1.5",
                )}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="relative flex items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => openLink(GITHUB_URL)}
              aria-label="GitHub repository"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
            >
              <Github className="h-4 w-4" />
            </button>
            <button
              onClick={() => openLink(LAUNCH_URL)}
              className="hidden rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-black transition-colors hover:bg-white/90 sm:inline-flex"
            >
              Launch
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-neutral-300 transition-colors hover:text-white md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {open && (
          <div
            className={cn(
              "overflow-hidden border border-white/10 bg-black/85 backdrop-blur-2xl md:hidden",
              scrolled
                ? "mt-2 rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
                : "mt-0 rounded-b-2xl border-t-0",
            )}
          >
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
            <button
              onClick={() => {
                setOpen(false);
                openLink(LAUNCH_URL);
              }}
              className="block w-full px-5 py-3 text-left text-sm font-semibold text-white"
            >
              Launch VileDocx →
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
