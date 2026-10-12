import { describe, expect, it } from "vitest";
import { computeTotals, maxQuantityFor } from "./pricing";

describe("computeTotals", () => {
  it("carrito vacío: todo a cero y sin envío", () => {
    expect(computeTotals([])).toEqual({ subtotalCents: 0, shippingCents: 0, totalCents: 0 });
  });

  it("cobra 4,95 € de envío por debajo de 50 €", () => {
    const t = computeTotals([{ unitPriceCents: 1499, quantity: 2 }]);
    expect(t).toEqual({ subtotalCents: 2998, shippingCents: 495, totalCents: 3493 });
  });

  it("envío gratis desde 50 € exactos", () => {
    const t = computeTotals([{ unitPriceCents: 2500, quantity: 2 }]);
    expect(t.shippingCents).toBe(0);
    expect(t.totalCents).toBe(5000);
  });
});

describe("maxQuantityFor", () => {
  it("respeta el stock y el tope general", () => {
    expect(maxQuantityFor(0)).toBe(0);
    expect(maxQuantityFor(6)).toBe(6);
    expect(maxQuantityFor(120)).toBe(20);
  });
});
