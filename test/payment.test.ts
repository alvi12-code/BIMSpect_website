import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createPaymentOrderPost } from "../app/api/payments/orders/handler.ts";
import { paymentWebhookPost } from "../app/api/payments/webhook/handler.ts";
import { getPaymentProvider, isCheckoutEnabled } from "../lib/payment/index.ts";
import { resetMockPaymentStoreForTests } from "../lib/payment/mock-provider.ts";
import { getPaymentOrder } from "../lib/payment/service.ts";

type CheckoutInput = {
  offerId?: string;
  name?: string;
  company?: string;
  email?: string;
  vatNumber?: string;
  termsAccepted?: boolean;
  attribution?: Record<string, string>;
  amount?: number;
  currency?: string;
};

function checkoutInput(overrides: CheckoutInput = {}): CheckoutInput {
  return {
    name: "Ada Buyer",
    company: "Example Construction Oy",
    email: "ADA@EXAMPLE.TEST",
    termsAccepted: true,
    ...overrides
  };
}

function request(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://marketing-web:3000${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "bimspect.com",
      origin: "https://bimspect.com",
      "x-forwarded-proto": "https",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

async function createMockOrder(overrides: CheckoutInput = {}) {
  const response = await createPaymentOrderPost(
    request("/api/payments/orders", checkoutInput(overrides))
  );
  assert.equal(response.status, 200);
  return (await response.json()) as {
    order: { id: string; reference: string; checkoutUrl: string; offer: { amount: number } };
  };
}

async function mockWebhook(orderId: string, outcome: "paid" | "failed" | "cancelled") {
  return paymentWebhookPost(request("/api/payments/webhook", { orderId, outcome }));
}

function useMockProvider() {
  process.env.PAYMENT_PROVIDER = "mock";
  process.env.CHECKOUT_ENABLED = "true";
  delete process.env.REVOLUT_MERCHANT_SECRET_KEY;
  delete process.env.REVOLUT_WEBHOOK_SECRET;
  delete process.env.REVOLUT_MERCHANT_API_VERSION;
  resetMockPaymentStoreForTests();
}

test("the current server-controlled offer creates a mock order at the existing amount", async () => {
  useMockProvider();
  const result = await createMockOrder();

  assert.match(result.order.id, /^mock_/);
  assert.equal(result.order.offer.amount, 5900);
  assert.equal(result.order.checkoutUrl, `/checkout/mock/${result.order.id}`);
  assert.equal((await getPaymentOrder(result.order.id))?.status, "pending");
});

test("the existing Buy now CTA leads into checkout", async () => {
  useMockProvider();
  const [pricingData, pricingSection] = await Promise.all([
    readFile(new URL("../components/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/PricingSection.tsx", import.meta.url), "utf8")
  ]);

  assert.equal(pricingData.includes('cta: "Buy now"'), true);
  assert.equal(pricingData.includes("currentOfferCheckoutHref"), true);
  assert.equal(pricingSection.includes("BuyNowLink"), true);
});

test("checkout availability controls only the Individual purchase CTA", async () => {
  const pricingData = await readFile(new URL("../components/data.ts", import.meta.url), "utf8");

  assert.equal(pricingData.includes('return { href: "#contact", label: "Contact us" }'), true);
  assert.equal(pricingData.includes('cta: "Discuss project access"'), true);
  assert.equal(pricingData.includes('cta: "Discuss enterprise access"'), true);
  assert.equal(pricingData.includes('href: "#contact"'), true);
});

test("checkout defaults to disabled and only enables explicitly", () => {
  const previous = process.env.CHECKOUT_ENABLED;

  try {
    delete process.env.CHECKOUT_ENABLED;
    assert.equal(isCheckoutEnabled(), false);
    process.env.CHECKOUT_ENABLED = "false";
    assert.equal(isCheckoutEnabled(), false);
    process.env.CHECKOUT_ENABLED = "true";
    assert.equal(isCheckoutEnabled(), true);
  } finally {
    if (previous === undefined) {
      delete process.env.CHECKOUT_ENABLED;
    } else {
      process.env.CHECKOUT_ENABLED = previous;
    }
  }
});

test("disabled checkout blocks order creation and mock completion", async () => {
  useMockProvider();
  process.env.CHECKOUT_ENABLED = "false";

  const orderResponse = await createPaymentOrderPost(
    request("/api/payments/orders", checkoutInput())
  );
  assert.equal(orderResponse.status, 503);
  assert.equal((await orderResponse.json()).error.code, "checkout_unavailable");

  const webhookResponse = await mockWebhook(
    "mock_00000000-0000-0000-0000-000000000000",
    "paid"
  );
  assert.equal(webhookResponse.status, 503);
  assert.equal((await webhookResponse.json()).error.code, "checkout_unavailable");
});

test("checkout and pricing sources gate disabled checkout and remove the dead access form", async () => {
  const [checkoutPage, mockCheckoutPage, pricingSection] = await Promise.all([
    readFile(new URL("../app/(en)/checkout/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/checkout/mock/[orderId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/PricingSection.tsx", import.meta.url), "utf8")
  ]);

  assert.equal(checkoutPage.includes("!isCheckoutEnabled() || !offer"), true);
  assert.equal(mockCheckoutPage.includes("!isCheckoutEnabled()"), true);
  assert.equal(pricingSection.includes("Submit access request"), false);
  assert.equal(pricingSection.includes('type="button"'), false);
});

test("a browser cannot select a different offer", async () => {
  useMockProvider();
  const response = await createPaymentOrderPost(
    request("/api/payments/orders", checkoutInput({ offerId: "not-a-real-offer" }))
  );

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "invalid_request");
});

test("invalid order IDs are rejected by the mock completion endpoint", async () => {
  useMockProvider();
  const response = await mockWebhook("mock_00000000-0000-0000-0000-000000000000", "paid");

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "invalid_webhook");
});

test("browser-supplied amounts are rejected and never become order pricing", async () => {
  useMockProvider();
  const response = await createPaymentOrderPost(
    request("/api/payments/orders", checkoutInput({ amount: 1, currency: "USD" }))
  );

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "invalid_request");
});

test("missing required customer details are rejected", async () => {
  useMockProvider();
  const response = await createPaymentOrderPost(
    request("/api/payments/orders", checkoutInput({ company: "", email: "not-an-email" }))
  );

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "invalid_request");
});

test("a mock success notification changes pending to paid", async () => {
  useMockProvider();
  const result = await createMockOrder();
  const response = await mockWebhook(result.order.id, "paid");

  assert.equal(response.status, 200);
  assert.equal((await response.json()).order.status, "paid");
  assert.equal((await getPaymentOrder(result.order.id))?.status, "paid");
  assert.ok((await getPaymentOrder(result.order.id))?.paidAt);
});

test("a mock failed payment remains unpaid", async () => {
  useMockProvider();
  const result = await createMockOrder();
  const response = await mockWebhook(result.order.id, "failed");

  assert.equal(response.status, 200);
  assert.equal((await response.json()).order.status, "failed");
  assert.equal((await getPaymentOrder(result.order.id))?.paidAt, undefined);
});

test("a cancelled mock checkout stays unpaid", async () => {
  useMockProvider();
  const result = await createMockOrder();
  const response = await mockWebhook(result.order.id, "cancelled");

  assert.equal(response.status, 200);
  assert.equal((await response.json()).order.status, "cancelled");
  assert.equal((await getPaymentOrder(result.order.id))?.status, "cancelled");
  assert.equal((await getPaymentOrder(result.order.id))?.paidAt, undefined);
});

test("duplicate success notifications are idempotent", async () => {
  useMockProvider();
  const result = await createMockOrder();
  const first = await mockWebhook(result.order.id, "paid");
  const paidAt = (await getPaymentOrder(result.order.id))?.paidAt;
  const duplicate = await mockWebhook(result.order.id, "paid");

  assert.equal((await first.json()).changed, true);
  assert.equal((await duplicate.json()).changed, false);
  assert.equal((await getPaymentOrder(result.order.id))?.paidAt, paidAt);
});

test("an outcome URL cannot mark an order paid because only the webhook mutates state", async () => {
  useMockProvider();
  const result = await createMockOrder();
  const page = await readFile(
    new URL("../components/payment/PaymentOutcome.tsx", import.meta.url),
    "utf8"
  );

  assert.equal(page.includes("This page cannot confirm a payment"), true);
  assert.equal(page.includes("processPaymentWebhook"), false);
  assert.equal((await getPaymentOrder(result.order.id))?.status, "pending");
});

test("Revolut mode without credentials fails safely and never falls back to mock", () => {
  useMockProvider();
  process.env.PAYMENT_PROVIDER = "revolut";

  assert.throws(
    () => getPaymentProvider(),
    /REVOLUT_MERCHANT_SECRET_KEY, REVOLUT_WEBHOOK_SECRET, and REVOLUT_MERCHANT_API_VERSION/
  );
});

test("attribution survives server-side order creation", async () => {
  useMockProvider();
  const result = await createMockOrder({
    attribution: {
      utm_source: "linkedin",
      utm_medium: "paid-social",
      utm_campaign: "autumn-launch",
      utm_content: "video-a",
      utm_term: "ifc"
    }
  });
  const order = await getPaymentOrder(result.order.id);

  assert.deepEqual(order?.attribution, {
    utm_source: "linkedin",
    utm_medium: "paid-social",
    utm_campaign: "autumn-launch",
    utm_content: "video-a",
    utm_term: "ifc"
  });
});

test("payment secrets are absent from client checkout source and API output", async () => {
  useMockProvider();
  const source = await Promise.all([
    readFile(new URL("../components/payment/CheckoutForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/payment/MockCheckoutControls.tsx", import.meta.url), "utf8")
  ]);
  const result = await createMockOrder();
  const output = JSON.stringify(result);

  for (const secretName of [
    "REVOLUT_MERCHANT_SECRET_KEY",
    "REVOLUT_WEBHOOK_SECRET",
    "REVOLUT_MERCHANT_API_VERSION"
  ]) {
    assert.equal(source.join("\n").includes(secretName), false);
    assert.equal(output.includes(secretName), false);
  }
});
