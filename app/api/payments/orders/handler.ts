import {
  PaymentIdempotencyConflictError,
  PaymentProviderConfigurationError,
  PaymentProviderNotImplementedError,
  isCheckoutEnabled
} from "../../../../lib/payment/index.ts";
import { createPaymentOrder } from "../../../../lib/payment/service.ts";
import {
  hasPaymentJsonContentType,
  hasPaymentSameOrigin,
  paymentIdempotencyKey,
  parseCreatePaymentOrder,
  readPaymentBody
} from "../../../../lib/payment/request.ts";
import { getCurrentPurchasableOffer } from "../../../../lib/payment/offer.ts";

type ErrorCode =
  | "invalid_request"
  | "checkout_unavailable"
  | "offer_not_configured"
  | "provider_not_configured"
  | "idempotency_conflict"
  | "order_creation_failed";

function errorResponse(status: number, code: ErrorCode, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function createPaymentOrderPost(request: Request) {
  if (!isCheckoutEnabled()) {
    return errorResponse(
      503,
      "checkout_unavailable",
      "Online checkout is not currently available. Please contact BIMSpect."
    );
  }

  if (!hasPaymentSameOrigin(request)) {
    return errorResponse(403, "invalid_request", "This checkout request is not allowed.");
  }
  if (!hasPaymentJsonContentType(request)) {
    return errorResponse(415, "invalid_request", "Checkout requests must use JSON.");
  }

  const idempotencyKey = paymentIdempotencyKey(request);
  if (idempotencyKey === null) {
    return errorResponse(400, "invalid_request", "The checkout request could not be processed.");
  }

  let body: unknown;
  try {
    body = JSON.parse(await readPaymentBody(request));
  } catch {
    return errorResponse(400, "invalid_request", "The checkout request could not be processed.");
  }

  const parsed = parseCreatePaymentOrder(body);
  if (!parsed.ok) {
    return errorResponse(400, parsed.code, parsed.message);
  }

  const offer = getCurrentPurchasableOffer();
  if (!offer) {
    return errorResponse(
      503,
      "offer_not_configured",
      "Online checkout is not currently available. Please contact BIMSpect."
    );
  }

  try {
    const order = await createPaymentOrder({
      ...parsed.value,
      offer,
      idempotencyKey
    });

    return Response.json({
      order: {
        id: order.id,
        reference: order.reference,
        status: order.status,
        offer: {
          id: order.offer.id,
          name: order.offer.name,
          amount: order.offer.amount,
          currency: order.offer.currency,
          billingPeriod: order.offer.billingPeriod
        },
        checkoutUrl: order.checkoutUrl
      }
    });
  } catch (error) {
    if (error instanceof PaymentIdempotencyConflictError) {
      return errorResponse(409, "idempotency_conflict", error.message);
    }
    if (
      error instanceof PaymentProviderConfigurationError ||
      error instanceof PaymentProviderNotImplementedError
    ) {
      return errorResponse(
        503,
        "provider_not_configured",
        "Online payments are not configured. Please contact BIMSpect."
      );
    }

    console.error("Payment order creation failed", {
      error: error instanceof Error ? error.name : "unknown"
    });
    return errorResponse(
      500,
      "order_creation_failed",
      "We could not start checkout. Please try again or contact BIMSpect."
    );
  }
}
