import { describe, expect, it } from "vitest";

import { RgbColor } from "./RgbColor";

describe("RgbColor.readableOnWhite", () => {
  it("oscurece un rojo claro hasta que se lea con texto blanco", () => {
    const fixed = RgbColor.readableOnWhite("242 7 19");
    expect(RgbColor.contrast(fixed, "255 255 255")).toBeGreaterThanOrEqual(4.5);
    expect(fixed).not.toBe("242 7 19");
  });

  it("no cambia un color que ya se lee bien", () => {
    expect(RgbColor.readableOnWhite("55 101 94")).toBe("55 101 94");
  });

  it("calcula el contraste de negro contra blanco", () => {
    expect(RgbColor.contrast("0 0 0", "255 255 255")).toBeCloseTo(21, 0);
  });
});
