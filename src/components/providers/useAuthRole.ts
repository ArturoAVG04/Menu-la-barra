"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";

import { auth } from "@/lib/firebase/config";
import type { UserRole } from "@/types";

/** Sesión de Firebase y rol (admin si el token trae el claim). */
export function useAuthRole() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("guest");
  const [authReady, setAuthReady] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setCurrentUser(null);
          setRole("guest");
          setAuthReady(true);
          return;
        }
        try {
          await user.getIdToken(true);
          const token = await user.getIdTokenResult(true);
          setCurrentUser(user);
          setRole(token?.claims.role === "admin" || token?.claims.admin === true ? "admin" : "guest");
        } catch {
          setCurrentUser(null);
          setRole("guest");
        } finally {
          setAuthReady(true);
        }
      }),
    []
  );

  return { currentUser, role, authReady };
}

export async function login(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await credential.user.getIdToken(true);
}

export async function logout() {
  await signOut(auth);
}
