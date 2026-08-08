"use client";

import { useEffect } from "react";

import { APP_SERVICE_WORKER_URL, getBrowserPushToken } from "@/lib/pwa/notifications";
import { getFirebaseVapidKey } from "@/lib/firebase/config";

function isLocalDev() {
  return (
    process.env.NODE_ENV !== "production" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

export function PWARegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const isStrictLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (isStrictLocalhost && process.env.NODE_ENV !== "production" && !getFirebaseVapidKey()) {
      return;
    }

    navigator.serviceWorker.register(APP_SERVICE_WORKER_URL).catch(() => undefined);
  }, []);

  useEffect(() => {
    async function syncPushTokenIfGranted() {
      const vapidKey = getFirebaseVapidKey();
      if (!vapidKey || typeof Notification === "undefined") return;

      if (Notification.permission === "granted") {
        await getBrowserPushToken().catch(() => undefined);
      }
    }

    void syncPushTokenIfGranted();
  }, []);

  return null;
}
