"use client";

import { useEffect, useRef } from "react";

/** Pila de modales abiertos: Escape cierra solo el de arriba. */
const stack: symbol[] = [];

/** Cierra el modal con la tecla Escape. */
export function useEscapeKey(onClose: () => void) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const id = Symbol("modal");
    stack.push(id);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && stack[stack.length - 1] === id) closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      stack.splice(stack.indexOf(id), 1);
    };
  }, []);
}
