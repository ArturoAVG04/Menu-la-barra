"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAppState } from "@/components/providers/AppProviders";

export function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authReady, currentUser } = useAppState();

  useEffect(() => {
    if (!authReady) return;
    if (pathname !== "/admin") return;
    if (!currentUser) {
      router.replace("/login");
    }
  }, [authReady, currentUser, pathname, router]);

  if (!authReady) {
    return null;
  }

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
}
