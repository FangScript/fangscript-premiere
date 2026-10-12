#!/bin/sh
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_AUTH_PASSWORD" <<'SQL'
CREATE ROLE fs_auth LOGIN PASSWORD :'pass';
CREATE DATABASE fs_auth OWNER fs_auth;
REVOKE ALL ON DATABASE fs_auth FROM PUBLIC;
\connect fs_auth
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_auth;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_CMS_PASSWORD" <<'SQL'
CREATE ROLE fs_cms LOGIN PASSWORD :'pass';
CREATE DATABASE fs_cms OWNER fs_cms;
REVOKE ALL ON DATABASE fs_cms FROM PUBLIC;
\connect fs_cms
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_cms;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_LEAD_PASSWORD" <<'SQL'
CREATE ROLE fs_lead LOGIN PASSWORD :'pass';
CREATE DATABASE fs_lead OWNER fs_lead;
REVOKE ALL ON DATABASE fs_lead FROM PUBLIC;
\connect fs_lead
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_lead;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_CRM_PASSWORD" <<'SQL'
CREATE ROLE fs_crm LOGIN PASSWORD :'pass';
CREATE DATABASE fs_crm OWNER fs_crm;
REVOKE ALL ON DATABASE fs_crm FROM PUBLIC;
\connect fs_crm
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_crm;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_PROJECT_PASSWORD" <<'SQL'
CREATE ROLE fs_project LOGIN PASSWORD :'pass';
CREATE DATABASE fs_project OWNER fs_project;
REVOKE ALL ON DATABASE fs_project FROM PUBLIC;
\connect fs_project
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_project;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_FILE_PASSWORD" <<'SQL'
CREATE ROLE fs_file LOGIN PASSWORD :'pass';
CREATE DATABASE fs_file OWNER fs_file;
REVOKE ALL ON DATABASE fs_file FROM PUBLIC;
\connect fs_file
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_file;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_PROPOSAL_PASSWORD" <<'SQL'
CREATE ROLE fs_proposal LOGIN PASSWORD :'pass';
CREATE DATABASE fs_proposal OWNER fs_proposal;
REVOKE ALL ON DATABASE fs_proposal FROM PUBLIC;
\connect fs_proposal
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_proposal;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_BILLING_PASSWORD" <<'SQL'
CREATE ROLE fs_billing LOGIN PASSWORD :'pass';
CREATE DATABASE fs_billing OWNER fs_billing;
REVOKE ALL ON DATABASE fs_billing FROM PUBLIC;
\connect fs_billing
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_billing;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_NOTIFICATION_PASSWORD" <<'SQL'
CREATE ROLE fs_notification LOGIN PASSWORD :'pass';
CREATE DATABASE fs_notification OWNER fs_notification;
REVOKE ALL ON DATABASE fs_notification FROM PUBLIC;
\connect fs_notification
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_notification;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_AUTOMATION_PASSWORD" <<'SQL'
CREATE ROLE fs_automation LOGIN PASSWORD :'pass';
CREATE DATABASE fs_automation OWNER fs_automation;
REVOKE ALL ON DATABASE fs_automation FROM PUBLIC;
\connect fs_automation
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_automation;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_MARKETING_PASSWORD" <<'SQL'
CREATE ROLE fs_marketing LOGIN PASSWORD :'pass';
CREATE DATABASE fs_marketing OWNER fs_marketing;
REVOKE ALL ON DATABASE fs_marketing FROM PUBLIC;
\connect fs_marketing
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_marketing;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_ANALYTICS_PASSWORD" <<'SQL'
CREATE ROLE fs_analytics LOGIN PASSWORD :'pass';
CREATE DATABASE fs_analytics OWNER fs_analytics;
REVOKE ALL ON DATABASE fs_analytics FROM PUBLIC;
\connect fs_analytics
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_analytics;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_AUDIT_PASSWORD" <<'SQL'
CREATE ROLE fs_audit LOGIN PASSWORD :'pass';
CREATE DATABASE fs_audit OWNER fs_audit;
REVOKE ALL ON DATABASE fs_audit FROM PUBLIC;
\connect fs_audit
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_audit;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_RAG_PASSWORD" <<'SQL'
CREATE ROLE fs_rag LOGIN PASSWORD :'pass';
CREATE DATABASE fs_rag OWNER fs_rag;
REVOKE ALL ON DATABASE fs_rag FROM PUBLIC;
\connect fs_rag
CREATE EXTENSION IF NOT EXISTS vector;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_rag;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_CHATBOT_PASSWORD" <<'SQL'
CREATE ROLE fs_chatbot LOGIN PASSWORD :'pass';
CREATE DATABASE fs_chatbot OWNER fs_chatbot;
REVOKE ALL ON DATABASE fs_chatbot FROM PUBLIC;
\connect fs_chatbot
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_chatbot;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_AGENT_PASSWORD" <<'SQL'
CREATE ROLE fs_agent LOGIN PASSWORD :'pass';
CREATE DATABASE fs_agent OWNER fs_agent;
REVOKE ALL ON DATABASE fs_agent FROM PUBLIC;
\connect fs_agent
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO fs_agent;
SQL
