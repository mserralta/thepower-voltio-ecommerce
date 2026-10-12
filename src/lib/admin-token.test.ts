import { describe, expect, it } from "vitest";
import { createAdminToken, isValidAdminToken, passwordMatches } from "./admin-token";

describe("token de admin", () => {
  it("valida el token de la contraseña correcta y rechaza el resto", async () => {
    const token = await createAdminToken("secreto");
    expect(token).not.toContain("secreto");
    expect(await isValidAdminToken(token, "secreto")).toBe(true);
    expect(await isValidAdminToken(token, "otra")).toBe(false);
    expect(await isValidAdminToken("x", "secreto")).toBe(false);
    expect(await isValidAdminToken(undefined, "secreto")).toBe(false);
    expect(await isValidAdminToken(token, undefined)).toBe(false);
  });

  it("compara contraseñas", async () => {
    expect(await passwordMatches("a", "a")).toBe(true);
    expect(await passwordMatches("a", "b")).toBe(false);
    expect(await passwordMatches("a", undefined)).toBe(false);
  });
});
