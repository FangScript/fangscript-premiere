#!/bin/sh
set -eu
# CI/local integration only: check that every module was initialized, then rerun safely.
count=$(docker compose exec -T postgres psql -U postgres -d postgres -Atc "SELECT count(*) FROM pg_roles WHERE rolname IN ('fs_auth','fs_cms','fs_lead','fs_crm','fs_project','fs_file','fs_proposal','fs_billing','fs_notification','fs_automation','fs_marketing','fs_analytics','fs_audit','fs_rag','fs_chatbot','fs_agent')")
[ "$count" = 16 ] || { echo "Expected 16 module roles, found $count" >&2; exit 1; }
docker compose exec -T postgres psql -U postgres -d fs_auth -v ON_ERROR_STOP=1 -c 'CREATE TABLE IF NOT EXISTS initialization_probe (id integer PRIMARY KEY); INSERT INTO initialization_probe VALUES (1) ON CONFLICT DO NOTHING;'
docker compose exec -T postgres sh /docker-entrypoint-initdb.d/10-modules.sh
count=$(docker compose exec -T postgres psql -U postgres -d fs_auth -Atc 'SELECT count(*) FROM initialization_probe')
[ "$count" = 1 ] || { echo 'Initialization did not preserve existing data' >&2; exit 1; }
docker compose exec -T postgres psql -U postgres -d fs_auth -c 'DROP TABLE initialization_probe;'
