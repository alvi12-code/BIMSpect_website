import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { submitCampaignRequest } from "../components/campaign/submitCampaignRequest.ts";

test("homepage and pilot reuse one CampaignForm implementation", async () => {
  const [homePage, pilotPage, campaignSections, campaignForm] = await Promise.all([
    readFile(new URL("../components/home/HomePage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/pilot/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/CampaignSections.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/CampaignForm.tsx", import.meta.url), "utf8")
  ]);

  assert.equal(homePage.includes('kind="homepage-enquiry"'), true);
  assert.equal(homePage.includes('landingPage="homepage"'), true);
  assert.equal(homePage.includes("submitCampaignRequest"), false);
  assert.equal(homePage.includes("<form"), false);
  assert.equal(pilotPage.includes('kind="pilot-enquiry"'), true);
  assert.equal(campaignSections.includes("<CampaignForm"), true);
  assert.equal(campaignForm.includes('fetch("/api/campaign/leads"'), false);
  assert.equal(campaignForm.includes("submitCampaignRequest"), true);
});

test("homepage pricing contact CTAs preserve #contact and selected interest", async () => {
  const [pricingData, pricingSection, contactLink] = await Promise.all([
    readFile(new URL("../components/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/PricingSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/CampaignContactLink.tsx", import.meta.url), "utf8")
  ]);

  assert.equal(pricingData.includes('return { href: "#contact", label: "Contact us" }'), true);
  assert.equal(pricingData.includes('cta: "Discuss project access"'), true);
  assert.equal(pricingData.includes('cta: "Discuss enterprise access"'), true);
  assert.equal(pricingSection.includes("<CampaignContactLink"), true);
  assert.equal(pricingSection.includes("interest={plan.name}"), true);
  assert.equal(contactLink.includes('href="#contact"'), true);
  assert.equal(contactLink.includes("CAMPAIGN_ENQUIRY_INTEREST_EVENT"), true);
});

test("homepage submits the existing lead payload and UTM attribution to the campaign endpoint", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "/api/campaign/leads");
      assert.equal(init?.method, "POST");
      assert.equal(new Headers(init?.headers).get("idempotency-key"), "homepage-lead-0001");
      assert.deepEqual(JSON.parse(String(init?.body)), {
        name: "Ada Buyer",
        email: "ADA@example.test",
        company: "Example Construction Oy",
        message: "I’m interested in BIMSpect Individual.",
        campaign: "september-2026",
        landing_page: "/",
        page_url: "https://bimspect.com/?utm_source=linkedin&utm_campaign=commercial_launch",
        utm_source: "linkedin",
        utm_campaign: "commercial_launch"
      });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };

    await submitCampaignRequest({
      kind: "homepage-enquiry",
      name: "Ada Buyer",
      email: "ADA@example.test",
      company: "Example Construction Oy",
      message: "I’m interested in BIMSpect Individual.",
      campaign: "september-2026",
      attribution: {
        landing_page: "/",
        page_url: "https://bimspect.com/?utm_source=linkedin&utm_campaign=commercial_launch",
        utm_source: "linkedin",
        utm_campaign: "commercial_launch"
      },
      idempotencyKey: "homepage-lead-0001"
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the shared submission helper returns failures to CampaignForm's existing error state", async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => new Response("unavailable", { status: 502 });

    await assert.rejects(
      submitCampaignRequest({
        kind: "homepage-enquiry",
        name: "Ada Buyer",
        email: "ada@example.test",
        campaign: "september-2026",
        attribution: {}
      }),
      /Campaign lead submission failed/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the shared form retains validation, Turnstile, privacy, success, and error UX", async () => {
  const [form, submitRequest, attribution, leadRoute] = await Promise.all([
    readFile(new URL("../components/campaign/CampaignForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/submitCampaignRequest.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/attribution.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/campaign/leads/route.ts", import.meta.url), "utf8")
  ]);

  assert.equal(form.includes('name="name"'), true);
  assert.equal(form.includes('name="company"'), true);
  assert.equal(form.includes('name="workEmail"'), true);
  assert.equal(form.includes('name="question"'), true);
  assert.equal(form.includes("form.reportValidity()"), true);
  assert.equal(form.includes("<Turnstile"), true);
  assert.equal(form.includes("Privacy Policy"), true);
  assert.equal(form.includes("We’ll be in touch with you shortly."), true);
  assert.equal(form.includes("We could not submit your request."), true);
  assert.equal(form.includes('trackCampaignEvent("form_success"'), true);
  assert.equal(submitRequest.includes('fetch("/api/campaign/leads"'), true);
  assert.equal(attribution.includes('pathname !== "/"'), true);
  assert.equal(leadRoute.includes("parseRequest"), true);
  assert.equal(leadRoute.includes("verifyTurnstile"), true);
  assert.equal(leadRoute.includes("hasSameOrigin"), true);
  assert.equal(leadRoute.includes('path: "/api/marketing/leads"'), true);
});
