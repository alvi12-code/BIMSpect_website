"use client";

export type CampaignAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  referrer?: string;
  page_url?: string;
};

const STORAGE_KEY = "bimspect_campaign_attribution";
const UTM_MAX_LENGTH = 255;
const LANDING_PAGE_MAX_LENGTH = 1000;
const REFERRER_MAX_LENGTH = 2000;
const PAGE_URL_MAX_LENGTH = 2000;
const UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term"
] as const;

export function shouldCaptureCampaignAttribution(pathname: string) {
  return pathname !== "/unsubscribe";
}

function cleanString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function campaignLandingPage(): string | undefined {
  const { pathname } = window.location;

  if (pathname !== "/pilot" && pathname !== "/what-changed") {
    return undefined;
  }

  return cleanString(pathname, LANDING_PAGE_MAX_LENGTH);
}

function campaignPageUrl(): string | undefined {
  const landingPage = campaignLandingPage();

  if (!landingPage) {
    return undefined;
  }

  // Keep the URL useful for campaign analysis without persisting unrelated
  // query-string data a visitor may have supplied.
  const url = new URL(window.location.origin + landingPage);
  const search = new URLSearchParams(window.location.search);

  for (const field of UTM_FIELDS) {
    const value = cleanString(search.get(field), UTM_MAX_LENGTH);
    if (value) {
      url.searchParams.set(field, value);
    }
  }

  return cleanString(url.toString(), PAGE_URL_MAX_LENGTH);
}

function readStoredAttribution(value: unknown): CampaignAttribution {
  if (!isRecord(value)) {
    return {};
  }

  const attribution: CampaignAttribution = {};

  for (const field of UTM_FIELDS) {
    const cleaned = cleanString(value[field], UTM_MAX_LENGTH);
    if (cleaned) {
      attribution[field] = cleaned;
    }
  }

  const landingPage = cleanString(value.landing_page, LANDING_PAGE_MAX_LENGTH);
  if (landingPage?.startsWith("/") && !landingPage.startsWith("//")) {
    attribution.landing_page = landingPage;
  }

  const referrer = cleanString(value.referrer, REFERRER_MAX_LENGTH);
  if (referrer) {
    attribution.referrer = referrer;
  }

  const pageUrl = cleanString(value.page_url, PAGE_URL_MAX_LENGTH);
  if (pageUrl) {
    try {
      const url = new URL(pageUrl);
      if (url.protocol === "http:" || url.protocol === "https:") {
        attribution.page_url = pageUrl;
      }
    } catch {
      // Ignore malformed historic session data.
    }
  }

  return attribution;
}

function captureCurrentAttribution(): CampaignAttribution {
  const attribution: CampaignAttribution = {};
  const search = new URLSearchParams(window.location.search);

  for (const field of UTM_FIELDS) {
    const cleaned = cleanString(search.get(field), UTM_MAX_LENGTH);
    if (cleaned) {
      attribution[field] = cleaned;
    }
  }

  const landingPage = campaignLandingPage();
  if (landingPage) {
    attribution.landing_page = landingPage;
  }

  const referrer = cleanString(document.referrer, REFERRER_MAX_LENGTH);
  if (referrer) {
    attribution.referrer = referrer;
  }

  const pageUrl = campaignPageUrl();
  if (pageUrl) {
    attribution.page_url = pageUrl;
  }

  return attribution;
}

function hasUtmAttribution(attribution: CampaignAttribution) {
  return UTM_FIELDS.some((field) => Boolean(attribution[field]));
}

function mergeFirstTouchAttribution(
  stored: CampaignAttribution,
  current: CampaignAttribution
): CampaignAttribution {
  const attribution: CampaignAttribution = { ...stored };

  if (!hasUtmAttribution(stored)) {
    for (const field of UTM_FIELDS) {
      const value = current[field];
      if (value) {
        attribution[field] = value;
      }
    }
  }

  if (!attribution.landing_page && current.landing_page) {
    attribution.landing_page = current.landing_page;
  }

  if (!attribution.referrer && current.referrer) {
    attribution.referrer = current.referrer;
  }

  if (!attribution.page_url && current.page_url) {
    attribution.page_url = current.page_url;
  }

  return attribution;
}

export function getCampaignAttribution(): CampaignAttribution {
  if (typeof window === "undefined") {
    return {};
  }

  const current = captureCurrentAttribution();

  try {
    const stored = readStoredAttribution(
      JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null")
    );
    const attribution = mergeFirstTouchAttribution(stored, current);

    if (Object.keys(attribution).length > 0) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    }

    return attribution;
  } catch {
    return current;
  }
}

// Visit events use the current campaign page while lead submissions retain the
// session's first-touch landing page and attribution.
export function getCurrentCampaignPageAttribution(): Pick<
  CampaignAttribution,
  "landing_page" | "page_url"
> {
  if (typeof window === "undefined") {
    return {};
  }

  return {
    landing_page: campaignLandingPage(),
    page_url: campaignPageUrl()
  };
}
