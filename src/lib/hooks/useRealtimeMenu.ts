"use client";

import { useEffect, useState } from "react";

import { subscribeCategories, subscribeProducts } from "@/lib/services/menu";
import type { Category, Product } from "@/types";

export function useRealtimeMenu(branchId?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!branchId) {
      setCategories([]);
      setProducts([]);
      return;
    }

    const unsubscribeCategories = subscribeCategories(branchId, setCategories);
    const unsubscribeProducts = subscribeProducts(branchId, setProducts);

    return () => {
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, [branchId]);

  return { categories, products };
}

