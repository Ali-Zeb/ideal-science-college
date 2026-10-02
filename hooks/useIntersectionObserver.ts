"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element is visible in the viewport.
 * @param options - IntersectionObserver options plus `once` to stop after first hit.
 */
export function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverInit & { once?: boolean } = {},
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  const { once = false, root = null, rootMargin = "0px", threshold = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { root, rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, root, rootMargin, threshold]);

  return [ref, visible];
}
