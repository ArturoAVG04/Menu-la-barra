/**
 * Un valor guardado como JSON en el localStorage del navegador, bajo una llave.
 * Encapsula los detalles feos (servidor sin `window`, JSON roto, modo privado)
 * para que los hooks solo digan `read()`, `write()` o `clear()`.
 */
export class LocalJsonStore<T> {
  constructor(
    private readonly key: string,
    private readonly fallback: T
  ) {}

  read(): T {
    if (typeof window === "undefined") return this.fallback;
    try {
      const stored = window.localStorage.getItem(this.key);
      return stored ? (JSON.parse(stored) as T) : this.fallback;
    } catch {
      return this.fallback;
    }
  }

  write(value: T) {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(value));
    } catch {
      // almacenamiento lleno o bloqueado: se ignora
    }
  }

  clear() {
    try {
      window.localStorage.removeItem(this.key);
    } catch {
      // almacenamiento bloqueado: se ignora
    }
  }
}
