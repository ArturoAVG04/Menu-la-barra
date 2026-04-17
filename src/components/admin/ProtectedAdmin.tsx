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
    return (
      <div className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
        Validando sesion...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="rounded-shell border border-dashed border-line bg-panel p-6 text-sm text-muted">
        Redirigiendo al acceso administrativo...
      </div>
    );
  }

  return <>{children}</>;
}
