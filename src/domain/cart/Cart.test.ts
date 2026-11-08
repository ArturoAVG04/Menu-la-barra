import { describe, expect, it } from "vitest";

import { Cart } from "@/domain/cart/Cart";
import { OrderLifecycle } from "@/domain/order/OrderStatus";
import type { CartItem } from "@/types";

const line = (id: string, productId: string, optionIds: string[] = [], quantity = 1): CartItem => ({
  id,
  productId,
  name: productId,
  quantity,
  unitPrice: 50,
  selectedModifiers: optionIds.length ? [{ modifierId: "m", optionIds }] : []
});

describe("Cart", () => {
  it("junta líneas iguales y separa las que tienen otras opciones", () => {
    const cart = Cart.empty().add(line("1", "papas")).add(line("2", "papas")).add(line("3", "papas", ["queso"]));
    expect(cart.items).toHaveLength(2);
    expect(cart.itemCount).toBe(3);
    expect(cart.subtotal).toBe(150);
  });

  it("es inmutable y quita la línea con cantidad 0", () => {
    const original = Cart.empty().add(line("1", "papas"));
    const updated = original.setQuantity("1", 0);
    expect(original.items).toHaveLength(1);
    expect(updated.isEmpty).toBe(true);
  });

  it("calcula propina y total", () => {
    const cart = Cart.from([line("1", "papas", [], 2)]);
    expect(cart.tipFor(10)).toBe(10);
    expect(cart.totalWithTip(10)).toBe(110);
  });
});

describe("OrderLifecycle", () => {
  it("solo permite transiciones válidas", () => {
    expect(OrderLifecycle.canTransition("new", "preparing")).toBe(true);
    expect(OrderLifecycle.canTransition("delivered", "new")).toBe(false);
  });

  it("estima minutos por cantidad de piezas", () => {
    const branch = { orderSettings: { baseItemThreshold: 3, baseMinutes: 20, extraItemStep: 2, extraMinutesPerStep: 5 } };
    expect(OrderLifecycle.estimatedMinutes(branch, { items: [], itemCount: 3 })).toBe(20);
    expect(OrderLifecycle.estimatedMinutes(branch, { items: [], itemCount: 6 })).toBe(30);
  });
});
