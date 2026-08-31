import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { unsubscribePost } from "../app/api/marketing/unsubscribe/handler.ts";
import { unsubscribeEmailRequestPost } from "../app/api/marketing/unsubscribe/request/handler.ts";
import {
  hasJsonContentType,
  hasSameOrigin,
  parseUnsubscribeEmailRequest,
  parseUnsubscribePayload
} from "../app/api/marketing/unsubscribe/request.ts";
import {
  isValidUnsubscribeToken,
  normalizeUnsubscribeEmail,
  unsubscribeTokenState
} from "../lib/unsubscribe.ts";
import {
  requestUnsubscribeConfirmation,
  submitUnsubscribe
} from "../components/unsubscribe/request.ts";
import { shouldCaptureCampaignAttribution } from "../components/campaign/attribution.ts";
import { languageSwitchHref } from "../content/language.ts";
import { preserveHash, preferredBrowserLocale, resolveLocaleHint } from "../lib/locale.ts";

const validToken = "a".repeat(64);

function apiRequest(
  body: unknown,
  headers: Record<string, string> = {}
): Request {
  return new Request("http://marketing-web:3000/api/marketing/unsubscribe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "bimspect.com",
      origin: "https://bimspect.com",
      "x-forwarded-proto": "https",
      ...headers
    },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

function emailRequest(
  body: unknown,
  headers: Record<string, string> = {}
): Request {
  return new Request("http://marketing-web:3000/api/marketing/unsubscribe/request", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "bimspect.com",
      origin: "https://bimspect.com",
      "x-forwarded-proto": "https",
      ...headers
    },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

function withCrmConfiguration() {
  const original = {
    BIMSPECT_CRM_URL: process.env.BIMSPECT_CRM_URL,
    BIMSPECT_CRM_API_SECRET: process.env.BIMSPECT_CRM_API_SECRET,
    CF_ACCESS_CLIENT_ID: process.env.CF_ACCESS_CLIENT_ID,
    CF_ACCESS_CLIENT_SECRET: process.env.CF_ACCESS_CLIENT_SECRET
  };

  process.env.BIMSPECT_CRM_URL = "https://crm.example.test";
  process.env.BIMSPECT_CRM_API_SECRET = "test-marketing-secret";
  process.env.CF_ACCESS_CLIENT_ID = "test-access-client";
  process.env.CF_ACCESS_CLIENT_SECRET = "test-access-secret";

  return () => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
}

test("unsubscribe token validation accepts only 64 lowercase hexadecimal characters", () => {
  assert.equal(isValidUnsubscribeToken(undefined), false);
  assert.equal(isValidUnsubscribeToken("a".repeat(63)), false);
  assert.equal(isValidUnsubscribeToken("a".repeat(65)), false);
  assert.equal(isValidUnsubscribeToken("A".repeat(64)), false);
  assert.equal(isValidUnsubscribeToken(`${"a".repeat(63)}g`), false);
  assert.equal(isValidUnsubscribeToken(validToken), true);
  assert.deepEqual(parseUnsubscribePayload({ token: validToken }), { token: validToken });
  assert.equal(parseUnsubscribePayload({ token: "bad" }), null);
  assert.equal(unsubscribeTokenState(null), "missing");
  assert.equal(unsubscribeTokenState(validToken), "valid");
  assert.equal(unsubscribeTokenState("bad"), "invalid");
});

test("email-entry unsubscribe validation normalizes only syntactically valid emails", () => {
  assert.equal(normalizeUnsubscribeEmail(" Pilot.User@Example.TEST "), "pilot.user@example.test");
  assert.equal(normalizeUnsubscribeEmail("not-an-email"), null);
  assert.equal(normalizeUnsubscribeEmail("a@b"), null);
  assert.equal(normalizeUnsubscribeEmail("a".repeat(250) + "@example.test"), null);
  assert.deepEqual(parseUnsubscribeEmailRequest({ email: "Pilot.User@Example.TEST" }), {
    email: "pilot.user@example.test"
  });
  assert.equal(parseUnsubscribeEmailRequest({ email: "not-an-email" }), null);
});

test("unsubscribe request security accepts JSON and proxy-aware same-origin requests", () => {
  const request = apiRequest({ token: validToken }, {
    "content-type": "application/json; charset=UTF-8"
  });
  assert.equal(hasJsonContentType(request), true);
  assert.equal(hasSameOrigin(request), true);

  assert.equal(
    hasJsonContentType(apiRequest({ token: validToken }, { "content-type": "text/plain" })),
    false
  );
  assert.equal(
    hasSameOrigin(apiRequest({ token: validToken }, { origin: "https://attacker.example" })),
    false
  );
});

test("unsubscribe processing is an explicit POST action", () => {
  assert.equal(typeof unsubscribePost, "function");
});

test("unsubscribe success copy confirms the recorded marketing-only preference", async () => {
  const form = await readFile(
    new URL("../components/unsubscribe/UnsubscribeForm.tsx", import.meta.url),
    "utf8"
  );
  assert.equal(form.includes("Your request has been recorded"), true);
  assert.equal(form.includes("marketing emails"), true);
  assert.equal(form.includes("essential service or account-related messages"), true);
});

test("email-entry unsubscribe forwards through the server without logging or exposing the address", async () => {
  const restoreConfiguration = withCrmConfiguration();
  const originalFetch = globalThis.fetch;
  const logCalls: unknown[][] = [];
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => logCalls.push(args);

  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://crm.example.test/api/marketing/unsubscribe/request");
      assert.equal(init?.method, "POST");
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer test-marketing-secret");
      assert.deepEqual(JSON.parse(String(init?.body)), { email: "person@example.test" });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    };

    const response = await unsubscribeEmailRequestPost(
      emailRequest({ email: " PERSON@EXAMPLE.TEST " })
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });
    assert.equal(JSON.stringify(logCalls).includes("person@example.test"), false);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
    restoreConfiguration();
  }
});

test("email-entry unsubscribe rejects invalid input, cross-origin requests, and non-JSON bodies", async () => {
  const malformed = await unsubscribeEmailRequestPost(emailRequest({ email: "not-an-email" }));
  assert.equal(malformed.status, 400);

  const plainText = await unsubscribeEmailRequestPost(
    emailRequest(JSON.stringify({ email: "person@example.test" }), {
      "content-type": "text/plain"
    })
  );
  assert.equal(plainText.status, 415);

  const crossOrigin = await unsubscribeEmailRequestPost(
    emailRequest({ email: "person@example.test" }, { origin: "https://attacker.example" })
  );
  assert.equal(crossOrigin.status, 403);
});

test("unsubscribe URLs are excluded from campaign attribution capture", () => {
  assert.equal(shouldCaptureCampaignAttribution("/unsubscribe"), false);
  assert.equal(shouldCaptureCampaignAttribution("/pilot"), true);
});

test("browser language detection respects quality values and ordering", () => {
  assert.equal(preferredBrowserLocale("fi-FI,fi;q=0.9,en;q=0.8"), "fi");
  assert.equal(preferredBrowserLocale("en-US,en;q=0.9,fi;q=0.5"), "en");
  assert.equal(preferredBrowserLocale("fi;q=0.7,en;q=0.9"), "en");
  assert.equal(preferredBrowserLocale("en;q=0.7,fi;q=0.9"), "fi");
  assert.equal(preferredBrowserLocale(null), "unknown");
  assert.equal(preferredBrowserLocale("not-a-valid-header;q=two"), "unknown");
});

test("locale hints never override an explicit preference or geo-redirect visitors", () => {
  assert.deepEqual(
    resolveLocaleHint({ cookie: undefined, acceptLanguage: null, country: "FI" }),
    {
      explicitLocale: null,
      browserLocale: "unknown",
      countrySuggestsFinnish: true,
      shouldSuggestFinnish: true
    }
  );
  assert.equal(
    resolveLocaleHint({
      cookie: undefined,
      acceptLanguage: "en-US,en;q=0.9",
      country: "FI"
    }).shouldSuggestFinnish,
    false
  );
  assert.equal(
    resolveLocaleHint({ cookie: undefined, acceptLanguage: "fi-FI,fi;q=0.9", country: "US" })
      .shouldSuggestFinnish,
    true
  );
  assert.equal(
    resolveLocaleHint({
      cookie: undefined,
      acceptLanguage: "fi-FI,fi;q=0.9",
      country: "FI",
      suggestionDismissed: true
    }).shouldSuggestFinnish,
    false
  );
  assert.deepEqual(
    resolveLocaleHint({ cookie: "en", acceptLanguage: "fi", country: "FI" }),
    {
      explicitLocale: "en",
      browserLocale: "fi",
      countrySuggestsFinnish: true,
      shouldSuggestFinnish: false
    }
  );
  assert.deepEqual(
    resolveLocaleHint({ cookie: "fi", acceptLanguage: "en", country: "US" }),
    {
      explicitLocale: "fi",
      browserLocale: "en",
      countrySuggestsFinnish: false,
      shouldSuggestFinnish: false
    }
  );
});

test("language switching preserves only recognised attribution parameters", () => {
  const parameters = {
    utm_source: "linkedin",
    utm_medium: "organic",
    utm_campaign: "launch",
    utm_content: "demo",
    utm_term: "ifc",
    sensitive: "do-not-copy"
  };

  assert.equal(
    languageSwitchHref("fi", parameters),
    "/fi?utm_source=linkedin&utm_medium=organic&utm_campaign=launch&utm_content=demo&utm_term=ifc"
  );
  assert.equal(
    languageSwitchHref("en", parameters),
    "/?utm_source=linkedin&utm_medium=organic&utm_campaign=launch&utm_content=demo&utm_term=ifc"
  );
  assert.equal(
    preserveHash(languageSwitchHref("fi", { utm_source: "email" }), "#analytics"),
    "/fi?utm_source=email#analytics"
  );
  assert.equal(
    preserveHash(languageSwitchHref("en", { utm_campaign: "launch" }), "#pricing"),
    "/?utm_campaign=launch#pricing"
  );
});

test("campaign pages keep pricing route-specific and include the generic footer link", async () => {
  const [pilot, whatChanged, content, form, campaignShell] = await Promise.all([
    readFile(new URL("../app/(en)/pilot/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/what-changed/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/CampaignForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/CampaignLayout.tsx", import.meta.url), "utf8")
  ]);

  assert.equal(pilot.includes("PilotPricingSection"), false);
  assert.equal(pilot.includes("View pricing"), false);
  assert.equal(pilot.includes("#offer"), false);
  assert.equal(pilot.includes("#pricing"), false);
  assert.equal(pilot.includes("BIMSpect is entering its"), true);
  assert.equal(pilot.includes("Thank you for being part of our pilot journey."), true);
  assert.equal(
    pilot.includes("Aalto University’s Research to Business (R2B) development phase to commercial operations."),
    true
  );
  assert.equal(pilot.includes("Browser-based."), true);
  assert.equal(pilot.includes("No installation required."), true);
  assert.equal(pilot.includes("CampaignVideo"), true);
  assert.equal(pilot.includes('id="analytics"'), true);
  assert.equal(pilot.includes('id="pilot-journey"'), false);
  assert.equal(pilot.includes("CommercialContinuation"), false);
  assert.equal(pilot.includes("FinalCta"), false);
  assert.equal(pilot.includes("Let’s discuss continuing with BIMSpect"), true);
  assert.equal(whatChanged.includes("PricingBridge"), true);
  assert.equal(whatChanged.includes('href: "#pricing"'), true);
  assert.equal(content.includes('{ href: "/unsubscribe", label: "Unsubscribe from BIMSpect emails" }'), true);
  assert.equal(content.includes('label: "hello@bimspect.com"'), true);
  assert.equal(content.includes('{ href: "#offer", label: "Pricing" }'), false);
  assert.equal(content.includes('{ href: "#analytics", label: "Analytics" }'), true);
  assert.equal(content.includes('{ href: "#contact", label: "Contact" }'), true);
  assert.equal(content.includes('title: "Understand stability and review priorities"'), true);
  assert.equal(form.includes('name="name"'), true);
  assert.equal(form.includes('name="company"'), true);
  assert.equal(form.includes('name="workEmail"'), true);
  assert.equal(form.includes('name="question"'), true);
  assert.equal(campaignShell.includes("useBrandImage"), true);
  assert.equal(campaignShell.includes('"© 2026 BIMSpect"'), true);
});

test("marketing reuses the exact CRM logo artwork", async () => {
  const [logo, header, unsubscribePage] = await Promise.all([
    readFile(new URL("../public/brand/bimspect-logo.png", import.meta.url)),
    readFile(new URL("../components/Header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/unsubscribe/page.tsx", import.meta.url), "utf8")
  ]);

  assert.equal(
    createHash("sha256").update(logo).digest("hex"),
    "54607e0e17c5e1be4b4780abc4e3a53e6ec3d65798ebaeb60e573bcc96236e72"
  );
  assert.equal(header.includes('src="/brand/bimspect-logo.png"'), true);
  assert.equal(unsubscribePage.includes('src="/brand/bimspect-logo.png"'), true);
});

test("unsubscribe API forwards valid tokens through the authenticated CRM helper", async () => {
  const restoreConfiguration = withCrmConfiguration();
  const originalFetch = globalThis.fetch;
  const logCalls: unknown[][] = [];
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => logCalls.push(args);

  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://crm.example.test/api/marketing/unsubscribe");
      assert.equal(init?.method, "POST");
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer test-marketing-secret");
      assert.equal(new Headers(init?.headers).get("cf-access-client-id"), "test-access-client");
      assert.equal(new Headers(init?.headers).get("cf-access-client-secret"), "test-access-secret");
      assert.deepEqual(JSON.parse(String(init?.body)), { token: validToken });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    };

    const response = await unsubscribePost(apiRequest({ token: validToken }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });
    assert.deepEqual(logCalls, []);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
    restoreConfiguration();
  }
});

test("unsubscribe API rejects malformed input, wrong origins, and unsupported media types", async () => {
  const malformed = await unsubscribePost(apiRequest({ token: "not-a-token" }));
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { error: "This unsubscribe link is not valid." });

  const plainText = await unsubscribePost(
    apiRequest(JSON.stringify({ token: validToken }), { "content-type": "text/plain" })
  );
  assert.equal(plainText.status, 415);

  const crossOrigin = await unsubscribePost(
    apiRequest({ token: validToken }, { origin: "https://attacker.example" })
  );
  assert.equal(crossOrigin.status, 403);
});

test("unsubscribe API returns a generic error when the CRM is unavailable without logging a token", async () => {
  const restoreConfiguration = withCrmConfiguration();
  const originalFetch = globalThis.fetch;
  const logCalls: unknown[][] = [];
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => logCalls.push(args);

  try {
    globalThis.fetch = async () => new Response(null, { status: 503 });
    const response = await unsubscribePost(apiRequest({ token: validToken }));
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), {
      error: "We couldn’t process your request right now. Please try again."
    });
    assert.equal(JSON.stringify(logCalls).includes(validToken), false);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
    restoreConfiguration();
  }
});

test("the client only sends an unsubscribe request after an explicit action", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ input: string; init?: RequestInit }> = [];

  try {
    globalThis.fetch = async (input, init) => {
      calls.push({ input: String(input), init });
      return new Response(null, { status: 200 });
    };

    assert.equal(calls.length, 0);
    assert.equal(await submitUnsubscribe(validToken), "success");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].input, "/api/marketing/unsubscribe");
    assert.equal(calls[0].init?.method, "POST");
    assert.equal(calls[0].init?.credentials, "same-origin");
    assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { token: validToken });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the generic email form requests a confirmation link without campaign analytics", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ input: string; init?: RequestInit }> = [];

  try {
    globalThis.fetch = async (input, init) => {
      calls.push({ input: String(input), init });
      return new Response(null, { status: 200 });
    };

    assert.equal(await requestUnsubscribeConfirmation("person@example.test"), "success");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].input, "/api/marketing/unsubscribe/request");
    assert.equal(calls[0].init?.method, "POST");
    assert.equal(calls[0].init?.credentials, "same-origin");
    assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
      email: "person@example.test"
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the client presents invalid and infrastructure failures generically", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => new Response(null, { status: 400 });
    assert.equal(await submitUnsubscribe(validToken), "invalid");

    globalThis.fetch = async () => new Response(null, { status: 502 });
    assert.equal(await submitUnsubscribe(validToken), "error");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
