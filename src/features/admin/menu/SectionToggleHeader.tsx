"use client";

/** Título de una pestaña del menú con el botón "+ Agregar" / "Cerrar". */
export function SectionToggleHeader({
  title,
  isOpen,
  onToggle
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
      <h2 className="text-2xl font-semibold text-text">{title}</h2>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
      >
        {isOpen ? "Cerrar" : "+ Agregar"}
      </button>
    </div>
  );
}
