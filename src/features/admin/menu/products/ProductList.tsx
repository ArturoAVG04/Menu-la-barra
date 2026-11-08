"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import type { MoveDirection } from "@/domain/admin/SortOrder";
import { currency } from "@/lib/utils";
import type { Category, Product } from "@/types";

type ProductListProps = {
  categories: Category[];
  products: Product[];
  onEdit: (product: Product) => void;
  onMove: (productId: string, direction: MoveDirection) => void;
  onDelete: (productId: string) => void;
};

/** Productos agrupados por categoría, con botones para ordenar y borrar. */
export function ProductList({ categories, products, onEdit, onMove, onDelete }: ProductListProps) {
  return (
    <section className="rounded-shell border border-line bg-panel p-6">
      <div className="space-y-5">
        {categories.length ? (
          categories.map((category) => {
            const categoryProducts = products.filter((item) => item.categoryId === category.id);
            if (!categoryProducts.length) return null;

            return (
              <div key={category.id} className="rounded-card border border-line bg-surface p-4">
                <div className="mb-4 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between">
                  <div>
                    <p className="font-semibold text-text">{category.name}</p>
                    <p className="text-sm text-muted">Ordena cómo aparecerán en el menú</p>
                  </div>
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    {categoryProducts.length} productos
                  </span>
                </div>

                <div className="space-y-3">
                  {categoryProducts.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex flex-col items-center justify-center gap-3 rounded-card border border-line bg-panel px-4 py-4 text-center md:flex-row md:justify-between"
                    >
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="flex min-w-0 flex-1 items-center justify-center text-center"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <p className="font-semibold text-text">{item.name}</p>
                            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                              #{item.sortOrder || index + 1}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted line-clamp-2">
                            {item.description || "Sin descripción"}
                          </p>
                        </div>
                      </button>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                          {currency(item.salePrice || item.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onMove(item.id, "up")}
                            disabled={index === 0}
                            className="rounded-full border border-line p-2 text-text disabled:text-muted disabled:opacity-50"
                            title="Subir"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMove(item.id, "down")}
                            disabled={index === categoryProducts.length - 1}
                            className="rounded-full border border-line p-2 text-text disabled:text-muted disabled:opacity-50"
                            title="Bajar"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="rounded-full border border-line p-2 text-muted hover:text-danger"
                            title="Eliminar producto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full rounded-card border border-dashed border-line bg-surface p-12 text-center text-muted">
            No hay productos en esta sucursal.
          </div>
        )}
      </div>
    </section>
  );
}
