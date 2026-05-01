"use client";

import { useEffect } from "react";

import { APP_SERVICE_WORKER_URL, getBrowserPushToken } from "@/lib/pwa/notifications";
import { getFirebaseVapidKey } from "@/lib/firebase/config";

export function PWARegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (process.env.NODE_ENV !== "production" || isLocalhost) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });

      if ("caches" in window) {
        void caches.keys().then((keys) => {
          keys.forEach((key) => {
            void caches.delete(key);
          });
        });
      }

      return;
    }

    navigator.serviceWorker.register(APP_SERVICE_WORKER_URL).catch(() => undefined);
  }, []);

  useEffect(() => {
    async function requestNotifications() {
      const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
      const vapidKey = getFirebaseVapidKey();

      if (!vapidKey || typeof Notification === "undefined") {
        return;
      }

      if (Notification.permission === "granted") {
        await getBrowserPushToken().catch(() => undefined);
        return;
      }

      if (isIOS && !(window.navigator as Navigator & { standalone?: boolean }).standalone) {
        return;
      }

      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }

    void requestNotifications();
  }, []);

  return null;
}
