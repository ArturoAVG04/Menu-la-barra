import { DomainError } from "@/domain/errors";
import { OrderLifecycle } from "@/domain/order/OrderStatus";
import type { Branch, Order, OrderStatus } from "@/types";

/** Cambio de estado listo para mandarse a la API. */
export type StatusChange = {
  status: OrderStatus;
  statusMessage: string;
  estimatedMinutes?: number;
  estimatedReadyAt?: number;
};

/** Mensaje que ve el cliente en su seguimiento según el nuevo estado. */
const CUSTOMER_MESSAGES: Partial<Record<OrderStatus, string>> = {
  preparing:
    "Tu pedido fue aceptado. Te recomendamos mandar mensaje al restaurante por cualquier detalle o para recibir actualizaciones.",
  rejected: "Tu pedido fue rechazado. Te recomendamos mandar mensaje al restaurante para revisar cualquier detalle.",
  ready: "Tu pedido está listo. Te recomendamos mandar mensaje al restaurante para coordinar cualquier detalle.",
  delivered: "Pedido entregado"
};

/**
 * Construye el cambio de estado que hace el admin. Usa `OrderLifecycle` para
 * validar la transición y, al aceptar, para calcular el tiempo estimado.
 */
export class OrderStatusChange {
  static to(
    order: Pick<Order, "status" | "itemCount" | "items">,
    target: OrderStatus,
    branch: Pick<Branch, "orderSettings"> | null,
    now: number = Date.now()
  ): StatusChange {
    if (!OrderLifecycle.canTransition(order.status, target)) {
      throw new DomainError(
        `No se puede pasar de "${OrderLifecycle.label(order.status)}" a "${OrderLifecycle.label(target)}".`,
        "INVALID_TRANSITION"
      );
    }

    const change: StatusChange = { status: target, statusMessage: CUSTOMER_MESSAGES[target] ?? "" };

    if (target === "preparing") {
      const estimatedMinutes = OrderLifecycle.estimatedMinutes(branch ?? {}, order);
      change.estimatedMinutes = estimatedMinutes;
      change.estimatedReadyAt = now + estimatedMinutes * 60_000;
    }

    return change;
  }
}
