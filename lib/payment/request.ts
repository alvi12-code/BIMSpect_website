import type {
  PaymentAttribution,
  PaymentCustomer
} from "./types.ts";

const UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term"
] as const;

export type PaymentRequestParseResult =
  | { ok: true; value: { customer: PaymentCustomer; attribution: PaymentAttribution } }
  | { ok: false; code: "invalid_request"; message: string };

function optionalString(value: unknown, maxLength: number): string | undefined | null {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed && trimmed.length <= maxLength ? trimmed : trimmed ? null : undefined;
}

function requiredString(value: unknown, maxLength: number): string | null {
  const cleaned = optionalString(value, maxLength);
  return typeof cleaned === "string" ? cleaned : null;
}

function cleanAttribution(value: unknown): PaymentAttribution | null {
  if (value === undefined || value === null || value === "") {
    return {};
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const input = value as Record<string, unknown>;
  const attribution: PaymentAttribution = {};

  for (const field of UTM_FIELDS) {
    const cleaned = optionalString(input[field], 255);
    if (cleaned === null) {
      return null;
    }
    if (cleaned) {
      attribution[field] = cleaned;
    }
  }

  const landingPage = optionalString(input.landing_page, 1000);
  if (landingPage === null || (landingPage && (!landingPage.startsWith("/") || landingPage.startsWith("//")))) {
    return null;
  }
  if (landingPage) {
    attribution.landing_page = landingPage;
  }

  for (const field of ["referrer", "page_url"] as const) {
    const url = optionalString(input[field], 2000);
    if (url === null) {
      return null;
    }
    if (url) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          return null;
        }
      } catch {
        return null;
      }
      attribution[field] = url;
    }
  }

  return attribution;
}

export function parseCreatePaymentOrder(value: unknown): PaymentRequestParseResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ok: false,
      code: "invalid_request",
      message: "Please check the checkout details and try again."
    };
  }

  const input = value as Record<string, unknown>;
  // An amount from a browser is a malformed request, not a pricing input.
  if (
    "amount" in input ||
    "currency" in input ||
    "price" in input ||
    "offerId" in input
  ) {
    return {
      ok: false,
      code: "invalid_request",
      message: "Checkout offer and pricing are determined by BIMSpect."
    };
  }

  const name = requiredString(input.name, 160);
  const company = requiredString(input.company, 200);
  const rawEmail = requiredString(input.email, 254);
  const email = rawEmail?.toLowerCase();
  const vatNumber = optionalString(input.vatNumber, 80);
  const attribution = cleanAttribution(input.attribution);

  if (
    !name ||
    !company ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    vatNumber === null ||
    attribution === null ||
    input.termsAccepted !== true
  ) {
    return {
      ok: false,
      code: "invalid_request",
      message: "Please provide valid customer details and accept the terms."
    };
  }

  const customer: PaymentCustomer = { name, company, email };
  if (vatNumber) {
    customer.vatNumber = vatNumber;
  }

  return {
    ok: true,
    value: { customer, attribution }
  };
}

export function hasPaymentJsonContentType(request: Request) {
  return request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

export function requestOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : requestUrl.protocol.slice(0, -1);
  const host = request.headers.get("host");

  if (!host) {
    return requestUrl.origin;
  }

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return requestUrl.origin;
  }
}

export function hasPaymentSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === requestOrigin(request);
}

export async function readPaymentBody(request: Request, maxBytes = 16 * 1024) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("payload_too_large");
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return "";
  }

  const decoder = new TextDecoder();
  let bytes = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      throw new Error("payload_too_large");
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

export function paymentIdempotencyKey(request: Request): string | undefined | null {
  const value = request.headers.get("idempotency-key");
  if (value === null) {
    return undefined;
  }

  const key = value.trim();
  return /^[a-zA-Z0-9-]{16,128}$/.test(key) ? key : null;
}
