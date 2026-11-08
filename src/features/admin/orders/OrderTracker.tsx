"use client";

import { useMemo, useState } from "react";
import { Archive, BellRing, ChefHat, Clock3, PackageCheck } from "lucide-react";

import { OrderBoard } from "@/domain/order/OrderBoard";
import { useNewOrderSound } from "@/features/admin/hooks/useNewOrderSound";
import { ActiveOrderCard } from "@/features/admin/orders/ActiveOrderCard";
import { HistoryOrderCard } from "@/features/admin/orders/HistoryOrderCard";
import type { OrderActions } from "@/features/admin/orders/types";
import type { Order } from "@/types";

const COLUMNS = [
  { status: "new", label: "Pendientes", icon: BellRing },
  { status: "preparing", label: "En cocina", icon: ChefHat },
  { status: "ready", label: "Listo", icon: PackageCheck }
] as const;

const tabClass = (active: boolean) =>
  [
    "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
    active ? "bg-brand text-white" : "border border-line text-text"
  ].join(" ");

/** Tablero de pedidos: columnas de activos e historial de 3 días. */
export function OrderTracker({ orders, ...actions }: { orders: Order[] } & OrderActions) {
  const [tab, setTab] = useState<"active" | "history">("active");
  // El tablero (dominio) decide qué es activo, qué va al historial y el número del día.
  const board = useMemo(() => new OrderBoard(orders), [orders]);
  const activeOrders = board.active;
  const historyOrders = board.history;

  useNewOrderSound(board.newCount);

  return (
    <section className="space-y-4 text-center">
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Pedidos</p>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
          <BellRing size={16} />
          {board.newCount} nuevos
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setTab("active")} className={tabClass(tab === "active")}>
          <Clock3 size={14} />
          Activos
          {activeOrders.length > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{activeOrders.length}</span>
          )}
        </button>
        <button type="button" onClick={() => setTab("history")} className={tabClass(tab === "history")}>
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
          {COLUMNS.map(({ status, label, icon: StatusIcon }) => {
            const columnOrders = board.inStatus(status);

            return (
              <div key={status} className="rounded-shell border border-line bg-panel p-4">
                <div className="mb-3 flex items-center justify-center gap-3 sm:justify-between">
                  <div className="flex items-center justify-center gap-2">
                    <StatusIcon size={16} className="text-brand" />
                    <h3 className="text-sm font-semibold text-text">{label}</h3>
                  </div>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {columnOrders.length ? (
                    columnOrders.map((order) => (
                      <ActiveOrderCard
                        key={order.id}
                        order={order}
                        dayNumber={board.dayNumberOf(order)}
                        actions={actions}
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
          <div className="mb-3 flex items-center justify-center gap-3 sm:justify-between">
            <div className="flex items-center justify-center gap-2">
              <Archive size={16} className="text-muted" />
              <h3 className="text-sm font-semibold text-text">Últimos 3 días</h3>
            </div>
            <span className="text-xs text-muted">{historyOrders.length} pedidos</span>
          </div>

          {historyOrders.length ? (
            <div className="space-y-2">
              {historyOrders.map((order) => (
                <HistoryOrderCard
                  key={order.id}
                  order={order}
                  dayNumber={board.dayNumberOf(order)}
                  actions={actions}
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
