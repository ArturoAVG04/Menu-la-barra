import Link from "next/link";

import { CustomerShell } from "@/components/customer/CustomerShell";

export default function MenuPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-6 flex justify-end">
        <Link href="/" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-text">
          Cambiar sucursal
        </Link>
      </div>
      <CustomerShell />
    </main>
  );
}

