export const business = {
  name: "EDM Piscinas",
  phone: "5511961350125",
  address: "Rua Florindo Felipe, 190 — Guarulhos, SP",
  since: 2011,
  experience: 15,
  rating: 5,
  reviews: 16,
};

export function whatsappUrl(
  message = "Olá! Gostaria de solicitar um orçamento para minha piscina.",
) {
  return `https://wa.me/${business.phone}?text=${encodeURIComponent(message)}`;
}

export function quoteUrl(data: {
  name: string;
  phone: string;
  service: string;
  description: string;
}) {
  return whatsappUrl(
    `Olá, EDM Piscinas! Gostaria de solicitar um orçamento.\n\nNome: ${data.name.trim()}\nWhatsApp: ${data.phone.trim()}\nServiço: ${data.service}\nDescrição: ${data.description.trim()}`,
  );
}

export const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Rua+Florindo+Felipe+190+Guarulhos+SP";
