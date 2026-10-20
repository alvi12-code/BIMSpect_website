# Remediation note: F02 plan-enquiry intent, F01 status

**Date:** 20 October 2026. **Source:** [marketing and pricing audit](2026-10-20-marketing-pricing-audit.md) (unchanged). **State:** local, uncommitted, on `work/2026-10-12-all-local-changes` at `ee7381c`. Not deployed.

## F02: implemented locally

**Confirmed before the change:** `PricingBridge` on `/what-changed` sent every plan CTA (“Start individually”, “Discuss project access”, “Discuss enterprise access”) to `#sample-report`. The homepage cards used `CampaignContactLink`, which put the plan only into a custom click event that prefilled the editable question. `submitCampaignRequest` discarded `kind`, and the lead route forwarded no purpose to the CRM. A sample-report lead could only be told apart from other leads by its landing page.

**Change:**

- `lib/enquiry-intent.ts` defines the finite identifiers. Purposes: `general-enquiry`, `plan-enquiry`, `sample-report`. Plans: `individual`, `project`, `enterprise`. The module also handles the URL format, the select options, the submission fields and server parsing. Links have the form `/?enquiry=plan&plan=project#contact` or `?enquiry=sample-report#contact`. Other query parameters, such as UTM tags, are kept. Unknown or malformed values fall back to a general enquiry. No visitor details are put in URLs.
- `CampaignContactLink` takes an `intent` and an optional `path`, and renders a real `href`. New tabs, modified clicks, cross-page links and direct entry all use ordinary navigation. A plain click on the page that holds the form updates the query in place, so details already typed are kept, and then performs a native `#contact` fragment navigation. Free-text `interest` links (the walkthrough and the comparison “Talk to BIMSpect”) keep their previous behaviour.
- `PricingSection` (homepage and pilot) sends each plan card's tier as a plan intent. `PricingBridge` on What Changed now links to the homepage enquiry form with `enquiryPath="/"`, because What Changed only has the sample-report form. The What Changed sample CTAs and the sample form are unchanged. The homepage sample-report CTA now carries `sample-report` instead of a prefilled sentence.
- `CampaignForm` enquiry forms (homepage and pilot) show a visible **“Enquiry about”** select, for example “Plan enquiry: BIMSpect Project” or “Sample report request”. Its value comes from the URL through `useSyncExternalStore`, so refresh and back/forward show the URL's context. Changing the select rewrites only the URL's enquiry parameters. Name, company, email and question are never reset by it. The question becomes optional (labelled “Question (optional)”) when a plan or sample purpose is selected, so the removed prefill does not add friction. The `sample-report` form always submits `sample-report`.
- `submitCampaignRequest` adds `request_purpose` and, for plan enquiries, `plan_interest`. Existing callers that do not pass these remain valid.
- `/api/campaign/leads` validates both fields against the allowlist and rejects inconsistent values with the existing 400 response. Because the CRM `/api/marketing/leads` schema is not available in any local repository, the route does not forward new fields. It prepends a header built on the server from the validated identifiers to the existing `message` field, for example `Request purpose: Plan enquiry` / `Selected plan: BIMSpect Project`, followed by the visitor's message unchanged. Validation, Turnstile, same-origin and idempotency handling, error states and the contact fallback are unchanged.

**Checks run:** `node --test --experimental-strip-types test/enquiry-intent.test.ts test/campaign-leads.test.ts` (18/18 pass; `fetch` mocked, no lead created), `tsc --noEmit`, `eslint` on changed files, `git diff --check`. One assertion in `test/homepage-flow.test.ts` was updated to the new sample CTA and was not run. Browser navigation, real submission, CRM receipt and delivery were **not verified**.

**Remaining limitations:**

- **CRM fields:** context reaches the CRM only as the message header. Add dedicated CRM fields once the CRM lead schema is confirmed. A visitor message close to the 5,000-character limit becomes about 80 characters longer than that limit, and the CRM's own limit is unknown.
- **Pre-hydration:** before hydration the select shows “General enquiry”. Context is applied once JavaScript runs.
- **`/pricing`:** this local route (404 live) places plan links on a mailto-only `ContactCTA`, so plan context is not used there. This is unchanged.
- **CTA wording, recorded and not changed:** “Start individually” on What Changed suggests immediate access, but the link leads to an enquiry. “Send me the sample report” and the success text “We’ll be in touch with you shortly” suggest delivery or a response time, but the route only forwards a lead. Copy ownership is unconfirmed, so the wording was left as it is.

## F01: unresolved, release consideration

| Location | Project billing unit as written |
|---|---|
| `components/data.ts` (`pricingPlans`, homepage, pilot and `/pricing` cards) | `€1,490` + `/project` |
| `components/campaign/content.ts` (`pilotPricing`, What Changed bridge) | `€1,490 / month` |
| `bimspect-pricing-updated.html` (legacy static page) | `€1,490/month` |
| `docs/application-billing-entry.md` | “€1,490/project” |
| `test/homepage-flow.test.ts` | asserts `price: "€1,490"` only |
| Core repo `BIMSpect/backend/docs/billing/entitlements.md`, `vat-policy-decisions.md` | “€1,490 one-time for one explicitly linked project”; the decision table states “Website says /month” and “Founders confirm duration, transfer and refund” |
| Core repo `BIMSpect/frontend/src/pages/Purchase.tsx` | “Project — €1,490/project” |

According to the audit, the live `/#pricing` page shows `/month`. Locally, the homepage card and the What Changed bridge disagree with each other. No approved commercial schedule was found. The core billing docs are engineering records, and they leave duration, transfer and refunds for the founders to confirm. The deployed revision cannot be established either: no deployment-to-commit record exists, and `DEPLOYMENT.md` only asks operators to record one. Because the homepage card says `/project` while the live page shows `/month`, deploying this branch as it stands would change the published Project unit.

**Decision needed:** “What is the approved Project billing cadence and scope—for example, a recurring charge per active project—and where is that offer recorded?” After the decision, align every row above, plus any Finnish copy if pricing is localized, and record the deployed SHA before release. Pricing, tax wording, entitlements, integrations, terms, data-handling text and Finnish pricing were not modified in this batch.
