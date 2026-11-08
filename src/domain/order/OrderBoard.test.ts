import { describe, expect, it } from "vitest";

import { DomainError } from "@/domain/errors";
import { OrderBoard } from "@/domain/order/OrderBoard";
import { OrderStatusChange } from "@/domain/order/OrderStatusChange";
import type { Order, OrderStatus } from "@/types";

const HOUR = 60 * 60 * 1000;
const now = new Date(2026, 10, 7, 20, 0).getTime();

const order = (id: string, status: OrderStatus, createdAt: number, quantity = 1): Order => ({
  id,
  sucursalID: "b1",
  customerName: id,
  items: [{ id: `${id}-1`, productId: "p", name: "Papas", quantity, unitPrice: 50, selectedModifiers: [] }],
  total: 50 * quantity,
  status,
  createdAt
});

describe("OrderBoard", () => {
  const orders = [
    order("n1", "new", now - 1 * HOUR),
    order("p1", "preparing", now - 2 * HOUR),
    order("d1", "delivered", now - 3 * HOUR),
    order("r1", "rejected", now - 5 * HOUR),
    order("viejo", "delivered", now - 4 * 24 * HOUR)
  ];
  const board = new OrderBoard(orders, now);

  it("separa pedidos activos del historial", () => {
    expect(board.active.map((item) => item.id)).toEqual(["n1", "p1"]);
    expect(board.newCount).toBe(1);
    expect(board.inStatus("preparing").map((item) => item.id)).toEqual(["p1"]);
  });

  it("el historial solo trae los últimos 3 días, del más reciente al más viejo", () => {
    expect(board.history.map((item) => item.id)).toEqual(["d1", "r1"]);
  });

  it("numera los pedidos dentro de su día", () => {
    expect(board.dayNumberOf(orders[3])).toBe(1);
    expect(board.dayNumberOf(orders[0])).toBe(4);
    expect(board.dayNumberOf(orders[4])).toBe(1);
  });
});

describe("OrderStatusChange", () => {
  const branch = { orderSettings: { baseItemThreshold: 3, baseMinutes: 20, extraItemStep: 2, extraMinutesPerStep: 5 } };

  it("al aceptar calcula el tiempo estimado con la configuración de la sucursal", () => {
    const change = OrderStatusChange.to(order("a", "new", now, 6), "preparing", branch, now);
    expect(change.status).toBe("preparing");
    expect(change.estimatedMinutes).toBe(30);
    expect(change.estimatedReadyAt).toBe(now + 30 * 60_000);
    expect(change.statusMessage).toContain("aceptado");
  });

  it("los demás cambios solo llevan estado y mensaje", () => {
    const change = OrderStatusChange.to(order("a", "ready", now), "delivered", null, now);
    expect(change).toEqual({ status: "delivered", statusMessage: "Pedido entregado" });
  });

  it("rechaza transiciones inválidas", () => {
    expect(() => OrderStatusChange.to(order("a", "delivered", now), "preparing", branch)).toThrow(DomainError);
    expect(() => OrderStatusChange.to(order("a", "new", now), "ready", branch)).toThrow(DomainError);
  });
});
