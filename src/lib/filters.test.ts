import { describe, expect, it } from "vitest";
import { isValidSlug, parseFilters } from "./filters";

describe("parseFilters", () => {
  it("convierte euros a céntimos", () => {
    expect(parseFilters({ min: "10", max: "50" })).toMatchObject({ minCents: 1000, maxCents: 5000 });
  });

  it("ignora precios que no son enteros positivos", () => {
    const f = parseFilters({ min: "-5", max: "abc" });
    expect(f.minCents).toBeUndefined();
    expect(f.maxCents).toBeUndefined();
  });

  it("intercambia min y max si vienen al revés", () => {
    expect(parseFilters({ min: "80", max: "20" })).toMatchObject({ minCents: 2000, maxCents: 8000 });
  });

  it("recorta y limpia la búsqueda y descarta categorías inválidas", () => {
    const f = parseFilters({ q: `  ${"a".repeat(200)} `, categoria: "../etc" });
    expect(f.q).toHaveLength(80);
    expect(f.category).toBeUndefined();
  });
});

describe("isValidSlug", () => {
  it("acepta un slug y rechaza el resto", () => {
    expect(isValidSlug("cable-h07v-k-1-5-mm-rollo-100-m")).toBe(true);
    expect(isValidSlug("1; drop table")).toBe(false);
    expect(isValidSlug("Mayusculas")).toBe(false);
  });
});
