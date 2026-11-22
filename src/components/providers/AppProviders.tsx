"use client";

import { createContext, useContext, useMemo } from "react";
import type { User } from "firebase/auth";

import { login, logout, useAuthRole } from "@/components/providers/useAuthRole";
import { useBranchBranding } from "@/components/providers/useBranchBranding";
import { useBranchSelection } from "@/components/providers/useBranchSelection";
import type { Branch, BrandingSettings, UserRole } from "@/types";

type AppStateValue = {
  activeBranch: Branch | null;
  branches: Branch[];
  branding: BrandingSettings;
  currentUser: User | null;
  role: UserRole;
  authReady: boolean;
  setBranches: (branches: Branch[]) => void;
  setBranch: (branch: Branch | null) => void;
  setBranding: (branding: BrandingSettings) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

/** Estado global: sucursales, marca de la sucursal activa y sesión del admin. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const { branches, activeBranch, setBranches, setActiveBranch } = useBranchSelection();
  const { branding, setBranding } = useBranchBranding(activeBranch?.id ?? null);
  const { currentUser, role, authReady } = useAuthRole();

  const value = useMemo<AppStateValue>(
    () => ({
      activeBranch,
      branches,
      branding,
      currentUser,
      role,
      authReady,
      setBranches,
      setBranch: setActiveBranch,
      setBranding,
      login,
      logout
    }),
    [activeBranch, authReady, branches, branding, currentUser, role, setActiveBranch, setBranches, setBranding]
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
