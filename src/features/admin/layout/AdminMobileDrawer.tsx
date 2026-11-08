"use client";

/** Panel lateral deslizable para móvil con fondo oscuro que lo cierra al tocarlo. */
export function AdminMobileDrawer({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 h-full w-[280px] border-r border-line bg-panel shadow-2xl">
        {children}
      </div>
    </div>
  );
}
