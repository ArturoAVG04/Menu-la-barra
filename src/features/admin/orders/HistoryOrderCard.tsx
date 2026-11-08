"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { OrderDetail } from "@/features/admin/orders/OrderDetail";
import type { OrderActions } from "@/features/admin/orders/types";
import { currency } from "@/lib/utils";
import type { Order } from "@/types";

/** Pedido terminado (entregado o rechazado) en el historial. */
export function HistoryOrderCard({
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
  const isRejected = order.status === "rejected";

  return (
    <article
      className={[
        "rounded-card border overflow-hidden",
        isRejected ? "border-danger/20 bg-danger/5" : "border-line bg-surface"
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full flex-col items-center justify-center gap-3 px-3 py-3 text-center sm:flex-row sm:justify-between"
      >
        <div className="flex min-w-0 items-center justify-center gap-2.5">
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              isRejected ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
            ].join(" ")}
          >
            #{dayNumber}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">
              {order.customerName || "Sin nombre"}
            </p>
            <p className="text-[10px] text-muted">
              {shortCode} ·{" "}
              {new Date(order.createdAt).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short"
              })}{" "}
              {new Date(order.createdAt).toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
          <span
            className={[
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
              isRejected ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
            ].join(" ")}
          >
            {isRejected ? "Rechazado" : "Entregado"}
          </span>
          <span className="text-xs font-semibold text-text">{currency(order.total)}</span>
          <ChevronDown
            size={14}
            className={[
              "text-muted transition-transform duration-200",
              expanded ? "rotate-180" : ""
            ].join(" ")}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-line px-3 pb-3">
          <OrderDetail order={order} actions={actions} />
        </div>
      )}
    </article>
  );
}
