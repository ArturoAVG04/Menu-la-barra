"use client";

import { useEffect, useMemo, useState } from "react";

import { SortOrder } from "@/domain/admin/SortOrder";
import { useCategoryActions } from "@/features/admin/hooks/catalog/useCategoryActions";
import { useModifierActions } from "@/features/admin/hooks/catalog/useModifierActions";
import { useProductActions } from "@/features/admin/hooks/catalog/useProductActions";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { catalogRepository } from "@/infrastructure";
import { useRealtimeMenu } from "@/lib/hooks/useRealtimeMenu";
import type { Branch, ModifierTemplate } from "@/types";

/**
 * Catálogo de la sucursal (productos, categorías y plantillas de opciones) en tiempo real.
 * Las operaciones de guardado viven en hooks/catalog/ (una por tipo).
 */
export function useProductCatalog(branch: Branch | null, notify: Notify) {
  const branchId = branch?.id;
  const { categories, products } = useRealtimeMenu(branchId);
  const [modifiers, setModifiers] = useState<ModifierTemplate[]>([]);
  const sortedModifiers = useMemo(() => SortOrder.byPriority(modifiers), [modifiers]);

  useEffect(() => {
    if (!branchId) return;
    return catalogRepository.subscribeModifiers(branchId, setModifiers);
  }, [branchId]);

  return {
    categories,
    products,
    modifiers: sortedModifiers,
    ...useCategoryActions(branchId, categories, products, notify),
    ...useProductActions(branchId, categories, products, notify),
    ...useModifierActions(branchId, sortedModifiers, products, notify)
  };
}

export type ProductCatalog = ReturnType<typeof useProductCatalog>;
