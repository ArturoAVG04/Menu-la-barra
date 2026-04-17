import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedAdmin } from "@/components/admin/ProtectedAdmin";

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap justify-end gap-3">
        <Link href="/menu" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-text">
          Ver menú
        </Link>
      </div>
      <ProtectedAdmin>
        <AdminShell />
      </ProtectedAdmin>
    </main>
  );
}
