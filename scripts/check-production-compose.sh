#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
runtime=false
validator=(python3 "$ROOT/scripts/validate-production-compose.py")
for arg in "$@"; do
  case "$arg" in
    --runtime) runtime=true ;;
    --origin-port) validator+=(--origin-port) ;;
    *) echo "ERROR: Usage: $0 [--runtime] [--origin-port]" >&2; exit 1 ;;
  esac
done
for command in docker python3; do
  command -v "$command" >/dev/null || { echo "ERROR: $command is required." >&2; exit 1; }
done
docker compose version >/dev/null

# Explicit -f ignores COMPOSE_FILE and prevents automatic override discovery.
# Reject auto-loaded files too: plain 'docker compose up' must remain safe.
for override in docker-compose.override.yml docker-compose.override.yaml compose.override.yml compose.override.yaml; do
  if [[ -e "$ROOT/$override" ]]; then
    echo "ERROR: Automatic override $override is forbidden. Use docker-compose.local.yml explicitly." >&2
    exit 1
  fi
done
# Alternative default base files can take precedence over docker-compose.yml.
for alternative in compose.yaml compose.yml docker-compose.yaml; do
  if [[ -e "$ROOT/$alternative" ]]; then
    echo "ERROR: Competing default Compose file $alternative detected. docker-compose.yml must be canonical." >&2
    exit 1
  fi
done

# Keep credentials in a pipe, never in CI logs or a generated tracked file.
docker compose --project-directory "$ROOT" -f "$ROOT/docker-compose.yml" config --format json \
  | "${validator[@]}"

if [[ "$runtime" == true ]]; then
  if ! docker network inspect bimspect_marketing_proxy >/dev/null 2>&1; then
    echo "ERROR: Required production network bimspect_marketing_proxy does not exist." >&2
    echo "Have the production proxy administrator restore/connect it. This script will NOT create it." >&2
    exit 1
  fi
fi
