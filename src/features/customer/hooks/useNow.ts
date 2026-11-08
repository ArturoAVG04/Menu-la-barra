"use client";

import { useEffect, useState } from "react";

/** Hora actual que se refresca cada `intervalMs` (para horarios y cuentas regresivas). */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const intervalId = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(intervalId);
  }, [intervalMs]);

  return now;
}
