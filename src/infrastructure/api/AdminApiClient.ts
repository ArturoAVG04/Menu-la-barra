import type { User } from "firebase/auth";

/** Rutas /api/admin que necesitan sesión de admin (borrar sucursal, subir imágenes, avisos del dispositivo). */
export class AdminApiClient {
  private async call<T>(url: string, init: RequestInit, fallbackError: string): Promise<T> {
    const response = await fetch(url, init);
    const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!response.ok) throw new Error(body?.error || fallbackError);
    return body as T;
  }

  private async auth(user: User) {
    return { Authorization: `Bearer ${await user.getIdToken()}` };
  }

  /** Borra la sucursal con sus productos, categorías y personalizaciones. */
  async deleteBranch(user: User, branchId: string) {
    await this.call(`/api/admin/branches/${encodeURIComponent(branchId)}`, { method: "DELETE", headers: await this.auth(user) }, "No se pudo borrar la sucursal");
  }

  /** Sube una imagen (archivo o liga) por el servidor; devuelve la URL pública. */
  async uploadImage(user: User, image: File | string) {
    const form = new FormData();
    form.append("image", image);
    const { url } = await this.call<{ url: string }>("/api/admin/upload", { method: "POST", headers: await this.auth(user), body: form }, "No se pudo subir la imagen");
    return url;
  }

  /** Este dispositivo deja de recibir avisos de pedidos (al cerrar sesión). */
  async forgetPushToken(token: string) {
    await this.call("/api/admin/notification-token", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    }, "No se pudo quitar el aviso");
  }
}
