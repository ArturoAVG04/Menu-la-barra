"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";

import { orderApi } from "@/infrastructure";
import { requestPushToken } from "@/lib/pwa/notifications";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";

export type PushPermission = NotificationPermission | "unsupported";

/** Botón "Activar avisos": pide permiso, obtiene el token del dispositivo y lo registra en el servidor. */
export function useAdminPush(currentUser: User | null, notify: Notify) {
  const [permission, setPermission] = useState<PushPermission>("default");

  async function syncToken(showNotice: boolean) {
    if (!currentUser) return;
    const { token, error } = await requestPushToken();
    if (!token) {
      // Se muestra el motivo real (service worker, VAPID, permisos…) para poder diagnosticar.
      if (showNotice) notify(`No se pudo activar los avisos: ${error}`);
      return;
    }
    try {
      await orderApi.registerAdminPushToken(currentUser, token);
      if (showNotice) notify("Avisos de pedidos nuevos activados en este dispositivo.");
    } catch (error) {
      if (showNotice) notify(error instanceof Error ? error.message : "No se pudo activar los avisos.");
    }
  }

  async function enable() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      await syncToken(true);
    } else {
      notify("Las notificaciones están bloqueadas. Actívalas en los ajustes del navegador o de la app.");
    }
  }

  // Si ya hay permiso, registrar (o refrescar) el token de este dispositivo al abrir el panel
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    if (Notification.permission === "granted" && currentUser) {
      void syncToken(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  /**
   * Diagnóstico en dos pasos:
   * 1) notificación LOCAL (no pasa por internet): si no aparece, Android/Chrome la está bloqueando;
   * 2) notificación por el SERVIDOR (como la de un pedido real).
   */
  async function test() {
    if (!currentUser) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Prueba local", {
        body: "Si ves esto, el celular sí permite notificaciones de esta app.",
        icon: "/icons/admin/icon-192.png",
        badge: "/icons/badge-96.png"
      });
    } catch (error) {
      notify(`El celular bloqueó la notificación local: ${error instanceof Error ? error.message : error}`);
      return;
    }
    await syncToken(false);
    try {
      const result = await orderApi.sendAdminTestPush(currentUser);
      notify(
        result.devices === 0
          ? "No hay dispositivos registrados. Toca \"Activar avisos\"."
          : `Prueba enviada a ${result.sent} de ${result.devices} dispositivo(s). Debe llegarte "Prueba de aviso" en unos segundos.`
      );
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo enviar la prueba");
    }
  }

  return { permission, enable, test };
}
