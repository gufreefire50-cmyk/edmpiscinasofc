import { describe, expect, it } from "vitest";
import { business, quoteUrl, whatsappUrl } from "@/lib/edm";

describe("EDM business rules", () => {
  it("sends quotes to the supplied WhatsApp number", () => {
    expect(new URL(whatsappUrl()).pathname).toBe("/5511961350125");
  });
  it("includes all submitted fields in the WhatsApp message", () => {
    const url = new URL(
      quoteUrl({
        name: "Ana Silva",
        phone: "11999998888",
        service: "Limpeza de piscinas",
        description: "Piscina com 30 mil litros",
      }),
    );
    expect(url.searchParams.get("text")).toBe(
      "Olá, EDM Piscinas! Gostaria de solicitar um orçamento.\n\nNome: Ana Silva\nWhatsApp: 11999998888\nServiço: Limpeza de piscinas\nDescrição: Piscina com 30 mil litros",
    );
  });
  it("uses the supplied operating year", () => expect(business.since).toBe(2011));
  it("uses the supplied technical experience", () => expect(business.experience).toBe(15));
  it("uses the supplied Google rating", () => expect(business.rating).toBe(5));
  it("uses the supplied review count", () => expect(business.reviews).toBe(16));
  it("uses the supplied physical store address", () =>
    expect(business.address).toBe("Rua Florindo Felipe, 190 — Guarulhos, SP"));
});
