import { useEffect, type RefObject } from "react";

/**
 * Smooth ("eased") scrolling.
 *
 * The browser's native wheel scroll moves in hard, frame-sized jumps — a
 * mouse wheel notch is ~100px at once. This takes the raw wheel delta,
 * accumulates it into a target position and then eases the real scroll
 * position toward that target every animation frame, so the page glides
 * instead of jumping.
 *
 * Tuning knobs:
 *  - EASE    how quickly the page catches up with the wheel (0.1 = floaty,
 *            0.3 = snappy). This is the effective scroll speed.
 *  - SETTLE  distance (px) at which we consider the page arrived.
 *
 * Details that matter:
 *  - `prefers-reduced-motion` opts out entirely (native scroll stays).
 *  - Wheel events over another scrollable element (the TRENCH overlay, the
 *    sub-products page, a nested panel) are left to that element's own
 *    instance, so stacking never fights itself.
 *  - At a scroll boundary, or when the scroller is locked (body overflow
 *    hidden behind an overlay), we stop instead of chasing a position that
 *    can't move, and we don't cancel the browser's native edge behaviour.
 *  - Anything that scrolls outside our own writes (keyboard, anchors,
 *    scrollbar drag) re-syncs the target instead of being pulled back.
 */

const EASE = 0.16;
const SETTLE = 0.5;
/** Ignore scroll events this long after we write one ourselves. */
const OWN_WRITE_WINDOW = 90;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The first scrollable ancestor between the event target and the scroller
 * this instance owns — i.e. an element that should take the wheel itself.
 * Returns null when the wheel belongs to us.
 */
function interveningScroller(
  from: EventTarget | null,
  root: HTMLElement | null,
): HTMLElement | null {
  let node: Element | null = from instanceof Element ? from : null;

  while (node) {
    if (root) {
      if (node === root) return null;
    } else if (node === document.body || node === document.documentElement) {
      // The page scroller is ours.
      return null;
    }

    if (
      node instanceof HTMLElement &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      const overflowY = getComputedStyle(node).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") return node;
    }

    node = node.parentElement;
  }

  return null;
}

/** Attach the eased-wheel behaviour. Pass `null` for the window scroller. */
export function attachSmoothScroll(scroller: HTMLElement | null) {
  if (typeof window === "undefined" || prefersReducedMotion()) return () => {};

  const position = () => (scroller ? scroller.scrollTop : window.scrollY);

  const limit = () => {
    if (scroller) {
      return Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    }
    const root = document.scrollingElement ?? document.documentElement;
    return Math.max(0, root.scrollHeight - window.innerHeight);
  };

  const write = (top: number) => {
    if (scroller) {
      scroller.scrollTop = top;
      return;
    }
    // The page declares `scroll-behavior: smooth` for anchor links; our own
    // per-frame writes have to bypass it or every frame would be re-eased.
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, top);
    root.style.scrollBehavior = previous;
  };

  let target = position();
  let raf = 0;
  let lastOwnWrite = -Infinity;

  const loop = () => {
    raf = 0;
    const current = position();
    const diff = target - current;
    if (Math.abs(diff) <= SETTLE) return;

    const next = current + diff * EASE;
    lastOwnWrite = performance.now();
    write(next);

    // The scroller refused to move (locked behind an overlay, or rounded to
    // a stop) — don't spin forever chasing a position that can't change.
    const expected = Math.abs(next - current);
    if (Math.abs(position() - current) < Math.min(1, expected * 0.5)) {
      target = position();
      return;
    }

    raf = requestAnimationFrame(loop);
  };

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.defaultPrevented || event.deltaY === 0) return;
    if (interveningScroller(event.target, scroller)) return;

    const unit =
      event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    const delta = event.deltaY * unit;
    const max = limit();

    // At an edge, keep the browser's own behaviour (bounce, chaining).
    if ((target <= 0 && delta < 0) || (target >= max && delta > 0)) return;

    target = Math.min(max, Math.max(0, target + delta));
    event.preventDefault();
    kick();
  };

  const onScroll = () => {
    // Our own write coming back around — leave the target alone.
    if (performance.now() - lastOwnWrite < OWN_WRITE_WINDOW) return;
    // Somebody else scrolled (keyboard, anchor, scrollbar): follow them.
    target = position();
  };

  const surface: HTMLElement | Window = scroller ?? window;
  surface.addEventListener("wheel", onWheel as EventListener, { passive: false });
  surface.addEventListener("scroll", onScroll as EventListener, {
    passive: true,
  });

  return () => {
    surface.removeEventListener("wheel", onWheel as EventListener);
    surface.removeEventListener("scroll", onScroll as EventListener);
    if (raf) cancelAnimationFrame(raf);
  };
}

/**
 * Mount the behaviour for the lifetime of a component.
 * No ref  → the window scroller. With a ref → that element
 * (use `enabled` so an overlay's element can exist first).
 */
export function useSmoothScroll(
  scrollerRef?: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;
    return attachSmoothScroll(scrollerRef?.current ?? null);
  }, [scrollerRef, enabled]);
}
