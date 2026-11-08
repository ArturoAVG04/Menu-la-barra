import { MessageCircle, X } from "lucide-react";

import { OrderLifecycle } from "@/domain/order/OrderStatus";
import { NotificationPrompt } from "@/features/customer/components/NotificationPrompt";
import { TrackedOrderSummary } from "@/features/customer/components/TrackedOrderSummary";
import { TrackingSteps } from "@/features/customer/components/TrackingSteps";
import type { PublicTrackedOrder } from "@/types";

type TrackingPanelProps = {
  order: PublicTrackedOrder;
  countdownLabel: string | null;
  whatsappTicketHref: string | null;
  showNotificationPrompt: boolean;
  showIOSHint: boolean;
  onEnableNotifications: () => void;
  onClose: () => void;
  onDismissRejected: () => void;
  onRetryRejected: () => void;
};

/** Modal de seguimiento del pedido activo. */
export function TrackingPanel(props: TrackingPanelProps) {
  const { order, countdownLabel } = props;

  return (
    <div className="fixed inset-0 z-[65] bg-black/55 p-4 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-2xl items-end md:items-center">
        <div className="max-h-[88vh] w-full overflow-y-auto rounded-shell border border-line bg-panel p-5 shadow-glow md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand">Seguimiento</p>
              <h3 className="mt-2 text-2xl font-semibold text-text">{OrderLifecycle.label(order.status)}</h3>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-text"
              aria-label="Cerrar seguimiento del pedido"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand/10 px-3 py-2 text-sm font-semibold text-brand">
                Pedido {OrderLifecycle.shortCode(order.id)}
              </span>
              {OrderLifecycle.suggestsWhatsappTicket(order.status) && props.whatsappTicketHref && (
                <a
                  href={props.whatsappTicketHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"
                >
                  <MessageCircle size={16} />
                  Enviar ticket al restaurante
                </a>
              )}
            </div>

            {props.showNotificationPrompt && (
              <NotificationPrompt showIOSHint={props.showIOSHint} onEnable={props.onEnableNotifications} />
            )}

            {order.statusMessage && (
              <div className="rounded-card border border-line bg-surface p-4">
                <p className="text-center text-sm text-text">{order.statusMessage}</p>
              </div>
            )}

            {countdownLabel && (
              <div className="rounded-card border border-brand/30 bg-brand/10 p-4">
                <p className="text-center text-sm font-semibold text-brand">{countdownLabel}</p>
              </div>
            )}

            <TrackingSteps status={order.status} />
            <TrackedOrderSummary order={order} />

            {order.status === "rejected" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={props.onDismissRejected}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line px-4 py-3 text-center text-sm font-semibold text-text"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={props.onRetryRejected}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Volver a pedir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
