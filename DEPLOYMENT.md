# BIMSpect website: production-safe Docker

> **IMPORTANT:** `docker-compose.yml` is production infrastructure. Local-only
> ports/networks belong in `docker-compose.local.yml`, which must be selected
> explicitly. Never create `docker-compose.override.yml` or another competing
> default Compose filename. Never merge local Compose into production.

## Root cause and recovered configuration

Git commit `cb81cd2` is the last production-safe Compose revision before
`4a00964` replaced its external proxy network with a local bridge and changed
loopback port mappings to public bindings. A healthy Next.js container on the
wrong network is unreachable through the existing reverse proxy, resulting in
502s. The canonical base restores that verified configuration:

- Project: `bimspect_website`; image: `bimspect-website:latest`.
- Internal Next.js port: 3000; Docker alias: **`marketing-web`**.
- Service network key: `marketing_proxy`.
- Existing external network name: **`bimspect_marketing_proxy`**; Compose must not
  create/manage/rename it. The public reverse proxy must already be connected.
- Website host binding: **`127.0.0.1:${MARKETING_PORT:-3001}:3000`**.
- nginx-test host binding: **`127.0.0.1:${NGINX_TEST_PORT:-8081}:80`**, attached to
  the same external network; its existing config proxies `marketing-web:3000`.

Node 22 slim, npm retry settings, `npm ci`, standalone multi-stage build,
non-root runtime, read-only filesystems, tmpfs and existing health checks are
retained. These improvements do not depend on local vs production networking.

## LOCAL DOCKER DEVELOPMENT

Docker Desktop with Compose, Bash and Python 3 are prerequisites. npm scripts
are optional launchers, not host dependency installation.

```bash
npm run docker:local:up
npm run docker:local:ps
npm run docker:local:logs
npm run docker:local:stop
npm run docker:local:down
npm run docker:local:build
```

Exact commands without npm:

```bash
docker compose -f docker-compose.local.yml config --quiet
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml logs --tail=100 web
curl -I http://localhost:3000
docker compose -f docker-compose.local.yml down
```

This is a **standalone local definition**, not a merge/override. Intentional
service duplication avoids reset/override tag dependencies and external network
inheritance. A regression test checks that shared runtime/security settings stay
in sync. Differences are restricted to project/image identity, ports and network:

- Project: `bimspect_website_local`; image: `bimspect-website:local`.
- Compose-managed bridge: `bimspect_local` (actual name is project-prefixed).
- Website: **http://localhost:3000**, mapping `3000:3000`.
- Local nginx test: **http://127.0.0.1:8081**, loopback-only mapping.
- No `bimspect_marketing_proxy` dependency. Basic content works without CRM,
  Turnstile or payment secrets; their live features still need configuration.

The local helper refuses to run inside `/opt/bimspect-website`. Local `down`
only targets its separate project; it cannot stop the production Compose project.
No prune, volume deletion or orphan removal flags are used.

For a **one-time migration on this Mac**, after verifying the old website
container names/labels, stop `bimspect_website-web-1` and
`bimspect_website-nginx-test-1` to free 3000/8081. Do not stop unrelated resources.
The old containers/network can remain stopped; no cleanup is required.

## PRODUCTION DEPLOYMENT

**Do not run these commands from the Mac.** Production directory is exclusively
`/opt/bimspect-website`. The scripts never operate on `/opt/bimspect`,
`/opt/bimspect-accounting` or `/opt/bimspect-crm` and never restart the gateway.

Prerequisites on the server:

- Git, Bash, Docker Engine with Compose v2+, Python 3 and curl.
- Existing external `bimspect_marketing_proxy` network, already shared with the
  production reverse proxy. If missing, stop and ask the proxy administrator;
  **do not automatically create it**.
- Server-only `/opt/bimspect-website/.env` with approved integration settings.
- The local Unix-socket Docker daemon, not a remote Docker context.

Review and update code through the normal process, then deploy:

```bash
cd /opt/bimspect-website
git status --short --branch
# Stop and preserve unexpected local changes before pulling.
git pull --ff-only origin main
./scripts/deploy-production.sh
```

The deployment script:

1. Requires this exact repository directory and working directory; fails elsewhere.
2. Explicitly selects the canonical file/project, rather than `COMPOSE_FILE` or
   automatically discovered local overrides.
3. Validates the resolved configuration and existing external network; never
   creates or renames networks.
4. Builds **web** before replacing anything. Build failure leaves the current
   container running.
5. Runs `up -d --no-deps --no-build web`; nginx-test/gateway/other apps are untouched.
6. Waits up to 120 seconds for an actual healthy web container; missing health
   check, unhealthy/exited state or timeout is a non-zero failure.
7. Tests `http://127.0.0.1:<resolved-web-port>/` with retries, then
   `https://bimspect.com/` with TLS verification and HTTPS-only redirects.
8. On post-replacement failure, prints website `ps` and the last 200 web log lines,
   exits non-zero, and performs no destructive cleanup or automatic rollback.

The local origin port comes from validated Compose JSON, including `.env` and
shell interpolation; it is not assumed to be 3001. The external network's mere
existence does **not** prove the gateway is correctly connected/configured.
The public URL check can also be served by Cloudflare cache; verify the gateway
upstream/path during an approved server deployment if routing remains suspect.

Plain `docker compose up -d` uses the safe production base, but the deploy script
is the recommended guarded update path. Do not set `COMPOSE_FILE` to the local
file on production or bypass the guard scripts.

To start the preserved nginx-test service deliberately on the server:

```bash
cd /opt/bimspect-website
./scripts/check-production-compose.sh --runtime
docker compose -f docker-compose.yml up -d --no-deps nginx-test
```

## Static safety check and CI

```bash
./scripts/check-production-compose.sh                 # No server/network required
./scripts/check-production-compose.sh --runtime       # Also checks actual network
./scripts/check-production-compose.sh --origin-port   # Only the validated host port
python3 test/docker_compose_safety_test.py
```

`docker compose config --format json` is the source of truth, consumed in memory
rather than printed/saved with credentials. The validator rejects:

- Missing/renamed/non-external production network or extra/local networks.
- Web not attached solely to `marketing_proxy`, or missing `marketing-web` alias.
- nginx-test on a different network, host-network bypass, wrong internal web port.
- Public IPv4/IPv6/unspecified web or nginx-test bindings, extra mappings/port ranges.
- Wrong project identity, unrelated services, invalid Compose/JSON.
- Automatically loaded override files and competing default Compose filenames.

GitHub workflow `.github/workflows/docker-config-check.yml` runs on all pull
requests and pushes to `main`, with read-only repository permission and no
production secrets/server access. It validates production and standalone local
Compose, runs mutation/regression tests (including the exact public-port/local-
network incident), checks shell syntax, and rejects tracked environment files
other than `.env.example`. External network existence is not a
CI requirement. Python tests also detect shared local/production runtime drift.

**Configure GitHub branch protection/rulesets to require `Production Compose
safety` on `main`, with reviewed changes and appropriate bypass restrictions.**
The local task does not change GitHub settings; a workflow alone cannot prevent
an authorized direct push/bypass or edits that disable the checks themselves.
CODEOWNERS was skipped because no confirmed production reviewer identity was
provided. Review `docker-compose.yml`, `Dockerfile`, `nginx/`, `scripts/` and
`.github/workflows/` as deployment-critical files.

## Environment safety

`.gitignore` excludes `.env*` with only `.env.example` explicitly allowed.
`.dockerignore` excludes all `.env*`, so production credentials cannot be copied
by the build's `COPY . .`. Do not print resolved Compose config into shared logs:
it contains interpolated values. Never upload production `.env` to GitHub.

`MARKETING_PORT`/`NGINX_TEST_PORT` adjust production loopback ports only. Local
ports are fixed in the explicit local definition. `NEXT_PUBLIC_LAUNCH_AT` is
optional; empty uses `lib/launch.ts`. Rebuild for any `NEXT_PUBLIC_*` change.

Live CRM requires `BIMSPECT_CRM_URL`, `BIMSPECT_CRM_API_SECRET`,
`CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`; Turnstile needs both
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Keep checkout disabled
until its real provider and credentials are approved. No secret defaults are
invented. Docker build arguments carry only the existing public settings.

## Failure and rollback

Record the deployed commit and image ID before an update. If build fails, the
old container remains. If startup/health/origin/public checks fail after
replacement, diagnose logs and gateway connectivity, then deliberately roll back
to an approved known-good commit/image. There is no transactional zero-downtime
switch or automatic rollback in this single-container deployment.

```bash
cd /opt/bimspect-website
git status --short --branch
# Preserve unexpected local changes; never use a destructive reset.
git switch --detach <reviewed-known-good-commit-with-safe-compose-and-deploy-script>
./scripts/deploy-production.sh
```

After a fix, return to `main` through the normal review/deployment process.
Inactive `nginx/*.example` templates are unchanged; proxy/TLS cutovers must be
separately approved and validated by the gateway administrator.

## Local verification — 2026-10-04

- Production Compose body matches recovered commit `cb81cd2` exactly, apart from
  the added warning header. Static validation passes without its external network.
- All 23 Docker configuration/deployment regression tests passed. Deployment
  success/failure paths use a temporary script copy and mocked CLI, never a server.
- Local image built with locked Docker dependencies; `npm run docker:local:up`
  executed successfully. Web and nginx-test are healthy; `/`, `/fi` and 8081 return
  HTTP 200. The production network remains absent on this Mac.
- Builder-stage lint, TypeScript and all 60 application tests passed.
- Only `.env.example` is tracked. No commit, push or production deployment was
  performed. GitHub workflow checks were exercised locally; branch protection
  still needs to be enabled by the repository administrator.
