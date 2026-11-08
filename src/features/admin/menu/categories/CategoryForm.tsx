"use client";

import { useState } from "react";

import type { CategoryEditor } from "@/features/admin/hooks/useCategoryEditor";
import type { Category } from "@/types";

/** Formulario para crear o renombrar una categoría. */
export function CategoryForm({
  editor,
  onSave
}: {
  editor: CategoryEditor;
  onSave: (name: string, editingId: string | null) => Promise<Category | null>;
}) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!editor.name.trim()) return;

    setIsSaving(true);
    try {
      await onSave(editor.name, editor.editingId);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-4 rounded-shell border border-line bg-panel p-6 text-center">
      <h2 className="text-xl font-semibold text-text">
        {editor.editingId ? "Editar categoría" : "Nueva categoría"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={editor.name}
          onChange={(event) => editor.setName(event.target.value)}
          className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 text-center outline-none focus:border-brand"
          placeholder="Nombre"
        />
        <div className="flex justify-center gap-2">
          <button
            type="submit"
            disabled={!editor.name.trim() || isSaving}
            className="inline-flex flex-1 min-h-[44px] items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line"
          >
            {isSaving ? "Guardando..." : editor.editingId ? "Actualizar" : "+ Agregar"}
          </button>
        </div>
      </form>
    </section>
  );
}
