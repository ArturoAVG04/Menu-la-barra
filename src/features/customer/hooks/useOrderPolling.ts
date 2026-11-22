"use client";

import { useEffect, useRef } from "react";

import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { orderApi } from "@/infrastructure";
import type { OrderStatus, PublicTrackedOrder } from "@/types";

const POLL_MS = 10_000;

type OrderRef = { id: string; trackingToken: string };

/**
 * Consulta el pedido por la API cada 10 s mientras siga activo.
 * Se pausa con la pestaña oculta y consulta al momento al volver.
 * `onResult(null)` = el pedido ya no existe.
 */
export function useOrderPolling(
  orderRef: OrderRef | null,
  status: OrderStatus | null,
  onResult: (order: PublicTrackedOrder | null) => void
) {
  const resultRef = useRef(onResult);
  useEffect(() => {
    resultRef.current = onResult;
  });

  const finished = status !== null && OrderLifecycle.isFinished(status);

  useEffect(() => {
    if (!orderRef || finished) return;
    let cancelled = false;
    let timer: number | undefined;
    let inFlight = false;
    const { id, trackingToken } = orderRef;

    async function poll() {
      if (inFlight) return;
      window.clearTimeout(timer);
      if (document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const order = await orderApi.track(id, trackingToken);
        if (!cancelled) resultRef.current(order);
      } catch {
        // sin red: se reintenta en el siguiente ciclo
      } finally {
        inFlight = false;
      }
      if (!cancelled) timer = window.setTimeout(poll, POLL_MS);
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") void poll();
    };

    void poll();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [orderRef, finished]);
}
