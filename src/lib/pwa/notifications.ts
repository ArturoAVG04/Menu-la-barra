

export const APP_SERVICE_WORKER_URL = "/sw.js";
export const PUSH_TOKEN_STORAGE_KEY = "la-barra-push-token";

export type PushTokenResult = { token: string; error?: undefined } | { token: null; error: string };

function base64UrlToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

async function fetchServerPublicKey() {
  const response = await fetch("/api/push/public-key");
  const body = (await response.json().catch(() => null)) as { publicKey?: string; error?: string } | null;
  if (!response.ok || !body?.publicKey) throw new Error(body?.error || "No se pudo obtener la llave del servidor.");
  return body.publicKey;
}

/**
 * Suscribe este dispositivo a notificaciones con el estándar Web Push y devuelve la
 * suscripción serializada (eso es lo que el servidor guarda como "token").
 * Devuelve el motivo si falla, para mostrarlo en pantalla.
 */
export async function requestPushToken(): Promise<PushTokenResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { token: null, error: "Este navegador no soporta notificaciones push." };
  }
  if (typeof Notification === "undefined") {
    return { token: null, error: "Este navegador no soporta notificaciones." };
  }
  if (Notification.permission !== "granted") {
    return { token: null, error: "No diste permiso de notificaciones." };
  }

  try {
    const publicKey = await fetchServerPublicKey();
    await navigator.serviceWorker.register(APP_SERVICE_WORKER_URL);
    // Esperar a que el service worker esté ACTIVO antes de suscribirse
    const registration = await navigator.serviceWorker.ready;
    const applicationServerKey = base64UrlToUint8Array(publicKey);

    let subscription = await registration.pushManager.getSubscription();
    // Si había una suscripción con otra llave (p. ej. la vieja de Firebase), se reemplaza
    const currentKey = subscription?.options.applicationServerKey;
    if (subscription && currentKey) {
      const current = new Uint8Array(currentKey);
      const sameKey =
        current.length === applicationServerKey.length && current.every((byte, i) => byte === applicationServerKey[i]);
      if (!sameKey) {
        await subscription.unsubscribe();
        subscription = null;
      }
    }
    subscription ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });

    const token = JSON.stringify(subscription.toJSON());
    window.localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    return { token };
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("Error al suscribir notificaciones:", error);
    return { token: null, error: message };
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
