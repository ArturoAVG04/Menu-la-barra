export type MoveDirection = "up" | "down";

/** Reglas para ordenar listas del admin (categorías, productos y opciones). */
export class SortOrder {
  /** Ordena por `sortOrder` (los que no tienen cuentan como 0). No modifica la lista original. */
  static byPriority<T extends { sortOrder?: number }>(items: readonly T[]): T[] {
    return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  /**
   * Mueve un elemento una posición arriba o abajo y renumera todos (1, 2, 3…).
   * Devuelve `null` si no se puede mover (no existe o ya está en la orilla).
   */
  static move<T extends { id: string }>(
    items: readonly T[],
    id: string,
    direction: MoveDirection
  ): (T & { sortOrder: number })[] | null {
    const index = items.findIndex((item) => item.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return null;

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    return reordered.map((item, orderIndex) => ({ ...item, sortOrder: orderIndex + 1 }));
  }
}
