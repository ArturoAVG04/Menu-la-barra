"use client";

import type { ImageSource } from "@/features/admin/hooks/useImageUpload";
import type { ProductEditor } from "@/features/admin/hooks/useProductEditor";
import { ProductBasicFields } from "@/features/admin/menu/products/ProductBasicFields";
import { ProductBranchesField } from "@/features/admin/menu/products/ProductBranchesField";
import { ProductFormFooter } from "@/features/admin/menu/products/ProductFormFooter";
import { ProductImageField } from "@/features/admin/menu/products/ProductImageField";
import { ProductModifiersField } from "@/features/admin/menu/products/ProductModifiersField";
import { ProductPricingFields } from "@/features/admin/menu/products/ProductPricingFields";
import type { Branch, Category, ModifierTemplate, Product } from "@/types";

type ProductFormProps = {
  editor: ProductEditor;
  categories: Category[];
  branches: Branch[];
  modifiers: ModifierTemplate[];
  images: string[];
  isUploadingImage: boolean;
  isSaving: boolean;
  onUploadImage: (source: ImageSource) => void;
  onSelectImage: (url: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onDelete: (productId: string) => void;
  onCreateModifier: () => void;
};

/** Formulario de producto armado por secciones. El estado vive en `ProductDraft`. */
export function ProductForm({
  editor,
  categories,
  branches,
  modifiers,
  images,
  isUploadingImage,
  isSaving,
  onUploadImage,
  onSelectImage,
  onSubmit,
  onDelete,
  onCreateModifier
}: ProductFormProps) {
  const { draft, editingId } = editor;
  const values = draft.values;
  const patch = (changes: Partial<Product>) => editor.update((current) => current.with(changes));

  return (
    <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
      <form onSubmit={onSubmit} className="grid gap-4 text-left lg:grid-cols-2">
        <ProductBasicFields values={values} categories={categories} onChange={patch} />
        <ProductPricingFields values={values} onChange={patch} />

        <label className="space-y-2 text-sm text-text lg:col-span-2">
          <span>Descripción</span>
          <textarea
            value={values.description}
            onChange={(event) => patch({ description: event.target.value })}
            className="min-h-28 w-full rounded-card border border-line bg-surface px-4 py-3 text-left [text-align:justify] outline-none"
          />
        </label>

        <ProductBranchesField draft={draft} branches={branches} onChange={editor.update} />
        <ProductModifiersField
          draft={draft}
          modifiers={modifiers}
          onChange={editor.update}
          onCreateModifier={onCreateModifier}
        />
        <ProductImageField
          imageUrl={values.imageUrl}
          images={images}
          isUploading={isUploadingImage}
          onUpload={onUploadImage}
          onSelect={onSelectImage}
        />

        <label className="grid min-h-11 grid-cols-[20px_1fr] items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left text-sm text-text lg:col-span-2">
          <input
            type="checkbox"
            checked={values.available}
            onChange={(event) => patch({ available: event.target.checked })}
          />
          <span>Disponible</span>
        </label>

        <ProductFormFooter
          finalPrice={draft.salePrice || 0}
          canDelete={Boolean(editingId)}
          canSave={draft.canSave}
          isSaving={isSaving}
          onDelete={() => editingId && onDelete(editingId)}
        />
      </form>
    </section>
  );
}
