"use client";

import { useEffect, useMemo, useState } from "react";

import { readImageHistory, uniqueUrls, writeImageHistory } from "@/features/admin/images/imageHistory";
import type { Branch, Product } from "@/types";

/**
 * Imágenes que el admin puede reutilizar: logo, portadas, fotos de productos
 * y el historial guardado en este navegador.
 */
export function useImageLibrary(branch: Branch | null, logoUrl: string | undefined, products: Product[]) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(readImageHistory());
  }, []);

  const images = useMemo(
    () =>
      uniqueUrls([
        logoUrl,
        branch?.coverImageUrl,
        branch?.menuCoverImageUrl,
        ...products.map((item) => item.imageUrl),
        ...history
      ]),
    [branch?.coverImageUrl, branch?.menuCoverImageUrl, logoUrl, history, products]
  );

  function remember(url: string) {
    setHistory((current) => {
      const next = uniqueUrls([url, ...current]);
      writeImageHistory(next);
      return next;
    });
  }

  return { images, remember };
}
