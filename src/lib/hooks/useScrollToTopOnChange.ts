"use client";

import { useEffect } from "react";

export function useScrollToTopOnChange(dependencies: readonly unknown[]) {
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      document.scrollingElement?.scrollTo({ top: 0, behavior: "auto" });
      window.scrollTo({ top: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, dependencies);
}
