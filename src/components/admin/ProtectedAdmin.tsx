"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAppState } from "@/components/providers/AppProviders";

export function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authReady, currentUser, role } = useAppState();

  useEffect(() => {
    if (!authReady) return;
    if (pathname !== "/admin") return;
    if (!currentUser || role !== "admin") {
      router.replace("/login");
    }
  }, [authReady, currentUser, pathname, role, router]);

  if (!authReady) {
    return null;
  }

  if (!currentUser || role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
