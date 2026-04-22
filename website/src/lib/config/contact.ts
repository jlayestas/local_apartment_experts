export const WHATSAPP_NUMBER = "13055550000";
export const CONTACT_PHONE = "+1 (305) 000-0000";
export const CONTACT_EMAIL = "hello@localapartmentexperts.com";

export function buildWhatsAppHref(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
