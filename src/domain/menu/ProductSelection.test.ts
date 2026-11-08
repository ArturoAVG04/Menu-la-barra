import { describe, expect, it } from "vitest";

import { Cart } from "@/domain/cart/Cart";
import { MenuCatalog } from "@/domain/menu/MenuCatalog";
import { MenuProduct } from "@/domain/menu/MenuProduct";
import { ProductSelection } from "@/domain/menu/ProductSelection";
import type { Category, Product } from "@/types";

const burger: Product = {
  id: "burger",
  sucursalID: "b1",
  categoryId: "c1",
  name: "Especial",
  description: "Con papas",
  price: 80,
  salePrice: 70,
  available: true,
  modifiers: [
    {
      id: "extras",
      name: "Extras",
      type: "multiple",
      required: false,
      sortOrder: 2,
      options: [
        { id: "queso", name: "Queso", priceDelta: 15 },
        { id: "tocino", name: "Tocino", priceDelta: 20 }
      ]
    },
    {
      id: "salsa",
      name: "Salsa",
      type: "single",
      required: true,
      sortOrder: 1,
      options: [
        { id: "bbq", name: "BBQ", priceDelta: 0 },
        { id: "mango", name: "Mango habanero", priceDelta: 10 }
      ]
    }
  ]
};

const product = MenuProduct.from(burger);

describe("ProductSelection", () => {
  it("empieza vacía, con cantidad 1 y el precio de promoción como base", () => {
    const selection = ProductSelection.start(product);
    expect(selection.quantity).toBe(1);
    expect(selection.basePrice).toBe(70);
    expect(selection.total).toBe(70);
    expect(selection.missingRequired()?.name).toBe("Salsa");
  });

  it("opción única reemplaza y opción múltiple agrega o quita", () => {
    const selection = ProductSelection.start(product)
      .toggle("salsa", "bbq")
      .toggle("salsa", "mango")
      .toggle("extras", "queso")
      .toggle("extras", "tocino")
      .toggle("extras", "queso");

    expect(selection.optionIdsFor("salsa")).toEqual(["mango"]);
    expect(selection.optionIdsFor("extras")).toEqual(["tocino"]);
    expect(selection.extrasTotal).toBe(30);
    expect(selection.unitPrice).toBe(100);
    expect(selection.missingRequired()).toBeNull();
  });

  it("la cantidad nunca baja de 1 y multiplica el total", () => {
    const selection = ProductSelection.start(product).toggle("salsa", "mango").withQuantity(3);
    expect(selection.total).toBe(240);
    expect(selection.withQuantity(0).quantity).toBe(1);
  });

  it("arma la línea del carrito en el orden de los grupos y sin grupos vacíos", () => {
    const item = ProductSelection.start(product).toggle("extras", "queso").toggle("salsa", "bbq").toCartItem("line-1");
    expect(item).toMatchObject({ id: "line-1", productId: "burger", basePrice: 70, unitPrice: 85, quantity: 1 });
    expect(item.selectedModifiers.map((modifier) => modifier.modifierId)).toEqual(["salsa", "extras"]);

    const onlySalsa = ProductSelection.start(product).toggle("salsa", "bbq").toCartItem("line-2");
    expect(onlySalsa.selectedModifiers).toHaveLength(1);
  });

  it("al editar una línea conserva su id y recalcula el precio", () => {
    const original = ProductSelection.start(product).toggle("salsa", "bbq").toCartItem("line-1");
    const edited = ProductSelection.fromCartItem(product, original).toggle("extras", "tocino").withQuantity(2);
    expect(edited.quantity).toBe(2);
    expect(edited.applyTo(original)).toMatchObject({ id: "line-1", quantity: 2, unitPrice: 90 });
  });

  it("ignora opciones que ya no existen en el menú", () => {
    const stale = { id: "x", productId: "burger", name: "Especial", quantity: 1, unitPrice: 70,
      selectedModifiers: [{ modifierId: "extras", optionIds: ["borrada"] }] };
    expect(ProductSelection.fromCartItem(product, stale).extrasTotal).toBe(0);
  });
});

describe("Cart.findIncompleteLine", () => {
  const catalog = new MenuCatalog([], [burger]);

  it("encuentra la línea a la que le falta un grupo obligatorio", () => {
    const complete = ProductSelection.start(product).toggle("salsa", "bbq").toCartItem("ok");
    const incomplete = ProductSelection.start(product).toCartItem("missing");
    const cart = Cart.from([complete, incomplete]);
    expect(cart.findIncompleteLine((id) => catalog.findProduct(id))?.id).toBe("missing");
    expect(Cart.from([complete]).findIncompleteLine((id) => catalog.findProduct(id))).toBeNull();
  });

  it("vuelve a pedir con ids nuevos", () => {
    const item = ProductSelection.start(product).toggle("salsa", "bbq").toCartItem("old");
    let next = 0;
    const cart = Cart.reorder([item], () => `new-${++next}`);
    expect(cart.items[0]).toMatchObject({ id: "new-1", productId: "burger" });
  });
});

describe("MenuCatalog", () => {
  const categories: Category[] = [
    { id: "c0", sucursalID: "b1", name: "Bebidas", sortOrder: 0 },
    { id: "c1", sucursalID: "b1", name: "Hamburguesas", sortOrder: 1 }
  ];
  const fries: Product = { ...burger, id: "fries", name: "Papas", description: "", modifiers: [] };
  const hidden: Product = { ...burger, id: "hidden", name: "Secreta", available: false };
  const catalog = new MenuCatalog(categories, [burger, fries, hidden]);

  it("busca por nombre, descripción o categoría y oculta lo no disponible", () => {
    expect(catalog.search("").map((item) => item.id)).toEqual(["burger", "fries"]);
    expect(catalog.search("  PAPAS ").map((item) => item.id)).toEqual(["burger", "fries"]);
    expect(catalog.search("hambur").map((item) => item.id)).toEqual(["burger", "fries"]);
    expect(catalog.search("secreta")).toEqual([]);
  });

  it("solo muestra categorías con productos y conserva su posición", () => {
    expect(catalog.categoriesWithProducts.map((category) => category.id)).toEqual(["c1"]);
    const sections = catalog.sectionsFor(catalog.search(""));
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({ position: 1 });
  });
});
