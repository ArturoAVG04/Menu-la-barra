"use client";

import { useEffect, useState } from "react";

import { LocalJsonStore } from "@/infrastructure/browser/LocalJsonStore";
import { LEGAL_VERSION } from "@/lib/legal";

type StoredDetails = {
  customerName?: string;
  customerPhone?: string;
  orderNote?: string;
  legalVersion?: string;
};

const detailsStore = new LocalJsonStore<StoredDetails | null>("la-barra-customer-details", null);

/**
 * Datos del cliente (nombre, teléfono, nota) y su aceptación del aviso legal.
 * Se recuerdan en el navegador; la aceptación solo vale si es de la versión vigente.
 */
export function useCustomerDetails() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalError, setLegalError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = detailsStore.read();
    if (stored) {
      setLegalAccepted(stored.legalVersion === LEGAL_VERSION);
      setCustomerName(stored.customerName ?? "");
      setCustomerPhone(stored.customerPhone ?? "");
      setOrderNote(stored.orderNote ?? "");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    detailsStore.write({
      customerName,
      customerPhone,
      orderNote,
      ...(legalAccepted ? { legalVersion: LEGAL_VERSION } : {})
    });
  }, [loaded, customerName, customerPhone, orderNote, legalAccepted]);

  function changeLegalAccepted(accepted: boolean) {
    setLegalAccepted(accepted);
    if (accepted) setLegalError(false);
  }

  /** Devuelve true si ya aceptó; si no, marca el error para mostrarlo en la casilla. */
  function ensureLegalAccepted() {
    if (!legalAccepted) setLegalError(true);
    return legalAccepted;
  }

  return {
    customerName,
    customerPhone,
    orderNote,
    legalAccepted,
    legalError,
    setCustomerName,
    setCustomerPhone,
    setOrderNote,
    changeLegalAccepted,
    ensureLegalAccepted,
    hasContact: Boolean(customerName.trim() && customerPhone.trim()),
    /** Datos limpios para mandar en el pedido. */
    trimmed: () => ({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderNote: orderNote.trim()
    })
  };
}

export type CustomerDetails = ReturnType<typeof useCustomerDetails>;
