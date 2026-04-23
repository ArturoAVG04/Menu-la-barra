"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";

import { auth } from "@/lib/firebase/config";
import { subscribeBranches, subscribeBranding } from "@/lib/services/menu";
import type { Branch, BrandingSettings, CartItem, UserRole } from "@/types";

type AppStateValue = {
  activeBranch: Branch | null;
  branches: Branch[];
  branding: BrandingSettings;
  cart: CartItem[];
  cartItemsCount: number;
  cartTotal: number;
  currentUser: User | null;
  role: UserRole;
  authReady: boolean;
  setBranches: (branches: Branch[]) => void;
  setBranch: (branch: Branch | null) => void;
  setBranding: (branding: BrandingSettings) => void;
  addToCart: (item: CartItem) => void;
  replaceCartItem: (item: CartItem) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  restoreCart: (items: CartItem[]) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const defaultBranding: BrandingSettings = {
  primaryRgb: "55 101 94",
  accentRgb: "180 140 92",
  shape: "rounded",
  fontFamily: "serif"
};

const ACTIVE_BRANCH_STORAGE_KEY = "la-barra-branch";
const CART_BRANCH_STORAGE_KEY = "la-barra-cart-branch";
const cartStorageKey = (branchId: string) => `la-barra-cart:${branchId}`;

function readStoredCart(branchId: string) {
  try {
    const stored = window.localStorage.getItem(cartStorageKey(branchId));
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartBranchId, setCartBranchId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("guest");
  const [authReady, setAuthReady] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    const storedBranch = window.localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);
    if (storedBranch) {
      setActiveBranch(JSON.parse(storedBranch) as Branch);
    }

    const storedCartBranchId = window.localStorage.getItem(CART_BRANCH_STORAGE_KEY);
    if (storedCartBranchId) {
      setCartBranchId(storedCartBranchId);
    }
  }, []);

  useEffect(() => subscribeBranches(setBranches), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      const token = user ? await user.getIdTokenResult() : null;
      setRole(token?.claims.role === "admin" ? "admin" : "guest");
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!activeBranch) return;
    window.localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, JSON.stringify(activeBranch));

    // Solo cargamos del disco si la sucursal activa cambió realmente
    const storedCart = readStoredCart(activeBranch.id);
    setCart(storedCart);
    setCartBranchId(activeBranch.id);
    setCartLoaded(true);
  }, [activeBranch?.id]);

  useEffect(() => {
    if (!activeBranch) {
      setBranding(defaultBranding);
      return;
    }

    return subscribeBranding(activeBranch.id, (settings) => {
      setBranding(settings ? { ...defaultBranding, ...settings } : defaultBranding);
    });
  }, [activeBranch?.id]);

  useEffect(() => {
    if (!activeBranch || !branches.length) return;

    const freshBranch = branches.find((branch) => branch.id === activeBranch.id);
    if (!freshBranch) return;

    if (JSON.stringify(freshBranch) !== JSON.stringify(activeBranch)) {
      setActiveBranch(freshBranch);
    }
  }, [activeBranch, branches]);

  useEffect(() => {
    if (!cartBranchId || !cartLoaded) return;
    window.localStorage.setItem(CART_BRANCH_STORAGE_KEY, cartBranchId);
    window.localStorage.setItem(cartStorageKey(cartBranchId), JSON.stringify(cart));
  }, [cart, cartBranchId, cartLoaded]);

  useEffect(() => {
    if (activeBranch || !branches.length) return;
    const preferredBranch = branches.find((branch) => branch.isPrimary) ?? branches[0];
    setActiveBranch(preferredBranch);
  }, [activeBranch, branches]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand", branding.primaryRgb);
    root.style.setProperty("--accent", branding.accentRgb);
    root.style.setProperty(
      "--radius-card",
      branding.shape === "pill" ? "999px" : branding.shape === "rounded" ? "1.5rem" : "0.375rem"
    );
    root.style.setProperty(
      "--radius-shell",
      branding.shape === "pill" ? "2rem" : branding.shape === "rounded" ? "2rem" : "0.5rem"
    );
    root.style.setProperty(
      "--app-font",
      branding.fontFamily === "sans"
        ? '"Inter", "Segoe UI", Helvetica, Arial, sans-serif'
        : '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif'
    );
  }, [branding]);

  useEffect(() => {
    if (cart.length > 0 && activeBranch && cartBranchId && cartBranchId !== activeBranch.id) {
      setCart([]);
    }
  }, [activeBranch?.id, cart.length, cartBranchId]);

  const cartItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const value = useMemo<AppStateValue>(
    () => ({
      activeBranch,
      branches,
      branding,
      cart,
      cartItemsCount,
      cartTotal,
      currentUser,
      role,
      authReady,
      setBranches,
      setBranch: (branch) => setActiveBranch(branch),
      setBranding,
      addToCart: (item) => {
        if (!activeBranch) return;

        setCartBranchId(activeBranch.id);
        setCart((current) => {
          const existingItemIndex = current.findIndex((entry) => {
            if (entry.productId !== item.productId) return false;
            if (entry.selectedModifiers.length !== item.selectedModifiers.length) return false;
            
            return entry.selectedModifiers.every((mod) => {
              const otherMod = item.selectedModifiers.find(m => m.modifierId === mod.modifierId);
              if (!otherMod) return false;
              if (mod.optionIds.length !== otherMod.optionIds.length) return false;
              return mod.optionIds.every(id => otherMod.optionIds.includes(id));
            });
          });

          if (existingItemIndex === -1) return [...current, item];

          return current.map((entry, index) =>
            index === existingItemIndex
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry
          );
        });
      },
      replaceCartItem: (item) => {
        setCart((current) =>
          current.map((entry) => (entry.id === item.id ? item : entry))
        );
      },
      updateCartItemQuantity: (itemId, quantity) => {
        setCart((current) => {
          if (quantity <= 0) {
            return current.filter((entry) => entry.id !== itemId);
          }

          return current.map((entry) =>
            entry.id === itemId ? { ...entry, quantity } : entry
          );
        });
      },
      removeFromCart: (itemId) => {
        setCart((current) => current.filter((entry) => entry.id !== itemId));
      },
      clearCart: () => setCart([]),
      restoreCart: (items) => {
        if (!activeBranch) return;
        setCartBranchId(activeBranch.id);
        setCart(items);
      },
      login: async (email, password) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await credential.user.getIdToken(true);
      },
      logout: async () => {
        await signOut(auth);
      }
    }),
    [activeBranch, authReady, branches, branding, cart, cartItemsCount, cartTotal, currentUser, role]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState debe usarse dentro de AppProviders");
  }
  return context;
}
