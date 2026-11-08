"use client";

import { BrandImagesCard } from "@/features/admin/branding/BrandImagesCard";
import { ThemeSettingsCard } from "@/features/admin/branding/ThemeSettingsCard";
import type { Notify } from "@/features/admin/hooks/useAdminNotices";
import { useBrandingEditor } from "@/features/admin/hooks/useBrandingEditor";
import { useBrandingSubscription } from "@/features/admin/hooks/useBrandingSubscription";
import type { Branch } from "@/types";

/** Sección "Temas": personalización visual e imágenes de la sucursal. */
export function BrandingPanel({ branch, notify }: { branch: Branch | null; notify: Notify }) {
  useBrandingSubscription(branch?.id);
  const editor = useBrandingEditor(branch, notify);

  if (!branch) {
    return (
      <section className="rounded-shell border border-line bg-panel p-6 text-center text-sm text-muted">
        Selecciona una sucursal.
      </section>
    );
  }

  return (
    <div className="grid gap-6 text-left xl:grid-cols-[0.95fr_1.05fr]">
      <ThemeSettingsCard editor={editor} />
      <BrandImagesCard branch={branch} editor={editor} />
    </div>
  );
}
