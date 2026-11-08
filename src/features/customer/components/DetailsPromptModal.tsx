import { MessageCircle } from "lucide-react";

type DetailsPromptModalProps = {
  onWriteDetails: () => void;
  onSubmitWithoutDetails: () => void;
};

/** "¿Quieres agregar tus datos?" cuando se envía el pedido sin nombre o teléfono. */
export function DetailsPromptModal({ onWriteDetails, onSubmitWithoutDetails }: DetailsPromptModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-shell border border-line bg-panel p-6 shadow-glow text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <MessageCircle size={28} />
        </div>
        <h3 className="text-xl font-bold text-text">¿Quieres agregar tus datos?</h3>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          Te recomendamos agregar tu nombre y teléfono para que el restaurante pueda contactarte y darte un mejor
          seguimiento de tu pedido.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onWriteDetails}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-bold text-white shadow-glow"
          >
            Escribir mis datos
          </button>
          <button
            type="button"
            onClick={onSubmitWithoutDetails}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-muted hover:text-text transition"
          >
            Pedir sin datos
          </button>
        </div>
      </div>
    </div>
  );
}
