import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Scroll speed (px per ms) that maps to the full blur strength. */
const FULL_SPEED = 2.6;
/** How long the page may sit still before the blur decays away. */
const IDLE_AFTER = 80;
/** Per-frame easing of the applied blur towards the target. */
const EASE = 0.22;

/**
 * A passive, viewport-sized layer whose backdrop blur follows scroll velocity.
 *
 * Fast flicks smear the page slightly; normal reading speed stays crisp; the
 * filter is removed entirely once the page settles, so nothing keeps a blurred
 * layer alive while idle. It blurs what is painted beneath it only — anything
 * with a higher z-index (the sticky nav, overlays) stays sharp.
 */
export function ScrollBlurLayer({
  container,
  zIndex = 40,
  maxBlur = 3,
  className,
}: {
  /** Scroll container. Window scrolling is used when omitted. */
  container?: React.RefObject<HTMLElement | null>;
  zIndex?: number;
  maxBlur?: number;
  className?: string;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const layer = layerRef.current;
    if (!layer) return;

    const scroller = container?.current ?? null;
    const target: HTMLElement | Window = scroller ?? window;
    const readScroll = () => (scroller ? scroller.scrollTop : window.scrollY);

    let lastY = readScroll();
    let lastAt = performance.now();
    let desired = 0;
    let applied = 0;
    let frame = 0;
    let idleTimer = 0;

    const write = (px: number) => {
      // Removing the declaration (rather than blur(0px)) lets the browser drop
      // the layer completely once the scroll has settled.
      const value = px < 0.08 ? "" : `blur(${px.toFixed(2)}px)`;
      layer.style.setProperty("-webkit-backdrop-filter", value);
      layer.style.setProperty("backdrop-filter", value);
    };

    const tick = () => {
      frame = 0;
      applied += (desired - applied) * EASE;
      if (Math.abs(desired - applied) < 0.03) applied = desired;

      // Below the perceptual threshold the filter is dropped; stop the loop
      // instead of writing an invisible blur every frame.
      if (applied < 0.08) {
        applied = 0;
        write(0);
        if (desired === 0) return;
      } else {
        write(applied);
      }

      frame = window.requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const now = performance.now();
      const y = readScroll();
      const dt = Math.max(now - lastAt, 8);
      const speed = Math.abs(y - lastY) / dt;
      lastY = y;
      lastAt = now;

      const t = Math.min(speed / FULL_SPEED, 1);
      desired = t * t * maxBlur;
      schedule();

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        desired = 0;
        schedule();
      }, IDLE_AFTER);
    };

    target.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", onScroll);
      window.clearTimeout(idleTimer);
      if (frame) window.cancelAnimationFrame(frame);
      write(0);
    };
  }, [container, maxBlur, reduceMotion]);

  return (
    <div
      ref={layerRef}
      aria-hidden
      className={cn("pointer-events-none fixed inset-0", className)}
      style={{ zIndex }}
    />
  );
}
