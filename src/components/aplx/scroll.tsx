import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useSpring } from "framer-motion";

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
      // Ignore tiny jitters / momentum noise.
      if (Math.abs(delta) < 8) return;
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
  const inView = useInView(ref, { margin: "-12% 0px -12% 0px" });

  const hiddenY = direction === "down" ? -distance : distance;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          : {
              opacity: 0,
              y: hiddenY,
              scale: 0.985,
              filter: blur ? "blur(6px)" : "blur(0px)",
            }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      style={{ willChange: "transform, opacity, filter" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** A thin, spring-damped reading-progress line pinned to the top of the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-emerald-400 via-emerald-300 to-white/70"
    />
  );
}
