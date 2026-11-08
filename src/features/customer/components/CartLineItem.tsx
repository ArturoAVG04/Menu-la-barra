import { Minus, Plus, Trash2 } from "lucide-react";

import { describeModifiers } from "@/features/customer/format";
import { currency } from "@/lib/utils";
import type { CartItem } from "@/types";

type CartLineItemProps = {
  item: CartItem;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
  onEdit: () => void;
};

/** Una línea del carrito con sus opciones, cantidad y botones de editar/eliminar. */
export function CartLineItem({ item, onRemove, onQuantityChange, onEdit }: CartLineItemProps) {
  return (
    <article className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 break-words font-semibold text-text">{item.name}</p>
          {item.selectedModifiers.length > 0 && (
            <p className="mt-1 text-sm text-muted">{describeModifiers(item.selectedModifiers)}</p>
          )}
          <p className="mt-2 text-sm font-semibold text-brand">{currency(item.unitPrice)} c/u</p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
          aria-label={`Eliminar ${item.name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onQuantityChange(item.quantity - 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
          >
            <Minus size={16} />
          </button>
          <span className="min-w-8 text-center font-semibold text-text">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(item.quantity + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
          >
            Editar
          </button>
          <p className="font-semibold text-text">{currency(item.unitPrice * item.quantity)}</p>
        </div>
      </div>
    </article>
  );
}
