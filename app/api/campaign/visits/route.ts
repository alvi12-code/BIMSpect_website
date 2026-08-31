import { NextResponse } from "next/server";
import { campaignCrmConfiguration, forwardCampaignRequest } from "../crm";

const MAX_REQUEST_BYTES = 8 * 1024;
const GENERIC_ERROR = "We could not record this page visit.";
const UTM_MAX_LENGTH = 255;
const PAGE_URL_MAX_LENGTH = 2000;
const UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term"
] as const;

type VisitPayload = {
  visit_id: string;
  campaign?: string;
  landing_page: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  page_url?: string;
};

function errorResponse(status: number) {
  return NextResponse.json({ error: GENERIC_ERROR }, { status });
}

async function readBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new Error("Payload too large");
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
      throw new Error("Payload too large");
    }

    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

function cleanString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function cleanLandingPage(value: unknown): string | undefined {
  const landingPage = cleanString(value, 1000);
  return landingPage?.startsWith("/") && !landingPage.startsWith("//")
    ? landingPage
    : undefined;
}

function cleanHttpUrl(value: unknown, maxLength: number): string | undefined {
  const url = cleanString(value, maxLength);
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function cleanCampaignPageUrl(
  value: unknown,
  landingPage: string
): string | undefined {
  const pageUrl = cleanHttpUrl(value, PAGE_URL_MAX_LENGTH);
  if (!pageUrl) {
    return undefined;
  }

  const parsed = new URL(pageUrl);
  if (parsed.pathname !== landingPage) {
    return undefined;
  }

  const sanitized = new URL(parsed.origin + parsed.pathname);
  for (const field of UTM_FIELDS) {
    const utm = cleanString(parsed.searchParams.get(field), UTM_MAX_LENGTH);
    if (utm) {
      sanitized.searchParams.set(field, utm);
    }
  }

  return sanitized.toString();
}

function parseVisit(value: unknown): VisitPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const input = value as Record<string, unknown>;
  const visitId = cleanString(input.visit_id, 128);
  const landingPage = cleanLandingPage(input.landing_page);
  if (!visitId || !/^[a-zA-Z0-9-]{16,128}$/.test(visitId) || !landingPage) {
    return null;
  }

  return {
    visit_id: visitId,
    landing_page: landingPage,
    campaign: cleanString(input.campaign, 120),
    utm_source: cleanString(input.utm_source, UTM_MAX_LENGTH),
    utm_medium: cleanString(input.utm_medium, UTM_MAX_LENGTH),
    utm_campaign: cleanString(input.utm_campaign, UTM_MAX_LENGTH),
    utm_content: cleanString(input.utm_content, UTM_MAX_LENGTH),
    utm_term: cleanString(input.utm_term, UTM_MAX_LENGTH),
    referrer: cleanHttpUrl(input.referrer, PAGE_URL_MAX_LENGTH),
    page_url: cleanCampaignPageUrl(input.page_url, landingPage)
  };
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

export async function POST(request: Request) {
  if (!hasSameOrigin(request) || !hasJsonContentType(request)) {
    return errorResponse(415);
  }

  let body: unknown;
  try {
    body = JSON.parse(await readBody(request));
  } catch {
    return errorResponse(400);
  }

  const visit = parseVisit(body);
  if (!visit) {
    return errorResponse(400);
  }

  const crm = campaignCrmConfiguration("Campaign visit");
  if (!crm) {
    return errorResponse(500);
  }

  try {
    const response = await forwardCampaignRequest({
      crm,
      path: "/api/marketing/visits",
      body: visit,
      headers: { "Idempotency-Key": visit.visit_id }
    });
    if (!response.ok) {
      console.error("Campaign visit CRM request failed", { status: response.status });
      return errorResponse(502);
    }
  } catch (error) {
    console.error("Campaign visit CRM request could not be completed", {
      error: error instanceof Error ? error.name : "unknown"
    });
    return errorResponse(502);
  }

  return NextResponse.json({ ok: true });
}
