"use client";

import { useState } from "react";

import { useAppState } from "@/components/providers/AppProviders";
import { adminApi } from "@/infrastructure";

export type ImageSource = File | string;

/**
 * Sube una imagen (por el servidor, que tiene la llave de ImgBB) y avisa mientras tanto (`isUploading`).
 * `onUploaded` corre antes de terminar, así el "Subiendo..." dura hasta que se guarda.
 */
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { currentUser } = useAppState();

  async function upload(source: ImageSource, onUploaded: (url: string) => void | Promise<void>) {
    setIsUploading(true);
    try {
      if (!currentUser) throw new Error("Inicia sesión otra vez para subir imágenes.");
      const url = await adminApi.uploadImage(currentUser, source);
      await onUploaded(url);
    } finally {
      setIsUploading(false);
    }
  }

  return { isUploading, upload };
}
