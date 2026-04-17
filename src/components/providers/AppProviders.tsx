"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";

import { auth } from "@/lib/firebase/config";
import type { Branch, BrandingSettings, CartItem, UserRole } from "@/types";

type AppStateValue = {
  activeBranch: Branch | null;
  branches: Branch[];
  branding: BrandingSettings;
  cart: CartItem[];
  currentUser: User | null;
  role: UserRole;
  authReady: boolean;
  setBranches: (branches: Branch[]) => void;
  setBranch: (branch: Branch | null) => void;
  setBranding: (branding: BrandingSettings) => void;
  addToCart: (item: CartItem) => void;
  clearCart: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const defaultBranding: BrandingSettings = {
  primaryRgb: "55 101 94",
  accentRgb: "180 140 92",
  shape: "rounded"
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("guest");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedBranch = window.localStorage.getItem("la-barra-branch");
    if (storedBranch) {
      setActiveBranch(JSON.parse(storedBranch) as Branch);
    }
  }, []);

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
    window.localStorage.setItem("la-barra-branch", JSON.stringify(activeBranch));
    setCart([]);
  }, [activeBranch?.id]);

  useEffect(() => {
    if (activeBranch || !branches.length) return;
    const preferredBranch = branches.find((branch) => branch.isPrimary) ?? branches[0];
    setActiveBranch(preferredBranch);
  }, [activeBranch, branches]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand", branding.primaryRgb);
    root.style.setProperty("--accent", branding.accentRgb);
    root.style.setProperty("--radius-card", branding.shape === "rounded" ? "1.5rem" : "0.375rem");
    root.style.setProperty("--radius-shell", branding.shape === "rounded" ? "2rem" : "0.5rem");
  }, [branding]);

  const value = useMemo<AppStateValue>(
    () => ({
      activeBranch,
      branches,
      branding,
      cart,
      currentUser,
      role,
      authReady,
      setBranches,
      setBranch: (branch) => setActiveBranch(branch),
      setBranding,
      addToCart: (item) => {
        setCart((current) => {
          const found = current.find((entry) => entry.id === item.id);
          if (!found) return [...current, item];
          return current.map((entry) =>
            entry.id === item.id
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry
          );
        });
      },
      clearCart: () => setCart([]),
      login: async (email, password) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await credential.user.getIdToken(true);
      },
      logout: async () => {
        await signOut(auth);
      }
    }),
    [activeBranch, authReady, branches, branding, cart, currentUser, role]
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
