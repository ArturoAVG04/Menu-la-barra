"use client";

import type { Branch } from "@/types";

const inputClass = "min-h-11 rounded-card border border-line bg-surface px-4 py-3 text-center outline-none";
const checkboxClass =
  "flex min-h-11 items-center justify-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-center text-sm text-text";

/** Datos generales de la sucursal: nombre, slug, contacto y estado. */
export function BranchInfoFields({ branch, onChange }: { branch: Branch; onChange: (patch: Partial<Branch>) => void }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={branch.name}
          onChange={(event) => onChange({ name: event.target.value })}
          className={inputClass}
          placeholder="Nombre"
        />
        <input
          value={branch.slug}
          onChange={(event) => onChange({ slug: event.target.value })}
          className={inputClass}
          placeholder="Slug"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={branch.address}
          onChange={(event) => onChange({ address: event.target.value })}
          className={inputClass}
          placeholder="Dirección"
        />
        <input
          value={branch.whatsapp || ""}
          onChange={(event) => onChange({ whatsapp: event.target.value })}
          className={inputClass}
          placeholder="WhatsApp"
        />
        <input
          value={branch.instagram || ""}
          onChange={(event) => onChange({ instagram: event.target.value })}
          className="min-h-11 rounded-card border border-line bg-surface px-4 py-3 outline-none"
          placeholder="Instagram (link o usuario)"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={branch.isOpen}
            onChange={(event) => onChange({ isOpen: event.target.checked })}
          />
          Abierta
        </label>
        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={branch.isPrimary || false}
            onChange={(event) => onChange({ isPrimary: event.target.checked })}
          />
          Principal
        </label>
      </div>
    </>
  );
}
