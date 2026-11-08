"use client";

import { useState } from "react";
import { CheckCircle2, ChefHat, ChevronDown, PackageCheck, XCircle } from "lucide-react";

import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { OrderDetail } from "@/features/admin/orders/OrderDetail";
import type { OrderActions } from "@/features/admin/orders/types";
import { currency } from "@/lib/utils";
import type { Order } from "@/types";

const quickActionClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-brand px-3 text-xs font-bold text-white shadow-glow hover:bg-accent active:scale-95 transition";

/** Tarjeta compacta de un pedido activo con su botón de acción rápida. */
export function ActiveOrderCard({
  order,
  dayNumber,
  actions
}: {
  order: Order;
  dayNumber: number;
  actions: OrderActions;
}) {
  const [expanded, setExpanded] = useState(false);
  const shortCode = OrderLifecycle.shortCode(order.id).slice(1);

  // Evita que el clic en el botón también abra/cierre el detalle.
  const run = (action: (order: Order) => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    action(order);
  };

  return (
    <article className="rounded-card border border-line bg-surface overflow-hidden shadow-sm hover:border-brand/30 transition">
      <div className="flex w-full items-center justify-between gap-2.5 p-3 text-left">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex flex-1 min-w-0 items-center gap-2.5 text-left group"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
            #{dayNumber}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-text truncate group-hover:text-brand transition">
                {order.customerName || "Sin nombre"}
              </p>
              <ChevronDown
                size={14}
                className={[
                  "text-muted shrink-0 transition-transform duration-200",
                  expanded ? "rotate-180" : ""
                ].join(" ")}
              />
            </div>
            <p className="text-[10px] text-muted font-mono truncate">
              {shortCode} · {currency(order.total)}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {order.status === "new" && (
            <>
              <button type="button" onClick={run(actions.onAccept)} className={quickActionClass}>
                <ChefHat size={14} />
                <span>Aceptar</span>
              </button>
              <button
                type="button"
                onClick={run(actions.onReject)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-danger/30 bg-danger/10 text-danger hover:bg-danger hover:text-white active:scale-95 transition"
                title="Rechazar pedido"
              >
                <XCircle size={15} />
              </button>
            </>
          )}

          {order.status === "preparing" && (
            <button type="button" onClick={run(actions.onReady)} className={quickActionClass}>
              <CheckCircle2 size={14} />
              <span>Marcar listo</span>
            </button>
          )}

          {order.status === "ready" && (
            <button type="button" onClick={run(actions.onDelivered)} className={quickActionClass}>
              <PackageCheck size={14} />
              <span>Entregado</span>
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-line px-3 pb-3">
          <OrderDetail order={order} actions={actions} />
        </div>
      )}
    </article>
  );
}
