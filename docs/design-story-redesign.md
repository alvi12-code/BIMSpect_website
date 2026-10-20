# English homepage design story handoff

This document records the first redesign. See the
[connected history update](design-story-connected-history.md) for the subsequent
interactive model and review improvements and their separate verification record.

## Purpose and scope

The redesign presents BIMSpect as a way to understand an evolving design:
**Every revision. A clearer picture.** The English homepage previously led with
three separate A/B model illustrations. The new experience follows one building
through a connected history, from revisions and recurring changes to element
evidence and a coordination discussion.

Work started from marketing-repository commit
`ccd66c1b9f09140f1f5bf08e442ceb16bc7f09dd`. Changes cover the English homepage,
English narrative/metadata, the new story components, and related tests/docs.
Finnish content and its legacy hero/plumbing/electrical experience remain in
place. The existing product video, screenshots, attribution and business paths
continue alongside the new narrative.

This checkout does **not** contain the separately reported local F02 enquiry
remediation. This redesign did not change API routes, pricing terms, enquiry
implementation, payment behavior or deployment infrastructure. No website
deployment was performed. A successful local preview does not establish which
revision the public website serves.

## The visitor journey

The introduction is server-rendered, with the established demo and contact
links. Five chapters then reuse the same building and source history:

1. **Build the history:** six IFC releases establish a sequence to explore.
2. **Follow the changes:** select a release to see geometry, movement and
   information events. An information update can count without changing shape.
3. **Find the pattern:** see repeated element changes and event totals across
   ARC, STR and MEP, with the reporting scope visible.
4. **Investigate an element:** follow the east-wing supply route through its
   movement, section and information updates while retaining building context.
5. **Focus the review:** bring that route, the nearby partition and the beam
   into a concrete question for the coordination team.

Later sections reuse the example for cross-discipline context and an
illustrative report. Shared location and change history define a useful review
scope; they do not establish causation, a clash or an engineering conclusion.
The actual product walkthrough remains available after the illustration.

## One fixture, explicit definitions

`story-data.ts` owns the synthetic Northline history. The detailed architectural
context contains additional drawing geometry; **only twelve example elements
are tracked by the displayed counts**. Their identifiers remain stable across
all six releases. R01 is the baseline, and events are recorded from R02 onward.

| Release | Cumulative events | Elements changed in release | Repeated elements | No recorded change |
| --- | ---: | ---: | ---: | ---: |
| R01 | 0 | 0 | 0 | 12 |
| R02 | 5 | 5 | 0 | 7 |
| R03 | 10 | 5 | 2 | 4 |
| R04 | 14 | 4 | 3 | 3 |
| R05 | 16 | 2 | 3 | 2 |
| R06 | 18 | 2 | 3 | 2 |

An event is one recorded change to a tracked element in a release; it is not a
new unique element. “Repeated” means changed in more than one release. Final
discipline event totals are ARC 6, STR 5 and MEP 7. The selected `MEP-041` route
has five events. Its related partition and beam each have three.

The scene, fallback, chapter evidence, context card and report read this shared
fixture. Transforms apply sequentially only through the selected release;
seeking backwards reconstructs the earlier state. Invalid revision inputs are
clamped or resolved to the baseline. These sample counts are **not EBF scores,
risk estimates, design-completion percentages or project-wide measurements**.

## Product and research evidence

The story was grounded in read-only inspection of the core product repository
`alvi12-code/IFC-web` at
`0bfce9f2241b163a44ddfc129379cc35cdce9038`. That inspection verified frontend
components and API contracts, not deployed/backend behavior or customer results.
Relevant evidence at that fixed revision includes:

- [`DisciplineAnalytics.tsx`](https://github.com/alvi12-code/IFC-web/blob/0bfce9f2241b163a44ddfc129379cc35cdce9038/src/pages/DisciplineAnalytics.tsx): model-transition history, category analytics, review focus and source/evidence information.
- [`ElementEvolutionPanel.tsx`](https://github.com/alvi12-code/IFC-web/blob/0bfce9f2241b163a44ddfc129379cc35cdce9038/src/components/buzz_view/ElementEvolutionPanel.tsx): GUID-level revision history and repeated changes.
- [`ProjectChangeIntelligence.tsx`](https://github.com/alvi12-code/IFC-web/blob/0bfce9f2241b163a44ddfc129379cc35cdce9038/src/components/analytics/ProjectChangeIntelligence.tsx): discipline trends, concentration, repeated/late changes, evidence drill-down and linked Reviews.
- [`designIntelligenceReportUtils.ts`](https://github.com/alvi12-code/IFC-web/blob/0bfce9f2241b163a44ddfc129379cc35cdce9038/src/components/analytics/designIntelligenceReportUtils.ts): stakeholder reporting and explicit rule-based methodology limits.

The supplied `master_Majid_Umer_2025.pdf` provides research context: printed
page 2 (PDF page 9) discusses design history; printed pages 29–32 examine
per-element iterations; page 35 connects the analysis with manager review.
Pages 40–41 describe limitations, including two Finnish retail projects and six
structural categories. These support the history-and-review narrative, not a
general claim of validated predictive performance. The marketing fixture is
new illustrative data, not a reproduction of the thesis's project results.

BIMSpect core remains distinct from Auris dataroom progress, scheduling and
commissioning analytics; the redesign does not import those claims.

## Implementation map

| File | Responsibility |
| --- | --- |
| `components/home/HomePage.tsx` | English story selection and shared page integration; Finnish legacy path |
| `content/home.ts` | English metadata and section narrative; unchanged Finnish copy |
| `components/design-story/DesignStoryHero.tsx` | Server-rendered introduction, headline and established links |
| `components/design-story/DesignStory.tsx` | Five chapters, release controls, evidence panels and renderer lifecycle |
| `components/design-story/story-data.ts` | Releases, stable elements, events, transforms and summary calculations |
| `components/design-story/story-geometry.ts` | Shared architectural context and model datum |
| `components/design-story/StoryScene.tsx` | WebGL model, camera framing and chapter emphasis |
| `components/design-story/StoryFallback.tsx` | SVG projection from shared geometry and selected history |
| `components/design-story/DesignContextEvidence.tsx` | Related ARC/STR/MEP elements and their recorded counts |
| `components/design-story/DesignReportPreview.tsx` | Clearly labeled illustrative summary derived from the same history |
| `components/design-story/design-story.module.css` | Story layout, responsive presentation and interaction styling |
| `test/design-story.test.ts` | Data, count, transform and fixture-integrity regression tests |

The WebGL scene loads near the viewport and uses demand rendering. Visibility
and reduced-motion state are passed into its lifecycle. Chapter controls use a
tablist with arrow/Home/End handling; release buttons expose their selection.
Descriptions, numerical evidence and links remain HTML. The SVG fallback uses
the same geometry and data rather than an unrelated placeholder, and updates
when a release or chapter changes.

## Run and verify locally

From the repository root, install the locked dependencies and start development:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/` for the new English story and
`http://localhost:3000/fi` for the retained Finnish experience. Basic visual
review does not require a real CRM submission. For a production-mode local
preview, stop the development server, then run:

```bash
npm run build
npm start
```

Run the data checks and TypeScript gate with:

```bash
node --test --experimental-strip-types test/design-story.test.ts
npx tsc --noEmit
```

`npm test` runs the repository's broader test collection. The existing Docker
workflow remains documented in the README; use its explicit local Compose
configuration rather than changing production ports or networks.

## Verification record and remaining acceptance

Final local verification on 20 October 2026:

| Check | Observed status |
| --- | --- |
| Shared fixture tests | 8 passed, 0 failed, including backward seeks, information-only events, immutability and revision clamping |
| Existing homepage/model regression checks | Four existing test files plus the new fixture test file reported passing |
| TypeScript and scoped lint | Passed; the production build also completed its TypeScript check |
| Production build | Final `npm run build` passed after the fallback, report and responsive navigation changes; all 17 static pages generated |
| Production-mode local preview | Chromium; desktop viewport 1363 px and responsive iframe viewports 390 px and 768 px inspected; one h1 and no page-wide horizontal overflow in the checked layouts |
| WebGL in the available browser | Context creation failed; the GPU-rendered scene was not visually validated |
| Fallback interaction | Chapter selection, arrow-key focus, backward release selection, baseline counts, element history and the final review brief worked with the SVG rendering path |
| Responsive navigation | Removed the observed extra vertical scrollbar from the chapter strip; horizontal chapter scrolling remains intentional on narrow screens |
| Report and navigation | Sample-report navigation reached the new summary, showing 6 releases, 18 events, 3 repeatedly changed elements and the route's 5 events; no forms were submitted |

Screenshots of the actual inspected fallback are in
`docs/design-story-previews/desktop-2026-10-20.jpg` and
`docs/design-story-previews/mobile-2026-10-20.jpg`. The mobile image is a
390 px iframe viewport, not a physical-device test. The detailed fallback was
also rendered directly from the React component and visually inspected.

Remaining visual acceptance is a hardware-enabled WebGL pass, actual mobile
device checks, and an emulated reduced-motion pass. The reduced-motion branch
is implemented and reviewed, but it was not separately exercised in this
browser. Finnish follows the unchanged legacy render path by source review;
its browser behavior and the separately reported local F02 remediation were
not revalidated here. No live CRM receipt or report delivery was tested.

`test/model-browser-qa.mjs` assumes the former English three-model experience.
Its selectors and assertions must be updated before it can validate this flow.
The older hero/model tests remain useful for retained legacy components, but
their success alone does not verify the new English interaction. Publication
requires a separate deployment decision against the intended target revision.

## Integrating with the existing F02 work

The source branch is `feat/design-history-homepage`. Save the local F02 work
in a commit first, then fetch and merge this branch into that checkout:

```bash
git fetch origin
git merge origin/feat/design-history-homepage
```

Alternatively, apply the previously delivered patch after reviewing its diff.
Check it first with `git apply --check BIMSpect_frontend_story.patch`.
If the check succeeds, `git apply BIMSpect_frontend_story.patch` applies the
frontend changes without creating a commit. Preserve the existing F02 files
and any local modifications when resolving a context conflict. Do not replace
the whole homepage or test file with a copy from the original base: the user's
F02 handoff describes a local change to the sample-report link and its test.

The patch does not include pricing data, campaign-link/form implementation,
submission code, lead routes, dependencies, build configuration or temporary
preview launch adapters. It also does not resolve F01's approved billing
cadence. Rerun the existing enquiry-intent and lead tests in the combined local
checkout before using that combined tree for a release.
