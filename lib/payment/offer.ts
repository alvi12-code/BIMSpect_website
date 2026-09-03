import type { PaymentOffer } from "./types.ts";

// This is the one current purchase offer. Its display facts are copied from
// the existing homepage commercial CTA; it is not a new plan catalogue.
// Keep a null amount/currency/billingPeriod if commercial approval later
// removes a published amount. Checkout will then omit a price rather than
// accepting one from the browser.
export const currentPurchaseOffer: PaymentOffer = {
  id: "individual",
  name: "BIMSpect Individual",
  description:
    "For an individual BIM coordinator, consultant or design manager working across several projects.",
  amount: 5900,
  currency: "EUR",
  billingPeriod: "month",
  purchasable: true,
  contactHref: "#contact"
};

export function getCurrentPurchasableOffer(): PaymentOffer | null {
  return currentPurchaseOffer.purchasable ? currentPurchaseOffer : null;
}

export function formatOfferAmount(
  amount: number | null,
  currency: PaymentOffer["currency"]
) {
  if (amount === null || !currency) {
    return null;
  }

  return new Intl.NumberFormat("en-FI", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount / 100);
}

export const currentOfferCheckoutHref = "/checkout";
