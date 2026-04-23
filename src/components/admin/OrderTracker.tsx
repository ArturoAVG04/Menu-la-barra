"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  BellRing,
  ChefHat,
  CheckCircle2,
  ChevronDown,
  Clock3,
  PackageCheck,
  Trash2,
  XCircle
} from "lucide-react";

import { currency } from "@/lib/utils";
import type { Order } from "@/types";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const statusLabels = {
  new: "Pendientes",
  preparing: "En cocina",
  ready: "Listo"
} as const;

const statusIcons = {
  new: BellRing,
  preparing: ChefHat,
  ready: PackageCheck
} as const;

type OrderTrackerProps = {
  orders: Order[];
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  onReady: (order: Order) => void;
  onDelivered: (order: Order) => void;
  onDelete: (order: Order) => void;
};

function getDayOrderNumber(order: Order, allOrders: Order[]) {
  const orderDate = new Date(order.createdAt);
  const dayStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate()).getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  const dayOrders = allOrders
    .filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd)
    .sort((a, b) => a.createdAt - b.createdAt);

  const index = dayOrders.findIndex((o) => o.id === order.id);
  return index + 1;
}

function OrderDetail({ order, allOrders, onAccept, onReject, onReady, onDelivered }: {
  order: Order;
  allOrders: Order[];
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  onReady: (order: Order) => void;
  onDelivered: (order: Order) => void;
}) {
  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm">
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
      {(order as any).customerPhone && (
        <p className="text-sm text-muted">{(order as any).customerPhone}</p>
      )}

      {typeof order.estimatedMinutes === "number" && order.status === "preparing" && (
        <p className="text-xs font-medium text-brand">
          Tiempo estimado: {order.estimatedMinutes} min
        </p>
      )}
      {order.statusMessage && (
        <p className="text-xs text-muted">{order.statusMessage}</p>
      )}
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
    </div>
  );
}

function CompactOrder({
  order,
  allOrders,
  onAccept,
  onReject,
  onReady,
  onDelivered
}: {
  order: Order;
  allOrders: Order[];
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  onReady: (order: Order) => void;
  onDelivered: (order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dayNumber = getDayOrderNumber(order, allOrders);
  const shortCode = order.id.slice(-6).toUpperCase();

  return (
    <article className="rounded-card border border-line bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((c) => !c)}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
            #{dayNumber}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text truncate">
              {order.customerName || "Sin nombre"}
            </p>
            <p className="text-[10px] text-muted font-mono">{shortCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-brand">{currency(order.total)}</span>
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
          <OrderDetail
            order={order}
            allOrders={allOrders}
            onAccept={onAccept}
            onReject={onReject}
            onReady={onReady}
            onDelivered={onDelivered}
          />
        </div>
      )}
    </article>
  );
}

function HistoryOrder({
  order,
  allOrders,
  onAccept,
  onReject,
  onReady,
  onDelivered
}: {
  order: Order;
  allOrders: Order[];
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  onReady: (order: Order) => void;
  onDelivered: (order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dayNumber = getDayOrderNumber(order, allOrders);
  const shortCode = order.id.slice(-6).toUpperCase();
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
        onClick={() => setExpanded((c) => !c)}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
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
        <div className="flex items-center gap-2 shrink-0">
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
          <OrderDetail
            order={order}
            allOrders={allOrders}
            onAccept={onAccept}
            onReject={onReject}
            onReady={onReady}
            onDelivered={onDelivered}
          />
        </div>
      )}
    </article>
  );
}

export function OrderTracker({
  orders,
  onAccept,
  onReject,
  onReady,
  onDelivered,
  onDelete
}: OrderTrackerProps) {
  const [tab, setTab] = useState<"active" | "history">("active");
  const previousCount = useRef(orders.length);

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status === "new" || o.status === "preparing" || o.status === "ready"),
    [orders]
  );

  const historyOrders = useMemo(() => {
    const now = Date.now();
    return orders
      .filter((o) => o.status === "delivered" || o.status === "rejected")
      .filter((o) => now - o.createdAt < THREE_DAYS_MS)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders]);

  const expiredOrders = useMemo(() => {
    const now = Date.now();
    return orders.filter(
      (o) => (o.status === "delivered" || o.status === "rejected") && now - o.createdAt >= THREE_DAYS_MS
    );
  }, [orders]);

  // Auto-delete orders older than 3 days
  useEffect(() => {
    expiredOrders.forEach((order) => {
      onDelete(order);
    });
  }, [expiredOrders, onDelete]);

  useEffect(() => {
    const newOrders = activeOrders.filter((o) => o.status === "new");
    if (newOrders.length > previousCount.current) {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YTAAAAAA"
      );
      void audio.play().catch(() => undefined);
    }

    previousCount.current = newOrders.length;
  }, [activeOrders]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Pedidos</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
          <BellRing size={16} />
          {activeOrders.filter((o) => o.status === "new").length} nuevos
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={[
            "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
            tab === "active" ? "bg-brand text-white" : "border border-line text-text"
          ].join(" ")}
        >
          <Clock3 size={14} />
          Activos
          {activeOrders.length > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{activeOrders.length}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={[
            "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
            tab === "history" ? "bg-brand text-white" : "border border-line text-text"
          ].join(" ")}
        >
          <Archive size={14} />
          Historial
          {historyOrders.length > 0 && (
            <span className={[
              "rounded-full px-2 py-0.5 text-xs",
              tab === "history" ? "bg-white/20" : "bg-brand/10 text-brand"
            ].join(" ")}>{historyOrders.length}</span>
          )}
        </button>
      </div>

      {tab === "active" && (
        <div className="grid gap-4 lg:grid-cols-3">
          {(["new", "preparing", "ready"] as const).map((status) => {
            const StatusIcon = statusIcons[status];
            const columnOrders = activeOrders.filter((o) => o.status === status);

            return (
              <div key={status} className="rounded-shell border border-line bg-panel p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon size={16} className="text-brand" />
                    <h3 className="text-sm font-semibold text-text">{statusLabels[status]}</h3>
                  </div>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {columnOrders.length ? (
                    columnOrders.map((order) => (
                      <CompactOrder
                        key={order.id}
                        order={order}
                        allOrders={orders}
                        onAccept={onAccept}
                        onReject={onReject}
                        onReady={onReady}
                        onDelivered={onDelivered}
                      />
                    ))
                  ) : (
                    <div className="rounded-card border border-dashed border-line bg-surface p-4 text-center text-xs text-muted">
                      Sin pedidos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "history" && (
        <div className="rounded-shell border border-line bg-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive size={16} className="text-muted" />
              <h3 className="text-sm font-semibold text-text">Últimos 3 días</h3>
            </div>
            <span className="text-xs text-muted">{historyOrders.length} pedidos</span>
          </div>

          {historyOrders.length ? (
            <div className="space-y-2">
              {historyOrders.map((order) => (
                <HistoryOrder
                  key={order.id}
                  order={order}
                  allOrders={orders}
                  onAccept={onAccept}
                  onReject={onReject}
                  onReady={onReady}
                  onDelivered={onDelivered}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
              No hay pedidos en el historial.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
