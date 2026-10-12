import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { renderOrderEmail } from "./email";

describe("renderOrderEmail", () => {
  it("escapa HTML y muestra líneas y total", () => {
    const html = renderOrderEmail({
      id: "abc",
      email: null,
      customerName: "<b>Ana</b>",
      subtotalCents: 2998,
      shippingCents: 495,
      totalCents: 3493,
      items: [{ nameSnapshot: "Cable <x>", unitPriceCents: 1499, quantity: 2 }],
    });
    expect(html).not.toContain("<b>Ana</b>");
    expect(html).toContain("Cable &#60;x&#62;");
    expect(html).toMatch(/2 × 14,99/);
    expect(html).toMatch(/34,93/);
  });
});
