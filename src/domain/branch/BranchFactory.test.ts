import { describe, expect, it } from "vitest";

import { BranchFactory, EMPTY_BRANCH_FORM } from "@/domain/branch/BranchFactory";
import { RgbColor } from "@/domain/branding/RgbColor";
import type { Branch } from "@/types";

describe("BranchFactory", () => {
  it("no crea sucursales sin nombre", () => {
    expect(BranchFactory.canCreate({ ...EMPTY_BRANCH_FORM, name: "  " })).toBe(false);
    expect(BranchFactory.canCreate({ ...EMPTY_BRANCH_FORM, name: "Presa" })).toBe(true);
  });

  it("genera el slug desde el nombre si no lo escriben", () => {
    expect(BranchFactory.slugFor({ name: "La Barra Presa", slug: "" })).toBe("la-barra-presa");
    expect(BranchFactory.slugFor({ name: "La Barra Presa", slug: " presa " })).toBe("presa");
  });

  it("crea la sucursal con datos limpios y tiempos por defecto", () => {
    const branch = BranchFactory.create(
      { ...EMPTY_BRANCH_FORM, name: "Salamanca", address: " Centro ", isPrimary: true },
      "id-1",
      []
    );
    expect(branch).toMatchObject({ id: "id-1", name: "Salamanca", slug: "salamanca", address: "Centro", isOpen: true });
    expect(branch.orderSettings).toEqual({ baseItemThreshold: 3, baseMinutes: 20, extraItemStep: 2, extraMinutesPerStep: 5 });
  });

  it("solo puede haber una principal", () => {
    const branches = [
      { id: "a", isPrimary: true },
      { id: "b", isPrimary: false },
      { id: "c", isPrimary: true }
    ] as Branch[];
    expect(BranchFactory.demoteOthers(branches, "c")).toEqual([{ id: "a", isPrimary: false }]);
  });
});

describe("RgbColor", () => {
  it("convierte entre hex y el formato de Tailwind", () => {
    expect(RgbColor.fromHex("#37655e")).toBe("55 101 94");
    expect(RgbColor.toHex("55 101 94")).toBe("#37655e");
    expect(RgbColor.toHex("300 -4 0")).toBe("#ff0000");
  });
});
