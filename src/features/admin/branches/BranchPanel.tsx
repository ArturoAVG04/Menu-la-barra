"use client";

import { BranchInfoFields } from "@/features/admin/branches/BranchInfoFields";
import { PrepTimeFields } from "@/features/admin/branches/PrepTimeFields";
import { ScheduleSlotCard } from "@/features/admin/branches/ScheduleSlotCard";
import type { BranchEditor } from "@/features/admin/hooks/useBranchEditor";

/** Sección "Datos": formulario de la sucursal seleccionada. */
export function BranchPanel({ editor }: { editor: BranchEditor }) {
  const branch = editor.editor;

  return (
    <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
      <div className="flex items-center justify-center gap-3">
        <h2 className="text-2xl font-semibold text-text">{branch ? branch.name : "Datos"}</h2>
      </div>

      {branch ? (
        <form onSubmit={editor.save} className="space-y-5">
          <BranchInfoFields branch={branch} onChange={editor.update} />

          <PrepTimeFields settings={branch.orderSettings} onChange={editor.setOrderSetting} />

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text">Horarios</h3>
            <div className="space-y-3">
              {editor.slots.map((slot, index) => (
                <ScheduleSlotCard
                  key={`schedule-slot-${index}`}
                  slot={slot}
                  index={index}
                  canRemove={editor.slots.length > 1}
                  onToggleDay={(dayLabel) => editor.toggleDay(index, dayLabel)}
                  onChangeTime={(field, value) => editor.updateSlot(index, (current) => ({ ...current, [field]: value }))}
                  onSetAllDay={(allDay) => editor.setAllDay(index, allDay)}
                  onRemove={() => editor.removeSlot(index)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={editor.addSlot}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-text transition hover:bg-surface"
            >
              Agregar más días y horarios
            </button>
          </div>

          <button
            type="submit"
            disabled={editor.isSaving}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
          >
            {editor.isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      ) : (
        <div className="rounded-card border border-dashed border-line bg-surface p-5 text-sm text-muted">
          Selecciona una sucursal.
        </div>
      )}
    </section>
  );
}
