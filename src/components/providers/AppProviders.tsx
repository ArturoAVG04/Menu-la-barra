"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";

import { auth } from "@/lib/firebase/config";
import { BranchDirectory } from "@/domain/branch/BranchDirectory";
import { branchRepository } from "@/infrastructure";
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

const defaultBranding: BrandingSettings = {
  primaryRgb: "55 101 94",
  accentRgb: "180 140 92",
  shape: "rounded",
  fontFamily: "serif"
};

const ACTIVE_BRANCH_STORAGE_KEY = "la-barra-branch";
const BRANCHES_STORAGE_KEY = "la-barra-branches";
const brandingStorageKey = (branchId: string) => `la-barra-branding:${branchId}`;

function readStoredJson<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const initialActiveBranch = readStoredJson<Branch | null>(ACTIVE_BRANCH_STORAGE_KEY, null);
  const [branches, setBranches] = useState<Branch[]>(() =>
    readStoredJson<Branch[]>(BRANCHES_STORAGE_KEY, [])
  );
  const [activeBranch, setActiveBranch] = useState<Branch | null>(initialActiveBranch);
  const [branding, setBranding] = useState<BrandingSettings>(() =>
    initialActiveBranch
      ? {
          ...defaultBranding,
          ...readStoredJson<Partial<BrandingSettings>>(brandingStorageKey(initialActiveBranch.id), {})
        }
      : defaultBranding
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("guest");
  const [authReady, setAuthReady] = useState(false);

  useEffect(
    () =>
      branchRepository.subscribeAll((nextBranches) => {
        setBranches(nextBranches);
        window.localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(nextBranches));
      }),
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setRole("guest");
        setAuthReady(true);
        return;
      }

      try {
        await user.getIdToken(true);
        const token = await user.getIdTokenResult(true);
        setCurrentUser(user);
        setRole(token?.claims.role === "admin" || token?.claims.admin === true ? "admin" : "guest");
      } catch {
        setCurrentUser(null);
        setRole("guest");
      } finally {
        setAuthReady(true);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!activeBranch) return;
    // El carrito de cada sucursal lo maneja `useCart` (src/features/customer/hooks).
    window.localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, JSON.stringify(activeBranch));
  }, [activeBranch?.id]);

  useEffect(() => {
    if (!activeBranch) {
      setBranding(defaultBranding);
      return;
    }

    setBranding({
      ...defaultBranding,
      ...readStoredJson<Partial<BrandingSettings>>(brandingStorageKey(activeBranch.id), {})
    });

    return branchRepository.subscribeBranding(activeBranch.id, (settings) => {
      const nextBranding = settings ? { ...defaultBranding, ...settings } : defaultBranding;
      setBranding(nextBranding);
      window.localStorage.setItem(brandingStorageKey(activeBranch.id), JSON.stringify(nextBranding));
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
    if (activeBranch || !branches.length) return;
    setActiveBranch(BranchDirectory.preferred(branches));
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

  const value = useMemo<AppStateValue>(
    () => ({
      activeBranch,
      branches,
      branding,
      currentUser,
      role,
      authReady,
      setBranches,
      setBranch: (branch) => setActiveBranch(branch),
      setBranding,
      login: async (email, password) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await credential.user.getIdToken(true);
      },
      logout: async () => {
        await signOut(auth);
      }
    }),
    [activeBranch, authReady, branches, branding, currentUser, role]
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
