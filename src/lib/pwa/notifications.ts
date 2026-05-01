import { getToken } from "firebase/messaging";

import { getFirebaseVapidKey, getMessagingClient } from "@/lib/firebase/config";

export const APP_SERVICE_WORKER_URL = "/sw.js";
export const PUSH_TOKEN_STORAGE_KEY = "la-barra-push-token";

export async function getBrowserPushToken() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  const vapidKey = getFirebaseVapidKey();
  if (!vapidKey || typeof Notification === "undefined" || Notification.permission !== "granted") {
    return null;
  }

  const messaging = await getMessagingClient();
  if (!messaging) return null;

  const serviceWorkerRegistration = await navigator.serviceWorker
    .register(APP_SERVICE_WORKER_URL)
    .catch(() => null);
  if (!serviceWorkerRegistration) return null;

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration
  }).catch(() => null);

  if (token) {
    window.localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
  }

  return token;
}

export function getStoredPushToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
}
