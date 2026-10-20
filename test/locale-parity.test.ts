import assert from "node:assert/strict";
import test from "node:test";
import { homeContent } from "../content/home.ts";
import { finnishPrice, finnishPricing } from "../content/pricing.ts";
import { enquiryIntentLabel, planEnquiry, SAMPLE_REPORT_REQUEST } from "../lib/enquiry-intent.ts";

// Same keys, array lengths and value types; text may differ.
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape((value as Record<string, unknown>)[key])]));
  }
  return typeof value;
}

test("Finnish homepage content mirrors the English structure", () => {
  const { en, fi } = homeContent;
  // structuredData is generated per locale and compared elsewhere.
  assert.deepEqual(shape({ ...fi, structuredData: null }), shape({ ...en, structuredData: null }));
  assert.deepEqual(fi.navigation.map((link) => link.href), en.navigation.map((link) => link.href));
  assert.deepEqual(fi.footerLinks.map((link) => link.href), en.footerLinks.map((link) => link.href));
  assert.ok(fi.navigation.some((link) => link.href === "#pricing"));
});

test("Finnish pricing translates display copy without changing amounts or plan contents", () => {
  assert.equal(finnishPrice("€59"), "59 €");
  assert.equal(finnishPrice("€1,490"), "1 490 €");
  assert.equal(finnishPrice("Custom pricing"), "Custom pricing");
  // Feature counts match components/data.ts: Individual 6, Project 6, Enterprise 7.
  assert.equal(finnishPricing.plans.Individual.features.length, 6);
  assert.equal(finnishPricing.plans.Project.features.length, 6);
  assert.equal(finnishPricing.plans.Enterprise.features.length, 7);
  assert.equal(finnishPricing.comparison.length, 2);
  assert.equal(finnishPricing.adoptionSteps.length, 4);
});

test("enquiry topics are labelled in the visitor's language", () => {
  assert.equal(enquiryIntentLabel(planEnquiry("project"), "fi"), "Pakettitiedustelu: BIMSpect Project");
  assert.equal(enquiryIntentLabel(SAMPLE_REPORT_REQUEST, "fi"), "Esimerkkiraportin pyyntö");
  assert.equal(enquiryIntentLabel(planEnquiry("project")), "Plan enquiry: BIMSpect Project");
});
