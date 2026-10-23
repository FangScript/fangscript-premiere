#!/bin/sh
set -eu

init_module() {
  module="$1"
  user="fs_${module}"
  db="fs_${module}"
  pass="$2"
  ext="${3:-}"

  echo "==> Configuring module: ${module} (database: ${db}, role: ${user})"

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$pass" <<EOF
-- psql substitution must be outside a dollar-quoted procedural body.
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', '${user}', :'pass')
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${user}')\\gexec

-- Explicit repair runs synchronize credentials without dropping any data.
SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', '${user}', :'pass')\\gexec

SELECT 'CREATE DATABASE ${db} OWNER ${user}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db}')\\gexec

REVOKE ALL ON DATABASE ${db} FROM PUBLIC;

\\connect ${db}

${ext}

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO ${user};
EOF
}

init_module "auth" "$DB_AUTH_PASSWORD"
init_module "cms" "$DB_CMS_PASSWORD"
init_module "lead" "$DB_LEAD_PASSWORD"
init_module "crm" "$DB_CRM_PASSWORD"
init_module "project" "$DB_PROJECT_PASSWORD"
init_module "file" "$DB_FILE_PASSWORD"
init_module "proposal" "$DB_PROPOSAL_PASSWORD"
init_module "billing" "$DB_BILLING_PASSWORD"
init_module "notification" "$DB_NOTIFICATION_PASSWORD"
init_module "automation" "$DB_AUTOMATION_PASSWORD"
init_module "marketing" "$DB_MARKETING_PASSWORD"
init_module "analytics" "$DB_ANALYTICS_PASSWORD"
init_module "audit" "$DB_AUDIT_PASSWORD"
init_module "rag" "$DB_RAG_PASSWORD" "CREATE EXTENSION IF NOT EXISTS vector;"
init_module "chatbot" "$DB_CHATBOT_PASSWORD"
init_module "agent" "$DB_AGENT_PASSWORD"

echo "==> PostgreSQL module initialization completed successfully."
