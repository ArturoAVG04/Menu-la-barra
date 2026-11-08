import type { Order, OrderStatus } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_WINDOW_MS = 3 * DAY_MS;
const ACTIVE_STATUSES: readonly OrderStatus[] = ["new", "preparing", "ready"];
const FINISHED_STATUSES: readonly OrderStatus[] = ["delivered", "rejected"];

/**
 * Tablero de pedidos del admin: separa activos e historial y numera los pedidos del día.
 * Recibe "ahora" por constructor para poder probarlo sin depender del reloj.
 */
export class OrderBoard {
  constructor(
    private readonly orders: readonly Order[],
    private readonly now: number = Date.now()
  ) {}

  /** Pedidos en curso (nuevos, en cocina o listos), en el mismo orden en que llegan. */
  get active(): Order[] {
    return this.orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  }

  /** Entregados o rechazados de los últimos 3 días, del más reciente al más viejo. */
  get history(): Order[] {
    return this.orders
      .filter((order) => FINISHED_STATUSES.includes(order.status))
      .filter((order) => this.now - order.createdAt < HISTORY_WINDOW_MS)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  inStatus(status: OrderStatus): Order[] {
    return this.orders.filter((order) => order.status === status);
  }

  get newCount() {
    return this.inStatus("new").length;
  }

  /** Número del pedido dentro de su día (#1 es el primero que llegó ese día). */
  dayNumberOf(order: Order) {
    const date = new Date(order.createdAt);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayEnd = dayStart + DAY_MS;

    const dayOrders = this.orders
      .filter((item) => item.createdAt >= dayStart && item.createdAt < dayEnd)
      .sort((a, b) => a.createdAt - b.createdAt);

    return dayOrders.findIndex((item) => item.id === order.id) + 1;
  }
}
