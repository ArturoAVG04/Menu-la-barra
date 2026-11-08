import { getToken } from "firebase/messaging";

import { getFirebaseVapidKey, getMessagingClient } from "@/lib/firebase/config";

export const APP_SERVICE_WORKER_URL = "/sw.js";
export const PUSH_TOKEN_STORAGE_KEY = "la-barra-push-token";

export type PushTokenResult = { token: string; error?: undefined } | { token: null; error: string };

/**
 * Obtiene el token de FCM de este dispositivo. Devuelve el motivo si falla,
 * para poder mostrarlo (antes el error se tragaba y no había forma de saber qué pasaba).
 */
export async function requestPushToken(): Promise<PushTokenResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return { token: null, error: "Este navegador no soporta notificaciones." };
  }
  if (typeof Notification === "undefined") {
    return { token: null, error: "Este navegador no soporta notificaciones." };
  }
  if (Notification.permission !== "granted") {
    return { token: null, error: "No diste permiso de notificaciones." };
  }

  const vapidKey = getFirebaseVapidKey();
  if (!vapidKey) return { token: null, error: "Falta la llave VAPID en la configuración." };

  const messaging = await getMessagingClient().catch(() => null);
  if (!messaging) return { token: null, error: "Firebase Messaging no es compatible con este navegador." };

  try {
    await navigator.serviceWorker.register(APP_SERVICE_WORKER_URL);
    // Esperar a que el service worker esté ACTIVO: si se está actualizando, getToken falla.
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration });
    if (!token) return { token: null, error: "Firebase no devolvió un token." };
    window.localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    return { token };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error al obtener token de notificaciones:", error);
    return { token: null, error: code ? `${code}: ${message}` : message };
  }
}

/** Atajo que solo devuelve el token (o null). */
export async function getBrowserPushToken() {
  return (await requestPushToken()).token;
}

export function getStoredPushToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
}
