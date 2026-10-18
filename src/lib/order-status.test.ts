import { describe, expect, it } from "vitest";
import { canTransition, isConfirmed, parseOrderStatus } from "./order-status";

describe("canTransition", () => {
  it("permite PAID→SHIPPED→DELIVERED y PENDING→CANCELLED", () => {
    expect(canTransition("PAID", "SHIPPED")).toBe(true);
    expect(canTransition("SHIPPED", "DELIVERED")).toBe(true);
    expect(canTransition("PENDING", "CANCELLED")).toBe(true);
  });

  it("rechaza saltos y retrocesos", () => {
    expect(canTransition("PAID", "DELIVERED")).toBe(false);
    expect(canTransition("PENDING", "PAID")).toBe(false);
    expect(canTransition("DELIVERED", "SHIPPED")).toBe(false);
    expect(canTransition("CANCELLED", "PENDING")).toBe(false);
    expect(canTransition("PAID", "CANCELLED")).toBe(false);
  });
});

describe("parseOrderStatus", () => {
  it("solo acepta estados conocidos", () => {
    expect(parseOrderStatus("PAID")).toBe("PAID");
    expect(parseOrderStatus("paid")).toBeUndefined();
    expect(parseOrderStatus(undefined)).toBeUndefined();
  });
});

describe("isConfirmed", () => {
  it("solo los pedidos con pago confirmado", () => {
    expect(["PAID", "SHIPPED", "DELIVERED"].every((s) => isConfirmed(s as never))).toBe(true);
    expect(isConfirmed("PENDING")).toBe(false);
    expect(isConfirmed("CANCELLED")).toBe(false);
  });
});
