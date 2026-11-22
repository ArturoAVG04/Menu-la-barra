import Link from "next/link";

import { LEGAL_OWNER } from "@/lib/legal";

type LegalConsentFieldProps = {
  accepted: boolean;
  showError: boolean;
  onChange: (accepted: boolean) => void;
};

/** Casilla obligatoria de aceptación del Aviso de privacidad y los Términos. */
export function LegalConsentField({ accepted, showError, onChange }: LegalConsentFieldProps) {
  const highlight = showError && !accepted;

  return (
    <label
      className={[
        "flex items-start gap-3 rounded-card border bg-surface p-4 text-sm text-text",
        highlight ? "border-brand" : "border-line"
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={accepted}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
      />
      <span className="leading-relaxed">
        Acepto el{" "}
        <Link href="/privacidad" target="_blank" className="font-semibold text-brand underline">
          Aviso de privacidad
        </Link>{" "}
        y los{" "}
        <Link href="/terminos" target="_blank" className="font-semibold text-brand underline">
          Términos y condiciones
        </Link>
        . {LEGAL_OWNER.ownerName} ({LEGAL_OWNER.businessName}) usará tu nombre y teléfono solo para tu pedido; no
        los compartimos y se borran a los 3 días (o antes si nos lo pides por WhatsApp).
        {highlight && (
          <span className="mt-1 block font-semibold text-brand">Debes aceptar para enviar tu pedido.</span>
        )}
      </span>
    </label>
  );
}
