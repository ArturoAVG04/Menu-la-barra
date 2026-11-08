import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

/**
 * Clase base de los repositorios de Firestore (herencia): comparte cómo se
 * convierte un documento en objeto y cómo se ordenan las listas.
 */
export abstract class FirestoreRepository {
  protected toEntity<T>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
    return { id: snapshot.id, ...snapshot.data() } as T;
  }

  /** Ordena por `sortOrder` y, si empatan, por nombre (sin distinguir acentos ni mayúsculas). */
  protected sortBySortOrder<T extends { sortOrder?: number; name?: string }>(items: T[]) {
    return [...items].sort((a, b) => {
      const left = typeof a.sortOrder === "number" ? a.sortOrder : Number.MAX_SAFE_INTEGER;
      const right = typeof b.sortOrder === "number" ? b.sortOrder : Number.MAX_SAFE_INTEGER;
      if (left !== right) return left - right;
      return (a.name ?? "").localeCompare(b.name ?? "", "es", { sensitivity: "base" });
    });
  }
}

export type Unsubscribe = () => void;
