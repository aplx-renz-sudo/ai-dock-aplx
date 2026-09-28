import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

/** Shared easing so every reveal on the page settles the same way. */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * A single shared, module-level scroll-direction store.
 *
 * We deliberately avoid React context here so that a direction change only
 * re-renders the small set of components that actually care about it, rather
 * than the entire landing page (which contains charts).
 */

export type ScrollDirection = "up" | "down";

let currentDirection: ScrollDirection = "down";
const listeners = new Set<(d: ScrollDirection) => void>();

let initialized = false;
let lastY = 0;
let rafId = 0;

function ensureListener() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  lastY = window.scrollY;

  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      // Ignore tiny jitters / momentum noise. A slightly larger floor than a
      // typical implementation so a single flick of the wheel never flips
      // direction mid-animation.
      if (Math.abs(delta) < 12) return;
      const next: ScrollDirection = delta > 0 ? "down" : "up";
      lastY = y;
      if (next !== currentDirection) {
        currentDirection = next;
        listeners.forEach((l) => l(next));
      }
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

export function useScrollDirection(): ScrollDirection {
  const [dir, setDir] = useState<ScrollDirection>(currentDirection);

  useEffect(() => {
    ensureListener();
    setDir(currentDirection);
    const listener = (d: ScrollDirection) => setDir(d);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return dir;
}

/**
 * Wraps content in a direction-aware reveal.
 *
 * - Scrolling down: elements that leave the viewport fade out and drift up.
 * - Scrolling up: elements fade back in and slide up into place.
 *
 * A soft blur + scale settles alongside the fade so reveals feel physical
 * rather than a plain opacity swap.
 */
export function ScrollFade({
  children,
  className,
  delay = 0,
  distance = 40,
  blur = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  blur?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const direction = useScrollDirection();
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "-12% 0px -12% 0px" });

  const hiddenY = direction === "down" ? -distance : distance;
  const blurAmount = reduce || !blur ? 0 : 10;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          : {
              opacity: 0,
              y: reduce ? 0 : hiddenY,
              scale: reduce ? 1 : 0.985,
              filter: `blur(${blurAmount}px)`,
            }
      }
      transition={{
        // Position resolves on a spring so the travel feels weighted rather
        // than mechanical; opacity and blur ease out on a curve so they never
        // out-run the transform.
        y: { type: "spring", stiffness: 120, damping: 22, mass: 0.9, delay },
        scale: { type: "spring", stiffness: 140, damping: 24, delay },
        opacity: { duration: 0.5, ease: EASE, delay },
        filter: { duration: 0.7, ease: EASE, delay },
      }}
      style={{ willChange: "transform, opacity, filter" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * A full-page motion-blur veil.
 *
 * Sits just above the page content but below the fixed chrome, so the copy and
 * cards streak while scrolling and the navbar / progress bar stay crisp. The
 * blur is spring-damped off the raw scroll velocity, which means it blooms
 * during a fast flick and melts away over ~0.5s once the page settles.
 */
export function MotionBlur({ max = 2.5 }: { max?: number }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, {
    stiffness: 90,
    damping: 22,
    mass: 0.5,
    restDelta: 0.5,
  });

  const amount = useTransform(smooth, (v) => {
    const t = Math.min(Math.abs(v) / 2400, 1);
    // Squared so a slow drift barely blurs and only a real flick shows it.
    return t * t * max;
  });
  const opacity = useTransform(amount, (a) => (a / max) * 0.85);
  const filter = useMotionTemplate`blur(${amount}px)`;

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        opacity,
        backdropFilter: filter,
        WebkitBackdropFilter: filter,
      }}
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}

/** A thin, spring-damped reading-progress line pinned to the top of the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 34,
    mass: 0.35,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-emerald-400 via-emerald-300 to-white/70"
    />
  );
}
