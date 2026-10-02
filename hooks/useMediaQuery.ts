"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query. Returns false during SSR.
 * @param query - e.g. "(min-width: 1024px)".
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
