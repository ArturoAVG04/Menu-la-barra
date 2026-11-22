"use client";

import type { ModifierDraft } from "@/domain/admin/ModifierDraft";
import { SortOrder, type MoveDirection } from "@/domain/admin/SortOrder";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { catalogRepository } from "@/infrastructure";
import type { ModifierTemplate, Product } from "@/types";

/**
 * Los productos guardan una COPIA de sus personalizaciones: al cambiar plantillas se calcula
 * cada producto una sola vez con todos los cambios (si no, dos escrituras se pisaban).
 */
function applyTemplates(products: readonly Product[], templates: readonly ModifierTemplate[], removedId?: string) {
  const byId = new Map(templates.map((template) => [template.id, template]));
  return products
    .filter((item) => item.modifiers.some((m) => byId.has(m.id) || m.id === removedId))
    .map((item) => ({
      ...item,
      modifiers: item.modifiers.filter((m) => m.id !== removedId).map((m) => byId.get(m.id) ?? m)
    }));
}

/** Guardar, ordenar y borrar plantillas de personalización. */
export function useModifierActions(branchId: string | undefined, modifiers: ModifierTemplate[], products: Product[], notify: Notify) {
  async function saveModifier(draft: ModifierDraft) {
    if (!branchId) return;
    const template = draft.toTemplate(modifiers);
    await catalogRepository.saveMany({
      modifiers: [{ branchId, template }],
      products: applyTemplates(products, [template])
    });
    notify("Personalización guardada");
  }

  async function moveModifier(modifierId: string, direction: MoveDirection) {
    if (!branchId) return;
    const reordered = SortOrder.move(modifiers, modifierId, direction);
    if (!reordered) return;
    await catalogRepository.saveMany({
      modifiers: reordered.map((template) => ({ branchId, template })),
      products: applyTemplates(products, reordered)
    });
    notify("Orden de personalizaciones actualizado");
  }

  async function deleteModifier(modifierId: string) {
    if (!branchId) return;
    try {
      await catalogRepository.saveMany({ products: applyTemplates(products, [], modifierId) });
      await catalogRepository.deleteModifier(branchId, modifierId);
      notify("Personalización eliminada");
    } catch {
      notify("Error al eliminar personalización");
    }
  }

  return { saveModifier, moveModifier, deleteModifier };
}
