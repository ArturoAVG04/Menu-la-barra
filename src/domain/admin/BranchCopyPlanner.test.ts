import { describe, expect, it } from "vitest";

import { BranchCopyPlanner } from "./BranchCopyPlanner";
import { SortOrder } from "./SortOrder";
import type { Category, Product } from "@/types";

const cat = (id: string, sucursalID: string, name: string, sortOrder = 1): Category => ({ id, sucursalID, name, sortOrder });
const product = { id: "p1", name: "Taco", categoryId: "c-a", branchIds: ["A", "B", "C"], sucursalID: "A" } as unknown as Product;

describe("BranchCopyPlanner", () => {
  it("liga cada copia a la categoría con el mismo nombre en su sucursal", () => {
    const plan = BranchCopyPlanner.plan({
      product,
      sourceBranchId: "A",
      sourceCategories: [cat("c-a", "A", "Tacos")],
      categoriesByBranch: { B: [cat("c-b", "B", "tacos")], C: [cat("x", "C", "Bebidas", 4)] },
      newId: () => "nueva"
    });
    expect(plan.copies.map((c) => [c.sucursalID, c.categoryId])).toEqual([["A", "c-a"], ["B", "c-b"], ["C", "nueva"]]);
    expect(plan.newCategories).toEqual([cat("nueva", "C", "Tacos", 5)]);
  });

  it("dice de qué sucursales borrar si se quitaron", () => {
    const plan = BranchCopyPlanner.plan({
      product: { ...product, branchIds: ["A"] },
      sourceBranchId: "A",
      sourceCategories: [],
      categoriesByBranch: {},
      previousBranchIds: ["A", "B"]
    });
    expect(plan.removeFrom).toEqual(["B"]);
  });
});

describe("SortOrder.next", () => {
  it("usa el mayor + 1 aunque se haya borrado uno", () => {
    expect(SortOrder.next([{ sortOrder: 2 }, { sortOrder: 3 }])).toBe(4);
    expect(SortOrder.next([])).toBe(1);
  });
});
