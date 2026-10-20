# BIMSpect marketing website and pricing audit

**Visit date:** 20 October 2026. **Decision:** retain the visual identity and genuine product evidence; rebuild the explanation and plan comparison around the buyer's task. This is an audit, not a change proposal to current prices or deployed behavior.

## Scope, evidence, and limits

I inspected the live English homepage at [bimspect.com](https://bimspect.com/), its `#pricing` content, the [What Changed campaign page](https://bimspect.com/what-changed), the [Finnish homepage](https://bimspect.com/fi), and the [pilot page](https://bimspect.com/pilot). The first two rendered in desktop Chrome; their first screens and accessibility trees were inspected. Text/links for the other routes came from live HTML and page retrieval. I checked HTTP responses for `/`, `/fi`, `/what-changed`, `/pilot`, `/pricing`, `/privacy`, `/terms`, `/robots.txt`, and `/sitemap.xml`. `/pricing`, `/privacy`, and `/terms` return 404; pricing is an on-page section. The sitemap lists only `/`, `/fi`, and `/what-changed`; `/pilot` is live but intentionally `noindex` in local source. I did not submit forms, create leads, buy, or test delivery. No mobile viewport, Safari, physical device, screen reader, automated accessibility scan, production Lighthouse run, console trace, or field Web Vitals measurement was completed. Those dimensions remain unscored where appropriate.

The marketing repository is `/Users/alvin/Desktop/Work/BIMSpect_website`, a Next.js 16 App Router site. At inspection it was on `work/2026-10-12-all-local-changes`, commit `ee7381c47fe981a19cd5a304c867a1c2b66f5bb7`, with only untracked `.DS_Store` files at root and `public/`. No `AGENTS.md` exists in that repository. I read its README and relevant content, pricing, campaign, layout, CSS, and animation files. The BIMSpect core frontend/backend are separate repositories under `/Users/alvin/Desktop/Work/BIMSpect/`; their code gives partial implementation context, not proof of deployed or commercially included features. I found no supplied competitor spreadsheet or current approved commercial schedule in the accessible workspace. Existing design notes dated October 2026 are historical QA, not a substitute for this live audit. There is no verified deployment-to-commit mapping, and at least one live/local pricing difference confirms that local code cannot be treated as production truth.

## Executive judgment and direct answers

1. **Beauty and trust:** The desktop site looks polished, coherent, and credible for an early B2B product. DM Sans/DM Mono, the violet accent, restrained surfaces, generous composition, and labeled model illustrations make a distinct first impression. It is more memorable than a generic SaaS template. The finish is held back by a long sequence of similarly weighted scenes, small product detail inside screenshots, and public promises stronger than the available evidence. The What Changed hero is visually strong but its dense video frame and three CTAs compete for attention.
2. **Complete story:** It clearly says that BIMSpect compares IFC model versions and shows added, removed, and changed elements. The step from one comparison to longitudinal design history, analytics, decisions, and reporting is asserted more than demonstrated. A first-time manager is left to infer what metric means, what judgment they should make, and what output their team receives.
3. **Buying journey:** An individual can see a plausible €59/month offer. A team can identify the €1,490/month Project tier, but cannot confidently determine common entitlements, user overages, contractual term, or integration scope. All live homepage plan CTAs lead to enquiry. The What Changed plan CTAs lead to the sample-report form, including those labeled “Discuss project access” and “Discuss enterprise access”; that loses the requested intent.
4. **Responsive, accessibility, performance, implementation:** Desktop semantics show useful headings, a skip link, named controls, form labels, and meaningful model descriptions. Source contains reduced-motion and static WebGL fallbacks. I cannot assert mobile quality or WCAG conformance without rendered viewport and keyboard/assistive checks. The homepage has three WebGL scenes and video, so performance needs production measurement; historical local frame timings do not establish live Core Web Vitals. Maintainability is reasonable but pricing/content divergence across routes and locales is a concrete risk.
5. **Next changes:** Clarify the comparison-to-decision story; reconcile the published Project billing unit; create an entitlement comparison and explicit contact process; make the sample output inspectable; resolve English/Finnish pricing strategy. Validate with task-based buyer tests and production accessibility/performance measurements.

### First impression: expert heuristic, not user research

**Five seconds, rendered desktop homepage:** “This is a browser-based IFC change-comparison product.” The large headline and calm architectural model communicate one job quickly. “Every change” sounds absolute. The hero does not yet show why a design manager should act on a changed wall or what repeated comparisons reveal.

**One-minute scan:** The navigation exposes workflow, analytics, sample report, pricing, data handling, and team. The site appears credible and research-led. Real viewer/dashboard captures and an attributed sample model help. However, the page repeatedly returns to *visible change* before showing a worked decision or readable report. The pricing unit switch from one user/five projects to ten users/one project is understandable only by inference. These are expert predictions, not observed visitor behavior.

## Scorecard

Scale: 1 major deficiencies; 2 substantial friction; 3 competent with meaningful gaps; 4 polished with limited weaknesses; 5 exceptional within inspected scope. Scores describe the inspected evidence, not the whole product.

| Dimension | Score | Evidence and confidence |
|---|---:|---|
| Visual craft | 4 | Strong desktop hero, disciplined type/color, relevant model visual; long page and small embedded UI details. Medium: two desktop first screens inspected. |
| Brand distinctiveness | 4 | Architectural change scenes, violet/mono system, technical specificity. Medium. |
| Story clarity | 3 | Comparison clear; history-to-decision progression and product/service boundary less clear. High from live content. |
| Product demonstration | 3 | Real viewer/dashboard images and 2m20s video; little annotated task/outcome evidence and no directly accessible full sample report. Medium. |
| Pricing clarity | 2 | Visible amounts and audiences; incomplete normalized entitlements, unclear commitments and overages, live/local unit conflict. High. |
| Buyer journey | 2 | Contact path exists, but plan-specific intent is weak and campaign plan CTAs lead to sample request. High for destinations; delivery untested. |
| Mobile experience | Not assessed | CSS and historical QA exist; no current rendered mobile inspection. |
| Accessibility | Not assessed | Partial semantic/source review only; no manual keyboard, zoom/reflow, contrast audit, or screen reader. |
| Performance | Not assessed | Resource sizes and architecture inspected; no repeatable live lab/field run. |
| Maintainability | 3 | Shared plan data in one component, tests/fallbacks present; English/Finnish and campaign/standalone routes can drift, and deployed/local billing unit differs. Medium. |

## Reference lessons, official sites visited 20 October 2026

| Pages observed | Pattern and why it matters | BIMSpect adaptation | Tradeoff / weakness |
|---|---|---|---|
| [Apple Mac](https://www.apple.com/mac/), [Compare Mac](https://www.apple.com/mac/compare/), [MacBook Air](https://www.apple.com/macbook-air/) | Strong hierarchy moves from a focused product image to highlights, detailed capabilities, then choice. Comparison presents like-for-like fields. | Keep one hero focal point; follow with a compact “what changes / what to do” proof; use a real side-by-side plan table. | Apple has broad brand recognition and physical products; its sparse copy cannot replace IFC scope, data, and commercial specifics. Its compare page is very long. |
| [Speckle](https://speckle.systems/), [pricing](https://speckle.systems/pricing/) | Names workflows and integrations; pricing defines users, projects, history, data region, usage and what happens at limits. | Define “active project,” version history, processing/retention, integration boundary, and upgrade state. | Speckle is a broader data platform; do not copy its capability list or compare amounts without scope and billing units. |
| [BIMcollab platform](https://www.bimcollab.com/en/platform/), [plans](https://www.bimcollab.com/en/plans/bimcollab-platform/), [demo](https://www.bimcollab.com/en/demo-request/) | Separates platform capabilities, plan units/commitment, and a demo page that says what happens after request. | State what “Talk to BIMSpect” produces and when; disclose monthly versus annual commitment. | BIMcollab has a large suite; its platform page is dense and sometimes broad in claims. Keep BIMSpect narrower and more concrete. |
| [Revizto pricing](https://revizto.com/pricing), [demo](https://revizto.com/book-a-demo), [home](https://revizto.com/) | Packages per user, per project, and enterprise by work mode; demo path sets expectations; role navigation supports varied stakeholders. | Explain why Individual covers several projects while Project buys a common team view of one project. | Revizto is a mature collaboration platform with different allowances; its many role links would overload BIMSpect’s smaller site. |

The reference pages are evidence of communication patterns, not evidence that those sites are accessible, fast, or commercially successful. No competitor price is used to infer a BIMSpect price level.

## Story, visual system, and page critique

**Current narrative:** revised IFC files arrive → BIMSpect detects differences → viewer filters/model scenes show them → analytics offers a bigger picture → report communicates them → buyer sees pricing. On [the homepage](https://bimspect.com/), the 4-step “Compare / Understand / Focus / Communicate” is the clearest end-to-end explanation. It arrives after a video, screenshot, category filter and service-room scene. On [What Changed](https://bimspect.com/what-changed), the three-step workflow stops at review, leaving the report as a separate request. Neither route shows one compact example of *change → review question → decision/report entry*.

**Proposed truthful sequence:** two IFC releases are supplied; BIMSpect compares elements and reports change types; the reviewer isolates a discipline/level/type; the team checks the model context and source versions; a report records the finding and next review action. If history/analytics are sold, show the same example across several dated releases, label the metric, denominator, and limits, and show the management question it answers. “Change intensity” is not design completeness, model quality, construction progress, or commissioning readiness. Auris Energy’s dataroom/advisory work is absent from these public marketing routes and should stay outside core plans.

| Section/template | Action | Reason and concrete direction |
|---|---|---|
| Home hero | **Keep/refine** | Preserve split composition and model. Replace “every design change immediately understandable” with bounded IFC language; one primary product CTA, one contact CTA. Make the final comparison state available without waiting for the long scroll. |
| Problem + demo | **Merge/refine** | State who receives revised IFCs and the specific coordination task. A captioned 30–45-second task clip or chaptered 2m20s video should show upload, filter, inspect and report; keep full video accessible. |
| Viewer screenshots + plumbing/electrical scenes | **Refine** | Keep the visually distinctive illustrations, clearly marked as illustrative; pair one with an enlarged actual UI crop and an annotated decision. Repeated “route changed” examples can be shortened. |
| Workflow | **Move earlier** | Place concise input → analysis → review → output steps immediately after the problem, then deepen with visuals. |
| Analytics | **Refine** | Explain the displayed measure, sample period, source comparison pairs, and decision supported. Label product screenshot versus illustration. |
| Sample report | **Refine** | The current preview shows counts and headings but little readable output. Offer a sanitized downloadable/viewable report before or alongside lead capture if approved; retain provenance and permissions. |
| Data handling | **Keep/refine** | EU processing, NDA/DPA, and ownership are valuable, but link to an actual privacy notice and precise retention/access terms once approved. Avoid certification language without evidence. |
| Pricing | **Refine** | Cards look orderly; the offer needs normalized comparison, definitions, commitment, limits and explicit sales steps. |
| Research/team/footer | **Keep/condense** | Named founders and research origin support credibility. Move compact trust proof before pricing; retain full bios below. Add accessible policy/contact links. |
| What Changed campaign | **Refine** | Strong first screen and product footage. Reduce competing CTAs; route plan discussion to a plan-aware enquiry and sample request to sample workflow. |
| Pilot campaign | **Keep targeted** | Current page serves invited pilot companies and is `noindex` in local source. Keep early-customer terms separate from public general pricing. |
| Finnish homepage | **Resolve parity** | Same core story and data statements, but no pricing and no equivalent English-style enquiry form. Decide whether it is an intentional market path and explain it; otherwise localize current approved pricing and CTA behavior. |

Visual rules: use one dominant message and one dominant image per section; target 55–70-character body lines; maintain a consistent content grid and 50/50 text/product compositions on desktop; use 16px minimum for explanatory labels and 18–20px for core body text; keep violet for actions and the changed/added/previous color system for model semantics. Crop product screenshots so key controls and legends can be read without zooming; provide a separate full-size view. Preserve licensed/attributed sample model credits. Motion should end in a stable, inspectable state; reduced-motion and static fallback should communicate the same information. On mobile, copy should precede each example, model captions and legend stay adjacent, and plan attributes should become a stacked comparison rather than a horizontally squeezed table. These are design specifications, not claims that the current mobile layout fails.

## Claims matrix

“Marketed” below means the site says it. Local code and screenshots are supporting context, not deployment or contract verification.

| Advertised claim/location | Evidence/status | Safer wording or action |
|---|---|---|
| “Every change” / hero | Live copy; no completeness evaluation or exception policy inspected. **Unverified absolute.** | “See changes between supported IFC model versions, including added, removed and modified elements.” Define comparison limits. |
| IFC2x3 / IFC4; browser-based / hero, data handling | Live statement and product UI screenshots; core code exists separately. **Marketed, partial implementation context.** | Keep, but publish file-size/model constraints and known unsupported cases once verified. |
| Added/deleted/modified, category/level filters / workflow | Live screenshot and copy; core frontend references comparison/history. **Demonstrated in presented UI, deployment/completeness unverified.** | Keep task-specific claim; link to a real inspectable example. |
| Analytics, history, heat maps, plain-language findings / analytics and post-pricing comparison | Live copy and dashboard image; core frontend contains history and analytics code, but commercial entitlement/deployment unknown. **Partially evidenced.** | Show dated source pairs, metric definition and output; avoid implying model-change metrics establish design completion. |
| Exportable/shared reports / sample report and plan cards | Live preview and product code references. Actual accessible sample and delivery not tested. **Marketed, output boundaries unverified.** | Publish one sanitized sample and list report contents/formats. |
| Automated tracking and one standard CDE integration / Project card | Live commercial claim; local plan data also asserts it. No approved integration catalogue or deployed verification. **Commercial availability unverified.** | Name supported integration routes or say “scoped with your team; one eligible standard connection included subject to API/auth review.” |
| EU project-file processing, data ownership, no AI training without permission / data handling | Live policy statements; no operational controls or signed DPA reviewed. **Marketed, not independently verified.** | Link to approved privacy/data processing terms and define storage, subprocessors and deletion process. |
| Aalto Research to Business and named team / research and team | Public bios and provenance statement; no independent verification performed. **Public identity/provenance claim.** | Keep if approved; do not imply Aalto endorses the commercial product. |
| Customer savings, certification, outcomes | No such quantified proof observed on inspected pages. **Not claimed here.** | Do not add without permissioned case evidence. |

## Pricing and conversion audit

The live [English pricing section](https://bimspect.com/#pricing) currently says Individual **€59/month**, one user, up to five active projects; Project **€1,490/month**, one active project, up to ten users, shared dashboards, automated tracking, one standard CDE integration, and additional users “at a preferential rate”; Enterprise **custom pricing**, multiple active projects and portfolio features. Prices exclude VAT/other applicable taxes. Project/Enterprise depend on agreed scope, data handling and technical feasibility; middleware, migration and nonstandard development may cost extra. The live [What Changed pricing bridge](https://bimspect.com/what-changed#pricing) repeats the amounts without the full entitlements. In local `components/data.ts`, Project is `€1,490` **`/project`**, which conflicts with live `/month`. Do not publish a revised unit until the approved offer and deployment are reconciled.

| Term | Individual | Project | Enterprise |
|---|---|---|---|
| Published price/billing unit | €59/month; per individual inferred from “one user” | €1,490/month live; one active project | Quotation; unit not stated |
| Users/viewers/guests | One user; guest/viewer rules not stated | Up to 10 users; extra users possible, rate not stated; guest/viewer rules not stated | Not stated |
| Active projects | Up to 5 | One | Multiple; count not stated |
| Uploads/models/processing limits | Manual IFC upload; limits not stated | Automated version tracking; limits not stated | Continuous monitoring; limits not stated |
| Version history | “IFC version comparisons”; retention not stated | Not stated explicitly on card | Not stated explicitly on card |
| Analytics/reports | Process analytics; exportable reports | Shared dashboards; reports not stated on card | Portfolio/org analytics; reports not stated on card |
| Integrations | Not stated | One “standard” CDE connection for documented API/standard authentication; eligible providers and setup limits not stated | Tailored; scope quoted |
| Onboarding/support | Not stated | Not stated | Custom onboarding/support |
| Data/security | Site-wide EU processing/NDA/DPA language; plan terms not distinguished | Same site-wide language; terms agreed | Same site-wide language; terms agreed |
| Term, setup, trial, cancel, renewal, archive, retention, limits | Not stated | Not stated | Not stated |

The cards separate audiences visually, but comparable entitlements do not line up. “Individual: five projects” versus “Project: one project” needs a one-sentence scope explanation: the first licenses one person's work across projects; the second licenses a shared team workflow on one project. This is copy guidance, not a verified contractual definition. A contact-only path after a displayed monthly price creates an expectation gap; state whether the buyer receives a quote, onboarding discussion, eligibility check, or checkout link and the expected response time if operationally approved. Avoid a new price recommendation until sales conversations, support cost, actual usage, willingness-to-pay, churn, and implementation effort are reviewed.

| Buyer scenario | Can choose? | Price/path and missing prerequisite |
|---|---|---|
| Independent coordinator, four projects | Likely Individual | €59/month shown; access process, processing limits and commitment unclear. Homepage “Contact us” goes to general enquiry. |
| Eight collaborators, one project | Likely Project | €1,490/month shown; need confirmation of user roles, integration eligibility and reporting. |
| Twelve collaborators, one project | Project plus extra users is suggested | “Preferential rate” has no amount or quote rule; buyer cannot estimate total. |
| Shared oversight across three projects | Likely Enterprise | Quotation path exists; portfolio metric/scope and minimum commitment unstated. |
| One project with custom CDE | Project or Enterprise depends on integration assessment | “Standard” boundary is only partly defined; custom work may cost extra. Ask for technical review before promising included integration. |

The homepage plan links carry the chosen plan into the editable question via `CampaignContactLink` and an in-page event, but that preservation depends on JavaScript and is invisible to a buyer until the form. Direct `#contact` entry has no selection. On What Changed, “Start individually,” “Discuss project access,” and “Discuss enterprise access” all target `#sample-report`, whose form requests a sample. This is a confirmed intent mismatch. The form has labeled required fields, native validity, an error/status region, Turnstile, and a fallback contact email in source. The success copy says only “We’ll be in touch shortly”; it does not say whether a report will be sent, when, or how. Submission, server acceptance and delivery remain untested. A dedicated privacy policy is not linked because `privacyHref` is `null`; `/privacy` and `/terms` return 404.

## Findings and implementation backlog

Effort is a rough delivery estimate, excluding legal/commercial approval. P0 requires an observed critical blocker or serious exposure; none was confirmed.

| ID / priority | Evidence, audience and consequence | Recommendation, effort/dependency, acceptance check |
|---|---|---|
| F01 / P1 | Live `/#pricing` Project unit is `/month`; local `components/data.ts` is `/project`. Buyers and editors can infer different contracts. High confidence. | Obtain approved billing unit and deployed SHA; align every card, bridge, checkout/application and FI copy. Small code effort, commercial approval required. Acceptance: identical approved unit and tax/term wording on every public route and offer document. |
| F02 / P1 | `what-changed#pricing` plan CTAs all lead to sample-report form. Team/enterprise buyer cannot express plan intent there. High confidence. | Route to a plan-aware enquiry or carry interest to a clearly labeled form; retain distinct sample request. Small/medium. Acceptance: each CTA opens a form stating the selected purpose, including direct-link and keyboard paths. |
| F03 / P1 | Cards omit key comparable terms and total overage price; Project and Individual list different feature types. High confidence. | Add normalized comparison and definitions, approved term/limit FAQ, and “what happens next.” Medium, commercial/legal input. Acceptance: scenario tests identify correct plan and remaining quote questions without facilitator explanation. |
| F04 / P1 | `/fi` lacks pricing while `/` shows full cards; FI ends in “request analysis / book demo.” Finnish visitor has a different buying path with no explanation. High confidence. | Decide intentional market differentiation or publish localized approved offer with equivalent CTA. Medium, commercial/localization approval. Acceptance: language-switch test preserves equivalent task and routes; differences explained. |
| F05 / P1 | Hero “every change” and several management analytics phrases exceed proof supplied in audit. A decision maker may read completeness/completion into change metrics. Medium confidence. | Bound claims, publish metric definitions and known limits; demonstrate one review-to-decision example. Medium, product validation. Acceptance: product owner signs off claims matrix against deployed behavior and sample data. |
| F06 / P2 | Homepage sample report is a preview of counts/headings; the full output is gated. A buyer cannot evaluate report usefulness. High confidence. | Publish one sanitized, permissioned PDF/HTML sample with a clear example conclusion, source versions, legend and limits; keep enquiry option. Medium, sample approval. Acceptance: first-time reviewer can explain what decision the report supports without submitting contact details. |
| F07 / P2 | Public data-handling statements lack linked privacy/retention detail; `/privacy` and `/terms` are 404. Procurement questions remain. High confidence. | Publish approved privacy notice and concise data-handling FAQ (storage, retention/deletion, subprocessors, DPA request). Medium, legal/security input. Acceptance: footer and forms link to live reviewed documents; no unsupported certification claims. |
| F08 / P2 | Three model scenes plus demo and screenshots make a long page with repeated “changes visible” message. Desktop visual inspection and content sequence support this; mobile unknown. Medium confidence. | Move short workflow up, keep best illustrative scene per idea, pair with actual UI crop and decision caption, condense repetition. Medium design/content. Acceptance: user task test can describe input, output and next action in 60 seconds. |
| F09 / P2 | Source has three WebGL experiences, GSAP and videos; historical local QA measured smooth frames, but live mobile/load unknown. Medium confidence as risk, not failure. | Run production mobile/desktop lab and field monitoring, then optimize measured bottleneck. Medium, measurement first. Acceptance: documented URL/tool/profile/run count and p75 field LCP≤2.5s, INP≤200ms, CLS≤0.1 when enough field data exists. |
| F10 / P2 | Static accessibility tree shows skip link, headings, labels and video controls; no keyboard/zoom/screen-reader sweep completed. Low confidence for defects. | Complete WCAG 2.2 AA audit across templates at 320 CSS px/200% zoom, keyboard, reduced motion, focus and media alternatives. Medium. Acceptance: confirmed failures cite criteria, are fixed, and are manually retested. |

No WCAG failure is asserted from an incomplete inspection. The relevant checks include 1.1.1 non-text content, 1.2.2 captions where video contains speech, 1.4.3 contrast, 1.4.10 reflow, 2.1.1 keyboard, 2.2.2 pause/stop/hide where applicable, 2.4.7 focus visible, 2.4.11 focus not obscured, 2.5.8 target size (minimum), and 3.3.1/3.3.2 form error and instructions; verify applicability against [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/). A larger 44px preferred touch target is a usability choice, distinct from 2.5.8's 24×24 CSS px minimum and exceptions.

## Proposed page architecture and copy

| Order | Homepage section: visitor question / message | Evidence, action, mobile treatment |
|---|---|---|
| 1 | Hero: “Is this for my IFC review?” / compare successive IFC versions and focus coordination review. | Stable labeled model comparison, one product CTA and contact CTA; static final frame on compact/reduced motion. |
| 2 | Problem + four-step workflow: “What do I supply and receive?” / versions → structured differences → focused review → report. | Real input/output thumbnails; vertical steps on mobile. |
| 3 | Worked example: “What decision changes?” / selected element change, model context, review question, report note. | Enlarged real UI and sanitized report excerpt; swipe-free stacked sequence on mobile. |
| 4 | History/analytics: “What changes over time?” / compare dated releases, explain measure and limits. | Chart with labels, denominator and source pairs; accessible text table on mobile. |
| 5 | Fit and proof: “Will this work with my files and practice?” / supported IFC, authoring/CDE relationship, sample and data handling. | Short technical facts and link to full data page; compact cards on mobile. |
| 6 | Plans and next step: “Which access and what happens after contact?” | Three concise cards plus comparison link; one column and sticky-free CTA on mobile. |
| 7 | Team/research/footer: “Who is accountable?” | Named founders, research origin, legal/policy/contact links; compressed bios. |

The pricing journey should present (1) choose by work mode, (2) three current approved offers, (3) same-row entitlement table, (4) definitions of user/active project/CDE connection and what changes at limits, (5) tax/term/onboarding FAQ, (6) plan-aware enquiry with expected process. Keep contract detail in disclosure and sales documentation rather than the homepage hero. Preserve current live prices pending F01 resolution.

**Copy drafts, subject to product/commercial verification:**

* Hero A — **“See what changed between IFC releases.”** “Compare model versions, isolate the elements that need review, and bring clearer evidence to the next coordination meeting.” CTA: **“See the workflow”**; secondary **“Talk to BIMSpect.”**
* Hero B — **“Turn model revisions into a focused review.”** “BIMSpect organizes changes between IFC versions so BIM coordinators and design managers can inspect the context and communicate the next action.” CTA: **“Watch the product walkthrough.”**
* Workflow — “Upload the IFC versions you want to compare. Review added, removed and modified elements by model category or level. Inspect important changes in context, then use the findings in a coordination report.”
* Plan position — **Individual:** “One specialist working across several projects.” **Project:** “One shared project review for a coordination team.” **Enterprise:** “A scoped portfolio view for multiple projects.” These describe the current marketing direction, not verified entitlements.
* Contact clarification — “Tell us which plan and IFC/CDE setup you are considering. We will confirm fit, scope and next steps before any project files are shared.” Add a response-time promise only if operations can meet it.
* Metrics clarification — “Change counts describe differences detected between the selected model versions. They do not by themselves measure design completeness, model quality or construction progress.”

## Validation and readiness

1. **Commercial truth gate:** product, sales and legal approve a single offer source containing billing unit, term, overages, project definition, eligible integrations, support, data handling and cancellation. Capture deployed commit/hash and compare live text before release.
2. **Comprehension:** run five moderated or unmoderated first-visit tasks with BIM coordinators and design managers. Ask what the user supplies, what BIMSpect returns, what one change means, what history adds, and what they would do next. Record answers and hesitation rather than claiming a forecast lift.
3. **Plan selection:** test the five scenarios above with buyers. Success means correct plan or explicit “needs quote,” correct price unit, and accurate prerequisites. Record wrong choices and questions.
4. **Journey instrumentation:** if analytics consent/policy permits, record `demo_play`, `sample_open`, `pricing_view`, `plan_select` with tier, `contact_start`, `form_error`, and `form_success`. Avoid project/customer identifiers. Treat form success as server acceptance only; separately verify actual sample delivery in an authorized test environment.
5. **Technical QA:** inspect `/`, `/fi`, `/what-changed`, `/pilot` at approximately 390×844, 768×1024, 1024×768 and 1440×900 CSS px in current Chrome plus Safari/iPhone where available; test direct anchors, back/refresh, reduced motion, WebGL/video failure, keyboard focus, 200% zoom and 320px reflow. Check headings, landmarks, alt text, focus, form states, captions and contrast. Do not call the site WCAG conformant from an automated scan alone.
6. **Performance:** measure production pages in repeatable mobile/desktop profiles with recorded network, cache, device, tool version and at least three lab runs. Check CrUX/RUM field data at p75 separately for mobile and desktop. Google's current [Core Web Vitals guidance](https://web.dev/articles/vitals) uses LCP≤2.5s, INP≤200ms and CLS≤0.1; Lighthouse navigation TBT is not field INP. Investigate hero canvas, 8.2MB attributed video, large poster/portrait assets and deferred scene loading only after measurement.

**Five actions with the most value:** reconcile the billing unit; repair plan CTA intent; define and compare entitlements; publish one readable decision-oriented sample; and show the full IFC-to-report workflow near the top. **Unresolved decisions:** approved Project billing unit/term, extra-user and integration scope, EN/FI commercial parity, report availability, and exact metric definitions. **Ready to release:** all public offer text matches approved terms; buyers in scenario tests choose or request a quote correctly; sample and contact purpose remain clear throughout; priority WCAG findings are fixed; and production performance has a measured baseline with no critical mobile or keyboard blocker.
