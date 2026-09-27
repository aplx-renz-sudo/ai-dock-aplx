import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

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
 */
export function ScrollFade({
  children,
  className,
  delay = 0,
  distance = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
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
        inView ? { opacity: 1, y: 0 } : { opacity: 0, y: hiddenY }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      style={{ willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
