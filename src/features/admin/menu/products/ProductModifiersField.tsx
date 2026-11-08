"use client";

import type { ProductDraft } from "@/domain/admin/ProductDraft";
import type { ModifierTemplate } from "@/types";

/** Elige qué plantillas de opciones (personalizaciones) lleva el producto. */
export function ProductModifiersField({
  draft,
  modifiers,
  onChange,
  onCreateModifier
}: {
  draft: ProductDraft;
  modifiers: ModifierTemplate[];
  onChange: (change: (draft: ProductDraft) => ProductDraft) => void;
  onCreateModifier: () => void;
}) {
  return (
    <div className="space-y-2 text-sm text-text lg:col-span-2">
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
        <span>Personalizaciones</span>
        <button
          type="button"
          onClick={onCreateModifier}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
        >
          Crear nueva
        </button>
      </div>
      <div className="grid gap-3">
        {modifiers.length ? (
          modifiers.map((modifier) => (
            <label
              key={modifier.id}
              className="grid min-h-[72px] grid-cols-[20px_1fr] items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left text-sm text-text"
            >
              <input
                type="checkbox"
                checked={draft.hasModifier(modifier.id)}
                onChange={(event) => {
                  const selected = event.target.checked;
                  onChange((current) => current.toggleModifier(modifier, selected));
                }}
              />
              <div className="min-w-0">
                <p className="font-semibold text-text">{modifier.name}</p>
                <p className="text-muted">{modifier.options.length} opciones</p>
              </div>
            </label>
          ))
        ) : (
          <div className="rounded-card border border-dashed border-line bg-surface p-4 text-sm text-muted">
            Sin personalizaciones.
          </div>
        )}
      </div>
    </div>
  );
}
