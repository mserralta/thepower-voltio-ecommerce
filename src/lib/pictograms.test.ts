import { describe, expect, it } from "vitest";
import { pictogramFor } from "./pictograms";

describe("pictogramFor", () => {
  it("usa el SKU exacto, luego el prefijo y luego el genérico", () => {
    expect(pictogramFor("PRO-DIF-2P-40-30")).toBe("rcd");
    expect(pictogramFor("CAB-NUEVO-1")).toBe("cable-reel");
    expect(pictogramFor("XXX-1")).toBe("bolt");
  });
});
