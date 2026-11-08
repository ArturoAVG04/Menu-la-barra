"use client";

import { useEffect, useRef } from "react";

const BEEP = "data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YTAAAAAA";

/** Suena un aviso cuando aumenta el número de pedidos nuevos. */
export function useNewOrderSound(newCount: number) {
  const previousCount = useRef(newCount);

  useEffect(() => {
    if (newCount > previousCount.current) {
      void new Audio(BEEP).play().catch(() => undefined);
    }
    previousCount.current = newCount;
  }, [newCount]);
}
