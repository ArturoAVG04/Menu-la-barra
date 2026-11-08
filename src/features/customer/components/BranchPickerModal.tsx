import { X } from "lucide-react";

import { BranchDirectory } from "@/domain/branch/BranchDirectory";
import { isBranchOpenAt } from "@/lib/branchHours";
import type { Branch } from "@/types";

type BranchPickerModalProps = {
  branches: readonly Branch[];
  activeBranchId: string;
  now: Date;
  onSelect: (branch: Branch) => void;
  onClose: () => void;
};

/** Selector de sucursal (cada una con su portada y si está abierta). */
export function BranchPickerModal({ branches, activeBranchId, now, onSelect, onClose }: BranchPickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-3xl items-end md:items-center">
        <div className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-shell border border-line bg-panel p-5 shadow-glow md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand">Sucursales</p>
              <h2 className="mt-2 text-2xl font-semibold text-text">Selecciona tu sucursal</h2>
              <p className="mt-2 text-center text-sm text-muted md:text-left">
                Tu carrito se mantiene separado por sucursal para que no se mezclen pedidos.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-text"
              aria-label="Cerrar selector de sucursal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 overflow-y-auto">
            <div className="grid gap-4 md:grid-cols-2">
              {BranchDirectory.sortForPicker(branches).map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => onSelect(branch)}
                  className={[
                    "overflow-hidden rounded-shell border text-left transition",
                    branch.id === activeBranchId
                      ? "border-brand bg-brand/10"
                      : "border-line bg-surface hover:border-brand/40"
                  ].join(" ")}
                >
                  <div
                    className="relative min-h-40 p-5"
                    style={
                      branch.coverImageUrl
                        ? {
                            backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.58)), url(${branch.coverImageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center center"
                          }
                        : {
                            background: "linear-gradient(135deg, rgb(var(--brand) / 0.16), rgb(var(--accent) / 0.18))"
                          }
                    }
                  >
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                          {isBranchOpenAt(branch, now) ? "Abierta" : "Cerrada"}
                        </span>
                        {branch.isPrimary && (
                          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                            Principal
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xl font-semibold text-white">{branch.name}</p>
                        <p className="mt-2 text-sm text-white/80">{branch.address}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
