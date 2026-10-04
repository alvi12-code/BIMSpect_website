# BIMSpect Website

Production-ready Next.js migration of the original static BIMSpect page in `bimspect-redesign-for-business.html`.

## Commands

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
  `useHeroAnimation` tells Version A → Version B → highlighted changes in 140vh
  of pinned scrolling, only at >=1000px width and >=680px height. Mobile is not
  pinned. No continuous rotation, technical disciplines or moving section planes.
- **Plumbing:** placed at the model-context explanation, after category filtering.
  Slab with open service shaft, two walls, columns, connected water/drainage
  pipework, valves, supports and a simplified pump/manifold. Three service changes:
  riser moved 400 mm, pipe rerouted 420 mm, new valve branch.
- **Electrical:** later in the analytics/value section, with normal workflow and
  dashboard content between examples. Slab, shaft, partial ceiling, walls,
  columns, distribution board, suspended trays and junction box. Three service
  changes: route around new partition, added branch, riser moved 400 mm.

`models/useModelScrollReveal.ts` shares the two secondary ScrollTrigger reveals:
78% → 32% viewport range, no pinning, no buttons, native scrolling. Mobile plays
once on entry; reduced motion shows a static final comparison. Two HTML notes
maximum accompany each model; accessible scene descriptions list every change.

`InstancedParts`, `SceneLighting` and `change-palette.ts` are shared. Changed
components use BIMSpect violet, added components a lighter violet, old components
are transparent ghosts. Scenes use demand rendering with explicit scroll
invalidation and a bounded 80ms smoothing tail, no idle loop, DPR capped at 1.5 and no HDR/textures/postprocessing/
shadow maps. Secondary canvases initialize within 250px of the viewport and stop
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
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 web
curl -I http://localhost:3000
```

Review `/` and `/fi` at 1440×900, 1280×800, 1024×768, 768×1024 and 390×844,
including reduced motion, failed WebGL, CTAs, mobile menu and offscreen rendering.

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

## Docker

Build and run the production image:

```bash
docker build -t bimspect-website .
docker run --rm -p 3000:3000 bimspect-website
```

Or use Docker Compose:

```bash
docker compose up --build
```
