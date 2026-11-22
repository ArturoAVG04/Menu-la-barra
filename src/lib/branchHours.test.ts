import { describe, expect, it } from "vitest";

import { isBranchOpenAt } from "@/lib/branchHours";
import type { Branch } from "@/types";

const branch = (weeklyHours: Branch["weeklyHours"]) => ({ id: "x", isOpen: true, weeklyHours }) as Branch;
// Hora de CDMX (UTC-6): "2026-11-21T01:00" sábado → 07:00Z
const cdmx = (local: string) => new Date(`${local}:00-06:00`);

describe("isBranchOpenAt", () => {
  const nightly = branch([{ days: ["Viernes", "Sábado"], open: "20:00", close: "02:00" }]);

  it("sigue abierta en la madrugada de un día que también tiene turno", () => {
    expect(isBranchOpenAt(nightly, cdmx("2026-11-21T01:00"))).toBe(true); // sábado 01:00
  });

  it("abre la madrugada siguiente al último día", () => {
    expect(isBranchOpenAt(nightly, cdmx("2026-11-22T01:00"))).toBe(true); // domingo 01:00
  });

  it("cierra después de la hora de cierre y antes de abrir", () => {
    expect(isBranchOpenAt(nightly, cdmx("2026-11-21T03:00"))).toBe(false);
    expect(isBranchOpenAt(nightly, cdmx("2026-11-21T19:59"))).toBe(false);
    expect(isBranchOpenAt(nightly, cdmx("2026-11-21T20:00"))).toBe(true);
  });

  it("no abre la madrugada del viernes (el jueves no tiene turno)", () => {
    expect(isBranchOpenAt(nightly, cdmx("2026-11-20T01:00"))).toBe(false);
  });

  it("horario normal de día", () => {
    const day = branch([{ days: ["Sábado"], open: "13:00", close: "22:00" }]);
    expect(isBranchOpenAt(day, cdmx("2026-11-21T13:00"))).toBe(true);
    expect(isBranchOpenAt(day, cdmx("2026-11-21T22:00"))).toBe(false);
    expect(isBranchOpenAt(day, cdmx("2026-11-22T01:00"))).toBe(false);
  });

  it("respeta el interruptor de cerrado", () => {
    expect(isBranchOpenAt({ ...nightly, isOpen: false }, cdmx("2026-11-21T21:00"))).toBe(false);
  });
});
