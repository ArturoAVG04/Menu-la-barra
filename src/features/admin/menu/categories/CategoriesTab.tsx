"use client";

import type { CategoryEditor } from "@/features/admin/hooks/useCategoryEditor";
import type { ProductCatalog } from "@/features/admin/hooks/useProductCatalog";
import type { ProductEditor } from "@/features/admin/hooks/useProductEditor";
import { SectionToggleHeader } from "@/features/admin/menu/SectionToggleHeader";
import { CategoryForm } from "@/features/admin/menu/categories/CategoryForm";
import { CategoryList } from "@/features/admin/menu/categories/CategoryList";

type CategoriesTabProps = {
  catalog: ProductCatalog;
  editor: CategoryEditor;
  productEditor: ProductEditor;
};

/** Pestaña "Categorías". Coordina con el formulario de producto (categoría nueva o borrada). */
export function CategoriesTab({ catalog, editor, productEditor }: CategoriesTabProps) {
  async function handleSave(name: string, editingId: string | null) {
    const category = await catalog.saveCategory(name, editingId);
    editor.close();
    // Una categoría recién creada queda elegida en el formulario de producto.
    if (category && !editingId) {
      productEditor.update((draft) => draft.with({ categoryId: category.id }));
    }
    return category;
  }

  async function handleDelete(categoryId: string) {
    if (!confirm("¿Eliminar categoría? Los productos asociados quedarán sin categoría.")) return;
    if (editor.editingId === categoryId) editor.close();
    if (productEditor.draft.values.categoryId === categoryId) {
      productEditor.update((draft) => draft.with({ categoryId: "" }));
    }
    await catalog.deleteCategory(categoryId);
  }

  return (
    <div className="space-y-6">
      <SectionToggleHeader title="Categorías" isOpen={editor.isOpen} onToggle={editor.isOpen ? editor.close : editor.open} />

      {editor.isOpen ? (
        <CategoryForm editor={editor} onSave={handleSave} />
      ) : (
        <CategoryList
          categories={catalog.categories}
          products={catalog.products}
          onMove={(categoryId, direction) => void catalog.moveCategory(categoryId, direction)}
          onEdit={editor.edit}
          onDelete={(categoryId) => void handleDelete(categoryId)}
        />
      )}
    </div>
  );
}
