# BIMSpect Website

Production-ready Next.js migration of the original static BIMSpect page in `bimspect-redesign-for-business.html`.

## LOCAL DOCKER DEVELOPMENT (Mac)

> **IMPORTANT:** `docker-compose.yml` is production infrastructure. Do not change
> its ports or networks to make local Docker work. Local-only settings belong in
> the explicit, standalone `docker-compose.local.yml`. Never add an automatically
> loaded `docker-compose.override.yml`.

Prerequisites: Docker Desktop with Docker Compose, Bash, and Python 3 for safety
checks. npm is only a convenient command launcher; dependency installation and
Next.js builds happen inside Docker using `npm ci`, not Mac `node_modules`.

```bash
npm run docker:local:up       # Build and start web + local nginx test
npm run docker:local:ps
npm run docker:local:logs
npm run docker:local:stop     # Stop, retaining containers
npm run docker:local:down     # Remove only the isolated local project
npm run docker:local:build    # Build; use :up to apply the new image
```

Without npm, use `bash scripts/docker-local.sh up`, or the exact Compose command:

```bash
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml down
```

Website: **http://localhost:3000** (also `/fi`). Local nginx test:
**http://127.0.0.1:8081**. Local project is `bimspect_website_local`, image is
`bimspect-website:local`, and its Compose-managed bridge is `bimspect_local`.
No production external network or production credentials are required for the
basic website. The requested local web mapping `3000:3000` listens on all host
interfaces; do not use this local definition on a public server.

Optional local integrations use an ignored `.env` copied from `.env.example`;
do not copy production secrets. CRM/Turnstile require their own credentials to
work; checkout remains disabled by default. Public variable changes require a
rebuild. This is a production-mode local preview, not a hot-reload dev server.

If migrating from the old Mac configuration, stop only its old website containers
first (after confirming their names/Compose labels):

```bash
docker stop bimspect_website-web-1 bimspect_website-nginx-test-1
npm run docker:local:up
```

This is a **one-time Mac migration**, never a production shutdown instruction.
It leaves the old containers/network available rather than deleting resources.

## PRODUCTION DEPLOYMENT

Production uses **only `docker-compose.yml`**: external network
`bimspect_marketing_proxy`, service alias `marketing-web`, and loopback binding
`127.0.0.1:${MARKETING_PORT:-3001}:3000`. nginx-test is also loopback-only.
`docker compose up -d` therefore defaults to the production architecture.

Validate without deploying or requiring the server's external network:

```bash
npm run docker:production:check
# Equivalent: bash scripts/check-production-compose.sh
```

On the production server only:

```bash
cd /opt/bimspect-website
./scripts/deploy-production.sh
```

The deploy script requires the existing external network; it never creates it.
It builds before replacing **only web**, waits for health, and tests the actual
configured loopback origin and public HTTPS endpoint. See [DEPLOYMENT.md](DEPLOYMENT.md)
for server prerequisites, safety checks, CI protection and rollback.

## Optional application commands without Docker

```bash
npm install
npm run dev
npm run lint
npm run build
```

The site uses the App Router, TypeScript, `next/font/google` for DM Sans and DM Mono, extracted screenshot assets under `public/images/bimspect/`, and native CSS plus Intersection Observer animations. The homepage hero additionally uses React Three Fiber / Three.js, and GSAP ScrollTrigger.

## Homepage model storytelling

The homepage has exactly three WebGL experiences: an architectural hero, a
plumbing service-room comparison and an electrical ceiling/riser comparison.
`HomePage.tsx` and `hero/HeroContent.tsx` keep copy, links and business flows
server-rendered. All copy is localized in `content/home.ts`.

- **Hero:** five-storey office with a three-storey connected cutaway wing. Six
  illustrative architectural changes: wall moved 300 mm, resized window,
  relocated entrance door, added partition, added facade panel and removed
  canopy. The displayed 2 added / 3 changed / 1 removed counts match the geometry.
  `useHeroAnimation` reserves 220vh for fine-pointer/hover desktops >=1000×680:
  normal 0–22%, stable Version A 22–40%, changed geometry 40–65%, final comparison
  65–100% (closing headline at 80%). Scrub smoothing is 0.5; there is no snapping.
  Touch/coarse-pointer/hover-none and smaller screens are never pinned: Version A
  holds for 700ms, revisions take 1.7s, then the final result stays visible.
  No continuous rotation, technical disciplines or moving section planes.
- **Plumbing:** placed at the model-context explanation, after category filtering.
  Slab with open service shaft, two walls, columns, connected water/drainage
  pipework, valves, supports and a simplified pump/manifold. Three service changes:
  riser moved 400 mm, pipe rerouted 420 mm, new valve branch.
- **Electrical:** later in the analytics/value section, with normal workflow and
  dashboard content between examples. Slab, shaft, partial ceiling, walls,
  columns, distribution board, suspended trays and junction box. Three service
  changes: route around new partition, added branch, riser moved 400 mm.

`models/useModelScrollReveal.ts` plays a once-only 3.2s timeline on **all** devices,
independent of scrolling: stable normal model, old-route ghosting at 0.5s, new
geometry at 1.1s, highlight at 1.7s, notes at 2.2s, then a final hold. The actual
ready model viewport must be >=45% visible; offscreen/hidden timelines pause and
resume rather than restart. Reduced motion immediately shows final comparison
with a fixed camera. Two HTML notes maximum accompany each model; accessible
scene descriptions list every change. Readiness/fonts/meaningful viewport changes
coalesce one safe ScrollTrigger refresh; matchMedia/observer cleanup prevents
navigation/breakpoint duplicate pins. UI story channels are plain objects, not
pin-cached animated CSS values.

`InstancedParts`, `SceneLighting`, `ComparisonEdges` and `change-palette.ts` are
shared. Architectural materials are warm concrete/slabs, graphite and blue-gray
glass. Change semantics: changed red `#ff3b30`, added cyan `#00aeef`, previous/removed
amber `#ff9500` with transparent ghosts and dashed edges. HTML square/plus/dashed
keys explain these without relying on color alone. A single 700ms emissive emphasis
settles to a steady highlight. Unchanged geometry softens but remains visible.
Scenes use demand rendering with revision-only invalidation and a bounded 80ms
tail, no idle loop, DPR 1 on compact/touch devices and <=1.5 on desktops; no
HDR/textures/postprocessing/shadow maps. Secondary canvases initialize within 250px of the viewport and stop
scheduling GPU work offscreen or in a hidden tab. Independent context-loss/error
boundaries retain static illustrations, text and CTAs.

The original product video, genuine screenshots, their attribution, pricing,
campaign form, UTM/analytics, payment gating, EN/FI routes and SEO remain intact.
DM Sans/DM Mono font aliases resolve on body (where `next/font` defines them).
Homepage body copy is 18–20px, supporting copy generally 15–17px, with bounded
line lengths, shorter localized headings and model/text layouts near 50/50.

### Validation

No host `node_modules` is needed. Test with the builder stage's locked dependencies:

```bash
docker build --target builder -t bimspect-hero-check .
docker run --rm bimspect-hero-check sh -c 'npm run lint && npx tsc --noEmit && npm test'
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs --tail=100 web
curl -I http://localhost:3000
```

Review `/` and `/fi` at 1440×900, 1280×800, 1024×768, 768×1024 and 390×844,
including reduced motion, failed WebGL, CTAs, mobile menu and offscreen rendering.
Also check 430×932 and wide coarse-pointer devices. See
[`docs/model-animation-review.md`](docs/model-animation-review.md) for the current
18-point review, actual browser results and remaining limitations.

## Campaign lead integration

The `/pilot` and `/what-changed` forms submit through the website's server-side `/api/campaign/leads` proxy. Set `BIMSPECT_CRM_URL`, `BIMSPECT_CRM_API_SECRET`, `CF_ACCESS_CLIENT_ID`, and `CF_ACCESS_CLIENT_SECRET` in production. To enable Cloudflare Turnstile, also set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`; set both values together.

### Campaign attribution

Campaign pages capture and retain first-touch UTM attribution in browser session
storage. The first rendered campaign page also records one landing-page visit per
browser tab and campaign path through `/api/campaign/visits`; the browser never
calls the CRM directly. A refresh reuses the same session visit ID and the CRM
deduplicates it. Campaign forms submit the same attribution through
`/api/campaign/leads`:
`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`,
`landing_page`, `referrer`, and a page URL limited to the campaign path and UTM
parameters.

The shared campaign form creates one browser-generated idempotency key for an
unchanged submission attempt and forwards it only as an HTTP header through the
website server route. The CRM uses it to prevent a retry after a network or
notification-email problem from creating a duplicate source record or CRM
interaction. No CRM credentials or service tokens are exposed to browser code.

Campaign URL examples:

- LinkedIn: `https://bimspect.com/pilot?utm_source=linkedin&utm_medium=social&utm_campaign=september_2026&utm_content=pilot_launch`
- Founder LinkedIn post: `https://bimspect.com/pilot?utm_source=linkedin&utm_medium=social&utm_campaign=september_2026&utm_content=founder_post_01`
- BIMSpect LinkedIn company page: `https://bimspect.com/what-changed?utm_source=linkedin&utm_medium=social&utm_campaign=september_2026&utm_content=company_post_01`
- Email CTA: `https://bimspect.com/pilot?utm_source=bimspect-email&utm_medium=email&utm_campaign=september-2026&utm_content=pilot-cta`

Do not add `#contact` to the email CTA URL: it must open the visitor at the top
of `/pilot`. Internal website CTAs may continue to use `#contact`.

## Marketing email footer and unsubscribe requirement

This repository does not send marketing email or contain an email template.
The email-sending system must keep the tracked CTA above and, for every
recipient, first call the CRM token issuer with its internal CRM person ID:

```text
CRM recipient
    ↓
POST https://crm.bimspect.com/api/marketing/unsubscribe-token
Authorization: Bearer <MARKETING_API_SECRET>
{
  "person_id": <internal-person-id>,
  "campaign": "<campaign-when-known>",
  "source": "marketing_email",
  "page_url": "https://bimspect.com/<campaign-page>?utm_campaign=<campaign>"
}
    ↓
unique opaque token (returned once)
    ↓
email sender
    ↓
https://bimspect.com/unsubscribe?token=<recipient-specific-opaque-token>
```

The sender must then inject this visible footer link into each HTML email (and
the full URL into the plain-text alternative):

```text
Unsubscribe from BIMSpect emails
https://bimspect.com/unsubscribe?token=<recipient-specific-opaque-token>
```

The token is generated by the CRM preference service, never from an email
address or browser-visible secret. Every recipient needs a unique token; do
not use a shared token or put email addresses/person IDs in the link. The
visible unsubscribe link is intentionally separate from the tracked campaign
CTA. The sender must retain the visible footer even if it later adds provider
support for `List-Unsubscribe`; this project has no sending provider and does
not implement one-click headers.

When campaign metadata is known, the trusted sender should supply the optional
`campaign`, `source`, and BIMSpect `page_url` fields when issuing a token. The
CRM retains only the normalized email and bounded opt-out attribution needed to
respect and manually process the request; it strips non-UTM URL parameters so
unsubscribe tokens and unrelated tracking values are not retained.

The generic `/unsubscribe` footer link provides a safe fallback for someone who
no longer has their campaign email. It asks for an email address and sends a
short-lived confirmation link only when the address is an eligible CRM contact.
The public response is identical for known, unknown, already opted-out, and
ineligible addresses. The email address is never added to campaign attribution
or browser analytics. Actual campaign emails must still use the
recipient-specific `/unsubscribe?token=<recipient-specific-opaque-token>` URL
above as the primary path.

The public `/unsubscribe` page only redeems the token after an explicit button
press. Its server-side `POST /api/marketing/unsubscribe` proxy uses the same
server-only CRM bearer and Cloudflare Access service-token credentials as the
campaign lead integration. It validates lowercase 64-character hexadecimal
tokens before forwarding them and returns generic results for well-formed
tokens, including expired, revoked, unknown, and previously used tokens.

The generic email form posts JSON only to
`POST /api/marketing/unsubscribe/request`, which applies the same proxy-aware
same-origin and bounded-body checks before forwarding to the CRM. It never
unsubscribes an entered address directly. The CRM creates a short-lived opaque
token, persists only its hash, sends the raw token once to the mailbox, and the
recipient must still explicitly confirm the unsubscribe action on the website.

## Deployment-critical files

Changes to `docker-compose.yml`, `Dockerfile`, `nginx/`, deployment scripts and
`.github/workflows/` require production review. The Docker configuration workflow
rejects wrong networks, missing alias and public production ports, and tests the
original incident as a regression. Make **Production Compose safety** a required
status check on `main`; adding a workflow alone does not enforce branch protection.
No CODEOWNERS identities were invented.
