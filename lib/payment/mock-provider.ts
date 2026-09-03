import { randomUUID } from "node:crypto";
import {
  PaymentIdempotencyConflictError,
  type CreatePaymentOrderInput,
  type PaymentOrder,
  type PaymentProvider,
  type PaymentStatus,
  type PaymentWebhookRequest,
  type PaymentWebhookResult
} from "./types.ts";

type StoredOrder = {
  order: PaymentOrder;
  fingerprint: string;
};

type MockStore = {
  orders: Map<string, StoredOrder>;
  idempotencyKeys: Map<string, string>;
};

declare global {
  // Preserve mock state across Next.js development-module reloads. This is
  // intentionally process-local and is not a production order database.
  var __bimspectMockPaymentStore: MockStore | undefined;
}

function store(): MockStore {
  if (!globalThis.__bimspectMockPaymentStore) {
    globalThis.__bimspectMockPaymentStore = {
      orders: new Map(),
      idempotencyKeys: new Map()
    };
  }

  return globalThis.__bimspectMockPaymentStore;
}

function orderFingerprint(input: CreatePaymentOrderInput) {
  return JSON.stringify({
    offerId: input.offer.id,
    customer: input.customer,
    attribution: input.attribution
  });
}

function orderReference(orderId: string) {
  return `BMS-MOCK-${orderId.slice(-8).toUpperCase()}`;
}

function cloneOrder(order: PaymentOrder): PaymentOrder {
  return {
    ...order,
    offer: { ...order.offer },
    customer: { ...order.customer },
    attribution: { ...order.attribution }
  };
}

function parseMockWebhook(rawBody: string):
  | { orderId: string; outcome: Extract<PaymentStatus, "paid" | "failed" | "cancelled"> }
  | null {
  try {
    const value: unknown = JSON.parse(rawBody);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const input = value as Record<string, unknown>;
    const orderId = typeof input.orderId === "string" ? input.orderId : "";
    const outcome = input.outcome;

    if (
      !/^mock_[a-z0-9-]{16,128}$/i.test(orderId) ||
      (outcome !== "paid" && outcome !== "failed" && outcome !== "cancelled")
    ) {
      return null;
    }

    return { orderId, outcome };
  } catch {
    return null;
  }
}

function canTransition(status: PaymentStatus, outcome: PaymentStatus) {
  if (status === "paid" || status === "failed" || status === "cancelled") {
    return false;
  }

  return outcome === "paid" || outcome === "failed" || outcome === "cancelled";
}

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock" as const;

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    const paymentStore = store();
    const fingerprint = orderFingerprint(input);

    if (input.idempotencyKey) {
      const existingOrderId = paymentStore.idempotencyKeys.get(input.idempotencyKey);
      if (existingOrderId) {
        const existing = paymentStore.orders.get(existingOrderId);
        if (!existing || existing.fingerprint !== fingerprint) {
          throw new PaymentIdempotencyConflictError();
        }

        return cloneOrder(existing.order);
      }
    }

    const id = `mock_${randomUUID()}`;
    const timestamp = new Date().toISOString();
    const order: PaymentOrder = {
      id,
      reference: orderReference(id),
      provider: this.name,
      providerOrderId: id,
      checkoutUrl: `/checkout/mock/${id}`,
      offer: { ...input.offer },
      customer: { ...input.customer },
      attribution: { ...input.attribution },
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    paymentStore.orders.set(id, { order, fingerprint });
    if (input.idempotencyKey) {
      paymentStore.idempotencyKeys.set(input.idempotencyKey, id);
    }

    return cloneOrder(order);
  }

  async getOrder(orderId: string): Promise<PaymentOrder | null> {
    const stored = store().orders.get(orderId);
    return stored ? cloneOrder(stored.order) : null;
  }

  async handleWebhook(request: PaymentWebhookRequest): Promise<PaymentWebhookResult | null> {
    const event = parseMockWebhook(request.rawBody);
    if (!event) {
      return null;
    }

    const stored = store().orders.get(event.orderId);
    if (!stored) {
      return null;
    }

    const changed = canTransition(stored.order.status, event.outcome);
    if (changed) {
      const timestamp = new Date().toISOString();
      stored.order = {
        ...stored.order,
        status: event.outcome,
        updatedAt: timestamp,
        paidAt: event.outcome === "paid" ? timestamp : stored.order.paidAt
      };
    }

    return { order: cloneOrder(stored.order), changed };
  }
}

// Test-only utility. It is deliberately not exported from the provider index.
export function resetMockPaymentStoreForTests() {
  globalThis.__bimspectMockPaymentStore = undefined;
}
