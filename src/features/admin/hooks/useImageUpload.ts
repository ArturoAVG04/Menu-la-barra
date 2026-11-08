"use client";

import { useState } from "react";

import { uploadToImgBB } from "@/lib/services/imgbb";

export type ImageSource = File | string;

/**
 * Sube una imagen a ImgBB y avisa mientras tanto (`isUploading`).
 * `onUploaded` corre antes de terminar, así el "Subiendo..." dura hasta que se guarda.
 */
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  async function upload(source: ImageSource, onUploaded: (url: string) => void | Promise<void>) {
    setIsUploading(true);
    try {
      const url = await uploadToImgBB(source);
      await onUploaded(url);
    } finally {
      setIsUploading(false);
    }
  }

  return { isUploading, upload };
}
