"use client";

import { Plus, Trash2 } from "lucide-react";

import { useNow } from "@/features/admin/hooks/useNow";
import { isBranchOpenAt } from "@/lib/branchHours";
import type { Branch } from "@/types";

type BranchListProps = {
  branches: Branch[];
  onAdd: () => void;
  onEdit: (branchId: string) => void;
  onDelete: (branchId: string) => void;
};

/** Sección "General": lista de sucursales con su estado (abierta/cerrada). */
export function BranchList({ branches, onAdd, onEdit, onDelete }: BranchListProps) {
  const now = useNow();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
        <h2 className="text-2xl font-semibold text-text">Sucursales</h2>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Agregar sucursal
        </button>
      </div>

      <section className="rounded-shell border border-line bg-panel p-4">
        <div className="space-y-3">
          {branches.length ? (
            branches.map((branch) => {
              const open = isBranchOpenAt(branch, new Date(now));

              return (
                <div key={branch.id} className="rounded-card border border-line bg-surface p-3 sm:px-4 sm:py-4">
                  <div className="flex flex-col items-center justify-center gap-4 text-center md:flex-row md:justify-between">
                    <div>
                      <p className="font-semibold text-text">{branch.name}</p>
                      <p className="text-sm text-muted">{branch.address || "Sin dirección"}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {branch.isPrimary && (
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                          Principal
                        </span>
                      )}
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          open ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                        ].join(" ")}
                      >
                        {open ? "Abierta" : "Cerrada"}
                      </span>
                      <button
                        type="button"
                        onClick={() => onEdit(branch.id)}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-text"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(branch.id)}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger"
                      >
                        <Trash2 size={16} />
                        Borrar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-card border border-dashed border-line bg-surface p-5 text-sm text-muted">
              Sin sucursales.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
