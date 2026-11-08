"use client";

import { useState } from "react";

import { ModifierDraft } from "@/domain/admin/ModifierDraft";
import type { ModifierTemplate } from "@/types";

/** Estado del formulario de plantilla de opciones. */
export function useModifierEditor() {
  const [draft, setDraft] = useState(() => ModifierDraft.empty());
  const [isOpen, setIsOpen] = useState(false);

  return {
    draft,
    isOpen,
    update: (change: (draft: ModifierDraft) => ModifierDraft) => setDraft(change),
    open: () => setIsOpen(true),
    edit(template: ModifierTemplate) {
      setDraft(ModifierDraft.fromTemplate(template));
      setIsOpen(true);
    },
    /** Limpia el borrador sin cerrar el formulario. */
    reset: () => setDraft(ModifierDraft.empty()),
    close() {
      setIsOpen(false);
      setDraft(ModifierDraft.empty());
    },
    hide: () => setIsOpen(false)
  };
}

export type ModifierEditor = ReturnType<typeof useModifierEditor>;
