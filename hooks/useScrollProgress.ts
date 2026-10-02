"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current window scroll offset and whether it has passed `threshold`.
 * @param threshold - Pixels scrolled before `scrolled` becomes true.
 */
export function useScrollProgress(threshold = 24): { y: number; scrolled: boolean; progress: number } {
  const [state, setState] = useState({ y: 0, scrolled: false, progress: 0 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setState({ y, scrolled: y > threshold, progress: max > 0 ? y / max : 0 });
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return state;
}
