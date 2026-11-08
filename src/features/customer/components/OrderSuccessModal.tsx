import { CheckCircle2, MessageCircle } from "lucide-react";

type OrderSuccessModalProps = {
  message: string;
  whatsappHref: string | null;
  onContinue: () => void;
};

/** Confirmación de "Pedido enviado" con el ticket por WhatsApp opcional. */
export function OrderSuccessModal({ message, whatsappHref, onContinue }: OrderSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/45 p-4 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-lg items-center">
        <div className="w-full rounded-shell border border-line bg-panel p-7 shadow-glow">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 size={28} />
          </div>
          <div className="mt-5 text-center">
            <h3 className="text-2xl font-semibold text-text">Pedido enviado</h3>
            <p className="mt-2 text-sm text-muted">{message || "Tu pedido ya quedó registrado para esta sucursal."}</p>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="flex flex-col gap-3 sm:flex-row">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
                >
                  <MessageCircle size={16} />
                  Enviar ticket por WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
              >
                Seguir explorando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
