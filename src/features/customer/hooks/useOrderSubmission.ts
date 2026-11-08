"use client";

import { useState } from "react";

import { BranchContact } from "@/domain/branch/BranchContact";
import type { Cart } from "@/domain/cart/Cart";
import type { MenuCatalog } from "@/domain/menu/MenuCatalog";
import type { CustomerDetails } from "@/features/customer/hooks/useCustomerDetails";
import { orderApi } from "@/infrastructure";
import { LEGAL_VERSION } from "@/lib/legal";
import type { Branch } from "@/types";

type SubmitState = "idle" | "sending" | "success" | "error";

type SubmissionOptions = {
  branch: Branch | null;
  branchOpen: boolean;
  cart: Cart;
  catalog: MenuCatalog;
  details: CustomerDetails;
  tipPercent: number;
  /** Se llama justo al tocar "Enviar pedido" (ahí se pide el permiso de notificaciones). */
  onSubmitTap: () => void;
  /** Una línea quedó sin opciones obligatorias: hay que abrirla para completarla. */
  onIncompleteLine: (lineId: string, message: string) => void;
  onSuccess: (order: { id: string; trackingToken: string }, branchId: string) => void;
  onError: () => void;
};

/**
 * Envío del pedido: valida (aviso legal, sucursal abierta, opciones obligatorias),
 * llama a la API y guarda el resultado para el modal de "Pedido enviado".
 */
export function useOrderSubmission(options: SubmissionOptions) {
  const { branch, branchOpen, cart, catalog, details, tipPercent } = options;
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null);
  const [detailsPromptOpen, setDetailsPromptOpen] = useState(false);

  /** Botón "Enviar pedido". Si faltan nombre o teléfono, primero sugiere agregarlos. */
  function requestSubmit() {
    if (!branch || !branchOpen || cart.isEmpty || state === "sending") return;
    if (!details.ensureLegalAccepted()) return;

    options.onSubmitTap();

    if (!details.hasContact) {
      setDetailsPromptOpen(true);
      return;
    }
    void submit();
  }

  async function submit() {
    if (!branch || !branchOpen || cart.isEmpty) return;
    if (!details.ensureLegalAccepted()) return;

    const incomplete = cart.findIncompleteLine((productId) => catalog.findProduct(productId));
    if (incomplete) {
      options.onIncompleteLine(incomplete.id, "Completa las personalizaciones obligatorias antes de enviar.");
      return;
    }

    const customer = details.trimmed();
    try {
      setState("sending");
      setMessage("");

      const ticketHref = BranchContact.whatsappTicketHref({
        whatsapp: branch.whatsapp,
        branchName: branch.name,
        ...customer,
        items: cart.items,
        subtotal: cart.subtotal,
        tipAmount: cart.tipFor(tipPercent),
        total: cart.totalWithTip(tipPercent)
      });

      const order = await orderApi.create({
        branchId: branch.id,
        items: cart.items,
        ...customer,
        tipPercent,
        legalVersion: LEGAL_VERSION
      });

      setWhatsappHref(ticketHref);
      options.onSuccess(order, branch.id);
      setState("success");
      setMessage("Tu pedido fue enviado correctamente.");
    } catch (error) {
      console.error("Error al enviar pedido:", error);
      setState("error");
      setMessage(
        error instanceof Error && error.message ? error.message : "No pudimos enviar tu pedido. Intenta nuevamente."
      );
      setWhatsappHref(null);
      options.onError();
    }
  }

  return {
    state,
    message,
    whatsappHref,
    detailsPromptOpen,
    requestSubmit,
    /** "Escribir mis datos": cierra el aviso para que llene el formulario. */
    dismissDetailsPrompt: () => setDetailsPromptOpen(false),
    /** "Pedir sin datos". */
    submitWithoutDetails: () => {
      setDetailsPromptOpen(false);
      void submit();
    },
    /** "Seguir explorando" en el modal de éxito. */
    reset: () => {
      setState("idle");
      setMessage("");
      setWhatsappHref(null);
    }
  };
}

export type OrderSubmission = ReturnType<typeof useOrderSubmission>;
