"use client";

import { useEffect, useRef, useState } from "react";

import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { useOrderPolling } from "@/features/customer/hooks/useOrderPolling";
import { LocalJsonStore } from "@/infrastructure/browser/LocalJsonStore";
import type { PublicTrackedOrder } from "@/types";

/** Lo mínimo para volver a encontrar el pedido después de recargar la página. */
type ActiveOrderRef = { id: string; trackingToken: string };

const activeOrderStore = new LocalJsonStore<Partial<ActiveOrderRef> | null>("la-barra-active-order", null);

/** Notificación local del navegador cuando cambia el estado (si ya hay permiso). */
function showStatusNotification(order: PublicTrackedOrder, statusLabel: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted" || order.status === "new") return;
  try {
    const notification = new Notification("Actualización de tu pedido", {
      body: order.statusMessage || `Tu pedido ahora está: ${statusLabel}.`,
      icon: "/icon.svg"
    });
    notification.onclick = () => window.focus();
  } catch {
    // el navegador no permite crear la notificación
  }
}

/**
 * Seguimiento del pedido activo: lo recuerda en el navegador y lo consulta por la API
 * (con el token). Avisa con `onNotice` cuando cambia de estado.
 */
export function useActiveOrder(onNotice: (message: string) => void) {
  const [orderRef, setOrderRef] = useState<ActiveOrderRef | null>(null);
  const [activeOrder, setActiveOrder] = useState<PublicTrackedOrder | null>(null);
  const [lastNotifiedStatus, setLastNotifiedStatus] = useState<string | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const noticeRef = useRef(onNotice);
  useEffect(() => {
    noticeRef.current = onNotice;
  });

  function clear() {
    activeOrderStore.clear();
    setOrderRef(null);
    setActiveOrder(null);
    setTrackingOpen(false);
    setLastNotifiedStatus(null);
  }

  /** Empieza a seguir un pedido recién creado. */
  function start(id: string, trackingToken: string) {
    activeOrderStore.write({ id, trackingToken });
    setActiveOrder(null);
    setLastNotifiedStatus(null);
    setOrderRef({ id, trackingToken });
    setTrackingOpen(false);
  }

  useEffect(() => {
    const stored = activeOrderStore.read();
    if (typeof stored?.id === "string" && typeof stored.trackingToken === "string") {
      setOrderRef({ id: stored.id, trackingToken: stored.trackingToken });
    } else if (stored) {
      activeOrderStore.clear();
    }
  }, []);

  useOrderPolling(orderRef, activeOrder?.status ?? null, (order) => {
    if (!order) return clear();
    if (order.status === "delivered") {
      noticeRef.current("Pedido entregado");
      return clear();
    }
    setActiveOrder(order);
  });

  useEffect(() => {
    if (!activeOrder) return;
    if (lastNotifiedStatus === null) {
      setLastNotifiedStatus(activeOrder.status);
      return;
    }
    if (activeOrder.status === lastNotifiedStatus) return;

    setLastNotifiedStatus(activeOrder.status);
    const statusLabel = OrderLifecycle.label(activeOrder.status);
    noticeRef.current(`Tu pedido cambió a: ${statusLabel}`);
    showStatusNotification(activeOrder, statusLabel);
  }, [activeOrder, lastNotifiedStatus]);

  return {
    activeOrder,
    orderRef,
    /** Hay un pedido sin terminar (ni entregado ni rechazado): no se puede mandar otro. */
    hasOrderInProgress: Boolean(orderRef) && !(activeOrder && OrderLifecycle.isFinished(activeOrder.status)),
    trackingOpen,
    openTracking: () => setTrackingOpen(true),
    closeTracking: () => setTrackingOpen(false),
    start,
    clear
  };
}

export type ActiveOrderState = ReturnType<typeof useActiveOrder>;
