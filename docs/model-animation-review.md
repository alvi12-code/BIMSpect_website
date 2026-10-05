# BIMSpect model animation refinement — 2026-10-04

Scope: exactly the existing architectural hero, plumbing service room and electrical
ceiling/riser comparison. No fourth model, new runtime dependency, production
Docker change, secret, automatic commit or push. Earlier Docker separation work
in the working tree is preserved, not overwritten by this refinement.

## 1. Why the animations were too fast

The pre-change code used a 140vh hero, with all revision geometry completed by
49% of that range. Secondary desktop models scrubbed a short viewport range and
stopped mid-comparison when scrolling stopped. On a stationary desktop audit they
stayed at progress 0.283. Phone timelines used a 1.15s eased reveal: progress was
already 0.582 after 300ms. Readiness was reported before the first render, and
visibility observation used the whole figure rather than the actual model viewport.

Before editing, the original three scenes were exercised in native Chrome desktop
and touch emulation, plus desktop/mobile WebKit. Application, GSAP, ScrollTrigger,
hydration and ResizeObserver error logs were clean. The upstream Three clock
warning below was present already. Direct Edge launch failed at browser startup;
native Safari session creation timed out, neither of which was a website defect.

## 2. Hero timing

Fine-pointer/hover desktops >=1000px wide and >=680px high:

| Scroll progress | Story | Geometry |
|---|---|---|
| 0–22% | Normal architectural model | Stable |
| 22–40% | Version A | Stable |
| 40–65% | Revised objects and old outlines | Only changed objects transition |
| 65–100% | Version B, six changes, counts/notes | Stable final comparison |

The closing headline begins at 80%; counts/notes fade in just after 65%.
A single 700ms emissive emphasis settles back to a steady highlight. No repeated
pulse, spinning building, aggressive snap or continuous camera orbit.

## 3. Hero distance

**220vh**, with `scrub: 0.5`. The final geometry gets 35% of the story for inspection.
This is a scroll distance, not a fixed number of seconds. Camera movement is
limited to a 5% fit adjustment and a small lateral settle in the same three-quarter
view; reduced motion disables both.

## 4. Architectural palette

Warm concrete `#e7e1d5`, warmer slabs `#c9c5bc`, graphite structure `#37434a`,
blue-gray glass `#7697a8`. Normal geometry softens toward light warm neutrals in
comparison view without disappearing. Glass is opaque on compact/touch devices.

## 5. Change semantics

- **Changed:** red `#ff3b30`, solid surface and darker outline.
- **Added:** cyan `#00aeef`, solid surface and a darker boundary/HTML plus sign.
- **Previous/removed:** amber `#ff9500`, ghosted surface and dashed edges/HTML key.

Brand buttons/headlines retain the existing BIMSpect violet. Dark, readable HTML
labels carry meaning independently of color. At most two change annotations per
scene; no critical text is placed on moving geometry. The service key says
“Previous route,” not “Removed,” because rerouted services are not extra removals.

## 6. Architectural changes

Same six examples: wall moved 300mm; resized window; relocated entrance door;
added partition; added facade panel; removed canopy. Counts still match geometry:
**2 added / 3 changed / 1 removed**. The cutaway wing exposes the interior wall,
and the three-quarter view exposes the window, door, panel and canopy.

## 7. Plumbing changes

Three: riser moved 400mm; main pipe rerouted 420mm; new valve branch. Slab, open
shaft, walls, columns, normal connected services, manifold/pump and supports stay
visible. Original amber ghost routes remain beside the solid replacement routes.

## 8. Electrical changes

Three: tray rerouted around the revised partition; riser moved 400mm; branch added.
Slab, open shaft, walls, columns, partial ceiling, distribution board and tray
supports retain spatial context. Old amber tray edges show where the route was.

## 9. Secondary timeline

Both use **once-only 3.2s timelines on every device**, no pin and no scrub:
0s stable Version A; 0.5s old-route ghosting; 1.1s replacement fade-in; 1.7s red
highlight; 2.2s HTML notes; then final hold. Added branches are an independent
channel. A short emphasis rises/falls once, rather than following an idle loop.
At least 45% of the ready model viewport must be visible to start. The timeline
pauses offscreen or in a hidden document and resumes without restarting.

## 10. Mobile strategy

Small screens, coarse pointers and hover-none devices use the automatic hero,
not the desktop pin. Version A holds ~700ms, revisions take 1.7s, final geometry
settles at ~2.4s and text stays visible; the complete timeline includes a hold to
3.6s. The same product information arrives without click/hover/drag/precise scroll.
The secondary stories use the same 45%-visible once trigger. Wide touch emulation
at 1440px was also tested: automatic mode, no pin.

## 11. Edge changes and actual testing

No UA-specific workaround was added. Readiness, positive Canvas dimensions,
coarse-pointer detection, reserved layouts, safe refresh, SVG fallbacks and ordinary
IntersectionObserver timelines remove browser-independent fragile assumptions.
Native **Microsoft Edge 154.0.4258.53** passed all three scene sequences at 1440×900,
and Finnish hero fit at 1280×800 and 1024×768.

Edge was a temporary signed Microsoft app, not a system installation. Its direct
headless executable launch failed with `base/path_service.cc:264` before a page
loaded. Normal macOS app launch worked; Playwright connected to its localhost CDP
endpoint with `noDefaults`, using the existing context and foreground emulation.
This was a browser-launch/tooling failure, not an Edge website error. No security
settings were disabled. Edge-specific failure on the original site was not proven.

## 12. Bugs found and corrected during refinement

- Desktop secondary progress depended on continued scrolling: replaced with time.
- Mobile progress raced ahead: introduced the deliberate Version A hold.
- Model/figure visibility and premature readiness could start a story before it
  was useful: now observe the actual viewport and announce readiness on first frame.
- ScrollTrigger refresh restored pin-cached CSS comparison values: the model was
  still Version A while the heading/counts said Version B. Visual QA caught this
  despite a successful build. Plain-object UI timeline channels now explicitly
  write CSS variables on update; browser assertions cover both labels and geometry.
- An attempted fallback callback incorrectly assumed R3F's DOM Canvas fallback
  only mounts when GL fails. Inspection of the installed R3F implementation showed
  it is rendered as canvas children even on healthy GL. Removed that callback;
  retained independent error/context-loss boundaries and a visible-only 12s
  readiness watchdog. Real context-loss and unavailable-GL tests passed for all three.
- An automatic story could remain unstarted if initially observed in a hidden
  document. The visibility handler now starts a qualified story when foregrounded.
- Static fallback slab SVG paths were corrected after screenshot review.

No remaining normal-page GSAP/ScrollTrigger/WebGL/shader/React/hydration/RO errors
were observed in the tested engines. Forced-failure tests intentionally generate
WebGL/error-boundary diagnostics rather than suppressing them.

## 13. Lifecycle and refresh

Scoped `gsap.matchMedia` contexts revert on unmount and breakpoint/preference
changes. Observers, document visibility listeners, timers and RAF handles are
cleaned up; timelines are killed. Readiness/fonts/meaningful viewport sizes,
orientation and pageshow events coalesce a safe 120ms-debounced refresh; the model
viewport, not the pin spacer, is observed. Mobile toolbar-only refresh churn is
reduced via `ignoreMobileResize`. This follows GSAP's
[safe refresh mechanism](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh()/)
and [mobile resize configuration](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()/).

Repeated EN/FI navigation and width transitions left exactly one hero trigger/pin
on desktop and zero on touch. A separate Docker development server exercised
Next's App Router default React Strict Mode: both secondary stories completed,
three locale navigations retained one trigger/pin, no React application errors.
The temporary development container was then stopped.

## 14. Performance

DPR **1** for compact/touch devices, desktop <=1.5. Fewer fixture/details on mobile,
opaque mobile glass, instanced services, merged lightweight comparison edges,
no HDR/postprocessing/textures/shadow maps. Model resources are disposed on cleanup.
UI-only story progress no longer invalidates unchanged geometry. Rendering is
on-demand with a bounded 80ms tail, offscreen/hidden gating and no idle motion.

Instrumented native Chrome at 390×844 touch emulation on this Mac:
active-render interval median **16.7ms** for all three; p95 **17.5ms hero / 17.2ms
plumbing / 17.1ms electrical** (intentional hold gaps excluded). GPU draw calls:
**0 during 1.5s settled idle**, **0 during 1.2s synthetic document-hidden scroll**.
This is Mac GPU/mobile-viewport evidence, not a physical-phone benchmark.

## 15. Files changed by this refinement

| Area | Modified / added files | Reason |
|---|---|---|
| Hero | `components/hero/{BimBuilding,BimScene,BimspectHero,ArchitecturalFallback}.tsx`, `hero-motion.ts`, `hero.module.css`, `useHeroAnimation.ts` | Materials/edges, ready gating, fixed/reduced cameras, native SVG fallback, staged timing and synchronized HTML |
| Shared models | `components/models/{DisciplineModel,ModelCanvas,ModelFallback,ComparisonEdges}.tsx`, `change-palette.ts`, `model-types.ts`, `models.module.css`, `useModelScrollReveal.ts` | Independent ghost/new/highlight channels, old/new edges, legends, three-change timelines |
| Lifecycle/budget | `components/models/{animation-lifecycle,comparison-motion,useRenderBudget,useSceneLayoutRefresh}.ts` | Once visibility controller, timing constants, touch DPR and debounced ready/font refresh |
| Integration/copy | `components/home/HomePage.tsx`, `content/home.ts`, `app/globals.css` | Replace hero screenshot fallback with representative illustration; EN/FI normal/count/key labels; semantic change color variables |
| Tests | `test/{hero-model,discipline-models,comparison-motion}.test.ts`, `test/model-browser-qa.mjs` | Timing/geometry/cleanup/palette regression coverage and optional real-browser phase/CSS/DPR/error checks |
| Documentation | `README.md`, this report | Current timing/colors/behavior, reproducible commands and honest QA limitations |

The existing standalone Dockerfile, production Compose, credentials and runtime
dependencies are unchanged by this animation request. No package-lock change.

## 16. Tests and Docker execution

Passed inside a Docker builder using locked `npm ci` dependencies (not Mac modules):
`npm run lint`, `npx tsc --noEmit`, **66 Node tests**, `npm run build`.
Also **23 Docker separation/safety tests** passed on the host.

Executed `npm run docker:local:up` (the documented wrapper for
`docker compose -f docker-compose.local.yml up -d --build`). Local web container
`bimspect_website_local-web-1`, image `bimspect-website:local`, host/container port
3000, healthy. Existing local nginx-test also healthy; production configuration
and unrelated Docker resources were not operated on. `/` and `/fi` return HTTP 200;
`docker compose ... logs --tail=100 web` has a clean Next startup.

```bash
npm run docker:local:up       # build and start/rebuild
npm run docker:local:stop     # stop local services
npm run docker:local:logs     # follow web logs
```

Website: **http://localhost:3000**.

Optional browser regression (Playwright is an external QA tool, not added to app deps):

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node test/model-browser-qa.mjs
# Optionally add EDGE_CDP_URL=http://127.0.0.1:9224 for normally-launched native Edge.
# CHROME_EXECUTABLE, BASE_URL and QA_OUTPUT_DIR can override the documented defaults.
```

## 17. Browser QA

All three scene sequences were run, sampled at normal/ghost/replacement/highlight/
final stages, screenshotted and visually inspected rather than accepting build
success as visual success. Refinement/rebuild repeated after the UI snapshot and
SVG faults were seen.

| Browser / environment | Result |
|---|---|
| Native Chrome 154 desktop 1440×900 | All three sequences, geometry and HTML phases pass |
| Native Edge 154 desktop 1440×900 | All three sequences, geometry and HTML phases pass |
| Playwright WebKit desktop 1440×900 | All three sequences, geometry and HTML phases pass |
| Chrome touch emulation 390×844 and 430×932 | All three automatically complete; no pin; DPR 1 |
| WebKit touch emulation 390×844 and 430×932 | All three automatically complete; no pin; DPR 1 |
| Chrome, Edge, WebKit 1280×800 and 1024×768 | Finnish final hero fits; no horizontal overflow |
| Chrome and WebKit, reduced-motion 390×844 | All three immediately final, no pin, steady camera |
| Chrome and WebKit, no JS / unavailable WebGL | Meaningful SVGs, counts/copy/CTAs retained |
| Chrome and WebKit, wide touch / hidden pause / resize / locale navigation | Automatic mode, resume and cleanup pass |
| Chrome, delayed JS chunks / actual lost GL contexts | Ready gating and independent fallbacks pass |
| Chrome, Docker Next development Strict Mode | All scenes/locale navigation, no duplicate pin or React errors |

JSON phase traces/screenshots are temporary local QA artifacts under
`/tmp/bimspect-motion-browser/` and `/tmp/bimspect-motion-final/`, not committed.

## 18. Remaining limitations

- Native Safari 27 is installed, but Safari WebDriver could not connect/launch a
  compatible automation session (RWIApplication timeout); native-app control also
  timed out. No Safari settings were changed. Actual WebKit desktop/mobile tests
  passed, but this is **not certification of the installed Safari app**.
- No physical iPhone/Android or Windows Edge hardware was available. Touch/viewport
  and reduced-motion results are browser simulations on the Mac, not device-lab QA.
- The locked R3F/Three combination emits the existing nonfatal `THREE.Clock`
  deprecation warning once per mounted Canvas (including after locale navigation).
  It is not hidden in production. No dependency churn was introduced to patch it.
- All geometry remains illustrative, not a live IFC comparison or a claim about
  automatic clash detection. Existing CRM/Turnstile/checkout configuration and
  earlier dependency-audit findings are outside this animation change and unchanged.
- Desktop story duration still depends on user scroll speed; extremely rapid
  scrolling can skip stages. Touch stories pause if the user scrolls away, then
  resume; visible HTML descriptions remain available throughout.
