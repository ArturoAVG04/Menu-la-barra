"use client";

import { useEffect, useRef, useState } from "react";

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
  // ¿Hay cambios sin guardar? Si sí, una actualización que llega de otro dispositivo no borra lo que escribes.
  const dirty = useRef(false);
  const loadedId = useRef<string | null>(null);

  useEffect(() => {
    const changedBranch = (selectedBranch?.id ?? null) !== loadedId.current;
    if (!changedBranch && dirty.current) return;
    loadedId.current = selectedBranch?.id ?? null;
    dirty.current = false;
    setEditor(
      selectedBranch ? { ...selectedBranch, weeklyHours: normalizeWeeklyHours(selectedBranch.weeklyHours) } : null
    );
  }, [selectedBranch]);

  const edit: typeof setEditor = (value) => {
    dirty.current = true;
    setEditor(value);
  };

  function update(patch: Partial<Branch>) {
    edit((current) => (current ? { ...current, ...patch } : current));
  }

  function setOrderSetting(key: keyof OrderSettings, value: number) {
    edit((current) =>
      current
        ? {
            ...current,
            orderSettings: { ...(current.orderSettings ?? { ...DEFAULT_ORDER_SETTINGS }), [key]: value || 1 }
          }
        : current
    );
  }

  function updateSlot(slotIndex: number, updater: SlotUpdater) {
    edit((current) =>
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
    edit((current) =>
      current
        ? {
            ...current,
            weeklyHours: [...normalizeWeeklyHours(current.weeklyHours), { days: [], open: "13:00", close: "22:00" }]
          }
        : current
    );
  }

  function removeSlot(slotIndex: number) {
    edit((current) => {
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
      dirty.current = false;
      notify("Cambios guardados");
    } catch (error) {
      notify(error instanceof Error ? `No se pudo guardar: ${error.message}` : "No se pudo guardar");
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
