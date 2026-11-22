/**
 * Ventana deslizante: permite `max` eventos cada `windowMs`.
 * Pura (sin Firestore) para poder probarla; la guarda `FirestoreOrderGateway`.
 */
export class RateLimitWindow {
  constructor(
    readonly max = 5,
    readonly windowMs = 10 * 60_000
  ) {}

  /** Devuelve si se permite uno más y la lista de marcas actualizada. */
  hit(previous: unknown, now: number): { allowed: boolean; hits: number[] } {
    const recent = (Array.isArray(previous) ? previous : []).filter(
      (time): time is number => typeof time === "number" && now - time < this.windowMs
    );
    if (recent.length >= this.max) return { allowed: false, hits: recent };
    return { allowed: true, hits: [...recent, now] };
  }
}
