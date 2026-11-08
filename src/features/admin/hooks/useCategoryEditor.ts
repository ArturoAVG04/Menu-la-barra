"use client";

import { useEffect, useState } from "react";

import type { Category } from "@/types";

/** Estado del formulario de categoría (nombre y cuál se está editando). */
export function useCategoryEditor(branchId?: string) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setName("");
  }, [branchId]);

  return {
    name,
    setName,
    editingId,
    isOpen,
    open: () => setIsOpen(true),
    edit(category: Category) {
      setEditingId(category.id);
      setName(category.name);
      setIsOpen(true);
    },
    close() {
      setIsOpen(false);
      setEditingId(null);
      setName("");
    },
    hide: () => setIsOpen(false)
  };
}

export type CategoryEditor = ReturnType<typeof useCategoryEditor>;
