"use client";

import type { ModifierDraft } from "@/domain/admin/ModifierDraft";
import type { ModifierEditor } from "@/features/admin/hooks/useModifierEditor";
import type { ProductCatalog } from "@/features/admin/hooks/useProductCatalog";
import { SectionToggleHeader } from "@/features/admin/menu/SectionToggleHeader";
import { ModifierForm } from "@/features/admin/menu/modifiers/ModifierForm";
import { ModifierList } from "@/features/admin/menu/modifiers/ModifierList";

/** Pestaña "Personalizaciones" (plantillas de opciones reutilizables entre productos). */
export function ModifiersTab({ catalog, editor }: { catalog: ProductCatalog; editor: ModifierEditor }) {
  async function handleSave(draft: ModifierDraft) {
    await catalog.saveModifier(draft);
    editor.close();
  }

  async function handleDelete(modifierId: string) {
    if (!confirm("¿Eliminar personalización?")) return;
    if (editor.draft.values.id === modifierId) editor.reset();
    await catalog.deleteModifier(modifierId);
  }

  return (
    <div className="space-y-6">
      <SectionToggleHeader
        title="Personalizaciones"
        isOpen={editor.isOpen}
        onToggle={editor.isOpen ? editor.close : editor.open}
      />

      {editor.isOpen ? (
        <ModifierForm editor={editor} onSave={handleSave} />
      ) : (
        <ModifierList
          modifiers={catalog.modifiers}
          onMove={(modifierId, direction) => void catalog.moveModifier(modifierId, direction)}
          onEdit={editor.edit}
          onDelete={(modifierId) => void handleDelete(modifierId)}
        />
      )}
    </div>
  );
}
