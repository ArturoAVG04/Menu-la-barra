"use client";

import { useEffect, useState } from "react";

import { subscribeCategories, subscribeProducts } from "@/lib/services/menu";
import type { Category, Product } from "@/types";

const categoriesStorageKey = (branchId: string) => `la-barra-categories:${branchId}`;
const productsStorageKey = (branchId: string) => `la-barra-products:${branchId}`;

function readStoredJson<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useRealtimeMenu(branchId?: string) {
  const [categories, setCategories] = useState<Category[]>(() =>
    branchId ? readStoredJson<Category[]>(categoriesStorageKey(branchId), []) : []
  );
  const [products, setProducts] = useState<Product[]>(() =>
    branchId ? readStoredJson<Product[]>(productsStorageKey(branchId), []) : []
  );

  useEffect(() => {
    if (!branchId) {
      setCategories([]);
      setProducts([]);
      return;
    }

    setCategories(readStoredJson<Category[]>(categoriesStorageKey(branchId), []));
    setProducts(readStoredJson<Product[]>(productsStorageKey(branchId), []));

    const unsubscribeCategories = subscribeCategories(branchId, (nextCategories) => {
      setCategories(nextCategories);
      window.localStorage.setItem(categoriesStorageKey(branchId), JSON.stringify(nextCategories));
    });
    const unsubscribeProducts = subscribeProducts(branchId, (nextProducts) => {
      setProducts(nextProducts);
      window.localStorage.setItem(productsStorageKey(branchId), JSON.stringify(nextProducts));
    });

    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, [branchId]);

  return { categories, products };
}
