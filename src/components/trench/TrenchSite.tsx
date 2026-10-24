import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Github, Menu, X } from "lucide-react";
import { ScrollBlurLayer } from "@/components/scroll-blur";
import { useSmoothScroll } from "@/components/smooth-scroll";
import "./trench.css";
import {
  NAV_LINKS,
  TRENCH_DOCS_URL,
  TRENCH_URL,
  VERSION_LABEL,
  VILEDOCX_URL,
} from "./data";
import {
  Ecosystem,
  Faq,
  Features,
  GettingStarted,
  Hero,
  Providers,
  TerminalPreview,
  TrenchFooter,
  WhaleMark,
} from "./sections";

const FOCUSABLE =
  'a[href], button:not([disabled]), summary, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The full TRENCH site, mounted over the sub-products page (which itself sits
 * over the VileDocx landing page). Portal + scroll lock + Escape + focus trap.
 */
export function TrenchSite({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousTitle = document.title;
    document.title = "TRENCH — Terminal-native AI coding agent";

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    overlayRef.current?.scrollTo({ top: 0 });
    const focusTimer = window.setTimeout(() => backRef.current?.focus(), 40);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !overlayRef.current) return;

      const nodes = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => node.offsetParent !== null || node === document.activeElement);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.title = previousTitle;
    };
  }, [open, onClose]);

  const scrollToSection = useCallback(
    (id: string) => {
      setMenuOpen(false);
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [reduceMotion],
  );

  // The overlay scrolls itself, so it gets its own eased wheel.
  useSmoothScroll(overlayRef, open);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="trench-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="TRENCH — terminal-native AI coding agent"
    >
      {/* Only the page body smears: the utility bar and nav sit above it. */}
      <ScrollBlurLayer container={overlayRef} zIndex={15} maxBlur={1.8} />

      <div className="trench-site">
        <button
          type="button"
          className="trench-skip"
          onClick={() => mainRef.current?.focus()}
        >
          Skip to content
        </button>

        <div className="tr-util">
          <div className="tr-util-inner">
            <button
              ref={backRef}
              type="button"
              className="tr-back"
              onClick={onClose}
            >
              <ArrowLeft size={13} />
              Back
            </button>
            <div className="tr-util-right">
              <span>{VERSION_LABEL}</span>
              <button
                type="button"
                className="tr-util-close"
                onClick={onClose}
                aria-label="Close TRENCH site"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        <header className="tr-nav">
          <div className="tr-nav-inner">
            <button
              type="button"
              className="tr-brand"
              onClick={() => scrollToSection("trench-top")}
              aria-label="TRENCH — back to top"
            >
              <span className="tr-mark">
                <WhaleMark />
              </span>
              <span className="tr-wordmark">
                <span className="tr-word">TRENCH</span>
                <span className="tr-word-sub">terminal-native AI</span>
              </span>
            </button>

            <nav className="tr-nav-links" aria-label="TRENCH sections">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.target}
                  type="button"
                  className="tr-nav-link"
                  onClick={() => scrollToSection(link.target)}
                >
                  {link.label}
                </button>
              ))}
              <a
                href={TRENCH_DOCS_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="tr-nav-link"
              >
                Documentation
              </a>
            </nav>

            <div className="tr-nav-meta">
              <a
                href={VILEDOCX_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="tr-parent"
              >
                <span className="tr-parent-dot" aria-hidden />
                Part of VileDocx
              </a>
              <a
                href={TRENCH_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="tr-btn tr-btn-ghost tr-btn-sm"
              >
                <Github size={13} />
                GitHub
                <ArrowUpRight size={12} />
              </a>
              <button
                type="button"
                className="tr-burger"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((value) => !value)}
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          <div className="tr-mobile-menu" data-open={menuOpen}>
            {NAV_LINKS.map((link) => (
              <button
                key={link.target}
                type="button"
                className="tr-mobile-link"
                onClick={() => scrollToSection(link.target)}
              >
                {link.label}
              </button>
            ))}
            <a
              href={TRENCH_DOCS_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="tr-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              Documentation
            </a>
            <a
              href={TRENCH_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="tr-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              GitHub repository
            </a>
            <a
              href={VILEDOCX_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="tr-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              Part of VileDocx
            </a>
          </div>
        </header>

        <main ref={mainRef} tabIndex={-1}>
          <Hero onScrollTo={scrollToSection} />
          <TerminalPreview />
          <Features />
          <Providers />
          <GettingStarted />
          <Ecosystem />
          <Faq />
        </main>

        <TrenchFooter onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
