import { describe, expect, it } from "vitest";

import { PlaceOrderService, type ExistingOrder, type OrderGateway } from "@/lib/server/orders/PlaceOrderService";
import { RateLimitWindow } from "@/lib/server/orders/RateLimitWindow";
import type { Branch, Product } from "@/types";

const ALL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const branch = { id: "b1", isOpen: true, weeklyHours: [{ days: ALL_DAYS, open: "00:00", close: "23:59", allDay: true }] } as Branch;
const product = { id: "p1", sucursalID: "b1", categoryId: "c", name: "Papas", description: "", price: 50 } as Product;

/** Gateway en memoria para probar el caso de uso sin Firestore. */
class FakeGateway implements OrderGateway {
  orders = new Map<string, Record<string, unknown>>();
  window = new RateLimitWindow(2, 60_000);
  hits: unknown = [];
  async findBranch() { return branch; }
  async findProducts() { return [product]; }
  async findOrder(id: string): Promise<ExistingOrder | null> {
    const order = this.orders.get(id);
    if (!order) return null;
    const { trackingToken, subtotal, tipAmount, total } = order as Record<string, never>;
    return { id, trackingToken, subtotal, tipAmount, total };
  }
  async saveOrder(id: string, order: Record<string, unknown>) {
    if (this.orders.has(id)) return false;
    this.orders.set(id, order);
    return true;
  }
  async allowOrderFrom(_key: string, now: number) {
    const result = this.window.hit(this.hits, now);
    this.hits = result.hits;
    return result.allowed;
  }
  async notifyAdmins() {}
}

const request = (clientOrderId?: string) => ({
  branchId: "b1",
  clientOrderId,
  items: [{ productId: "p1", quantity: 2 }],
  customerName: "Ana",
  customerPhone: "462 123 4567",
  legalConsent: { version: "v1" }
});

describe("PlaceOrderService", () => {
  it("no duplica el pedido si se reintenta con el mismo id", async () => {
    const gateway = new FakeGateway();
    const service = new PlaceOrderService(gateway, "v1");
    const id = "6f1c2d3e-1111-4222-8333-444455556666";
    const first = await service.execute(request(id));
    const retry = await service.execute(request(id));
    expect(retry).toEqual(first);
    expect(first.total).toBe(100);
    expect(gateway.orders.size).toBe(1);
  });

  it("rechaza ids con formato raro", async () => {
    const service = new PlaceOrderService(new FakeGateway(), "v1");
    await expect(service.execute(request("../otro"))).rejects.toThrow("Pedido inválido");
  });

  it("exige teléfono de 10 dígitos", async () => {
    const service = new PlaceOrderService(new FakeGateway(), "v1");
    await expect(service.execute({ ...request(), customerPhone: "" })).rejects.toThrow("10 dígitos");
  });

  it("limita pedidos seguidos por cliente", async () => {
    const service = new PlaceOrderService(new FakeGateway(), "v1");
    await service.execute(request());
    await service.execute(request());
    await expect(service.execute(request())).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });
});

describe("RateLimitWindow", () => {
  it("olvida marcas viejas", () => {
    const window = new RateLimitWindow(1, 1000);
    expect(window.hit([0], 500).allowed).toBe(false);
    expect(window.hit([0], 1500)).toEqual({ allowed: true, hits: [1500] });
    expect(window.hit("basura", 0).allowed).toBe(true);
  });
});
