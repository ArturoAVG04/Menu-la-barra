import { useEffect, useLayoutEffect } from "react";

/** useLayoutEffect en el navegador (lee antes de pintar, sin parpadeo); useEffect en el servidor. */
export const useMountLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Lee JSON del localStorage; si falta, está roto o no pasa `isValid`, regresa `fallback`. */
export function readStoredJson<T>(key: string, fallback: T, isValid: (value: unknown) => boolean = () => true): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed: unknown = JSON.parse(stored);
    return isValid(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Guarda JSON sin romper la app si el almacenamiento está lleno o bloqueado. */
export function writeStoredJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // almacenamiento lleno o bloqueado: se ignora
  }
}

/** Objeto con `id` de texto (sucursal guardada). */
export const hasStringId = (value: unknown) =>
  Boolean(value) && typeof value === "object" && typeof (value as { id?: unknown }).id === "string";

export const isPlainObject = (value: unknown) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
