import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import type { Cart } from "@/domain/cart/Cart";
import { CartLineItem } from "@/features/customer/components/CartLineItem";
import { currency } from "@/lib/utils";

type CartDrawerProps = {
  cart: Cart;
  onClose: () => void;
  onRemove: (lineId: string) => void;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onEdit: (lineId: string) => void;
  /** El formulario de checkout va debajo de los productos. */
  children: ReactNode;
};

/** Panel lateral (abajo en móvil) con el carrito y el checkout. */
export function CartDrawer({ cart, onClose, onRemove, onQuantityChange, onEdit, children }: CartDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm">
      <div className="ml-auto flex h-full w-full max-w-2xl items-end md:items-stretch">
        <aside className="flex h-[88vh] w-full flex-col overflow-hidden rounded-t-shell border border-line bg-panel shadow-glow md:h-full md:rounded-none md:rounded-l-shell">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
            >
              <ArrowLeft size={16} />
              Volver
            </button>

            <div className="text-right">
              <p className="font-semibold text-text">Tu pedido</p>
              <p className="text-sm text-muted">
                {cart.itemCount} items · {currency(cart.subtotal)}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-6">
              <section className="space-y-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-brand">Productos</p>
                  <h3 className="mt-2 text-2xl font-semibold text-text">Revisa tu pedido</h3>
                </div>

                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <CartLineItem
                      key={item.id}
                      item={item}
                      onRemove={() => onRemove(item.id)}
                      onQuantityChange={(quantity) => onQuantityChange(item.id, quantity)}
                      onEdit={() => onEdit(item.id)}
                    />
                  ))}
                </div>
              </section>

              {children}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
