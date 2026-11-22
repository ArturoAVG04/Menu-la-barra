"use client";

import { useState } from "react";

import { BranchContact } from "@/domain/branch/BranchContact";
import type { Cart } from "@/domain/cart/Cart";
import type { MenuCatalog } from "@/domain/menu/MenuCatalog";
import { CustomerInfo } from "@/domain/order/CustomerInfo";
import { OrderLifecycle } from "@/domain/order/OrderStatus";
import type { CustomerDetails } from "@/features/customer/hooks/useCustomerDetails";
import { clearPendingOrder, pendingOrderId } from "@/features/customer/pendingOrder";
import { orderApi } from "@/infrastructure";
import type { CreatedOrder } from "@/infrastructure/api/OrderApiClient";
import { LEGAL_VERSION } from "@/lib/legal";
import { currency } from "@/lib/utils";
import type { Branch } from "@/types";

type SubmitState = "idle" | "sending" | "success" | "error";

type SubmissionOptions = {
  branch: Branch | null;
  branchOpen: boolean;
  /** Carrito con precios del menú actual. */
  cart: Cart;
  unavailableIds: readonly string[];
  catalog: MenuCatalog;
  details: CustomerDetails;
  tipPercent: number;
  /** Hay un pedido anterior sin terminar. */
  hasOrderInProgress: boolean;
  /** Se llama justo al tocar "Enviar pedido" (ahí se pide el permiso de notificaciones). */
  onSubmitTap: () => void;
  /** Una línea quedó sin opciones obligatorias: hay que abrirla para completarla. */
  onIncompleteLine: (lineId: string, message: string) => void;
  onSuccess: (order: CreatedOrder, branchId: string) => void;
  onError: () => void;
};

/**
 * Envío del pedido: valida (aviso legal, datos, sucursal abierta, productos), llama a la API
 * con un id fijo por pedido (reintentos sin duplicar) y arma el modal de "Pedido enviado".
 */
export function useOrderSubmission(options: SubmissionOptions) {
  const { branch, branchOpen, cart, details, tipPercent } = options;
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null);

  function fail(text: string) {
    setState("error");
    setMessage(text);
    setWhatsappHref(null);
  }

  /** Primer motivo para no enviar (o null). */
  function blocker(): string | null {
    if (options.hasOrderInProgress) return "Ya tienes un pedido en curso.";
    if (options.unavailableIds.length) return "Quita los productos que ya no están disponibles.";
    return CustomerInfo.problemWith({ name: details.customerName, phone: details.customerPhone });
  }

  /** Botón "Enviar pedido". */
  function requestSubmit() {
    if (!branch || !branchOpen || cart.isEmpty || state === "sending") return;
    if (!details.ensureLegalAccepted()) return;

    const problem = blocker();
    if (problem) return fail(problem);

    const incomplete = cart.findIncompleteLine(options.catalog.finder);
    if (incomplete) {
      options.onIncompleteLine(incomplete.id, "Completa las opciones obligatorias.");
      return;
    }

    options.onSubmitTap();
    void submit(branch);
  }

  async function submit(target: Branch) {
    const customer = details.trimmed();
    try {
      setState("sending");
      setMessage("");
      const order = await orderApi.create({
        branchId: target.id,
        clientOrderId: pendingOrderId(target.id, cart, tipPercent),
        items: cart.items,
        ...customer,
        tipPercent,
        legalVersion: LEGAL_VERSION
      });
      clearPendingOrder();

      // Montos del servidor (los definitivos) y número de pedido en el ticket.
      setWhatsappHref(
        BranchContact.whatsappTicketHref({
          whatsapp: target.whatsapp,
          branchName: target.name,
          ...customer,
          items: cart.items,
          subtotal: order.subtotal ?? cart.subtotal,
          tipAmount: order.tipAmount ?? 0,
          total: order.total,
          orderId: order.id
        })
      );
      setMessage(`Pedido ${OrderLifecycle.shortCode(order.id)} · Total ${currency(order.total)}`);
      setState("success");
      options.onSuccess(order, target.id);
    } catch (error) {
      console.error("Error al enviar pedido:", error);
      fail(error instanceof Error && error.message ? error.message : "No pudimos enviar tu pedido. Intenta de nuevo.");
      options.onError();
    }
  }

  return {
    state,
    message,
    whatsappHref,
    requestSubmit,
    /** "Seguir explorando" en el modal de éxito. */
    reset: () => {
      setState("idle");
      setMessage("");
      setWhatsappHref(null);
    }
  };
}

export type OrderSubmission = ReturnType<typeof useOrderSubmission>;
