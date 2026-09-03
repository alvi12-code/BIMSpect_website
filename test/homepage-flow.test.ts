import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function homepageSources() {
  const [home, pricing, data, content, pilot, campaignForm] = await Promise.all([
    readFile(new URL("../components/home/HomePage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/PricingSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../content/home.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/pilot/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/CampaignForm.tsx", import.meta.url), "utf8")
  ]);

  return { home, pricing, data, content, pilot, campaignForm };
}

test("English homepage places pricing and contact before research and team", async () => {
  const { home } = await homepageSources();
  const pricing = home.indexOf('{content.locale === "en" ? <PricingSection /> : null}');
  const contact = home.indexOf('id="contact"');
  const credibility = home.lastIndexOf(
    '{content.locale === "en" ? <CredibilitySections content={content} /> : null}'
  );

  assert.ok(pricing > 0);
  assert.ok(contact > pricing);
  assert.ok(credibility > contact);
  assert.equal(home.includes('id="demo"'), true);
});

test("pricing shows plan cards before the tax disclosure and comparison", async () => {
  const { pricing } = await homepageSources();
  const normalised = pricing.replace(/\s+/g, " ");

  assert.ok(pricing.indexOf('className="pricing-grid"') < pricing.indexOf('pricing-footnote'));
  assert.ok(pricing.indexOf('pricing-footnote') < pricing.indexOf('pricing-comparison'));
  assert.equal(
    normalised.includes(
      "Prices are for business customers and exclude VAT and other applicable taxes. Taxes, if applicable, are determined based on the customer’s location and tax status."
    ),
    true
  );
});

test("commercial values, checkout links, and shared form contracts remain intact", async () => {
  const { home, pricing, data, pilot, campaignForm } = await homepageSources();

  assert.equal(data.includes('price: "€1,490"'), true);
  assert.equal(data.includes('price: "Custom pricing"'), true);
  assert.equal(data.includes('cta: "Buy now"'), true);
  assert.equal(data.includes('return { href: "#contact", label: "Contact us" }'), true);
  assert.equal(data.includes('cta: "Discuss project access"'), true);
  assert.equal(data.includes('cta: "Discuss enterprise access"'), true);
  assert.equal(pricing.includes('id="pricing"'), true);
  assert.equal(home.includes('id="contact"'), true);
  assert.equal(home.includes('kind="homepage-enquiry"'), true);
  assert.equal(home.includes('landingPage="homepage"'), true);
  assert.equal(pilot.includes('kind="pilot-enquiry"'), true);
  assert.equal(campaignForm.includes('fetch("/api/campaign/leads"'), false);
});

test("English commercial CTAs use the shared contact path while Finnish fallbacks remain separate", async () => {
  const { home, content } = await homepageSources();

  assert.equal(content.includes('primaryCta: "See BIMSpect in action"'), true);
  assert.equal(content.includes('secondaryCta: "Talk to BIMSpect"'), true);
  assert.equal(content.includes('headerCta: "Talk to BIMSpect"'), true);
  assert.equal(home.includes('href={content.locale === "en" ? "#demo" : "#workflow"}'), true);
  assert.equal(home.includes('interest="a BIMSpect walkthrough"'), true);
  assert.equal(home.includes('interest="the BIMSpect sample report"'), true);
  assert.equal(home.includes('content.locale === "fi" ? ('), true);
  assert.equal(home.includes('fetch("/api/'), false);
});

test("important homepage anchors have one matching target", async () => {
  const { home, pricing, content } = await homepageSources();
  const markup = `${home}\n${pricing}`;

  for (const id of [
    "home",
    "demo",
    "workflow",
    "analytics",
    "sample-report",
    "security",
    "pricing",
    "contact",
    "research",
    "about"
  ]) {
    assert.equal((markup.match(new RegExp(`id="${id}"`, "g")) ?? []).length, 1, id);
  }

  for (const href of ["#workflow", "#analytics", "#sample-report", "#pricing", "#security"]) {
    assert.equal(content.includes(`href: "${href}"`), true, href);
  }
});
