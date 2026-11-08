"use client";

import type { NewBranchForm } from "@/domain/branch/BranchFactory";
import type { BranchManager } from "@/features/admin/hooks/useBranchManager";

const inputClass = "min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 text-center outline-none";
const checkboxClass =
  "flex min-h-11 items-center justify-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-center text-sm text-text";

const TEXT_FIELDS: { key: Exclude<keyof NewBranchForm, "isOpen" | "isPrimary">; placeholder: string }[] = [
  { key: "name", placeholder: "Nombre" },
  { key: "slug", placeholder: "Slug" },
  { key: "address", placeholder: "Dirección" },
  { key: "whatsapp", placeholder: "WhatsApp" },
  { key: "instagram", placeholder: "Instagram" }
];

type CreateBranchModalProps = {
  manager: BranchManager;
  onClose: () => void;
  onCreated: (branchId: string) => void;
};

/** Ventana "Nueva sucursal". */
export function CreateBranchModal({ manager, onClose, onCreated }: CreateBranchModalProps) {
  const { form, updateForm } = manager;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const branchId = await manager.create();
    if (branchId) onCreated(branchId);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
      <div className="w-full max-w-xl rounded-shell border border-line bg-panel p-6 text-center shadow-glow">
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
          <h2 className="text-2xl font-semibold text-text">Nueva sucursal</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {TEXT_FIELDS.map(({ key, placeholder }) => (
            <input
              key={key}
              value={form[key] || ""}
              onChange={(event) => updateForm({ [key]: event.target.value })}
              className={inputClass}
              placeholder={placeholder}
            />
          ))}
          <div className="grid gap-4 md:grid-cols-2">
            <label className={checkboxClass}>
              <input
                type="checkbox"
                checked={form.isOpen}
                onChange={(event) => updateForm({ isOpen: event.target.checked })}
              />
              Abierta
            </label>
            <label className={checkboxClass}>
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(event) => updateForm({ isPrimary: event.target.checked })}
              />
              Principal
            </label>
          </div>
          <button
            type="submit"
            disabled={manager.isCreating || !manager.canCreate}
            className="inline-flex min-h-11 items-center justify-center self-center rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
          >
            {manager.isCreating ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>
  );
}
