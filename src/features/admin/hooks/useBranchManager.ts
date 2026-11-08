"use client";

import { useState } from "react";

import { BranchFactory, EMPTY_BRANCH_FORM, type NewBranchForm } from "@/domain/branch/BranchFactory";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { branchRepository } from "@/infrastructure";
import { defaultWeeklyHours } from "@/lib/branchHours";
import type { Branch } from "@/types";

/** Alta y baja de sucursales (el formulario "Nueva sucursal" y el botón "Borrar"). */
export function useBranchManager(branches: Branch[], notify: Notify) {
  const [form, setForm] = useState<NewBranchForm>(EMPTY_BRANCH_FORM);
  const [isCreating, setIsCreating] = useState(false);

  function updateForm(patch: Partial<NewBranchForm>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  /** Devuelve el id de la sucursal creada (o null si el formulario no es válido). */
  async function create(): Promise<string | null> {
    if (!BranchFactory.canCreate(form)) return null;

    setIsCreating(true);
    try {
      const branch = BranchFactory.create(form, crypto.randomUUID(), defaultWeeklyHours());
      if (branch.isPrimary) {
        await Promise.all(BranchFactory.demoteOthers(branches, branch.id).map((item) => branchRepository.save(item)));
      }
      await branchRepository.save(branch);
      setForm(EMPTY_BRANCH_FORM);
      notify("Sucursal guardada");
      return branch.id;
    } finally {
      setIsCreating(false);
    }
  }

  async function remove(branchId: string) {
    await branchRepository.delete(branchId);
    notify("Sucursal eliminada");
  }

  return { form, updateForm, canCreate: BranchFactory.canCreate(form), isCreating, create, remove };
}

export type BranchManager = ReturnType<typeof useBranchManager>;
