import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { submitCampaignRequest } from "../components/campaign/submitCampaignRequest.ts";
import {
  ENQUIRY_PLANS,
  GENERAL_ENQUIRY,
  SAMPLE_REPORT_REQUEST,
  enquiryHref,
  enquiryIntentLabel,
  enquiryOptionValue,
  enquiryPlanForTier,
  intentFromOptionValue,
  leadMessageWithContext,
  parseEnquiryContext,
  planEnquiry,
  readEnquiryIntent,
  searchWithEnquiryIntent,
  type EnquiryIntent
} from "../lib/enquiry-intent.ts";

const PLAN_LABELS = {
  individual: "BIMSpect Individual",
  project: "BIMSpect Project",
  enterprise: "BIMSpect Enterprise"
} as const;

// Captures what the browser would POST without reaching the lead route or CRM.
async function capturedSubmission(kind: "homepage-enquiry" | "sample-report", intent: EnquiryIntent, message?: string) {
  const originalFetch = globalThis.fetch;
  let body: Record<string, unknown> = {};

  try {
    globalThis.fetch = async (_input, init) => {
      body = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };
    await submitCampaignRequest({
      kind,
      name: "Ada Buyer",
      email: "ada@example.test",
      company: "Example Oy",
      message,
      intent,
      campaign: "september-2026",
      attribution: { landing_page: "/what-changed" }
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  return body;
}

for (const plan of ENQUIRY_PLANS) {
  test(`${plan} CTA keeps its plan enquiry from link to prepared lead`, async () => {
    const tier = plan[0].toUpperCase() + plan.slice(1);
    assert.equal(enquiryPlanForTier(tier), plan);

    // Homepage cards link on-page; What Changed cards link to the homepage form.
    for (const href of [
      enquiryHref(planEnquiry(plan)),
      enquiryHref(planEnquiry(plan), { path: "/", search: "?utm_source=linkedin" })
    ]) {
      const url = new URL(href, "https://bimspect.com/what-changed");
      assert.equal(url.hash, "#contact");
      assert.deepEqual(readEnquiryIntent(url.search), planEnquiry(plan));
    }

    const body = await capturedSubmission("homepage-enquiry", planEnquiry(plan), "Our team has 12 people.");
    assert.equal(body.request_purpose, "plan-enquiry");
    assert.equal(body.plan_interest, plan);
    assert.equal(body.message, "Our team has 12 people.");

    const prepared = parseEnquiryContext(body);
    assert.deepEqual(prepared, planEnquiry(plan));
    assert.equal(
      leadMessageWithContext(prepared!, String(body.message)),
      `Request purpose: Plan enquiry\nSelected plan: ${PLAN_LABELS[plan]}\n\nOur team has 12 people.`
    );
  });
}

test("What Changed plan CTAs use plan enquiry links while sample CTAs stay on the sample form", async () => {
  const [sections, page] = await Promise.all([
    readFile(new URL("../components/campaign/CampaignSections.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/what-changed/page.tsx", import.meta.url), "utf8")
  ]);
  const bridge = sections.slice(sections.indexOf("export function PricingBridge"));

  assert.equal(bridge.includes('href="#sample-report"'), false);
  assert.equal(bridge.includes("intent={planEnquiry(enquiryPlan)}"), true);
  assert.equal(page.includes('enquiryPath="/"'), true);
  assert.equal(page.includes('kind="sample-report"'), true);
  assert.equal(page.match(/href: "#sample-report"/g)?.length, 3);
});

test("a direct plan link initializes the visible purpose and the submitted context", async () => {
  const intent = readEnquiryIntent("?utm_source=newsletter&enquiry=plan&plan=enterprise");
  assert.ok(intent);
  assert.equal(enquiryIntentLabel(intent), "Plan enquiry: BIMSpect Enterprise");
  assert.deepEqual(intentFromOptionValue(enquiryOptionValue(intent)), intent);

  const body = await capturedSubmission("homepage-enquiry", intent);
  assert.equal(body.request_purpose, "plan-enquiry");
  assert.equal(body.plan_interest, "enterprise");
  assert.equal("message" in body, false);
  assert.equal(
    leadMessageWithContext(parseEnquiryContext(body)!),
    "Request purpose: Plan enquiry\nSelected plan: BIMSpect Enterprise"
  );
});

test("sample report requests remain sample requests", async () => {
  assert.deepEqual(readEnquiryIntent("?enquiry=sample-report"), SAMPLE_REPORT_REQUEST);
  assert.equal(enquiryIntentLabel(SAMPLE_REPORT_REQUEST), "Sample report request");

  const body = await capturedSubmission("sample-report", SAMPLE_REPORT_REQUEST);
  assert.equal(body.request_purpose, "sample-report");
  assert.equal("plan_interest" in body, false);
  assert.deepEqual(parseEnquiryContext(body), SAMPLE_REPORT_REQUEST);
  assert.equal(leadMessageWithContext(SAMPLE_REPORT_REQUEST), "Request purpose: Sample report request");
});

for (const search of [
  "?enquiry=plan&plan=premium",
  "?enquiry=plan",
  "?plan=project",
  "?enquiry=checkout&plan=project",
  "?enquiry=sample-report&plan=project",
  "?enquiry=%3Cscript%3E"
]) {
  test(`invalid context ${search} falls back to a general enquiry`, () => {
    assert.deepEqual(readEnquiryIntent(search), GENERAL_ENQUIRY);
  });
}

test("invalid context keeps visitor text and unrelated parameters", async () => {
  assert.equal(readEnquiryIntent("?utm_source=linkedin"), null);
  assert.equal(
    searchWithEnquiryIntent("?utm_source=linkedin&enquiry=plan&plan=premium", planEnquiry("project")),
    "?utm_source=linkedin&enquiry=plan&plan=project"
  );
  assert.equal(searchWithEnquiryIntent("?utm_source=linkedin&plan=x", GENERAL_ENQUIRY), "?utm_source=linkedin");

  for (const input of [
    { request_purpose: "plan-enquiry", plan_interest: "premium" },
    { request_purpose: "plan-enquiry" },
    { plan_interest: "project" },
    { request_purpose: "sample-report", plan_interest: "project" },
    { request_purpose: "I want a discount" }
  ]) {
    assert.equal(parseEnquiryContext(input), null);
  }
  assert.equal(parseEnquiryContext({ message: "legacy caller" }), undefined);

  const message = "Line one\n\nRequest purpose: written by visitor";
  assert.equal(
    leadMessageWithContext(GENERAL_ENQUIRY, message),
    `Request purpose: General enquiry\n\n${message}`
  );

  // The plan control only rewrites the URL; the question is set only by the
  // visitor or by the legacy prefill, which never replaces existing text.
  const form = await readFile(new URL("../components/campaign/CampaignForm.tsx", import.meta.url), "utf8");
  assert.equal(form.match(/setQuestion\(/g)?.length, 2);
  assert.equal(form.includes("currentQuestion.trim()\n          ? currentQuestion"), true);
  assert.equal(form.includes("readEnquiryIntent(search) ?? GENERAL_ENQUIRY"), true);

  const route = await readFile(new URL("../app/api/campaign/leads/route.ts", import.meta.url), "utf8");
  assert.equal(route.includes("parseEnquiryContext(input)"), true);
  assert.equal(route.includes("leadMessageWithContext(enquiry, parsed.message)"), true);
});
