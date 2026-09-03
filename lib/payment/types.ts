export type PaymentProviderName = "mock" | "revolut";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export type PaymentOfferId = "individual";

export type PaymentOffer = {
  id: PaymentOfferId;
  name: string;
  description: string;
  amount: number | null;
  currency: "EUR" | null;
  billingPeriod: "month" | null;
  purchasable: boolean;
  contactHref: string;
};

export type PaymentCustomer = {
  name: string;
  company: string;
  email: string;
  vatNumber?: string;
};

export type PaymentAttribution = {
  landing_page?: string;
  referrer?: string;
  page_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

export type PaymentOrder = {
  id: string;
  reference: string;
  provider: PaymentProviderName;
  providerOrderId: string;
  checkoutUrl: string;
  offer: PaymentOffer;
  customer: PaymentCustomer;
  attribution: PaymentAttribution;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
};

export type CreatePaymentOrderInput = {
  offer: PaymentOffer;
  customer: PaymentCustomer;
  attribution: PaymentAttribution;
  idempotencyKey?: string;
};

export type PaymentWebhookRequest = {
  headers: Headers;
  rawBody: string;
};

export type PaymentWebhookResult = {
  order: PaymentOrder;
  changed: boolean;
};

export type PaymentProvider = {
  readonly name: PaymentProviderName;
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>;
  getOrder(orderId: string): Promise<PaymentOrder | null>;
  handleWebhook(request: PaymentWebhookRequest): Promise<PaymentWebhookResult | null>;
};

export class PaymentProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentProviderConfigurationError";
  }
}

export class PaymentProviderNotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentProviderNotImplementedError";
  }
}

export class PaymentIdempotencyConflictError extends Error {
  constructor() {
    super("The idempotency key was already used for a different order request.");
    this.name = "PaymentIdempotencyConflictError";
  }
}
