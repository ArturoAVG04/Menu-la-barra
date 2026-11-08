"use client";

import { useEffect, useMemo, useState } from "react";

import { orderApi } from "@/infrastructure";
import { requestPushToken } from "@/lib/pwa/notifications";

/** Pedido al que se liga el token de este dispositivo. */
export type PushTarget = { orderId: string; branchId: string; trackingToken: string };

const supportsNotifications = () => typeof window !== "undefined" && "Notification" in window;

/** Obtiene el token de este dispositivo y lo registra en el pedido (si hay permiso). */
async function linkTokenToOrder({ orderId, branchId, trackingToken }: PushTarget) {
  const { token } = await requestPushToken().catch(() => ({ token: null }));
  if (!token) return;

  await orderApi.registerCustomerPushToken(orderId, branchId, token, trackingToken).catch((error) => {
    console.error("Error al registrar token de notificaciones:", error);
  });
}

/**
 * Permiso de notificaciones del navegador y registro del token push del pedido activo.
 * `onNotice` muestra el resultado al cliente.
 */
export function usePushNotifications(target: PushTarget | null, onNotice: (message: string) => void) {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    supportsNotifications() ? Notification.permission : "default"
  );

  const isIOS = useMemo(
    () => typeof window !== "undefined" && /iphone|ipad|ipod/i.test(window.navigator.userAgent),
    []
  );
  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone ||
        window.matchMedia("(display-mode: standalone)").matches
    );
  }, []);

  const { orderId, branchId, trackingToken } = target ?? {};

  // Con permiso y un pedido activo, el token se liga al pedido.
  useEffect(() => {
    if (!orderId || !branchId || !trackingToken || permission !== "granted") return;
    void linkTokenToOrder({ orderId, branchId, trackingToken });
  }, [orderId, branchId, trackingToken, permission]);

  /** Se llama al tocar "Enviar pedido" (el navegador exige un toque del usuario para preguntar). */
  function askOnSubmit() {
    if (supportsNotifications() && Notification.permission === "default") {
      void Notification.requestPermission()
        .then(setPermission)
        .catch(() => undefined);
    }
  }

  /** Botón "Activar notificaciones" del seguimiento. */
  async function enable() {
    if (!supportsNotifications()) return;
    try {
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);
      if (nextPermission === "granted" && target) {
        const { token, error } = await requestPushToken();
        if (!token) {
          onNotice(`No se pudieron activar las notificaciones: ${error}`);
          return;
        }
        await orderApi
          .registerCustomerPushToken(target.orderId, target.branchId, token, target.trackingToken)
          .catch(() => undefined);
        onNotice("¡Notificaciones activadas!");
      } else if (nextPermission === "denied") {
        onNotice("Las notificaciones están bloqueadas en tu navegador.");
      }
    } catch (error) {
      console.error("Error al solicitar permiso de notificaciones:", error);
    }
  }

  return { permission, isIOS, isStandalone, askOnSubmit, enable, linkTokenToOrder };
}

export type PushNotifications = ReturnType<typeof usePushNotifications>;
