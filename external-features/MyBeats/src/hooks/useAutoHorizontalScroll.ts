import { RefObject, useEffect, useRef } from "react";

interface AutoScrollOptions {
  /** pixels per tick */
  step?: number;
  /** ms between steps */
  interval?: number;
  /** pause when user hovers */
  pauseOnHover?: boolean;
  /** pause when user is actively scrolling (wheel / touch / drag) */
  pauseOnUserScroll?: boolean;
  /** restart delay after user interaction (ms) */
  resumeDelay?: number;
}

/**
 * Automatically scrolls a horizontal overflow container in a loop.
 */
export function useAutoHorizontalScroll<T extends HTMLElement>(
  ref: RefObject<T>,
  {
    step = 1,
    interval = 25,
    pauseOnHover = true,
    pauseOnUserScroll = true,
    resumeDelay = 2000,
  }: AutoScrollOptions = {}
) {
  const pausedRef = useRef(false);
  const userInteractingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Helper to start interval
  const start = () => {
    if (!ref.current) return;
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      const el = ref.current!;
      if (pausedRef.current) return;
      if (el.scrollWidth <= el.clientWidth) return; // nothing to scroll
      const reachedEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;
      if (reachedEnd) {
        el.scrollTo({ left: 0, behavior: "auto" });
      } else {
        el.scrollTo({ left: el.scrollLeft + step, behavior: "auto" });
      }
    }, interval);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    start();

    const handleMouseEnter = () => {
      if (pauseOnHover) pausedRef.current = true;
    };
    const handleMouseLeave = () => {
      if (pauseOnHover) pausedRef.current = false;
    };

    const debounceResume = () => {
      if (!pauseOnUserScroll) return;
      userInteractingRef.current = true;
      pausedRef.current = true;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        userInteractingRef.current = false;
        pausedRef.current = false;
      }, resumeDelay) as unknown as number;
    };

    const handleWheel = debounceResume;
    const handleTouchStart = debounceResume;
    const handlePointerDown = debounceResume;

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("wheel", handleWheel, { passive: true });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      stop();
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("pointerdown", handlePointerDown);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, step, interval, pauseOnHover, pauseOnUserScroll, resumeDelay]);
}
