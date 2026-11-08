import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL_VERSION } from "@/lib/legal";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 text-text">
      <Link href="/" className="text-sm font-semibold text-brand">
        ← Volver al menú
      </Link>
      <h1 className="mt-6 text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted">Última actualización: {LEGAL_VERSION}</p>
      <div className="legal-content mt-8 space-y-6 text-sm leading-relaxed text-text/90 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-text [&_li]:ml-5 [&_li]:list-disc [&_a]:font-semibold [&_a]:text-brand">
        {children}
      </div>
    </main>
  );
}
