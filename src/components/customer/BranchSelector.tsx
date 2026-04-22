"use client";

import { isBranchOpenAt } from "@/lib/branchHours";
import type { Branch } from "@/types";

type BranchSelectorProps = {
  branches: Branch[];
  selectedBranchId?: string;
  onSelect: (branch: Branch) => void;
};

export function BranchSelector({
  branches,
  selectedBranchId,
  onSelect
}: BranchSelectorProps) {
  const now = new Date();

  return (
    <section className="space-y-4 rounded-shell border border-line bg-panel p-5">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-brand">Sucursales</p>
        <h2 className="mt-2 text-2xl font-semibold text-text">Elige dónde ordenar</h2>
      </div>

      <div className="grid gap-3">
        {branches.map((branch) => (
          <button
            key={branch.id}
            type="button"
            onClick={() => onSelect(branch)}
            className={[
              "rounded-card border px-4 py-4 text-left transition",
              selectedBranchId === branch.id
                ? "border-brand bg-brand/10"
                : "border-line bg-surface hover:border-brand/40"
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-text">{branch.name}</p>
                <p className="text-sm text-muted">{branch.address}</p>
              </div>
              <div className="flex items-center gap-2">
                {branch.isPrimary && (
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    Principal
                  </span>
                )}
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    isBranchOpenAt(branch, now) ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                  ].join(" ")}
                >
                  {isBranchOpenAt(branch, now) ? "Abierta" : "Cerrada"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
