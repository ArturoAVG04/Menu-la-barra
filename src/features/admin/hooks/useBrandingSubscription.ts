"use client";

import { useEffect } from "react";

import { useAppState } from "@/components/providers/AppProviders";
import { branchRepository } from "@/infrastructure";

/** Mantiene el branding del contexto sincronizado con el de la sucursal en Firestore. */
export function useBrandingSubscription(branchId?: string) {
  const { setBranding } = useAppState();

  useEffect(() => {
    if (!branchId) return;
    return branchRepository.subscribeBranding(branchId, (settings) => {
      if (settings) setBranding(settings);
    });
  }, [branchId, setBranding]);
}
