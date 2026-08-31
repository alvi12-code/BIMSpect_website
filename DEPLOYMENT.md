# Marketing website deployment

This Compose project is independent of `/opt/bimspect`. It publishes Next.js
only on `127.0.0.1:3001` and its local Nginx test endpoint only on
`127.0.0.1:8081`.

## Safe update

```bash
cd /opt/bimspect-website

git status --short --branch
git pull --ff-only origin main

docker network inspect bimspect_marketing_proxy >/dev/null 2>&1 \
  || docker network create bimspect_marketing_proxy
docker compose build
docker compose up -d
docker compose ps

curl -fsS -o /dev/null http://127.0.0.1:3001/
curl -fsS -o /dev/null -H 'Host: web-staging.bimspect.com' \
  http://127.0.0.1:8081/
```

Stop before pulling if `git status` shows tracked or untracked repository
changes other than the expected ignored `.env`; preserve and review them first.
The deployment configuration created on this server should be committed to the
upstream repository through the normal review process so future pulls stay
conflict-free.

Stop only the marketing deployment with:

```bash
cd /opt/bimspect-website
docker compose down
```

The external `bimspect_marketing_proxy` network is intentionally persistent and
is not removed by `docker compose down`.

## Configuration

`.env` is local and untracked. `MARKETING_PORT` and `NGINX_TEST_PORT` must
remain bound to `127.0.0.1` in `docker-compose.yml`. `NEXT_PUBLIC_LAUNCH_AT`
is optional; an empty value uses the default in `lib/launch.ts`.

The campaign lead proxy requires `BIMSPECT_CRM_URL`,
`BIMSPECT_CRM_API_SECRET`, `CF_ACCESS_CLIENT_ID`, and
`CF_ACCESS_CLIENT_SECRET`. These are server-side secrets and must not be
committed. To enable Turnstile, set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
`TURNSTILE_SECRET_KEY`. Rebuild the image after changing any `NEXT_PUBLIC_*`
variable, including the Turnstile site key.

## Rollback

Before an update, record the deployed commit with `git rev-parse HEAD`. If a new
release fails, preserve any local work, switch to the recorded known-good commit,
and rebuild only this project:

```bash
cd /opt/bimspect-website
git status --short --branch
git switch --detach <known-good-commit>
docker compose build
docker compose up -d
docker compose ps
```

After the issue is fixed, return to the production branch with `git switch main`.
Never use a destructive reset when local changes are present.

## Public Nginx cutover

Files under `nginx/*.example` are inactive templates. The server's public ports
80 and 443 belong to the existing `/opt/bimspect` gateway, so public routing must
be added to that gateway only during an approved cutover. The gateway must first
join the external `bimspect_marketing_proxy` network. Validate its complete
configuration with `nginx -t` inside the gateway before issuing an Nginx reload.
Do not recreate or restart the other BIMSpect services.
