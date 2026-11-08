"use client";

import { Palette, Type } from "lucide-react";

import { RgbColor } from "@/domain/branding/RgbColor";
import type { BrandingEditor } from "@/features/admin/hooks/useBrandingEditor";
import type { BrandingSettings } from "@/types";

const DEFAULT_PRIMARY = "55 101 94";
const DEFAULT_ACCENT = "180 140 92";

function ColorField({ label, rgb, onChange }: { label: string; rgb: string; onChange: (rgb: string) => void }) {
  const hex = RgbColor.toHex(rgb);
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <div className="flex items-center justify-center gap-3 rounded-card border border-line bg-surface p-2">
        <input
          type="color"
          value={hex}
          onChange={(event) => onChange(RgbColor.fromHex(event.target.value))}
          className="h-10 w-10 cursor-pointer overflow-hidden rounded-md border-none bg-transparent"
        />
        <span className="text-xs font-mono text-muted uppercase">{hex}</span>
      </div>
    </div>
  );
}

/** Colores, bordes y tipografía del menú. */
export function ThemeSettingsCard({ editor }: { editor: BrandingEditor }) {
  const { branding, updateBranding } = editor;

  return (
    <section className="space-y-5 rounded-shell border border-line bg-panel p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-brand/10 p-3 text-brand">
            <Palette size={18} />
          </div>
          <h2 className="text-2xl font-semibold text-text">Personalización visual</h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          label="Color principal"
          rgb={branding.primaryRgb || DEFAULT_PRIMARY}
          onChange={(primaryRgb) => updateBranding({ primaryRgb })}
        />
        <ColorField
          label="Color de acento"
          rgb={branding.accentRgb || DEFAULT_ACCENT}
          onChange={(accentRgb) => updateBranding({ accentRgb })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm text-text">
          <span>Estilo de bordes</span>
          <select
            value={branding.shape}
            onChange={(event) => updateBranding({ shape: event.target.value as BrandingSettings["shape"] })}
            className="min-h-11 w-full rounded-card border border-line bg-surface px-4 py-3 text-center outline-none"
          >
            <option value="rounded">Suave (Redondeado)</option>
            <option value="square">Clásico (Recto)</option>
            <option value="pill">Moderno (Cápsula)</option>
          </select>
        </label>

        <label className="block space-y-2 text-sm text-text">
          <span>Tipografía</span>
          <div className="flex items-center justify-center gap-2 min-h-11 w-full rounded-card border border-line bg-surface px-4">
            <Type size={16} className="text-muted" />
            <select
              value={branding.fontFamily || "sans"}
              onChange={(event) => updateBranding({ fontFamily: event.target.value })}
              className="flex-1 bg-transparent text-center outline-none"
            >
              <option value="sans">Moderna (Sans-serif)</option>
              <option value="serif">Elegante (Serif)</option>
            </select>
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={() => void editor.saveTheme()}
        disabled={editor.isSaving}
        className="inline-flex min-h-11 items-center justify-center self-center rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
      >
        {editor.isSaving ? "Guardando..." : "Guardar cambios"}
      </button>
    </section>
  );
}
