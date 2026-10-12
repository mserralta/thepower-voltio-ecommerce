import { describe, expect, it } from "vitest";
import { parsePriceToCents, parseProductForm } from "./product-input";

describe("parsePriceToCents", () => {
  it("convierte a céntimos sin decimales flotantes", () => {
    expect(parsePriceToCents("12,95")).toBe(1295);
    expect(parsePriceToCents("12.9")).toBe(1290);
    expect(parsePriceToCents("0,07")).toBe(7);
    expect(parsePriceToCents("34")).toBe(3400);
  });
  it("rechaza lo inválido", () => {
    for (const v of ["", "abc", "-1", "1,234", "0", "1e3"]) expect(parsePriceToCents(v)).toBeNull();
  });
});

describe("parseProductForm", () => {
  const base = { name: "A", brand: "B", description: "D", price: "1,50", stock: "3", categoryId: "cat1" };
  const make = (o: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries({ ...base, ...o })) f.set(k, v);
    return f;
  };
  it("acepta datos válidos", () => {
    expect(parseProductForm(make({ active: "on" }))).toEqual({
      data: { name: "A", brand: "B", description: "D", priceCents: 150, stock: 3, active: true, categoryId: "cat1" },
    });
  });
  it("rechaza stock negativo y nombre vacío", () => {
    expect("error" in parseProductForm(make({ stock: "-1" }))).toBe(true);
    expect("error" in parseProductForm(make({ name: " " }))).toBe(true);
  });
});
