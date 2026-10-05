#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
if [[ "$ROOT" != /opt/bimspect-website || "$(pwd -P)" != "$ROOT" ]]; then
  echo "ERROR: Run this script from the repository at /opt/bimspect-website only." >&2
  exit 1
fi
if [[ "$(git -C "$ROOT" rev-parse --show-toplevel)" != "$ROOT" ]] || [[ ! -f "$ROOT/package.json" ]]; then
  echo "ERROR: /opt/bimspect-website is not the expected website repository." >&2
  exit 1
fi
for command in docker python3 curl; do
  command -v "$command" >/dev/null || { echo "ERROR: $command is required." >&2; exit 1; }
done
if [[ ! -r "$ROOT/.env" ]]; then
  echo "ERROR: Configure /opt/bimspect-website/.env on the server first; never commit credentials." >&2
  exit 1
fi
# Never let a remote Docker context deploy to a different machine.
if [[ -n "${DOCKER_CONTEXT:-}" ]]; then
  endpoint="$(docker context inspect "$DOCKER_CONTEXT" --format '{{.Endpoints.docker.Host}}')"
elif [[ -n "${DOCKER_HOST:-}" ]]; then
  endpoint="$DOCKER_HOST"
else
  endpoint="$(docker context inspect "$(docker context show)" --format '{{.Endpoints.docker.Host}}')"
fi
if [[ "$endpoint" != unix://* ]]; then
  echo "ERROR: Production deployment requires the server's local Unix-socket Docker daemon." >&2
  exit 1
fi

compose=(docker compose --project-directory "$ROOT" --project-name bimspect_website -f "$ROOT/docker-compose.yml")
replaced=false
on_error() {
  local status=$?
  trap - ERR
  echo "ERROR: Production deployment failed (exit $status). No cleanup or automatic rollback was performed." >&2
  if [[ "$replaced" == true ]]; then
    "${compose[@]}" ps >&2 || true
    "${compose[@]}" logs --tail=200 web >&2 || true
  fi
  exit "$status"
}
trap on_error ERR

# Static configuration and real network presence are separate checks for CI.
"$ROOT/scripts/check-production-compose.sh" --runtime
origin_port="$("$ROOT/scripts/check-production-compose.sh" --origin-port)"

echo "Building web first; the current container remains running during the build."
"${compose[@]}" build web
replaced=true
"${compose[@]}" up -d --no-deps --no-build web

container="$("${compose[@]}" ps -q web)"
if [[ -z "$container" ]]; then
  echo "ERROR: No running production web container was found." >&2
  false
fi
healthy=false
for ((attempt=1; attempt<=60; attempt++)); do
  state="$(docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$container")"
  case "$state" in
    'running healthy') healthy=true; break ;;
    'running starting') sleep 2 ;;
    *) echo "ERROR: Web container is not healthy: $state" >&2; false ;;
  esac
done
if [[ "$healthy" != true ]]; then
  echo "ERROR: Web health check timed out after 120 seconds." >&2
  false
fi

# Check the actual interpolated port, not a guessed/default environment value.
curl --fail --silent --show-error --output /dev/null --connect-timeout 5 --max-time 20 \
  --retry 10 --retry-delay 3 --retry-connrefused "http://127.0.0.1:${origin_port}/"
curl --fail --silent --show-error --location --output /dev/null --connect-timeout 5 --max-time 30 \
  --proto '=https' --proto-redir '=https' --retry 3 --retry-delay 3 https://bimspect.com/

"${compose[@]}" ps
echo "PASS: Production web is healthy; local origin and https://bimspect.com responded successfully."
