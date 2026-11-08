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

/** Pasos que ve el cliente en el seguimiento, en orden. */
export const TRACKING_STEPS = ["new", "preparing", "ready", "delivered"] as const;
export type TrackingStep = (typeof TRACKING_STEPS)[number];

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

  /** Con un pedido en cocina o rechazado, el cliente ya no puede agregar productos desde el menú. */
  static blocksNewItems(status: OrderStatus) {
    return status === "preparing" || status === "rejected";
  }

  /** Estados en los que conviene ofrecer mandar el ticket por WhatsApp. */
  static suggestsWhatsappTicket(status: OrderStatus) {
    return status === "preparing" || status === "ready" || status === "rejected";
  }

  /** ¿El pedido ya llegó (o pasó) este paso del seguimiento? Un rechazado solo marca "Recibido". */
  static hasReachedStep(status: OrderStatus, step: TrackingStep) {
    if (status === "rejected") return step === "new";
    return TRACKING_STEPS.indexOf(step) <= TRACKING_STEPS.indexOf(status as TrackingStep);
  }

  /** Texto de cuenta regresiva mientras el pedido está en cocina (o null si no aplica). */
  static countdownLabel(
    order: Pick<Order, "status" | "estimatedReadyAt" | "estimatedMinutes">,
    now: number
  ) {
    if (order.status !== "preparing") return null;

    if (typeof order.estimatedReadyAt === "number") {
      const remainingMinutes = Math.max(0, Math.ceil((order.estimatedReadyAt - now) / 60_000));
      return remainingMinutes > 0
        ? `Pedido listo en aproximadamente ${remainingMinutes} min`
        : "Pedido listo en cualquier momento";
    }

    if (typeof order.estimatedMinutes === "number") {
      return `Pedido listo en aproximadamente ${order.estimatedMinutes} min`;
    }

    return null;
  }
}
