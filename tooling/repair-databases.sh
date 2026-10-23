#!/bin/sh
# Run from the repository root. Reconciles roles/passwords; never drops databases.
set -eu
container=${1:-$(docker compose ps -q postgres)}
if [ -z "$container" ]; then
  echo 'Supply the PostgreSQL container name, or run inside the Compose project.' >&2
  exit 1
fi
if [ ! -f infra/postgres/init.sh ]; then
  echo 'Run this script from the repository root.' >&2
  exit 1
fi
echo 'Reconciling module databases using credentials already configured in the database container.'
docker exec -i "$container" sh -s < infra/postgres/init.sh
echo 'Database repair completed. Restart affected application services and verify Connections.'
