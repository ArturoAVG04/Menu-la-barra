"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppState } from "@/components/providers/AppProviders";

export function AdminLogin() {
  const router = useRouter();
  const { authReady, currentUser, login } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (currentUser) {
      router.replace("/admin");
    }
  }, [authReady, currentUser, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/admin");
    } catch {
      setError("Correo o contrasena invalidos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 rounded-shell border border-line bg-panel p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-brand">Acceso protegido</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Login admin</h1>
        <p className="mt-2 text-sm text-muted">Por ahora, cualquier usuario autenticado puede entrar al panel.</p>
      </div>

      <label className="block space-y-2 text-sm text-text">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-card border border-line bg-surface px-4 py-3 outline-none"
        />
      </label>

      <label className="block space-y-2 text-sm text-text">
        <span>Password</span>
        <div className="flex items-center rounded-card border border-line bg-surface">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full bg-transparent px-4 py-3 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="px-4 text-muted"
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
