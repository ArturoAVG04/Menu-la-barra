import { DEFAULT_ORDER_SETTINGS } from "@/domain/order/OrderStatus";
import type { Branch } from "@/types";

/** Datos que se capturan en el formulario "Nueva sucursal". */
export type NewBranchForm = {
  name: string;
  slug: string;
  address: string;
  whatsapp: string;
  instagram: string;
  isPrimary: boolean;
  isOpen: boolean;
};

export const EMPTY_BRANCH_FORM: NewBranchForm = {
  name: "",
  slug: "",
  address: "",
  whatsapp: "",
  instagram: "",
  isPrimary: false,
  isOpen: true
};

/** Crea sucursales nuevas y aplica la regla de "solo una sucursal principal". */
export class BranchFactory {
  static canCreate(form: NewBranchForm) {
    return Boolean(form.name.trim());
  }

  /** Si no escriben slug, se genera del nombre ("La Barra Presa" → "la-barra-presa"). */
  static slugFor(form: Pick<NewBranchForm, "name" | "slug">) {
    return form.slug.trim() || form.name.toLowerCase().replaceAll(" ", "-");
  }

  /** El horario se recibe de fuera: el dominio no conoce el formato por defecto de `lib/branchHours`. */
  static create(form: NewBranchForm, id: string, weeklyHours: Branch["weeklyHours"]): Branch {
    return {
      id,
      name: form.name.trim(),
      slug: BranchFactory.slugFor(form),
      address: form.address.trim(),
      whatsapp: form.whatsapp.trim(),
      instagram: form.instagram?.trim() || "",
      isPrimary: form.isPrimary,
      orderSettings: { ...DEFAULT_ORDER_SETTINGS },
      weeklyHours,
      isOpen: form.isOpen
    };
  }

  /** Sucursales que deben dejar de ser principales porque `primaryId` ahora lo es. */
  static demoteOthers(branches: readonly Branch[], primaryId: string): Branch[] {
    return branches
      .filter((branch) => branch.id !== primaryId && branch.isPrimary)
      .map((branch) => ({ ...branch, isPrimary: false }));
  }
}
