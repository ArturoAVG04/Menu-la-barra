"use client";

import { useState } from "react";

import { MenuCard } from "@/components/customer/MenuCard";
import { useAppState } from "@/components/providers/AppProviders";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { useImageLibrary } from "@/features/admin/hooks/useImageLibrary";
import { useImageUpload, type ImageSource } from "@/features/admin/hooks/useImageUpload";
import type { ProductCatalog } from "@/features/admin/hooks/useProductCatalog";
import type { ProductEditor } from "@/features/admin/hooks/useProductEditor";
import { SectionToggleHeader } from "@/features/admin/menu/SectionToggleHeader";
import { ProductForm } from "@/features/admin/menu/products/ProductForm";
import { ProductList } from "@/features/admin/menu/products/ProductList";
import type { Branch } from "@/types";

type ProductsTabProps = {
  branch: Branch;
  allBranches: Branch[];
  catalog: ProductCatalog;
  editor: ProductEditor;
  notify: Notify;
  onCreateModifier: () => void;
};

/** Pestaña "Productos": lista ordenable o formulario con vista previa. */
export function ProductsTab({ branch, allBranches, catalog, editor, notify, onCreateModifier }: ProductsTabProps) {
  const { branding } = useAppState();
  const library = useImageLibrary(branch, branding.logoUrl, catalog.products);
  const imageUpload = useImageUpload();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!editor.draft.canSave) return;

    setIsSaving(true);
    try {
      await catalog.saveProduct(editor.draft);
      editor.close();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("¿Eliminar producto?")) return;
    if (editor.editingId === productId) editor.close();
    await catalog.deleteProduct(productId);
  }

  async function handleUploadImage(source: ImageSource) {
    try {
      await imageUpload.upload(source, (imageUrl) => {
        library.remember(imageUrl);
        editor.update((current) => current.with({ imageUrl }));
        notify("Imagen del producto lista");
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      notify("No se pudo cargar la imagen");
    }
  }

  return (
    <div className="space-y-6">
      <SectionToggleHeader
        title={editor.isOpen ? (editor.editingId ? "Editar producto" : "Nuevo producto") : "Productos"}
        isOpen={editor.isOpen}
        onToggle={editor.isOpen ? editor.close : editor.open}
      />

      {editor.isOpen ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ProductForm
            editor={editor}
            categories={catalog.categories}
            branches={allBranches}
            modifiers={catalog.modifiers}
            images={library.images}
            isUploadingImage={imageUpload.isUploading}
            isSaving={isSaving}
            onUploadImage={(source) => void handleUploadImage(source)}
            onSelectImage={(imageUrl) => {
              library.remember(imageUrl);
              editor.update((current) => current.with({ imageUrl }));
            }}
            onSubmit={handleSave}
            onDelete={(productId) => void handleDelete(productId)}
            onCreateModifier={onCreateModifier}
          />

          <section className="space-y-4 rounded-shell border border-line bg-panel p-6">
            <h2 className="text-2xl font-semibold text-text">Vista previa</h2>
            <div className="mx-auto w-full max-w-sm">
              <MenuCard product={editor.draft.preview(branch.id)} onSelect={() => undefined} />
            </div>
          </section>
        </div>
      ) : (
        <ProductList
          categories={catalog.categories}
          products={catalog.products}
          onEdit={editor.edit}
          onMove={(productId, direction) => void catalog.moveProduct(productId, direction)}
          onDelete={(productId) => void handleDelete(productId)}
        />
      )}
    </div>
  );
}
