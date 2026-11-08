import type { Modifier } from "@/domain/menu/Modifier";
import { currency } from "@/lib/utils";

type ModifierGroupProps = {
  modifier: Modifier;
  isSelected: (optionId: string) => boolean;
  onToggle: (optionId: string) => void;
};

/** Un grupo de opciones del editor (radio si es única, checkbox si es múltiple). */
export function ModifierGroup({ modifier, isSelected, onToggle }: ModifierGroupProps) {
  return (
    <div className="rounded-card border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-text">{modifier.name}</p>
        {modifier.isRequired && (
          <span className="text-xs font-bold uppercase tracking-wide text-brand">Obligatorio</span>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {modifier.options.map((option) => (
          <label
            key={option.id}
            className="flex items-center justify-between gap-3 rounded-card border border-line px-3 py-3 text-sm text-text"
          >
            <div className="flex items-center gap-3">
              <input
                type={modifier.allowsMultiple ? "checkbox" : "radio"}
                name={`modifier-${modifier.id}`}
                checked={isSelected(option.id)}
                onChange={() => onToggle(option.id)}
                className="h-4 w-4 accent-[rgb(var(--brand))]"
              />
              <span>{option.name}</span>
            </div>
            <span>{option.priceDelta ? `+${currency(option.priceDelta)}` : "Incluido"}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
