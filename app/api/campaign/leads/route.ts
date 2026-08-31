import { NextResponse } from "next/server";
import { campaignCrmConfiguration, forwardCampaignRequest } from "../crm";

const MAX_REQUEST_BYTES = 16 * 1024;
const GENERIC_ERROR = "We could not submit your request. Please try again.";
const IDEMPOTENCY_KEY_PATTERN = /^[a-zA-Z0-9-]{16,128}$/;

class PayloadTooLargeError extends Error {}

type LeadPayload = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  campaign?: string;
  landing_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  page_url?: string;
};

type ParsedRequest = LeadPayload & { turnstile_token?: string };

function errorResponse(status: number) {
  return NextResponse.json({ error: GENERIC_ERROR }, { status });
}

function requestOrigin(request: Request) {
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

function hasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === requestOrigin(request);
}

function hasJsonContentType(request: Request) {
  const contentType = request.headers.get("content-type");
  const mediaType = contentType?.split(";", 1)[0]?.trim().toLowerCase();

  return mediaType === "application/json";
}

function idempotencyKey(request: Request): string | null | undefined {
  const value = request.headers.get("idempotency-key");
  if (value === null) {
    return undefined;
  }

  const key = value.trim();
  return IDEMPOTENCY_KEY_PATTERN.test(key) ? key : null;
}

async function readBody(request: Request) {
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

function optionalString(
  value: unknown,
  maxLength: number
): string | undefined | null {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed || undefined : null;
}

function requiredString(value: unknown, maxLength: number): string | null {
  const result = optionalString(value, maxLength);
  return typeof result === "string" ? result : null;
}

function cleanAttributionString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function cleanLandingPage(value: unknown): string | undefined {
  const landingPage = cleanAttributionString(value, 1000);

  if (!landingPage?.startsWith("/") || landingPage.startsWith("//")) {
    return undefined;
  }

  return landingPage;
}

function parseRequest(value: unknown): ParsedRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const input = value as Record<string, unknown>;
  const name = requiredString(input.name, 160);
  const rawEmail = requiredString(input.email, 254);
  const email = rawEmail?.toLowerCase();

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  const fields = [
    ["company", 200],
    ["phone", 80],
    ["message", 5000],
    ["campaign", 120],
    ["turnstile_token", 2048]
  ] as const;
  const parsed: ParsedRequest = { name, email };

  for (const [field, maxLength] of fields) {
    const fieldValue = optionalString(input[field], maxLength);

    if (fieldValue === null) {
      return null;
    }

    if (fieldValue) {
      parsed[field] = fieldValue;
    }
  }

  Object.assign(parsed, {
    landing_page: cleanLandingPage(input.landing_page),
    utm_source: cleanAttributionString(input.utm_source, 255),
    utm_medium: cleanAttributionString(input.utm_medium, 255),
    utm_campaign: cleanAttributionString(input.utm_campaign, 255),
    utm_content: cleanAttributionString(input.utm_content, 255),
    utm_term: cleanAttributionString(input.utm_term, 255),
    referrer: cleanAttributionString(input.referrer, 2000),
    page_url: cleanAttributionString(input.page_url, 2000)
  });

  return parsed;
}

async function verifyTurnstile(token: string | undefined, request: Request) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const isConfigured = Boolean(siteKey || secret);

  if (!isConfigured) {
    return true;
  }

  if (!siteKey || !secret || !token) {
    console.error("Campaign lead Turnstile configuration or token is missing", {
      hasSiteKey: Boolean(siteKey),
      hasSecret: Boolean(secret),
      hasToken: Boolean(token)
    });
    return false;
  }

  try {
    const verificationBody = new URLSearchParams({ secret, response: token });
    const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (remoteIp) {
      verificationBody.set("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verificationBody
      }
    );

    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
    } | null;

    if (!response.ok || !result?.success) {
      console.error("Campaign lead Turnstile verification failed", {
        status: response.status
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Campaign lead Turnstile verification could not be completed", {
      error: error instanceof Error ? error.name : "unknown"
    });
    return false;
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request) || !hasJsonContentType(request)) {
    return errorResponse(415);
  }

  const retryKey = idempotencyKey(request);
  if (retryKey === null) {
    return errorResponse(400);
  }

  let body: unknown;

  try {
    body = JSON.parse(await readBody(request));
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return errorResponse(413);
    }

    return errorResponse(400);
  }

  const parsed = parseRequest(body);
  if (!parsed) {
    return errorResponse(400);
  }

  if (!(await verifyTurnstile(parsed.turnstile_token, request))) {
    return errorResponse(400);
  }

  const crm = campaignCrmConfiguration("Campaign lead");
  if (!crm) {
    return errorResponse(500);
  }

  const lead = { ...parsed };
  delete lead.turnstile_token;

  try {
    const response = await forwardCampaignRequest({
      crm,
      path: "/api/marketing/leads",
      body: lead,
      headers: retryKey ? { "Idempotency-Key": retryKey } : undefined
    });

    if (!response.ok) {
      console.error("Campaign lead CRM request failed", {
        status: response.status
      });
      return errorResponse(502);
    }
  } catch (error) {
    console.error("Campaign lead CRM request could not be completed", {
      error: error instanceof Error ? error.name : "unknown"
    });
    return errorResponse(502);
  }

  return NextResponse.json({ ok: true });
}
