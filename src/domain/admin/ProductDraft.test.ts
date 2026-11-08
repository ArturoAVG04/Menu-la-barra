import { describe, expect, it } from "vitest";

import { ProductDraft } from "@/domain/admin/ProductDraft";
import type { Product, ProductModifier } from "@/types";

const product = (overrides: Partial<Product> = {}): Product => ({
  id: "p1",
  sucursalID: "b1",
  categoryId: "c1",
  name: "Papas",
  description: "",
  price: 100,
  available: true,
  modifiers: [],
  ...overrides
});

const salsa: ProductModifier = { id: "salsa", name: "Salsa", type: "single", required: false, options: [] };

describe("ProductDraft", () => {
  it("empieza vacío y asignado a la sucursal actual", () => {
    const draft = ProductDraft.empty("b1");
    expect(draft.values.branchIds).toEqual(["b1"]);
    expect(draft.canSave).toBe(false);
    expect(ProductDraft.empty().values.branchIds).toEqual([]);
  });

  it("solo se puede guardar con nombre (sin espacios) y categoría", () => {
    const draft = ProductDraft.empty("b1").with({ name: "   ", categoryId: "c1" });
    expect(draft.canSave).toBe(false);
    expect(draft.with({ name: "Papas" }).canSave).toBe(true);
    expect(draft.with({ name: "Papas", categoryId: "" }).canSave).toBe(false);
  });

  it("calcula el precio con descuento sin bajar de 0", () => {
    expect(ProductDraft.empty().with({ price: 80, discountPercent: 25 }).salePrice).toBe(60);
    expect(ProductDraft.empty().with({ price: 80, discountPercent: 0 }).salePrice).toBe(80);
    expect(ProductDraft.empty().with({ price: 80, discountPercent: 150 }).salePrice).toBe(0);
  });

  it("es inmutable", () => {
    const original = ProductDraft.empty("b1");
    const changed = original.with({ name: "Hot dog" });
    expect(original.values.name).toBe("");
    expect(changed.values.name).toBe("Hot dog");
  });

  it("agrega y quita sucursales sin repetir", () => {
    const draft = ProductDraft.empty("b1").toggleBranch("b2", true).toggleBranch("b2", true);
    expect(draft.values.branchIds).toEqual(["b1", "b2"]);
    expect(draft.toggleBranch("b1", false).values.branchIds).toEqual(["b2"]);
    expect(draft.hasBranch("b2")).toBe(true);
  });

  it("agrega y quita personalizaciones", () => {
    const draft = ProductDraft.empty().toggleModifier(salsa, true);
    expect(draft.hasModifier("salsa")).toBe(true);
    expect(draft.toggleModifier(salsa, false).hasModifier("salsa")).toBe(false);
  });

  it("al cargar un producto sin sucursales usa la suya", () => {
    expect(ProductDraft.fromProduct(product({ branchIds: [] })).values.branchIds).toEqual(["b1"]);
    expect(ProductDraft.fromProduct(product({ branchIds: ["b2"] })).values.branchIds).toEqual(["b2"]);
  });

  it("un producto nuevo sin prioridad va al final de su categoría", () => {
    const catalog = [product({ id: "a" }), product({ id: "b" }), product({ id: "c", categoryId: "otra" })];
    const saved = ProductDraft.empty("b1")
      .with({ name: "Nuevo", categoryId: "c1", price: 50, discountPercent: 10 })
      .toProduct({ branchId: "b1", catalog, newId: "nuevo" });

    expect(saved).toMatchObject({ id: "nuevo", sucursalID: "b1", sortOrder: 3, salePrice: 45, branchIds: ["b1"] });
  });

  it("al editar respeta la prioridad y no se cuenta a sí mismo", () => {
    const catalog = [product({ id: "p1" }), product({ id: "p2" })];
    const draft = ProductDraft.fromProduct(product({ id: "p1", sortOrder: 0 }));
    expect(draft.toProduct({ branchId: "b1", catalog }).sortOrder).toBe(2);
    expect(draft.with({ sortOrder: 7 }).toProduct({ branchId: "b1", catalog }).sortOrder).toBe(7);
  });

  it("genera una copia por sucursal elegida", () => {
    const copies = ProductDraft.empty("b1")
      .toggleBranch("b2", true)
      .with({ name: "Papas", categoryId: "c1" })
      .toBranchCopies({ branchId: "b1", catalog: [], newId: "x" });

    expect(copies.map((copy) => copy.sucursalID)).toEqual(["b1", "b2"]);
    expect(copies.every((copy) => copy.id === "x")).toBe(true);
  });

  it("la vista previa rellena textos vacíos", () => {
    const preview = ProductDraft.empty().with({ price: 100, discountPercent: 50 }).preview("b1");
    expect(preview).toMatchObject({ id: "preview", name: "Nombre del producto", salePrice: 50, sucursalID: "b1" });
  });
});
