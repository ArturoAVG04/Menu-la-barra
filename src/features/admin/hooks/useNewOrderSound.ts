"use client";

import { useEffect, useRef } from "react";

/**
 * Campanita de "pedido nuevo" generada con Web Audio (sin archivos de audio):
 * tres notas ascendentes tipo timbre de cocina. Suena cuando aumenta el número
 * de pedidos nuevos con el panel abierto.
 */
function playOrderChime() {
  const AudioContextClass =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
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

  window.setTimeout(() => void context.close().catch(() => undefined), 1500);
  navigator.vibrate?.([200, 100, 200]);
}

/** Suena un aviso cuando aumenta el número de pedidos nuevos. */
export function useNewOrderSound(newCount: number) {
  const previousCount = useRef(newCount);

  useEffect(() => {
    if (newCount > previousCount.current) {
      try {
        playOrderChime();
      } catch {
        // Algunos navegadores bloquean el audio hasta que el usuario toca la pantalla.
      }
    }
    previousCount.current = newCount;
  }, [newCount]);
}
