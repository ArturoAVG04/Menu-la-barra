"use client";

import Image from "next/image";

import { AdminImagePicker } from "@/features/admin/images/AdminImagePicker";
import type { BrandingEditor } from "@/features/admin/hooks/useBrandingEditor";
import type { Branch } from "@/types";

function CoverPreview({ url, alt, emptyText }: { url?: string; alt: string; emptyText: string }) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface p-4 text-sm text-muted break-words">
      {url ? (
        <div className="space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-card bg-panel border border-line">
            <Image src={url} alt={alt} fill className="object-cover" />
          </div>
          <p className="text-xs break-all">{url}</p>
        </div>
      ) : emptyText}
    </div>
  );
}

/** Logotipo y portadas (sucursal y menú) con su vista previa. */
export function BrandImagesCard({ branch, editor }: { branch: Branch; editor: BrandingEditor }) {
  return (
    <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
      <h2 className="text-2xl font-semibold text-text">Branding e Imágenes</h2>

      <AdminImagePicker
        label="Logotipo"
        value={editor.branding.logoUrl}
        isUploading={editor.isUploadingLogo}
        history={editor.images}
        helperText="Ideal en PNG/WebP transparente o fondo claro."
        onUpload={(source) => void editor.uploadLogo(source)}
        onSelect={editor.selectLogo}
      />

      <AdminImagePicker
        label="Portada sucursal"
        value={branch.coverImageUrl}
        isUploading={editor.isUploadingCover}
        history={editor.images}
        helperText="Usa una foto horizontal amplia; se ajusta como fondo en escritorio y móvil."
        onUpload={(source) => void editor.uploadCover(source, "branch")}
        onSelect={(imageUrl) => editor.selectCover(imageUrl, "branch")}
      />

      <AdminImagePicker
        label="Portada menú"
        value={branch.menuCoverImageUrl}
        isUploading={editor.isUploadingMenuCover}
        history={editor.images}
        helperText="Usa una foto horizontal con el sujeto al centro para el encabezado del menú."
        onUpload={(source) => void editor.uploadCover(source, "menu")}
        onSelect={(imageUrl) => editor.selectCover(imageUrl, "menu")}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CoverPreview url={branch.coverImageUrl} alt="Portada sucursal" emptyText="Sin imagen principal" />
        <CoverPreview url={branch.menuCoverImageUrl} alt="Portada menú" emptyText="Sin imagen de menú" />
      </div>
    </section>
  );
}
