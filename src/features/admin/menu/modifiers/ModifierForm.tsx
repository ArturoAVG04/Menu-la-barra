"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { ModifierDraft } from "@/domain/admin/ModifierDraft";
import type { ModifierEditor } from "@/features/admin/hooks/useModifierEditor";
import type { ModifierTemplate } from "@/types";

const inputClass = "min-h-11 rounded-card border border-line bg-surface px-4 py-3 text-left outline-none";

/** Formulario de plantilla de opciones: nombre, tipo, si es obligatoria y sus opciones con precio. */
export function ModifierForm({
  editor,
  onSave
}: {
  editor: ModifierEditor;
  onSave: (draft: ModifierDraft) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const { draft } = editor;
  const values = draft.values;
  const patch = (changes: Partial<ModifierTemplate>) => editor.update((current) => current.with(changes));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.canSave) return;

    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-shell border border-line bg-panel p-6 text-center">
      <h2 className="text-xl font-semibold text-text">
        {draft.isNew ? "Nueva personalización" : "Editar personalización"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={values.name}
          onChange={(event) => patch({ name: event.target.value })}
          className={`${inputClass} w-full`}
          placeholder="Nombre"
        />

        <label className="space-y-2 text-sm text-text">
          <span>Prioridad</span>
          <input
            type="number"
            min="1"
            step="1"
            value={values.sortOrder || ""}
            onChange={(event) => patch({ sortOrder: Number(event.target.value) || 0 })}
            className={`${inputClass} w-full`}
            placeholder="Ej: 1"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={values.type}
            onChange={(event) => patch({ type: event.target.value as ModifierTemplate["type"] })}
            className={inputClass}
          >
            <option value="multiple">Múltiple</option>
            <option value="single">Única</option>
          </select>

          <label className="grid min-h-11 grid-cols-[20px_1fr] items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left text-sm text-text">
            <input
              type="checkbox"
              checked={values.required}
              onChange={(event) => patch({ required: event.target.checked })}
            />
            <span>Obligatoria</span>
          </label>
        </div>

        <div className="space-y-3">
          {values.options.map((option, index) => (
            <div key={option.id} className="grid gap-3 md:grid-cols-[1fr_160px]">
              <input
                value={option.name}
                onChange={(event) => {
                  const name = event.target.value;
                  editor.update((current) => current.updateOption(index, { name }));
                }}
                className={inputClass}
                placeholder="Opción"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={option.priceDelta}
                onChange={(event) => {
                  const priceDelta = Number(event.target.value);
                  editor.update((current) => current.updateOption(index, { priceDelta }));
                }}
                className={inputClass}
                placeholder="Precio"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => editor.update((current) => current.addOption())}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
        >
          <span className="inline-flex items-center gap-2">
            <Plus size={16} />
            Agregar opción
          </span>
        </button>

        <button
          type="submit"
          disabled={isSaving || !draft.canSave}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
