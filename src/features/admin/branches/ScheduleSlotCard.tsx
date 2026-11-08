"use client";

import { Trash2 } from "lucide-react";

import { WEEK_DAYS, type NormalizedWeeklyHoursSlot } from "@/lib/branchHours";

type ScheduleSlotCardProps = {
  slot: NormalizedWeeklyHoursSlot;
  index: number;
  canRemove: boolean;
  onToggleDay: (dayLabel: string) => void;
  onChangeTime: (field: "open" | "close", value: string) => void;
  onSetAllDay: (allDay: boolean) => void;
  onRemove: () => void;
};

/** Un bloque de horario: días que comparten el mismo horario. */
export function ScheduleSlotCard({
  slot,
  index,
  canRemove,
  onToggleDay,
  onChangeTime,
  onSetAllDay,
  onRemove
}: ScheduleSlotCardProps) {
  return (
    <div className="space-y-4 rounded-card border border-line bg-surface p-4">
      <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-text">Bloque {index + 1}</p>
          <p className="text-xs text-muted">Elige los días que comparten este horario.</p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger"
          >
            <Trash2 size={16} />
            Borrar
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-subtle pb-2">
        {WEEK_DAYS.map((day) => {
          const selected = slot.days.includes(day.label);

          return (
            <button
              key={`${index}-${day.id}`}
              type="button"
              onClick={() => onToggleDay(day.label)}
              className={[
                "inline-flex shrink-0 min-h-[44px] min-w-[4rem] items-center justify-center rounded-card border px-3 py-3 text-sm font-semibold transition",
                selected ? "border-brand bg-brand text-white" : "border-line bg-panel text-text hover:border-brand/40"
              ].join(" ")}
            >
              {day.shortLabel}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-text">
          <span>Hora de inicio</span>
          <input
            type="time"
            value={slot.allDay ? "00:00" : slot.open}
            disabled={slot.allDay}
            onChange={(event) => onChangeTime("open", event.target.value)}
            className="min-h-11 w-full rounded-card border border-line bg-panel px-4 py-3 text-center outline-none disabled:opacity-50"
          />
        </label>
        <label className="space-y-2 text-sm text-text">
          <span>Hora de finalización</span>
          <input
            type="time"
            value={slot.allDay ? "23:59" : slot.close}
            disabled={slot.allDay}
            onChange={(event) => onChangeTime("close", event.target.value)}
            className="min-h-11 w-full rounded-card border border-line bg-panel px-4 py-3 text-center outline-none disabled:opacity-50"
          />
        </label>
      </div>

      <label className="flex min-h-11 items-center justify-center gap-3 rounded-card border border-line bg-panel px-4 py-3 text-center text-sm text-text">
        <input type="checkbox" checked={slot.allDay || false} onChange={(event) => onSetAllDay(event.target.checked)} />
        Abierto las 24 horas
      </label>
    </div>
  );
}
