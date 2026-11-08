"use client";

import { AdminImagePicker } from "@/features/admin/images/AdminImagePicker";
import type { ImageSource } from "@/features/admin/hooks/useImageUpload";

/** Imagen del producto: selector + miniatura con la URL actual. */
export function ProductImageField({
  imageUrl,
  images,
  isUploading,
  onUpload,
  onSelect
}: {
  imageUrl?: string;
  images: string[];
  isUploading: boolean;
  onUpload: (source: ImageSource) => void;
  onSelect: (url: string) => void;
}) {
  return (
    <>
      <div className="lg:col-span-2">
        <AdminImagePicker
          label="Imagen"
          value={imageUrl}
          isUploading={isUploading}
          history={images}
          helperText="Para productos, una imagen cuadrada o 4:3 ayuda a que se vea completa."
          onUpload={onUpload}
          onSelect={onSelect}
        />
      </div>

      {imageUrl && (
        <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4 rounded-card border border-line bg-surface p-2 text-center sm:flex-row">
          <img src={imageUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
          <span className="text-xs text-muted truncate flex-1">{imageUrl}</span>
        </div>
      )}
    </>
  );
}
