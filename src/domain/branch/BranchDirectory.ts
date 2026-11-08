import type { Branch } from "@/types";

/** Reglas para listar sucursales: la principal primero y después por nombre. */
export class BranchDirectory {
  static sortForPicker(branches: readonly Branch[]): Branch[] {
    return [...branches].sort((left, right) => {
      if (left.isPrimary === right.isPrimary) {
        return left.name.localeCompare(right.name, "es", { sensitivity: "base" });
      }
      return left.isPrimary ? -1 : 1;
    });
  }

  /** La que se abre por defecto cuando el cliente aún no ha elegido. */
  static preferred(branches: readonly Branch[]): Branch | null {
    return branches.find((branch) => branch.isPrimary) ?? branches[0] ?? null;
  }
}
