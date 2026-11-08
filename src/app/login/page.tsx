import { redirect } from "next/navigation";

// El login vive dentro de /admin para que la app (PWA) del admin no se salga a la del menú.
export default function LegacyLoginPage() {
  redirect("/admin/login");
}
