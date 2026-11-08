"use client";

import { DEFAULT_ORDER_SETTINGS } from "@/domain/order/OrderStatus";
import type { Branch } from "@/types";

type OrderSettings = NonNullable<Branch["orderSettings"]>;

const FIELDS: { key: keyof OrderSettings; label: string }[] = [
  { key: "baseItemThreshold", label: "Hasta cuántos productos" },
  { key: "baseMinutes", label: "Minutos base" },
  { key: "extraItemStep", label: "Cada cuántos extras" },
  { key: "extraMinutesPerStep", label: "Minutos extra" }
];

/** Configuración del tiempo estimado (la usa `OrderLifecycle.estimatedMinutes`). */
export function PrepTimeFields({
  settings,
  onChange
}: {
  settings: Branch["orderSettings"];
  onChange: (key: keyof OrderSettings, value: number) => void;
}) {
  const value = (key: keyof OrderSettings) => settings?.[key] ?? DEFAULT_ORDER_SETTINGS[key];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-text">Tiempos de preparación</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FIELDS.map((field) => (
          <label key={field.key} className="space-y-2 text-sm text-text">
            <span>{field.label}</span>
            <input
              type="number"
              min="1"
              value={value(field.key)}
              onChange={(event) => onChange(field.key, Number(event.target.value))}
              className="w-full min-h-11 rounded-card border border-line bg-surface px-4 py-3 text-center outline-none"
            />
          </label>
        ))}
      </div>
      <p className="text-sm text-muted">
        Ejemplo: hasta {value("baseItemThreshold")} productos son{" "}
        {value("baseMinutes")} min; luego sumas{" "}
        {value("extraMinutesPerStep")} min por cada{" "}
        {value("extraItemStep")} productos extra.
      </p>
    </div>
  );
}
