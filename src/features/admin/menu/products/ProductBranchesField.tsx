"use client";

import type { ProductDraft } from "@/domain/admin/ProductDraft";
import type { Branch } from "@/types";

/** Casillas para elegir en qué sucursales se vende el producto. */
export function ProductBranchesField({
  draft,
  branches,
  onChange
}: {
  draft: ProductDraft;
  branches: Branch[];
  onChange: (change: (draft: ProductDraft) => ProductDraft) => void;
}) {
  return (
    <div className="space-y-2 text-sm text-text lg:col-span-2">
      <span>Sucursales</span>
      <div className="grid gap-3 md:grid-cols-2">
        {branches.map((item) => (
          <label
            key={item.id}
            className="grid min-h-11 grid-cols-[20px_1fr] items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left text-sm text-text"
          >
            <input
              type="checkbox"
              checked={draft.hasBranch(item.id)}
              onChange={(event) => {
                const selected = event.target.checked;
                onChange((current) => current.toggleBranch(item.id, selected));
              }}
            />
            <span className="min-w-0">{item.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
