"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";

import { OrderStatusChange } from "@/domain/order/OrderStatusChange";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { orderApi, orderRepository } from "@/infrastructure";
import type { Branch, Order, OrderStatus } from "@/types";

const SUCCESS_NOTICES: Partial<Record<OrderStatus, string>> = {
  preparing: "Pedido aceptado",
  rejected: "Pedido rechazado",
  ready: "Pedido listo",
  delivered: "Pedido entregado"
};

/**
 * Pedidos de la sucursal en tiempo real + acciones del admin para cambiarlos de estado.
 * Las reglas (transición válida, ETA, mensaje al cliente) las decide `OrderStatusChange`.
 */
export function useAdminOrders(branch: Branch | null, currentUser: User | null, notify: Notify) {
  const [orders, setOrders] = useState<Order[]>([]);
  // Evita mandar dos veces el mismo cambio si el admin toca el botón dos veces.
  const updatingOrderIds = useRef(new Set<string>());

  useEffect(() => {
    if (!branch || !currentUser) {
      setOrders([]);
      return;
    }

    return orderRepository.subscribeByBranch(branch.id, setOrders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, branch?.id]);

  async function changeStatus(order: Order, target: OrderStatus) {
    if (!currentUser || (target === "preparing" && !branch)) {
      notify(
        target === "preparing"
          ? "Selecciona una sucursal e inicia sesión de nuevo."
          : "Inicia sesión de nuevo para actualizar pedidos."
      );
      return;
    }
    if (updatingOrderIds.current.has(order.id)) return;

    updatingOrderIds.current.add(order.id);
    try {
      const update = OrderStatusChange.to(order, target, branch);
      await orderApi.updateStatusAsAdmin(currentUser, order.id, update);
      notify(SUCCESS_NOTICES[target] ?? "Pedido actualizado");
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      notify(error instanceof Error ? error.message : "No se pudo actualizar el pedido");
    } finally {
      updatingOrderIds.current.delete(order.id);
    }
  }

  return {
    orders,
    accept: (order: Order) => changeStatus(order, "preparing"),
    reject: (order: Order) => changeStatus(order, "rejected"),
    markReady: (order: Order) => changeStatus(order, "ready"),
    markDelivered: (order: Order) => changeStatus(order, "delivered")
  };
}
