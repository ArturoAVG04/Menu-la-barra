import { MenuCard } from "@/components/customer/MenuCard";
import type { MenuSection } from "@/domain/menu/MenuCatalog";
import type { Product } from "@/types";

type ProductGridProps = {
  sections: readonly MenuSection[];
  /** La búsqueda no encontró ningún producto. */
  isEmpty: boolean;
  onSelect: (product: Product) => void;
};

/** Secciones del menú por categoría, con sus tarjetas de producto. */
export function ProductGrid({ sections, isEmpty, onSelect }: ProductGridProps) {
  return (
    <>
      <div className="space-y-9">
        {sections.map(({ category, position, products }) => (
          <section key={category.id} id={`category-${category.id}`} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-text md:text-2xl">{category.name}</h2>
              <span className="rounded-card bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                {products.length} opciones
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {products.map((product, productIndex) => (
                <MenuCard
                  key={product.id}
                  product={product}
                  onSelect={onSelect}
                  // Las primeras imágenes se cargan con prioridad (se ven sin hacer scroll).
                  priority={position === 0 && productIndex < 4}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {isEmpty && (
        <section className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
          No encontramos productos con esa búsqueda en esta sucursal.
        </section>
      )}
    </>
  );
}
