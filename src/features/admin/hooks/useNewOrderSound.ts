"use client";

import { useEffect, useRef } from "react";

/**
 * Campanita de "pedido nuevo" generada con Web Audio (sin archivos de audio):
 * tres notas ascendentes tipo timbre de cocina.
 * Chrome solo deja sonar audio después de que tocas la pantalla: por eso hay UN solo
 * AudioContext que se crea/reanuda en el primer toque y se reutiliza.
 */
let sharedContext: AudioContext | null = null;

function getContext() {
  const AudioContextClass =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  sharedContext ??= new AudioContextClass();
  if (sharedContext.state === "suspended") void sharedContext.resume().catch(() => undefined);
  return sharedContext;
}

function playOrderChime() {
  const context = getContext();
  if (!context) return;
  const notes = [880, 1108.73, 1318.51]; // La5, Do#6, Mi6 (acorde mayor, suena "alegre")

  notes.forEach((frequency, index) => {
    const start = context.currentTime + index * 0.16;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.65);
  });
  navigator.vibrate?.([200, 100, 200]);
}

/**
 * Suena cuando llega un pedido que no se había visto (compara ids, no cantidades:
 * si aceptas uno y llega otro al mismo tiempo, también suena). Va en el panel completo,
 * no solo en la pestaña de pedidos.
 */
export function useNewOrderSound(newOrderIds: readonly string[]) {
  const seen = useRef<Set<string> | null>(null);

  // Desbloquea el audio con el primer toque del admin.
  useEffect(() => {
    const unlock = () => getContext();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const key = newOrderIds.join(",");
  useEffect(() => {
    if (seen.current === null) {
      // Primera carga: los pedidos que ya estaban no suenan.
      seen.current = new Set(newOrderIds);
      return;
    }
    const fresh = newOrderIds.filter((id) => !seen.current!.has(id));
    fresh.forEach((id) => seen.current!.add(id));
    if (fresh.length) {
      try {
        playOrderChime();
      } catch {
        // Si el navegador bloquea el audio, al menos llega la notificación push.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
