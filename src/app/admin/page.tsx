import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedAdmin } from "@/components/admin/ProtectedAdmin";

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-6">
      <ProtectedAdmin>
        <AdminShell />
      </ProtectedAdmin>
    </main>
  );
}
