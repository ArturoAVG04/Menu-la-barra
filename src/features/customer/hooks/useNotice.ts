"use client";

import { useEffect, useState } from "react";

const NOTICE_DURATION_MS = 2200;

/** Aviso flotante temporal ("agregado al carrito", cambios de estado, etc.). */
export function useNotice() {
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), NOTICE_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  return { notice, showNotice: setNotice };
}
