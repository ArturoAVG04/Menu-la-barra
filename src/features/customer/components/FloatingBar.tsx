import { ChevronRight, Clock3, ShoppingBag } from "lucide-react";

import type { Cart } from "@/domain/cart/Cart";
import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { SocialLinks } from "@/features/customer/components/SocialLinks";
import { currency } from "@/lib/utils";
import type { PublicTrackedOrder } from "@/types";

type FloatingBarProps = {
  whatsappHref: string | null;
  instagramHref: string | null;
  activeOrder: PublicTrackedOrder | null;
  countdownLabel: string | null;
  cart: Cart;
  onOpenTracking: () => void;
  onOpenCart: () => void;
};

/** Barra flotante inferior: redes sociales y, a la derecha, el pedido activo o el carrito. */
export function FloatingBar(props: FloatingBarProps) {
  const { activeOrder, countdownLabel, cart } = props;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <SocialLinks whatsappHref={props.whatsappHref} instagramHref={props.instagramHref} />

      {activeOrder ? (
        <button
          type="button"
          onClick={props.onOpenTracking}
          className="flex w-full items-center justify-between rounded-full border-2 border-surface/30 bg-brand px-5 py-3.5 text-left text-surface shadow-glow md:ml-auto md:max-w-md transition hover:brightness-110 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-brand shadow-glow">
              <Clock3 size={20} className="animate-pulse" />
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-accent ring-2 ring-brand" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-surface text-sm truncate">
                Pedido {OrderLifecycle.shortCode(activeOrder.id)}
              </p>
              <p className="text-xs font-semibold text-surface/80 truncate">
                {OrderLifecycle.label(activeOrder.status)}
                {countdownLabel ? ` · ${countdownLabel}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-surface shrink-0 pl-2">
            <span>Ver detalle</span>
            <ChevronRight size={16} />
          </div>
        </button>
      ) : (
        !cart.isEmpty && (
          <button
            type="button"
            onClick={props.onOpenCart}
            className="flex w-full items-center justify-between rounded-shell border border-line bg-panel px-4 py-3 text-left shadow-glow md:ml-auto md:max-w-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-brand/10 p-3 text-brand">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="font-semibold text-text">Tu carrito</p>
                <p className="text-sm text-muted">
                  {cart.itemCount} items · {currency(cart.subtotal)}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        )
      )}
    </div>
  );
}
