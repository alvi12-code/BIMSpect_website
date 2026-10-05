#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
if [[ "$ROOT" == /opt/bimspect-website ]]; then
  echo "ERROR: Local Docker commands are forbidden in the production directory." >&2
  exit 1
fi
compose=(docker compose --project-directory "$ROOT" --project-name bimspect_website_local -f "$ROOT/docker-compose.local.yml")
case "${1:-}" in
  up) exec "${compose[@]}" up -d --build ;;
  down) exec "${compose[@]}" down ;;
  stop) exec "${compose[@]}" stop ;;
  build) exec "${compose[@]}" build ;;
  logs) exec "${compose[@]}" logs --tail=100 -f web ;;
  ps) exec "${compose[@]}" ps ;;
  config) exec "${compose[@]}" config --quiet ;;
  *) echo "ERROR: Usage: $0 {up|down|stop|build|logs|ps|config}" >&2; exit 1 ;;
esac
