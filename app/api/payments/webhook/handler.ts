import {
  PaymentProviderConfigurationError,
  PaymentProviderNotImplementedError,
  isCheckoutEnabled,
  paymentProviderName
} from "../../../../lib/payment/index.ts";
import { processPaymentWebhook } from "../../../../lib/payment/service.ts";
import {
  hasPaymentJsonContentType,
  hasPaymentSameOrigin,
  readPaymentBody
} from "../../../../lib/payment/request.ts";

function errorResponse(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function paymentWebhookPost(request: Request) {
  let provider: "mock" | "revolut";
  try {
    provider = paymentProviderName();
  } catch (error) {
    if (error instanceof PaymentProviderConfigurationError) {
      return errorResponse(503, "provider_not_configured", "Payment provider configuration is incomplete.");
    }
    throw error;
  }

  if (provider === "mock" && !isCheckoutEnabled()) {
    return errorResponse(503, "checkout_unavailable", "Mock checkout is not currently available.");
  }

  // Mock controls are intentionally only usable as a same-origin JSON action.
  // A real provider will authenticate its raw webhook in its isolated adapter.
  if (provider === "mock" && !hasPaymentSameOrigin(request)) {
    return errorResponse(403, "invalid_webhook", "Mock payment controls are not allowed from this origin.");
  }
  if (provider === "mock" && !hasPaymentJsonContentType(request)) {
    return errorResponse(415, "invalid_webhook", "Mock payment controls must use JSON.");
  }

  let rawBody: string;
  try {
    rawBody = await readPaymentBody(request);
  } catch {
    return errorResponse(400, "invalid_webhook", "Payment notification could not be processed.");
  }

  try {
    const result = await processPaymentWebhook({
      headers: request.headers,
      rawBody
    });
    if (!result) {
      return errorResponse(400, "invalid_webhook", "Payment notification could not be processed.");
    }

    return Response.json({
      accepted: true,
      changed: result.changed,
      order: {
        id: result.order.id,
        reference: result.order.reference,
        status: result.order.status
      }
    });
  } catch (error) {
    if (
      error instanceof PaymentProviderConfigurationError ||
      error instanceof PaymentProviderNotImplementedError
    ) {
      return errorResponse(503, "provider_not_configured", "Payment provider configuration is incomplete.");
    }

    console.error("Payment webhook processing failed", {
      error: error instanceof Error ? error.name : "unknown"
    });
    return errorResponse(500, "webhook_processing_failed", "Payment notification could not be processed.");
  }
}
