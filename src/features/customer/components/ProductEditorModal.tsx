"use client";

import { useEffect, useRef } from "react";
import { Minus, Plus, X } from "lucide-react";

import { ProductVisual } from "@/components/customer/ProductVisual";
import type { ProductSelection } from "@/domain/menu/ProductSelection";
import { ModifierGroup } from "@/features/customer/components/ModifierGroup";
import { currency } from "@/lib/utils";

type ProductEditorModalProps = {
  selection: ProductSelection;
  isEditingCartItem: boolean;
  error: string;
  onToggleOption: (modifierId: string, optionId: string) => void;
  onChangeQuantity: (delta: number) => void;
  onSave: () => void;
  onClose: () => void;
};

/** Modal para elegir opciones y cantidad de un producto (nuevo o ya en el carrito). */
export function ProductEditorModal(props: ProductEditorModalProps) {
  const { selection, error } = props;
  const product = selection.product;
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Al abrir otro producto, el panel vuelve arriba.
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [product.id]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 p-4 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-2xl items-end md:items-center">
        <div
          ref={panelRef}
          className="relative max-h-[88vh] w-full overflow-y-auto overflow-x-hidden rounded-shell border border-line bg-panel shadow-glow md:max-w-xl"
        >
          <div className="relative h-60 w-full overflow-hidden bg-surface sm:h-72">
            <ProductVisual product={product.toData()} />
            <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/30 to-transparent" />
            <button
              type="button"
              onClick={props.onClose}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/65 text-white backdrop-blur-md transition hover:bg-black/80 active:scale-95 shadow-glow"
              aria-label="Cerrar edición del producto"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 md:p-6 -mt-6 relative z-10">
            <h3 className="text-2xl font-bold text-text">{product.name}</h3>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">{product.description}</p>
            <p className="mt-3 text-base font-bold text-brand">Base {currency(selection.basePrice)}</p>
          </div>

          <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-4">
            {product.sortedModifiers.map((modifier) => (
              <ModifierGroup
                key={modifier.id}
                modifier={modifier}
                isSelected={(optionId) => selection.isSelected(modifier.id, optionId)}
                onToggle={(optionId) => props.onToggleOption(modifier.id, optionId)}
              />
            ))}

            <div className="rounded-card border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-text">Cantidad</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => props.onChangeQuantity(-1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-8 text-center font-semibold text-text">{selection.quantity}</span>
                  <button
                    type="button"
                    onClick={() => props.onChangeQuantity(1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-text"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-6 space-y-2 rounded-card bg-surface/50 px-4 py-4 text-sm text-text border border-line/50">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Extras</span>
                  <span className="font-medium text-text">{currency(selection.extrasTotal)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2 font-bold text-base">
                  <span>Total</span>
                  <span className="text-brand">{currency(selection.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm font-medium text-danger">{error}</p>}

          <div className="mt-6 flex">
            <button
              type="button"
              onClick={props.onSave}
              className="inline-flex min-h-[52px] w-full items-center justify-between rounded-full bg-brand px-6 py-3 text-base font-bold text-white shadow-glow transition active:scale-[0.98]"
            >
              <span>{props.isEditingCartItem ? "Guardar cambios" : "Agregar al carrito"}</span>
              <span className="border-l border-white/20 pl-4">{currency(selection.total)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
