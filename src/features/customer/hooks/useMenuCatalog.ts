"use client";

import { useEffect, useMemo, useState } from "react";

import { MenuCatalog } from "@/domain/menu/MenuCatalog";
import { catalogRepository } from "@/infrastructure";
import { LocalJsonStore } from "@/infrastructure/browser/LocalJsonStore";
import type { Category, Product } from "@/types";

const categoriesStore = (branchId: string) =>
  new LocalJsonStore<Category[]>(`la-barra-categories:${branchId}`, []);
const productsStore = (branchId: string) => new LocalJsonStore<Product[]>(`la-barra-products:${branchId}`, []);

/** La copia local puede venir rota: solo se aceptan arreglos de objetos con id. */
function asArray<T extends { id: string }>(value: unknown): T[] {
  return Array.isArray(value) ? value.filter((item) => item && typeof item.id === "string") : [];
}

/**
 * Menú de la sucursal en tiempo real. Muestra primero la copia guardada en el navegador
 * (carga instantánea) y luego la actualiza con lo que llega de Firestore.
 */
export function useMenuCatalog(branchId?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(false);
    if (!branchId) {
      setCategories([]);
      setProducts([]);
      return;
    }

    setCategories(asArray(categoriesStore(branchId).read()));
    setProducts(asArray(productsStore(branchId).read()));

    const unsubscribeCategories = catalogRepository.subscribeCategories(branchId, (next) => {
      setCategories(next);
      categoriesStore(branchId).write(next);
    });
    const unsubscribeProducts = catalogRepository.subscribeProducts(branchId, (next) => {
      setProducts(next);
      setLive(true);
      productsStore(branchId).write(next);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, [branchId]);

  return useMemo(() => new MenuCatalog(categories, products, live), [categories, products, live]);
}
