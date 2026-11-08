"use client";

import { useState } from "react";

import { useAppState } from "@/components/providers/AppProviders";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { useImageLibrary } from "@/features/admin/hooks/useImageLibrary";
import { useImageUpload, type ImageSource } from "@/features/admin/hooks/useImageUpload";
import { branchRepository } from "@/infrastructure";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import type { Branch, BrandingSettings } from "@/types";

type CoverKind = "branch" | "menu";

const COVER_FIELD: Record<CoverKind, "coverImageUrl" | "menuCoverImageUrl"> = {
  branch: "coverImageUrl",
  menu: "menuCoverImageUrl"
};

/** Pestaña "Temas": colores, forma, tipografía, logotipo y portadas de la sucursal. */
export function useBrandingEditor(branch: Branch | null, notify: Notify) {
  const { branding, setBranding } = useAppState();
  const { products } = useRealtimeMenu(branch?.id);
  const library = useImageLibrary(branch, branding.logoUrl, products);
  const logoUpload = useImageUpload();
  const coverUpload = useImageUpload();
  const menuCoverUpload = useImageUpload();
  const [isSaving, setIsSaving] = useState(false);

  function updateBranding(patch: Partial<BrandingSettings>) {
    setBranding({ ...branding, ...patch });
  }

  async function saveTheme() {
    if (!branch) return;
    setIsSaving(true);
    try {
      await branchRepository.saveBranding(branch.id, branding);
      notify("Tema guardado");
    } finally {
      setIsSaving(false);
    }
  }

  function applyLogo(branchId: string, imageUrl: string) {
    library.remember(imageUrl);
    const updated = { ...branding, logoUrl: imageUrl };
    setBranding(updated);
    return branchRepository.saveBranding(branchId, updated);
  }

  async function uploadLogo(source: ImageSource) {
    if (!branch) return;
    await logoUpload.upload(source, async (imageUrl) => {
      await applyLogo(branch.id, imageUrl);
      notify("Logotipo actualizado");
    });
  }

  function selectLogo(imageUrl: string) {
    if (!branch) return;
    void applyLogo(branch.id, imageUrl);
  }

  async function uploadCover(source: ImageSource, kind: CoverKind) {
    if (!branch) return;
    const uploader = kind === "branch" ? coverUpload : menuCoverUpload;
    await uploader.upload(source, async (imageUrl) => {
      library.remember(imageUrl);
      await branchRepository.save({ ...branch, [COVER_FIELD[kind]]: imageUrl });
      notify(kind === "branch" ? "Portada guardada" : "Portada del menú guardada");
    });
  }

  function selectCover(imageUrl: string, kind: CoverKind) {
    if (!branch) return;
    library.remember(imageUrl);
    void branchRepository.save({ ...branch, [COVER_FIELD[kind]]: imageUrl });
  }

  return {
    branding,
    updateBranding,
    isSaving,
    saveTheme,
    images: library.images,
    isUploadingLogo: logoUpload.isUploading,
    isUploadingCover: coverUpload.isUploading,
    isUploadingMenuCover: menuCoverUpload.isUploading,
    uploadLogo,
    selectLogo,
    uploadCover,
    selectCover
  };
}

export type BrandingEditor = ReturnType<typeof useBrandingEditor>;
