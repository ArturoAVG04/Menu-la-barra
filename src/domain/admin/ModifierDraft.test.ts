import { describe, expect, it } from "vitest";

import { ModifierDraft } from "@/domain/admin/ModifierDraft";
import { SortOrder } from "@/domain/admin/SortOrder";
import type { ModifierTemplate } from "@/types";

const template = (id: string, sortOrder?: number): ModifierTemplate => ({
  id,
  name: id,
  type: "single",
  required: false,
  sortOrder,
  options: []
});

describe("ModifierDraft", () => {
  it("empieza con una opción en blanco y no se puede guardar sin nombre", () => {
    const draft = ModifierDraft.empty();
    expect(draft.isNew).toBe(true);
    expect(draft.values.options).toHaveLength(1);
    expect(draft.canSave).toBe(false);
    expect(draft.with({ name: "Salsas" }).canSave).toBe(true);
  });

  it("edita y agrega opciones sin mutar el original", () => {
    const original = ModifierDraft.empty();
    const edited = original.updateOption(0, { name: "Queso", priceDelta: 10 }).addOption();
    expect(original.values.options[0].name).toBe("");
    expect(edited.values.options).toHaveLength(2);
    expect(edited.values.options[0]).toMatchObject({ name: "Queso", priceDelta: 10 });
  });

  it("al guardar quita opciones vacías y una plantilla nueva va al final", () => {
    const saved = ModifierDraft.empty()
      .with({ name: "Extras" })
      .updateOption(0, { name: "Tocino" })
      .addOption()
      .toTemplate([template("a"), template("b")], "nuevo");

    expect(saved.id).toBe("nuevo");
    expect(saved.sortOrder).toBe(3);
    expect(saved.options.map((option) => option.name)).toEqual(["Tocino"]);
  });

  it("al editar conserva la prioridad guardada", () => {
    const saved = ModifierDraft.fromTemplate({ ...template("a", 1), sortOrder: 9 }).toTemplate([template("a", 4)]);
    expect(saved.sortOrder).toBe(4);
  });
});

describe("SortOrder", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("mueve un elemento y renumera desde 1", () => {
    expect(SortOrder.move(items, "c", "up")).toEqual([
      { id: "a", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
      { id: "b", sortOrder: 3 }
    ]);
  });

  it("no mueve fuera de la lista ni ids inexistentes", () => {
    expect(SortOrder.move(items, "a", "up")).toBeNull();
    expect(SortOrder.move(items, "c", "down")).toBeNull();
    expect(SortOrder.move(items, "x", "down")).toBeNull();
  });

  it("ordena por prioridad sin tocar la lista original", () => {
    const list = [template("b", 2), template("sin"), template("a", 1)];
    expect(SortOrder.byPriority(list).map((item) => item.id)).toEqual(["sin", "a", "b"]);
    expect(list[0].id).toBe("b");
  });
});
