# Homepage refinement: implementation and review

## Audit and reference

The existing homepage was inspected before editing: navigation, every product
section, video/screenshots, workflow, analytics, report, trust/research, team,
pricing, shared campaign form, CTA and footer. Both `/` and `/fi` were rendered
at 1440×900, 1280×800, 1024×768, 768×1024 and 390×844.

The current [Apple homepage](https://www.apple.com/) and
[MacBook Pro page](https://www.apple.com/macbook-pro/) were reviewed for
hierarchy, whitespace and progressive storytelling. No Apple fonts, copy,
graphics, assets or CSS were copied. BIMSpect's DM Sans/DM Mono, violet accent,
existing content architecture and real product screenshots remain.

## Requested final report

1. **Old hero problems:** the multidisciplinary building competed with its
   message; too many highlighted parts, labels and technical networks obscured
   the architectural silhouette. A separate architectural example made four
   experiences. Font aliases resolved outside the scope of `next/font` variables,
   causing unintended serif fallback across the page.
2. **Removed:** the fourth architectural experience, hero MEP networks and
   excess technical geometry, on-model markers, secondary change buttons,
   pointer/idle rotation logic, redundant animation fields and unused Drei
   dependency. Genuine product screenshots and their attribution were retained.
3. **Simplified architecture:** a five-storey office with a connected
   three-storey cutaway wing, readable slabs, walls, glazing, columns, core and
   limited partitions. One elevated three-quarter camera, approximately 7%
   closer during the reveal, then a small lateral settle; no orbit or idle spin.
4. **Six architectural changes:** wall moved 300 mm, resized window, relocated
   entrance door, added partition, added facade panel and removed canopy. Counts
   are derived from these actual illustrative change groups: 2 added, 3 changed,
   1 removed. Geometry dimensions use metres; counts are not real project data.
5. **Hero sequence:** Version A → Version B → highlighted changes/counts and
   closing message. Desktop pin lasts 140vh, only at width ≥1000px and height
   ≥680px. Mobile uses a shorter unpinned progression. Reduced motion and failed
   WebGL remove pinning and show an understandable static comparison. Headline
   crossfades no longer overlap.
6. **Plumbing placement:** the existing model-context section, after category
   filtering and before workflow; model left and explanation right on desktop.
7. **Plumbing environment:** a service room with a slab/open shaft, two walls,
   columns, connected domestic-water and drainage risers, manifold/pump, valves,
   supports and floor penetrations. It is an illustrative room, not an IFC export.
8. **Plumbing changes:** riser moved 400 mm, pipe rerouted 420 mm, new branch to a
   valve connection. Previous routes remain faint ghosts; replacement and added
   geometry use the shared violet palette. Cylinder rotations were corrected
   and tested so generated pipes connect their intended endpoints.
9. **Electrical placement:** later within the existing analytics/value section,
   after the dashboard, with ordinary workflow content separating the models.
10. **Electrical environment:** office electrical ceiling/riser coordination
    zone with floor slab, shaft, walls/columns, partial ceiling, board, suspended
    main/secondary trays, bends, supports, branch junction and service opening.
    Rear-only ceiling detail keeps the changed route visible.
11. **Electrical changes:** main tray routed around a new partition, new branch
    connected to a junction box, electrical riser moved 400 mm. Prior routes
    ghost out; the new partition is context, not a fourth service-change count.
12. **Secondary scroll:** both use `useModelScrollReveal`, a compact 78% → 32%
    viewport ScrollTrigger range, native scrolling, no pin or buttons. Mobile
    plays once on entry and retains the final state; reduced motion starts final.
    A slight camera settle, ghost/replacement reveal, highlights and two HTML
    notes are shared rather than duplicated timelines.
13. **Typography:** repaired DM font aliases on `body`; short localized headings,
    responsive `clamp()` sizes, generally 18–20px homepage body and 15–17px
    supporting copy. Paragraphs are bounded; form labels, report lists, captions,
    attribution and team bios were enlarged where necessary.
14. **Readability/contrast:** copy and annotations stay outside geometry; stable
    navigation surface, darker muted text, clear violet CTA, less card framing,
    calmer section rhythm. Major text/CTA color pairs were checked against 4.5:1;
    this is not a claim of a complete WCAG audit. All changes remain described in
    HTML, including the third secondary change not shown as a visible note.
15. **Mobile:** copy precedes each secondary visual; models are recomposed and
    detail reduced, no hero pin, no hover-dependent information, DPR ≤1.5.
    Navigation switches to the existing menu below 1100px to avoid 1024px
    wrapping. English/Finnish headings and controls were reviewed independently.
16. **Performance:** exactly three canvases after visiting all examples, only
    the hero initially. Secondary scene code/initialization is deferred until
    near the viewport (250px margin). Instanced geometry, shared lighting/palette,
    demand rendering and an 80ms bounded smoothing tail avoid an idle loop.
    Offscreen/hidden scenes stop scheduling draws. No HDR, textures, shadow maps,
    postprocessing or smooth-scroll dependency. Native Mac Chrome measurements:
    median frame intervals 16.6–16.7ms during scrolling (~60fps), p95
    17.4–17.6ms; zero idle/background GPU draws. Across two runs, the measured idle
    page spent ~9–11ms/s in browser tasks, ~0.9–1ms/s in script. These are local measurements,
    not guarantees for other devices. Initial compressed JS was 444,609 bytes;
    the largest shared Three/R3F chunk was 244,466 compressed bytes.
17. **Files removed:** `components/hero/ChangeMarkers.tsx` and
    `components/models/ChangeToggle.tsx`. Both belonged to the pre-existing
    uncommitted 3D implementation. The separate architecture branch was removed
    from model types, geometry, fallback, localization and homepage composition.
18. **Files created for this refinement:**
    `components/models/change-palette.ts`,
    `components/models/useModelScrollReveal.ts`,
    `components/models/useSceneInvalidation.ts`,
    `test/homepage-readability.test.ts`, and this review. The existing working-tree
    hero/model implementation was untracked at the initial audit; its additions
    represent refactored existing experiences, not extra models.
19. **Files modified:** see the inventory below. Business logic, routes, metadata,
    SEO, CRM payloads, analytics/UTM, Turnstile and payment gating were retained.
    No secret values were printed or committed. Existing Docker fixes were
    retained; no duplicate Docker configuration was introduced by this redesign.
20. **Checks:** Docker builder-stage `npm run lint` (zero warnings),
    `npx tsc --noEmit`, and all **60 tests passed**. Locked dependencies use
    `npm ci` inside Docker, not host `node_modules`. Production `npm run build`
    completed inside the multi-stage build. A pre-existing Node test-module-type
    warning remains non-fatal.
21. **Docker (original redesign QA, before separation):** `docker compose up -d --build` executed successfully.
    `bimspect_website-web-1` runs `bimspect-website:latest`, is healthy and maps
    host/container port 3000. `/` and `/fi` return HTTP 200. Runtime uses Node 22,
    Next standalone output and a non-root user. The existing local nginx test
    container on 8081 was left intact; the website is directly accessible at
    [localhost:3000](http://localhost:3000). This is historical validation; the
    subsequent Docker separation uses `bimspect_website_local-web-1` and
    `bimspect-website:local`. See `DEPLOYMENT.md` for current architecture.
22. **Remaining visual/operational review:** see the critique and configuration
    limitations below. The site is locally operational, not certified for live
    production campaign/payment processing or every mobile GPU.

## Modified-file inventory and reason

| File(s) | Reason |
| --- | --- |
| `components/home/HomePage.tsx` | Exactly three experiences; contextual secondary placements; restore genuine screenshot instead of fourth model. |
| `content/home.ts` | Short localized headings, truthful illustrative counts/change descriptions, remove obsolete click/architecture copy. |
| `app/globals.css` | Font-variable scope fix, responsive hierarchy, contrast, spacing, navigation and reduced visual clutter. |
| `components/campaign/campaign.module.css` | More readable labels/privacy text; no form logic changes. |
| `components/hero/{BimBuilding,BimScene,BimspectHero}.tsx` | Architectural-only scene, fixed camera, viewport-aware demand rendering and fallback. |
| `components/hero/{bim-geometry,hero-motion,useHeroAnimation}.ts` | Six physical architectural changes and focused hero-only scroll sequence. |
| `components/hero/hero.module.css` | Text/model separation, two below-model notes, legible counts and non-overlapping headline transition. |
| `components/models/{DisciplineModel,ModelCanvas,ModelFallback,SceneLighting}.tsx` | Automatic room-based comparisons, shared lighting, independent fallback and lazy scene initialization. |
| `components/models/{model-geometry,model-types}.ts` | Two disciplines only; connected routes, actual shafts/openings, realistic supports/equipment and motion types. |
| `components/models/models.module.css` | Borderless responsive visuals and stable, accessible HTML captions. |
| `package.json`, `package-lock.json` | Remove unused Drei and its unnecessary transitive payload. |
| `test/{hero-model,discipline-models,homepage-flow}.test.ts` | Accurate geometry/count/scroll/connectivity tests and preserved server-rendered business-flow contracts. |
| `README.md` | Three-model architecture, renderer behavior and Docker validation workflow. |

`HeroContent.tsx`, `InstancedParts.tsx` and `SceneBoundary.tsx` remain supporting
parts of the implementation present at the initial audit. `HeroVideoPreview.tsx`, Docker
production infrastructure, application business integrations and unrelated
`build.log` were not removed.

## Browser verification

The browser sweep covers both locales and all five required sizes, every major
section, lazy loading, exactly three canvases, the single desktop hero pin,
automatic secondary comparisons, zero horizontal overflow, DM font resolution,
mobile menu, CTA/interest behavior, language-switch UTM retention, checkout gating
and campaign/unsubscribe/payment routes. **All browser assertions passed**;
observed cumulative layout shift was **0** in all ten locale/viewport runs, with
no captured application, shader or hydration errors. Reduced-motion static comparisons,
independent WebGL context-loss fallbacks and unavailable-WebGL HTML/SVG fallbacks
were checked. An additional failed-WebGL desktop check verifies hero pin removal.

Screenshots were reviewed and used to fix overlapping hero headlines, ceiling
geometry obscuring the electrical reroute and navigation wrapping at 1024px.
QA artifacts are local temporary files under `/tmp/bimspect-hero-browser`, not
production assets or checked-in browser dependencies.

## Final critical review

- **Still busy:** authentic product screenshots contain dense BIM UI. They remain
  genuine proof rather than being cosmetically fabricated; their surrounding
  headings/copy explain the point without requiring the tiny UI to be read.
- **Copy:** Finnish is inherently longer; some sections have more lines than
  English. Bounded columns and larger supporting text improve scanning, but the
  research/security material remains more information-dense than the model story.
- **Change visibility:** the removed canopy is deliberately quiet, and old pipe
  routes are faint. Review these on a bright physical phone; increasing every
  color would undermine the requested hierarchy.
- **Hierarchy:** the hero leads; secondary models have supporting roles. Pricing
  retains its existing comparison cards and business detail, rather than losing
  useful information solely to mimic the reference's minimalism.
- **Mobile compromise:** service fixtures/tiny tray details are reduced and
  secondary scenes play once instead of requiring continuous scrub. Mobile QA
  used Chrome viewport/touch emulation, not a physical iPhone/Safari test.
- **Animation:** only the desktop hero pins; secondary changes and existing
  restrained section reveals remain. Demand smoothing stops after 80ms without
  updates, rather than running an invisible continuous model loop.
- **Performance:** the shared Three runtime still costs about 239KiB compressed.
  The final software-GPU sweep showed a 1.564-second cold long task on its first
  desktop load; later viewport runs did not reproduce it. This includes shader
  compilation/browser work, not a measured real-phone load time. Native Metal
  scrolling was smooth. Older phones,
  Safari/WebGL driver behavior and cold-load real-network timings need physical
  device validation. Do not interpret the local ~60fps result as universal.
- **Security:** `npm audit --omit=dev` reports pre-existing **critical Next.js**
  and **high Sharp** advisories (two production findings). Dependency remediation
  was not folded into this UX change; patch/retest before production deployment.

## Environment limitations

`.env` remains ignored. CRM URL exists locally, but these values are blank:

- `BIMSPECT_CRM_API_SECRET`
- `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET` (for the protected CRM)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (configure as a pair)

The main website works without them. Real CRM lead/visit delivery and live
Turnstile verification were not tested; do not assume successful delivery.
Rebuild after changing the public Turnstile site key.

`PAYMENT_PROVIDER=mock`, `CHECKOUT_ENABLED=false` remain safe defaults. Revolut
secrets are blank and its adapter is not approved/implemented for production;
keep live checkout disabled. No production credentials were invented.

## Local operation

Docker architecture has since been separated: these commands explicitly use the
local configuration. `docker-compose.yml` is now production-only; see `DEPLOYMENT.md`.

```bash
# Start / stop without deleting containers, networks or volumes
docker compose -f docker-compose.local.yml up -d
docker compose -f docker-compose.local.yml stop

# Rebuild and start
docker compose -f docker-compose.local.yml up -d --build

# Inspect
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs --tail=100 -f web
curl -I http://localhost:3000
curl -I http://localhost:3000/fi
```
