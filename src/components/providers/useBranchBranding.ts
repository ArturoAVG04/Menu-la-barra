"use client";

import { useEffect, useState } from "react";

import { isPlainObject, readStoredJson, useMountLayoutEffect, writeStoredJson } from "@/components/providers/storage";
import { branchRepository } from "@/infrastructure";
import type { BrandingSettings } from "@/types";

export const defaultBranding: BrandingSettings = {
  primaryRgb: "55 101 94",
  accentRgb: "180 140 92",
  shape: "rounded",
  fontFamily: "serif"
};

const brandingKey = (branchId: string) => `la-barra-branding:${branchId}`;

const storedBranding = (branchId: string): BrandingSettings => ({
  ...defaultBranding,
  ...readStoredJson<Partial<BrandingSettings>>(brandingKey(branchId), {}, isPlainObject)
});

/** Pasa la marca a variables CSS (colores, forma y tipografía). */
function applyBranding(branding: BrandingSettings) {
  const root = document.documentElement;
  const card = branding.shape === "pill" ? "999px" : branding.shape === "rounded" ? "1.5rem" : "0.375rem";
  const shell = branding.shape === "square" ? "0.5rem" : "2rem";
  root.style.setProperty("--brand", branding.primaryRgb);
  root.style.setProperty("--accent", branding.accentRgb);
  root.style.setProperty("--radius-card", card);
  root.style.setProperty("--radius-shell", shell);
  root.style.setProperty(
    "--app-font",
    branding.fontFamily === "sans"
      ? '"Inter", "Segoe UI", Helvetica, Arial, sans-serif'
      : '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif'
  );
}

/** Marca de la sucursal activa: copia local al instante y luego la de Firestore. */
export function useBranchBranding(branchId: string | null) {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);

  // Antes de pintar, para evitar el parpadeo de colores.
  useMountLayoutEffect(() => {
    setBranding(branchId ? storedBranding(branchId) : defaultBranding);
  }, [branchId]);

  useEffect(() => {
    if (!branchId) return;
    return branchRepository.subscribeBranding(branchId, (settings) => {
      const next = settings ? { ...defaultBranding, ...settings } : defaultBranding;
      setBranding(next);
      writeStoredJson(brandingKey(branchId), next);
    });
  }, [branchId]);

  useMountLayoutEffect(() => applyBranding(branding), [branding]);

  return { branding, setBranding };
}
