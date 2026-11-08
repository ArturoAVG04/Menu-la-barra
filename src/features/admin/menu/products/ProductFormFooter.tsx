"use client";

import { Tag, Trash2 } from "lucide-react";

import { currency } from "@/lib/utils";

/** Pie del formulario: precio final, eliminar (si se edita) y guardar. */
export function ProductFormFooter({
  finalPrice,
  canDelete,
  canSave,
  isSaving,
  onDelete
}: {
  finalPrice: number;
  canDelete: boolean;
  canSave: boolean;
  isSaving: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4 rounded-card border border-line bg-surface p-4 md:flex-row md:justify-between">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <p className="inline-flex items-center gap-2 font-semibold text-text">
          <Tag size={16} />
          {currency(finalPrice)}
        </p>

        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-danger/30 px-4 text-xs font-bold text-danger transition hover:bg-danger/10"
          >
            <Trash2 size={14} />
            Eliminar producto
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isSaving || !canSave}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
      >
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
