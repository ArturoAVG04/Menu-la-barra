type NotificationPromptProps = {
  /** En iPhone, fuera de la app instalada, se explica cómo agregarla a inicio. */
  showIOSHint: boolean;
  onEnable: () => void;
};

/** Invitación a activar las notificaciones del pedido. */
export function NotificationPrompt({ showIOSHint, onEnable }: NotificationPromptProps) {
  return (
    <div className="rounded-card border border-brand/30 bg-brand/5 p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text">Notificaciones de tu pedido</p>
          <p className="text-xs text-muted">Recibe avisos cuando cambie el estado</p>
        </div>
        <button
          type="button"
          onClick={onEnable}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-glow transition active:scale-95"
        >
          Activar notificaciones
        </button>
      </div>
      {showIOSHint && (
        <p className="text-xs text-muted pt-1 border-t border-line/40">
          💡 En iPhone, para recibir alertas cuando la pantalla esté apagada: Toca Compartir ⎋ → &quot;Agregar a inicio&quot;.
        </p>
      )}
    </div>
  );
}
