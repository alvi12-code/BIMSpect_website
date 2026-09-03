import type { PaymentOrder } from "./types.ts";

export type PaymentOrderCrmRecord = {
  order_reference: string;
  customer_name: string;
  company: string;
  email: string;
  offer: string;
  amount: number | null;
  currency: string | null;
  payment_status: string;
  provider: string;
  provider_order_id: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  created_at: string;
  paid_at?: string;
};

export interface PaymentOrderCrmAdapter {
  record(order: PaymentOrder): Promise<void>;
}

export function paymentOrderCrmRecord(order: PaymentOrder): PaymentOrderCrmRecord {
  return {
    order_reference: order.reference,
    customer_name: order.customer.name,
    company: order.customer.company,
    email: order.customer.email,
    offer: order.offer.id,
    amount: order.offer.amount,
    currency: order.offer.currency,
    payment_status: order.status,
    provider: order.provider,
    provider_order_id: order.providerOrderId,
    utm_source: order.attribution.utm_source,
    utm_medium: order.attribution.utm_medium,
    utm_campaign: order.attribution.utm_campaign,
    utm_content: order.attribution.utm_content,
    utm_term: order.attribution.utm_term,
    created_at: order.createdAt,
    paid_at: order.paidAt
  };
}

// The existing CRM only exposes campaign lead and visit endpoints. Do not make
// speculative production calls. Replace this adapter once its payment-order
// endpoint and schema have been agreed; see docs/revolut-payment-integration.md.
const noPaymentOrderCrmAdapter: PaymentOrderCrmAdapter = {
  async record(order) {
    void order;
    return;
  }
};

export function getPaymentOrderCrmAdapter(): PaymentOrderCrmAdapter {
  return noPaymentOrderCrmAdapter;
}
