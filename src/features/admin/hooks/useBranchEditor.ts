"use client";

import { useEffect, useState } from "react";

import { BranchFactory } from "@/domain/branch/BranchFactory";
import { DEFAULT_ORDER_SETTINGS } from "@/domain/order/OrderStatus";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { branchRepository } from "@/infrastructure";
import { defaultWeeklyHours, normalizeWeeklyHours, type NormalizedWeeklyHoursSlot } from "@/lib/branchHours";
import type { Branch } from "@/types";

type OrderSettings = NonNullable<Branch["orderSettings"]>;
type SlotUpdater = (slot: NormalizedWeeklyHoursSlot) => NormalizedWeeklyHoursSlot;

/** Edición de la sucursal seleccionada: datos, tiempos de preparación y horarios. */
export function useBranchEditor(selectedBranch: Branch | null, branches: Branch[], notify: Notify) {
  const [editor, setEditor] = useState<Branch | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cada vez que cambia la sucursal (o llega una versión nueva de Firestore) se recarga el formulario.
  useEffect(() => {
    setEditor(
      selectedBranch ? { ...selectedBranch, weeklyHours: normalizeWeeklyHours(selectedBranch.weeklyHours) } : null
    );
  }, [selectedBranch]);

  function update(patch: Partial<Branch>) {
    setEditor((current) => (current ? { ...current, ...patch } : current));
  }

  function setOrderSetting(key: keyof OrderSettings, value: number) {
    setEditor((current) =>
      current
        ? {
            ...current,
            orderSettings: { ...(current.orderSettings ?? { ...DEFAULT_ORDER_SETTINGS }), [key]: value || 1 }
          }
        : current
    );
  }

  function updateSlot(slotIndex: number, updater: SlotUpdater) {
    setEditor((current) =>
      current
        ? {
            ...current,
            weeklyHours: normalizeWeeklyHours(current.weeklyHours).map((slot, index) =>
              index === slotIndex ? updater(slot) : slot
            )
          }
        : current
    );
  }

  function toggleDay(slotIndex: number, dayLabel: string) {
    updateSlot(slotIndex, (slot) => ({
      ...slot,
      days: slot.days.includes(dayLabel) ? slot.days.filter((day) => day !== dayLabel) : [...slot.days, dayLabel]
    }));
  }

  function setAllDay(slotIndex: number, allDay: boolean) {
    updateSlot(slotIndex, (slot) => ({
      ...slot,
      allDay,
      open: allDay ? "00:00" : slot.open,
      close: allDay ? "23:59" : slot.close
    }));
  }

  function addSlot() {
    setEditor((current) =>
      current
        ? {
            ...current,
            weeklyHours: [...normalizeWeeklyHours(current.weeklyHours), { days: [], open: "13:00", close: "22:00" }]
          }
        : current
    );
  }

  function removeSlot(slotIndex: number) {
    setEditor((current) => {
      if (!current) return current;
      const nextSlots = normalizeWeeklyHours(current.weeklyHours).filter((_, index) => index !== slotIndex);
      return { ...current, weeklyHours: nextSlots.length ? nextSlots : defaultWeeklyHours() };
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editor) return;

    setIsSaving(true);
    try {
      if (editor.isPrimary) {
        await Promise.all(BranchFactory.demoteOthers(branches, editor.id).map((branch) => branchRepository.save(branch)));
      }
      await branchRepository.save(editor);
      notify("Cambios guardados");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    editor,
    slots: editor ? normalizeWeeklyHours(editor.weeklyHours) : [],
    isSaving,
    update,
    setOrderSetting,
    updateSlot,
    toggleDay,
    setAllDay,
    addSlot,
    removeSlot,
    save
  };
}

export type BranchEditor = ReturnType<typeof useBranchEditor>;
