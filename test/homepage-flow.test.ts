import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function homepageSources() {
  const [home, pricing, data, content, pilot, campaignForm, hero] = await Promise.all([
    readFile(new URL("../components/home/HomePage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/PricingSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../content/home.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/pilot/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/campaign/CampaignForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/hero/HeroContent.tsx", import.meta.url), "utf8")
  ]);

  return { home, pricing, data, content, pilot, campaignForm, hero };
}

test("both locales place pricing and contact before research and team", async () => {
  const { home } = await homepageSources();
  const pricing = home.indexOf("<PricingSection heading={content.pricingHeading} locale={content.locale} />");
  const contact = home.indexOf('id="contact"');
  const credibility = home.lastIndexOf("<CredibilitySections content={content} />");

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
  assert.equal(data.includes('cta: "Contact sales"'), true);
  assert.equal(pricing.includes('id="pricing"'), true);
  assert.equal(home.includes('id="contact"'), true);
  assert.equal(home.includes('kind="homepage-enquiry"'), true);
  assert.equal(home.includes('landingPage="homepage"'), true);
  assert.equal(pilot.includes('kind="pilot-enquiry"'), true);
  assert.equal(campaignForm.includes('fetch("/api/campaign/leads"'), false);
});

test("English and Finnish share one layout, CTAs and the enquiry form", async () => {
  const { home, content, hero } = await homepageSources();

  assert.equal(content.includes('primaryCta: "See BIMSpect in action"'), true);
  assert.equal(content.includes('secondaryCta: "Talk to BIMSpect"'), true);
  assert.equal(content.includes('headerCta: "Talk to BIMSpect"'), true);
  assert.equal(hero.includes('href="#demo"'), true);
  assert.equal(hero.includes("interest={content.hero.walkthroughInterest}"), true);
  assert.equal(home.includes("intent={SAMPLE_REPORT_REQUEST}"), true);
  assert.equal(home.includes("locale={content.locale}"), true);
  // Only the header switcher and the Finnish suggestion depend on the locale.
  const main = home.slice(home.indexOf("<main"), home.indexOf("</main>"));
  assert.equal(/content\.locale === "(en|fi)"/.test(main), false);
  assert.equal(main.includes("mailto:"), false);
  assert.equal(home.includes('fetch("/api/'), false);
});

test("the Northline illustrative design story is removed", async () => {
  const { home, content } = await homepageSources();
  assert.equal(home.includes("design-story"), false);
  assert.equal(`${home}${content}`.includes("Northline"), false);
  await assert.rejects(readFile(new URL("../components/design-story/DesignStory.tsx", import.meta.url), "utf8"));
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
