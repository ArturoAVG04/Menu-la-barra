"use client";

import { useMemo } from "react";

import { BranchContact } from "@/domain/branch/BranchContact";
import type { Cart } from "@/domain/cart/Cart";
import type { CustomerDetails } from "@/features/customer/hooks/useCustomerDetails";
import type { Branch, PublicTrackedOrder } from "@/types";

const DEFAULT_WHATSAPP_LINK = "https://wa.me/message/JRC557CVY6LP1";

type BranchLinksInput = {
  branch: Branch | null;
  cart: Cart;
  tipPercent: number;
  details: Pick<CustomerDetails, "customerName" | "customerPhone" | "orderNote">;
  activeOrder: PublicTrackedOrder | null;
};

/** Enlaces de contacto de la sucursal y los tickets por WhatsApp (los arma `BranchContact`). */
export function useBranchLinks({ branch, cart, tipPercent, details, activeOrder }: BranchLinksInput) {
  const whatsapp = branch?.whatsapp;
  const branchName = branch?.name;
  const { customerName, customerPhone, orderNote } = details;

  const cartTicketHref = useMemo(
    () =>
      BranchContact.whatsappTicketHref({
        whatsapp,
        branchName,
        customerName,
        customerPhone,
        orderNote,
        items: cart.items,
        subtotal: cart.subtotal,
        tipAmount: cart.tipFor(tipPercent),
        total: cart.totalWithTip(tipPercent)
      }),
    [whatsapp, branchName, customerName, customerPhone, orderNote, cart, tipPercent]
  );

  const activeOrderTicketHref = useMemo(
    () =>
      activeOrder
        ? BranchContact.whatsappTicketHref({
            whatsapp,
            branchName,
            customerName: activeOrder.customerName,
            customerPhone: activeOrder.customerPhone,
            orderNote: activeOrder.orderNote,
            items: activeOrder.items,
            subtotal: activeOrder.subtotal ?? Math.max(activeOrder.total - (activeOrder.tipAmount ?? 0), 0),
            tipAmount: activeOrder.tipAmount ?? 0,
            total: activeOrder.total,
            orderId: activeOrder.id
          })
        : null,
    [whatsapp, branchName, activeOrder]
  );

  return {
    whatsappHref: BranchContact.whatsappHref(whatsapp) ?? DEFAULT_WHATSAPP_LINK,
    instagramHref: BranchContact.instagramHref(branch?.instagram),
    cartTicketHref,
    activeOrderTicketHref
  };
}
