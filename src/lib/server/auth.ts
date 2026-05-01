import type { NextRequest } from "next/server";

import { adminAuth } from "@/lib/firebase/admin";

export async function requireAdminUser(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Missing bearer token");
  }

  const idToken = authorization.slice("Bearer ".length).trim();
  const decoded = await adminAuth().verifyIdToken(idToken);

  if (decoded.role !== "admin") {
    throw new Error("User is not admin");
  }

  return decoded;
}
