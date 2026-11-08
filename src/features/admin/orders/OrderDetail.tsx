"use client";

import { CheckCircle2, ChefHat, PackageCheck, XCircle } from "lucide-react";

import type { OrderActions } from "@/features/admin/orders/types";
import { currency } from "@/lib/utils";
import type { Order } from "@/types";

/** Detalle desplegable de un pedido: cliente, notas, productos y botones de estado. */
export function OrderDetail({ order, actions }: { order: Order; actions: OrderActions }) {
  return (
    <div className="mt-3 space-y-3 text-center">
      <div className="flex items-center justify-center gap-3 text-sm sm:justify-between">
        <span className="text-muted">
          {new Date(order.createdAt).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </span>
        <span className="font-semibold text-brand">{currency(order.total)}</span>
      </div>

      {order.customerName && (
        <p className="text-sm text-text">
          <span className="font-medium">Cliente:</span> {order.customerName}
        </p>
      )}
      {order.customerPhone && <p className="text-sm text-muted">{order.customerPhone}</p>}

      {typeof order.estimatedMinutes === "number" && order.status === "preparing" && (
        <p className="text-xs font-medium text-brand">
          Tiempo estimado: {order.estimatedMinutes} min
        </p>
      )}
      {order.statusMessage && <p className="text-xs text-muted">{order.statusMessage}</p>}
      {order.orderNote && (
        <div className="rounded-card border border-brand/20 bg-brand/5 px-3 py-2">
          <p className="text-xs text-brand">Nota: {order.orderNote}</p>
        </div>
      )}

      <div className="space-y-1.5 text-sm text-muted">
        {order.items.map((item) => (
          <div key={item.id} className="space-y-0.5">
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

      <div className="flex flex-wrap justify-center gap-2 pt-1">
        {order.status === "new" && (
          <>
            <button
              type="button"
              onClick={() => actions.onAccept(order)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
            >
              <ChefHat size={14} />
              Aceptar
            </button>
            <button
              type="button"
              onClick={() => actions.onReject(order)}
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
            onClick={() => actions.onReady(order)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
          >
            <CheckCircle2 size={14} />
            Marcar listo
          </button>
        )}

        {order.status === "ready" && (
          <button
            type="button"
            onClick={() => actions.onDelivered(order)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
          >
            <PackageCheck size={14} />
            Entregado
          </button>
        )}
      </div>
    </div>
  );
}
