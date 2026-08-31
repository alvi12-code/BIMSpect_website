import {
  isValidUnsubscribeToken,
  normalizeUnsubscribeEmail
} from "../../../../lib/unsubscribe.ts";

const MAX_REQUEST_BYTES = 1024;

export class PayloadTooLargeError extends Error {}

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

export function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === requestOrigin(request);
}

export function hasJsonContentType(request: Request) {
  const contentType = request.headers.get("content-type");
  const mediaType = contentType?.split(";", 1)[0]?.trim().toLowerCase();

  return mediaType === "application/json";
}

export async function readBoundedBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new PayloadTooLargeError();
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return "";
  }

  const decoder = new TextDecoder();
  let size = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }

    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

export function parseUnsubscribePayload(value: unknown): { token: string } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const token = (value as Record<string, unknown>).token;
  if (!isValidUnsubscribeToken(token)) {
    return null;
  }

  return { token };
}

export function parseUnsubscribeEmailRequest(
  value: unknown
): { email: string } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const email = normalizeUnsubscribeEmail((value as Record<string, unknown>).email);

  return email ? { email } : null;
}
