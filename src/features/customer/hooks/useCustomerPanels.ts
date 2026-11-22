"use client";

import { useEffect, useState } from "react";

/** Paneles del menú (carrito y selector de sucursal). */
export function useCustomerPanels(branchId: string | null, cartIsEmpty: boolean, onBranchChange: () => void) {
  const [cartOpen, setCartOpen] = useState(false);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);

  // Carrito vacío: se cierra el panel.
  useEffect(() => {
    if (cartIsEmpty) setCartOpen(false);
  }, [cartIsEmpty]);

  // Al cambiar de sucursal se cierran todos los paneles.
  useEffect(() => {
    setCartOpen(false);
    setBranchPickerOpen(false);
    onBranchChange();
  }, [branchId]);

  return {
    cartOpen,
    branchPickerOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    openBranchPicker: () => setBranchPickerOpen(true),
    closeBranchPicker: () => setBranchPickerOpen(false)
  };
}

export type CustomerPanels = ReturnType<typeof useCustomerPanels>;
