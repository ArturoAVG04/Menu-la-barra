"use client";

import { useEffect, useRef, useState } from "react";

import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { orderApi, orderRepository } from "@/infrastructure";
import { LocalJsonStore } from "@/infrastructure/browser/LocalJsonStore";
import type { Order, PublicTrackedOrder } from "@/types";

/** Lo mínimo para volver a encontrar el pedido después de recargar la página. */
type ActiveOrderRef = { id: string; trackingToken: string };

const activeOrderStore = new LocalJsonStore<Partial<ActiveOrderRef> | null>("la-barra-active-order", null);

function toPublicOrder(order: Order): PublicTrackedOrder {
  return {
    id: order.id,
    items: order.items ?? [],
    customerName: order.customerName ?? "",
    customerPhone: order.customerPhone ?? "",
    orderNote: order.orderNote ?? "",
    subtotal: order.subtotal ?? 0,
    tipPercent: order.tipPercent ?? 0,
    tipAmount: order.tipAmount ?? 0,
    total: order.total ?? 0,
    status: order.status ?? "new",
    estimatedMinutes: order.estimatedMinutes,
    estimatedReadyAt: order.estimatedReadyAt,
    statusMessage: order.statusMessage ?? "",
    createdAt: order.createdAt ?? Date.now()
  };
}

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
 * Seguimiento del pedido activo: lo recuerda en el navegador, lo consulta por la API
 * y escucha sus cambios en tiempo real. Avisa con `onNotice` cuando cambia de estado.
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
    setOrderRef({ id, trackingToken });
    setTrackingOpen(false);
  }

  useEffect(() => {
    const stored = activeOrderStore.read();
    if (stored?.id && stored.trackingToken) {
      setOrderRef({ id: stored.id, trackingToken: stored.trackingToken });
    } else if (stored) {
      activeOrderStore.clear();
    }
  }, []);

  useEffect(() => {
    if (!orderRef) {
      setActiveOrder(null);
      setLastNotifiedStatus(null);
      setTrackingOpen(false);
      return;
    }

    let cancelled = false;

    // Primero por la API (rápido); si falla, queda la escucha en tiempo real de Firestore.
    orderApi
      .track(orderRef.id, orderRef.trackingToken)
      .then((order) => {
        if (!cancelled && order) setActiveOrder(order);
      })
      .catch(() => undefined);

    const unsubscribe = orderRepository.subscribe(orderRef.id, (order) => {
      if (cancelled) return;
      if (!order) {
        clear();
        return;
      }
      if (order.status === "delivered") {
        noticeRef.current("Pedido entregado");
        clear();
        return;
      }
      setActiveOrder(toPublicOrder(order));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [orderRef]);

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
    trackingOpen,
    openTracking: () => setTrackingOpen(true),
    closeTracking: () => setTrackingOpen(false),
    start,
    clear
  };
}

export type ActiveOrderState = ReturnType<typeof useActiveOrder>;
