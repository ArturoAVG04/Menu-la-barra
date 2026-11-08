import type { Branch, Order, OrderStatus } from "@/types";

const LABELS: Record<OrderStatus, string> = {
  new: "Pendiente de confirmación",
  preparing: "En cocina",
  ready: "Listo para entrega",
  rejected: "Pedido rechazado",
  delivered: "Pedido entregado"
};

/** Qué cambios de estado están permitidos (máquina de estados del pedido). */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ["preparing", "rejected"],
  preparing: ["ready", "rejected"],
  ready: ["delivered"],
  rejected: [],
  delivered: []
};

export const DEFAULT_ORDER_SETTINGS = {
  baseItemThreshold: 3,
  baseMinutes: 20,
  extraItemStep: 2,
  extraMinutesPerStep: 5
} as const;

/** Reglas del ciclo de vida de un pedido. */
export class OrderLifecycle {
  static label(status: OrderStatus) {
    return LABELS[status] ?? status;
  }

  static canTransition(from: OrderStatus, to: OrderStatus) {
    return TRANSITIONS[from]?.includes(to) ?? false;
  }

  static isFinished(status: OrderStatus) {
    return TRANSITIONS[status]?.length === 0;
  }

  /** Número corto que ve el cliente, ej. "#4PUTSF". */
  static shortCode(orderId: string) {
    return `#${orderId.slice(-6).toUpperCase()}`;
  }

  /** Minutos estimados según cuántas piezas tiene el pedido y la configuración de la sucursal. */
  static estimatedMinutes(branch: Pick<Branch, "orderSettings">, order: Pick<Order, "itemCount" | "items">) {
    const settings = branch.orderSettings ?? DEFAULT_ORDER_SETTINGS;
    const itemCount = order.itemCount ?? order.items.reduce((sum, item) => sum + item.quantity, 0);
    if (itemCount <= settings.baseItemThreshold) return settings.baseMinutes;
    const extraBlocks = Math.ceil(
      (itemCount - settings.baseItemThreshold) / Math.max(settings.extraItemStep, 1)
    );
    return settings.baseMinutes + extraBlocks * settings.extraMinutesPerStep;
  }
}
