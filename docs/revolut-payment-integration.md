# BIMSpect payment integration

## Current working checkout

`PAYMENT_PROVIDER=mock` together with `CHECKOUT_ENABLED=true` enables local mock
testing. Checkout is disabled by default, so public visitors do not enter the
mock journey until BIMSpect explicitly enables it. The mock setup provides:

- the existing BIMSpect Individual **Buy now** CTA on the homepage;
- a responsive customer-details checkout at `/checkout`;
- server-side offer, price, currency, email, required-field, attribution and idempotency validation;
- a development-only hosted mock checkout at `/checkout/mock/[orderId]`;
- trusted mock completion through `POST /api/payments/webhook`, including idempotent paid, failed and cancelled states;
- status-aware `/payment/success`, `/payment/failed` and `/payment/cancelled` pages;
- first-touch campaign UTM capture and the existing PostHog/gtag bridge;
- a typed CRM payment-order record boundary with no speculative CRM calls.

The mock checkout is deliberately branded as BIMSpect, not Revolut. It does not collect card details, contact a payment provider, or represent a real payment. Its order data is process-local and is intentionally suitable only for local/development testing. A durable, access-controlled order store is required before enabling real payments in a production deployment.

Use the following server-only configuration states:

```dotenv
# Local mock testing
PAYMENT_PROVIDER=mock
CHECKOUT_ENABLED=true

# Production before Revolut is ready
PAYMENT_PROVIDER=mock
CHECKOUT_ENABLED=false

# Future production Revolut checkout
PAYMENT_PROVIDER=revolut
CHECKOUT_ENABLED=true
```

The pre-existing Project and Enterprise content remains contact-led because current public copy describes it as scope-dependent. The manual invoice/purchase-order path is the existing contact route (`/#contact`). No pricing page, cards, tiers, or offers are created by this implementation.

## Architecture

- `lib/payment/types.ts` defines provider, order, status, customer and webhook contracts.
- `lib/payment/offer.ts` is the server-controlled record of the one existing purchasable offer. Amounts are minor-unit integers; browsers cannot submit an amount or select another offer.
- `lib/payment/mock-provider.ts` owns the mock order store and safe terminal state transitions.
- `lib/payment/revolut-provider.ts` is a network-free placeholder. It throws a controlled error rather than guessing an API endpoint, request format, signature scheme or credentials.
- `lib/payment/index.ts` selects the provider from server-only environment variables.
- `lib/payment/service.ts` is the application-level create/completion flow shared by the order API and webhook route.
- `lib/payment/crm.ts` defines the payment order schema for CRM handoff. Existing CRM APIs support campaign leads and visits only, so the present adapter does not send payment data anywhere.
- `app/api/payments/orders/route.ts` validates and creates orders.
- `app/api/payments/webhook/route.ts` is the provider webhook boundary. In mock mode it accepts only same-origin JSON testing controls. In Revolut mode, raw payload authentication belongs entirely in `RevolutPaymentProvider`.

The state machine is `pending` → `paid`, `failed`, or `cancelled`. Terminal orders cannot be changed by duplicate notifications or by visiting an outcome URL. `paidAt` is written only by the trusted completion flow.

## What BIMSpect must provide for Revolut

Before setting `PAYMENT_PROVIDER=revolut`, provide all of the following:

1. Merchant Account approval and the selected sandbox or production environment.
2. The real Merchant secret key for that environment.
3. The actual webhook signing secret and Revolut's current signature-verification specification.
4. The intended Merchant API version and official API documentation for that version.
5. The actual create-order/hosted-checkout request and response contract, including return/cancel URLs and payment metadata limits.
6. The webhook event schema, webhook registration method and production callback URL.
7. Required timestamp/replay-protection rules and event ID/idempotency behaviour.
8. The supported payment states, refunds requirements, and whether BIMSpect will later add recurring/subscription billing.
9. A durable production order datastore and the authorization model for returning customers to an order/status page.
10. The CRM endpoint, authentication agreement, idempotency behaviour and field mapping for payment orders.

No values above should be provided in browser-visible variables or committed files.

## Exact change list when credentials arrive

1. Set the server environment variables in the deployment platform (never in source):

   ```dotenv
   PAYMENT_PROVIDER=revolut
   CHECKOUT_ENABLED=true
   REVOLUT_MERCHANT_SECRET_KEY=...
   REVOLUT_WEBHOOK_SECRET=...
   REVOLUT_MERCHANT_API_VERSION=...
   ```

2. Implement the documented real Merchant create-order request, returned hosted checkout URL, and provider order ID in `lib/payment/revolut-provider.ts`. Do not alter checkout browser code to call Revolut directly.
3. Implement raw-body signature verification, timestamp/replay protection and event-to-state mapping in `lib/payment/revolut-provider.ts`. Do not add signature guessing to `app/api/payments/webhook/route.ts`.
4. Replace the process-local mock store with a durable order repository used by the real provider and `lib/payment/service.ts`; retain idempotency keys and terminal-state protection.
5. Register the production webhook and configure its public HTTPS URL for `POST /api/payments/webhook`.
6. Implement `getPaymentOrderCrmAdapter` in `lib/payment/crm.ts` once the CRM team provides a compatible endpoint. Send the schema defined by `PaymentOrderCrmRecord`:
   `order_reference`, customer/company/email, offer, amount/currency, payment status, provider/provider order ID, UTM fields, `created_at`, and `paid_at`.
7. Test real successful, failed, cancelled, duplicate-webhook and refund flows in the approved sandbox before production.
8. Add recurring/subscription handling only as a separate future capability; the current checkout is an order architecture, not a claimed subscription implementation.

## Security notes

- The client is rejected if it submits `amount`, `currency`, or `price`; only the server offer record resolves commercial facts.
- Payment secrets are server-only and are absent from checkout client components and API response payloads.
- The mock provider makes no network calls. Selecting Revolut without all required values fails cleanly; it never falls back to mock or fake production payment behaviour.
- Outcome pages query state but do not mutate it, so a copied success URL does not mark an order paid.
- Production webhook authenticity is not implemented yet and must not be simulated. The unimplemented Revolut adapter fails safely.
