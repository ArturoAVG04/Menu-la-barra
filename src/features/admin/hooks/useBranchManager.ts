"use client";

import { useState } from "react";

import { BranchFactory, EMPTY_BRANCH_FORM, type NewBranchForm } from "@/domain/branch/BranchFactory";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { useAppState } from "@/components/providers/AppProviders";
import { adminApi, branchRepository } from "@/infrastructure";
import { defaultWeeklyHours } from "@/lib/branchHours";
import type { Branch } from "@/types";

/** Alta y baja de sucursales (el formulario "Nueva sucursal" y el botón "Borrar"). */
export function useBranchManager(branches: Branch[], notify: Notify) {
  const [form, setForm] = useState<NewBranchForm>(EMPTY_BRANCH_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const { currentUser } = useAppState();

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

  /** Pide confirmación y borra la sucursal con todo su menú (en el servidor). */
  async function remove(branchId: string) {
    const name = branches.find((branch) => branch.id === branchId)?.name ?? "esta sucursal";
    if (!window.confirm(`¿Borrar ${name} con todo su menú? No se puede deshacer.`)) return;
    if (!currentUser) return notify("Inicia sesión otra vez.");
    try {
      await adminApi.deleteBranch(currentUser, branchId);
      notify("Sucursal eliminada");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo borrar la sucursal");
    }
  }

  return { form, updateForm, canCreate: BranchFactory.canCreate(form), isCreating, create, remove };
}

export type BranchManager = ReturnType<typeof useBranchManager>;
