import { describe, expect, it } from "vitest";

import { DomainError } from "@/domain/errors";
import { OrderPricing } from "@/domain/order/OrderPricing";
import type { Product } from "@/types";

const burger: Product = {
  id: "burger",
  sucursalID: "b1",
  categoryId: "c1",
  name: "Especial",
  description: "",
  price: 80,
  salePrice: 70,
  available: true,
  modifiers: [
    {
      id: "salsa",
      name: "Salsa",
      type: "single",
      required: true,
      options: [
        { id: "bbq", name: "BBQ", priceDelta: 0 },
        { id: "mango", name: "Mango habanero", priceDelta: 10 }
      ]
    },
    {
      id: "extras",
      name: "Extras",
      type: "multiple",
      required: false,
      options: [
        { id: "tocino", name: "Tocino", priceDelta: 15 },
        { id: "queso", name: "Queso", priceDelta: 10 }
      ]
    }
  ]
};

const fries: Product = {
  id: "fries",
  sucursalID: "b1",
  categoryId: "c2",
  name: "Papas",
  description: "",
  price: 50,
  available: false,
  modifiers: []
};

const pricing = new OrderPricing([burger, fries]);

describe("OrderPricing", () => {
  it("usa el precio de promoción y suma las opciones", () => {
    const result = pricing.price(
      [
        {
          productId: "burger",
          quantity: 2,
          selectedModifiers: [
            { modifierId: "salsa", optionIds: ["mango"] },
            { modifierId: "extras", optionIds: ["tocino", "queso"] }
          ]
        }
      ],
      10
    );

    expect(result.items[0].unitPrice).toBe(70 + 10 + 15 + 10);
    expect(result.subtotal).toBe(210);
    expect(result.tipAmount).toBe(21);
    expect(result.total).toBe(231);
    expect(result.itemCount).toBe(2);
  });

  it("ignora precios mandados por el cliente", () => {
    const tampered = { productId: "burger", quantity: 1, unitPrice: 1, selectedModifiers: [{ modifierId: "salsa", optionIds: ["bbq"] }] };
    expect(pricing.price([tampered], 0).total).toBe(70);
  });

  it("rechaza si falta una opción obligatoria", () => {
    expect(() => pricing.price([{ productId: "burger", quantity: 1 }], 0)).toThrow(DomainError);
  });

  it("rechaza dos opciones en un grupo de una sola", () => {
    expect(() =>
      pricing.price(
        [{ productId: "burger", quantity: 1, selectedModifiers: [{ modifierId: "salsa", optionIds: ["bbq", "mango"] }] }],
        0
      )
    ).toThrow(/Solo puedes elegir una/);
  });

  it("rechaza productos agotados, inexistentes y cantidades inválidas", () => {
    expect(() => pricing.price([{ productId: "fries", quantity: 1 }], 0)).toThrow(/no está disponible/);
    expect(() => pricing.price([{ productId: "x", quantity: 1 }], 0)).toThrow(/ya no está/);
    expect(() =>
      pricing.price([{ productId: "burger", quantity: 0, selectedModifiers: [{ modifierId: "salsa", optionIds: ["bbq"] }] }], 0)
    ).toThrow(/Cantidad inválida/);
  });

  it("limita la propina entre 0 y 100 %", () => {
    expect(OrderPricing.normalizeTipPercent(-5)).toBe(0);
    expect(OrderPricing.normalizeTipPercent(250)).toBe(100);
  });
});
