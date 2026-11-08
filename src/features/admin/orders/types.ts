import type { Order } from "@/types";

/** Acciones que el admin puede hacer sobre un pedido (las mismas en tarjeta y detalle). */
export type OrderActions = {
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  onReady: (order: Order) => void;
  onDelivered: (order: Order) => void;
};
