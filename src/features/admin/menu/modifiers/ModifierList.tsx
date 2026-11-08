"use client";

import { ArrowDown, ArrowUp, Check, Edit2, Trash2 } from "lucide-react";

import type { MoveDirection } from "@/domain/admin/SortOrder";
import { currency } from "@/lib/utils";
import type { ModifierTemplate } from "@/types";

type ModifierListProps = {
  modifiers: ModifierTemplate[];
  onMove: (modifierId: string, direction: MoveDirection) => void;
  onEdit: (modifier: ModifierTemplate) => void;
  onDelete: (modifierId: string) => void;
};

/** Plantillas de opciones ya ordenadas por prioridad, con sus opciones y precios. */
export function ModifierList({ modifiers, onMove, onEdit, onDelete }: ModifierListProps) {
  return (
    <section className="rounded-shell border border-line bg-panel p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {modifiers.length ? (
          modifiers.map((modifier, index) => (
            <div key={modifier.id} className="group relative rounded-card border border-line bg-surface p-4 transition hover:border-brand/40">
              <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between">
                <div>
                  <p className="font-semibold text-text">{modifier.name} <span className="text-[10px] text-brand ml-1">#{modifier.sortOrder || index + 1}</span></p>
                  <p className="text-[10px] text-muted uppercase tracking-wider">{modifier.type === "single" ? "Única" : "Múltiple"}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(modifier.id, "up")}
                    disabled={index === 0}
                    className="p-1.5 text-muted hover:text-brand disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(modifier.id, "down")}
                    disabled={index === modifiers.length - 1}
                    className="p-1.5 text-muted hover:text-brand disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(modifier)}
                    className="inline-flex items-center justify-center p-2 text-muted hover:text-brand"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(modifier.id)}
                    className="inline-flex items-center justify-center p-2 text-muted hover:text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {modifier.options.map((option) => (
                  <div key={option.id} className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted sm:flex-row sm:justify-between sm:gap-3">
                    <span className="inline-flex items-center justify-center gap-2">
                      <Check size={14} />
                      {option.name}
                    </span>
                    <span className={option.priceDelta > 0 ? "text-text font-medium" : "text-success font-bold"}>
                      {option.priceDelta ? `+ ${currency(option.priceDelta)}` : "Gratis"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-card border border-dashed border-line bg-surface p-12 text-center text-muted">
            No hay personalizaciones configuradas.
          </div>
        )}
      </div>
    </section>
  );
}
