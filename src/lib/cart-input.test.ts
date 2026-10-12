import { describe, expect, it } from "vitest";
import { parseCheckoutItems } from "./cart-input";

const ID = "cmgsx0000000000000000abcd";

describe("parseCheckoutItems", () => {
  it("acepta líneas válidas y junta las repetidas", () => {
    expect(parseCheckoutItems([{ productId: ID, quantity: 2 }, { productId: ID, quantity: 3 }])).toEqual([
      { productId: ID, quantity: 5 },
    ]);
  });

  it("rechaza ids, cantidades y formas inválidas", () => {
    expect(parseCheckoutItems([])).toBeNull();
    expect(parseCheckoutItems("x")).toBeNull();
    expect(parseCheckoutItems([{ productId: "'; drop", quantity: 1 }])).toBeNull();
    expect(parseCheckoutItems([{ productId: ID, quantity: 0 }])).toBeNull();
    expect(parseCheckoutItems([{ productId: ID, quantity: 1.5 }])).toBeNull();
    expect(parseCheckoutItems([{ productId: ID, quantity: 99 }])).toBeNull();
  });
});
