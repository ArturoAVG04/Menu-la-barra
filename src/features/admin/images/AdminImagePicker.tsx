"use client";

import { useState } from "react";
import { Images, Link2, UploadCloud } from "lucide-react";

import type { ImageSource } from "@/features/admin/hooks/useImageUpload";
import { getDroppedImageSource } from "@/features/admin/images/imageHistory";

type AdminImagePickerProps = {
  label: string;
  value?: string;
  isUploading: boolean;
  history: string[];
  helperText: string;
  onUpload: (source: ImageSource) => void;
  onSelect: (url: string) => void;
};

/** Selector de imagen: arrastrar, pegar, elegir archivo, pegar URL o reutilizar una guardada. */
export function AdminImagePicker({
  label,
  value,
  isUploading,
  history,
  helperText,
  onUpload,
  onSelect
}: AdminImagePickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");

  function uploadSource(source?: ImageSource | null) {
    if (!source) return;
    onUpload(source);
    setSourceUrl("");
  }

  return (
    <div className="space-y-3 text-left text-sm text-text">
      <span>{label}</span>
      <label
        tabIndex={0}
        className={[
          "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed bg-surface px-4 py-5 text-center text-sm transition",
          isDragging ? "border-brand bg-brand/10 text-brand" : "border-line text-text"
        ].join(" ")}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          uploadSource(getDroppedImageSource(event.dataTransfer));
        }}
        onPaste={(event) => uploadSource(getDroppedImageSource(event.clipboardData))}
      >
        <UploadCloud size={22} className="text-brand" />
        <span className="font-semibold">
          {isUploading ? "Subiendo..." : "Arrastra, pega o selecciona una imagen"}
        </span>
        <span className="max-w-md text-xs text-muted">{helperText}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => uploadSource(event.target.files?.[0])}
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Link2
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            className="min-h-11 w-full rounded-card border border-line bg-surface px-10 py-3 text-left outline-none"
            placeholder="Pegar URL de imagen"
          />
        </div>
        <button
          type="button"
          onClick={() => uploadSource(sourceUrl.trim())}
          disabled={!sourceUrl.trim() || isUploading}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text disabled:text-muted"
        >
          Usar URL
        </button>
      </div>

      {history.length > 0 && (
        <div className="space-y-2 rounded-card border border-line bg-surface p-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
            <Images size={14} />
            Imágenes guardadas
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {history.slice(0, 24).map((imageUrl) => (
              <button
                key={imageUrl}
                type="button"
                onClick={() => onSelect(imageUrl)}
                className={[
                  "relative aspect-square overflow-hidden rounded-lg border bg-panel",
                  value === imageUrl ? "border-brand ring-2 ring-brand/30" : "border-line"
                ].join(" ")}
                title="Usar imagen"
              >
                <img src={imageUrl} alt="" className="h-full w-full object-contain p-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
