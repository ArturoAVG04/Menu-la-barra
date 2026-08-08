import type { NextRequest } from "next/server";

import { adminAuth } from "@/lib/firebase/admin";

export async function requireAdminUser(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Falta iniciar sesión.");
  }

  const idToken = authorization.slice("Bearer ".length).trim();
  const decoded = await adminAuth().verifyIdToken(idToken);

  if (decoded.role !== "admin" && decoded.admin !== true) {
    throw new Error("Tu sesión no tiene role: admin. Cierra sesión y vuelve a entrar después de asignar el claim.");
  }

  return decoded;
}
