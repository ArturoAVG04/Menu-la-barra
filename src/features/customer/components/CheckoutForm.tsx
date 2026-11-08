import { LoaderCircle, MessageCircle } from "lucide-react";

import type { Cart } from "@/domain/cart/Cart";
import { LegalConsentField } from "@/features/customer/components/LegalConsentField";
import { TipSelector } from "@/features/customer/components/TipSelector";
import type { CustomerDetails } from "@/features/customer/hooks/useCustomerDetails";
import type { OrderSubmission } from "@/features/customer/hooks/useOrderSubmission";
import { currency } from "@/lib/utils";

type CheckoutFormProps = {
  cart: Cart;
  details: CustomerDetails;
  tipPercent: number;
  onTipChange: (tipPercent: number) => void;
  branchOpen: boolean;
  submission: Pick<OrderSubmission, "state" | "message" | "requestSubmit">;
  /** Ticket por WhatsApp para cuando la sucursal está cerrada. */
  whatsappTicketHref: string | null;
  onClearCart: () => void;
};

const inputClass =
  "min-h-11 w-full rounded-full border border-line bg-surface px-4 py-3 text-sm text-text outline-none";

/** Datos del cliente, aviso legal, propina y botón de enviar. */
export function CheckoutForm(props: CheckoutFormProps) {
  const { cart, details, tipPercent, branchOpen, submission } = props;
  const sending = submission.state === "sending";

  return (
    <section className="space-y-3">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-brand">Datos</p>
        <h3 className="mt-2 text-2xl font-semibold text-text">Completa tu pedido</h3>
      </div>

      <input
        value={details.customerName}
        onChange={(event) => details.setCustomerName(event.target.value)}
        placeholder="Nombre para el pedido"
        className={inputClass}
      />
      <input
        value={details.customerPhone}
        onChange={(event) => details.setCustomerPhone(event.target.value)}
        placeholder="Numero de telefono"
        inputMode="tel"
        className={inputClass}
      />
      <textarea
        value={details.orderNote}
        onChange={(event) => details.setOrderNote(event.target.value)}
        rows={1}
        placeholder="Nota general para el restaurante"
        className="min-h-11 max-h-11 w-full resize-none overflow-hidden rounded-full border border-line bg-surface px-4 py-3 text-sm text-text outline-none placeholder:text-muted"
      />

      <LegalConsentField
        accepted={details.legalAccepted}
        showError={details.legalError}
        onChange={details.changeLegalAccepted}
      />

      <TipSelector cart={cart} tipPercent={tipPercent} onChange={props.onTipChange} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={props.onClearCart}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-text"
        >
          Vaciar carrito
        </button>
        <button
          type="button"
          onClick={submission.requestSubmit}
          disabled={!branchOpen || sending}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
        >
          {sending ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={16} className="animate-spin" />
              Enviando pedido...
            </span>
          ) : branchOpen ? (
            `Enviar pedido ${currency(cart.totalWithTip(tipPercent))}`
          ) : (
            "Sucursal cerrada"
          )}
        </button>
      </div>

      {submission.state === "error" && submission.message && (
        <p className="text-sm font-medium text-danger">{submission.message}</p>
      )}

      {!branchOpen && (
        <div className="space-y-3 rounded-card border border-danger/20 bg-danger/5 p-4 text-center">
          <p className="text-sm font-medium text-danger">
            Esta sucursal está cerrada. Puedes revisar el menú y tu carrito, pero no enviar pedidos por ahora.
          </p>
          {props.whatsappTicketHref && (
            <a
              href={props.whatsappTicketHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              <MessageCircle size={16} />
              Enviar ticket por WhatsApp
            </a>
          )}
        </div>
      )}
    </section>
  );
}
