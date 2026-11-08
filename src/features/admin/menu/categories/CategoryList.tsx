"use client";

import { ArrowDown, ArrowUp, Edit2, Trash2 } from "lucide-react";

import type { MoveDirection } from "@/domain/admin/SortOrder";
import type { Category, Product } from "@/types";

type CategoryListProps = {
  categories: Category[];
  products: Product[];
  onMove: (categoryId: string, direction: MoveDirection) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
};

/** Tarjetas de categorías con su número de productos y acciones. */
export function CategoryList({ categories, products, onMove, onEdit, onDelete }: CategoryListProps) {
  return (
    <section className="rounded-shell border border-line bg-panel p-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length ? (
          categories.map((category, index) => (
            <div key={category.id} className="group rounded-card border border-line bg-surface px-4 py-3">
              <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <p className="font-semibold text-text">{category.name}</p>
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                    {products.filter((product) => product.categoryId === category.id).length} ítems
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1 opacity-100 transition group-hover:opacity-100 sm:opacity-0">
                  <button
                    type="button"
                    onClick={() => onMove(category.id, "up")}
                    disabled={index === 0}
                    className="p-2 text-muted hover:text-brand disabled:opacity-50"
                    title="Subir"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(category.id, "down")}
                    disabled={index === categories.length - 1}
                    className="p-2 text-muted hover:text-brand disabled:opacity-50"
                    title="Bajar"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button type="button" onClick={() => onEdit(category)} className="p-2 text-muted hover:text-brand">
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category.id)}
                    className="p-2 text-muted hover:text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-card border border-dashed border-line bg-surface p-12 text-center text-muted">
            Sin categorías.
          </div>
        )}
      </div>
    </section>
  );
}
