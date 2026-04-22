"use client";

import { useEffect, useRef } from "react";
import { BellRing, CheckCircle2, ChefHat, PackageCheck, XCircle } from "lucide-react";

import { currency } from "@/lib/utils";
import type { Order } from "@/types";

const statusLabels = {
  new: "Pendientes",
  preparing: "En cocina",
  ready: "Listo",
  rejected: "Rechazados"
} as const;

type OrderTrackerProps = {
  orders: Order[];
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  onReady: (order: Order) => void;
  onDelivered: (order: Order) => void;
};

export function OrderTracker({
  orders,
  onAccept,
  onReject,
  onReady,
  onDelivered
}: OrderTrackerProps) {
  const previousCount = useRef(orders.length);

  useEffect(() => {
    if (orders.length > previousCount.current) {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YTAAAAAA"
      );
      void audio.play().catch(() => undefined);
    }

    previousCount.current = orders.length;
  }, [orders.length]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Pedidos</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
          <BellRing size={16} />
          Alertas activas
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {(["new", "preparing", "ready", "rejected"] as const).map((status) => (
          <div key={status} className="rounded-shell border border-line bg-panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-text">{statusLabels[status]}</h3>
              <span className="rounded-full bg-surface px-3 py-1 text-xs text-muted">
                {orders.filter((order) => order.status === status).length}
              </span>
            </div>

            <div className="space-y-3">
              {orders
                .filter((order) => order.status === status)
                .map((order) => (
                  <article key={order.id} className="rounded-card border border-line bg-surface p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-text">{order.customerName}</p>
                      <span className="text-sm font-semibold text-brand">{currency(order.total)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(order.createdAt).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    {typeof order.estimatedMinutes === "number" && order.status === "preparing" && (
                      <p className="mt-1 text-xs font-medium text-brand">
                        Tiempo estimado: {order.estimatedMinutes} min
                      </p>
                    )}
                    {order.statusMessage && (
                      <p className="mt-1 text-xs text-muted">{order.statusMessage}</p>
                    )}
                    <div className="mt-3 space-y-2 text-sm text-muted">
                      {order.items.map((item) => (
                        <div key={item.id} className="space-y-1">
                          <p>
                            {item.quantity}x {item.name}
                          </p>
                          {item.selectedModifiers.length > 0 && (
                            <p className="text-xs">
                              {item.selectedModifiers
                                .map((modifier) =>
                                  modifier.optionNames?.length
                                    ? `${modifier.modifierName}: ${modifier.optionNames.join(", ")}`
                                    : null
                                )
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                          {item.note && <p className="text-xs">Nota: {item.note}</p>}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.status === "new" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onAccept(order)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
                          >
                            <ChefHat size={14} />
                            Aceptar
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(order)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-danger/30 px-4 py-2 text-xs font-semibold text-danger"
                          >
                            <XCircle size={14} />
                            Rechazar
                          </button>
                        </>
                      )}

                      {order.status === "preparing" && (
                        <button
                          type="button"
                          onClick={() => onReady(order)}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
                        >
                          <CheckCircle2 size={14} />
                          Marcar listo
                        </button>
                      )}

                      {order.status === "ready" && (
                        <button
                          type="button"
                          onClick={() => onDelivered(order)}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
                        >
                          <PackageCheck size={14} />
                          Entregado
                        </button>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
