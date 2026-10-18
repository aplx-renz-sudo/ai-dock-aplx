import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  Hammer,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GITHUB_URL } from "./data";
import {
  GithubButton,
  InstallWebsiteButton,
  LaunchButton,
  PreviewButton,
  openLink,
} from "./ui";
import { TRENCH_URL } from "@/components/trench/data";
import { TrenchSite } from "@/components/trench/TrenchSite";

export { TRENCH_URL };
export const TRENCH_STATUS = "T01 still under construction, release soon";

/**
 * A full page that wraps the landing page: it opens over everything, keeps the
 * page behind it in place, and closes with the Back button, the X, or Escape.
 */
export function SubProductsOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [trenchOpen, setTrenchOpen] = useState(false);
  const openSiteRef = useRef<HTMLButtonElement>(null);

  // Closing this page also drops the site stacked on top of it.
  const closePage = () => {
    setTrenchOpen(false);
    onClose();
  };

  // Stable so the TRENCH site's open/close effect doesn't re-run on renders.
  const closeTrench = useCallback(() => {
    setTrenchOpen(false);
    window.setTimeout(() => openSiteRef.current?.focus(), 30);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      // The TRENCH site has its own Escape handler; don't close both layers.
      if (event.key === "Escape" && !trenchOpen) onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Hold the landing page still while the wrapper is up.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, trenchOpen]);

  // Portalled to <body> so the landing page's overflow clipping and stacking
  // order can never cut the wrapper off.
  return createPortal(
    <>
      <AnimatePresence>
        {open && (
        <motion.div
          key="sub-products"
          role="dialog"
          aria-modal="true"
          aria-label="Sub products of VileDocx"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-2xl"
        >
          {/* warm wash so the wrapper still belongs to the landing page */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251, 146, 60, 0.16), transparent 70%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-5xl px-5 pb-20 pt-6 sm:px-8 sm:pt-8"
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closePage}
                autoFocus
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-neutral-200 backdrop-blur-xl transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Back
              </button>
              <button
                type="button"
                onClick={closePage}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-neutral-300 transition-colors hover:border-white/30 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <header className="mt-10 max-w-2xl sm:mt-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-400/80">
                The VileDocx family
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Sub products of VileDocx
              </h1>
              <p className="mt-4 text-base leading-relaxed text-neutral-400">
                Everything built under the same roof — the dock you launch, and
                the tools still on the workbench.
              </p>
            </header>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {/* ------------------------------ VileDocx ------------------------------ */}
              <article className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-colors duration-300 hover:border-white/20 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[15px] font-bold text-black">
                      V
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-semibold tracking-tight text-white">
                        VileDocx
                      </h2>
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-500">
                        V01 — the dock
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>

                <p className="mt-5 text-[13px] leading-relaxed text-neutral-400">
                  Every major provider, their models and your own keys in one
                  interface. Free to use and download, zero ads, no markup.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <PreviewButton className="px-4 py-2 text-[13px]" />
                  <LaunchButton className="px-4 py-2 text-[13px]" />
                  <GithubButton label="GitHub" className="px-4 py-2 text-[13px]" />
                  <InstallWebsiteButton className="px-4 py-2 text-[13px]" />
                </div>

                <p className="mt-auto pt-6 text-[11px] font-mono tracking-tight text-neutral-600">
                  {GITHUB_URL.replace("https://", "github.com/")}
                </p>
              </article>

              {/* ------------------------------- Trench ------------------------------- */}
              <article className="flex flex-col rounded-2xl border border-amber-400/20 bg-amber-400/[0.03] p-5 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-colors duration-300 hover:border-amber-300/35 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/15 text-[15px] font-bold text-amber-300">
                      T
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-semibold tracking-tight text-white">
                        Trench
                      </h2>
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-500">
                        T01 — in the works
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Soon
                  </span>
                </div>

                <p className="mt-5 text-[13px] leading-relaxed text-neutral-400">
                  The next tool out of the VileDocx workshop. Built in the open
                  on GitHub, shipped when it is actually ready.
                </p>

                <p className="mt-5 inline-flex items-center gap-2 self-start rounded-lg border border-amber-400/25 bg-amber-400/[0.07] px-3 py-2 text-[12px] font-semibold tracking-tight text-amber-300">
                  <Hammer className="h-3.5 w-3.5" />
                  {TRENCH_STATUS}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    ref={openSiteRef}
                    onClick={() => setTrenchOpen(true)}
                    aria-haspopup="dialog"
                    className="group inline-flex items-center gap-2 rounded-lg bg-[#3ad3e3] px-4 py-2 text-[13px] font-semibold tracking-tight text-[#04181c] transition-colors duration-200 hover:bg-[#6ee6f2]"
                  >
                    Open site
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openLink(TRENCH_URL)}
                    className={cn(
                      "group inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2 text-[13px] font-medium tracking-tight text-neutral-200",
                      "transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.07] hover:text-white",
                    )}
                  >
                    <Github className="h-3.5 w-3.5" />
                    View on GitHub
                    <ExternalLink className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-90" />
                  </button>
                </div>

                <p className="mt-auto pt-6 text-[11px] font-mono tracking-tight text-neutral-600">
                  {TRENCH_URL.replace("https://", "")}
                </p>
              </article>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* The TRENCH site stacks on top of this page. */}
      <TrenchSite open={open && trenchOpen} onClose={closeTrench} />
    </>,
    document.body,
  );
}

