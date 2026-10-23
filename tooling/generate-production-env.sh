#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# Generates a production env file for FangScript Lab.
# The generated file is intentionally ignored by Git and must stay on the VPS.

OUT_FILE="${1:-.env.production}"
ADMIN_EMAIL="${BOOTSTRAP_ADMIN_EMAIL:-}"
if [[ -z "$ADMIN_EMAIL" ]]; then
  read -r -p "Admin email: " ADMIN_EMAIL
fi

if [[ -e "$OUT_FILE" ]]; then
  printf 'Refusing to overwrite %s. Move it aside first if you want a new file.\n' "$OUT_FILE" >&2
  exit 1
fi

random_secret() { openssl rand -hex 32; }

{
  printf '%s\n' \
    'DOMAIN=fangscriptlab.com' \
    'PUBLIC_URL=https://fangscriptlab.com' \
    'NODE_ENV=production' \
    "POSTGRES_PASSWORD=$(random_secret)" \
    "JWT_SECRET=$(random_secret)" \
    "INTERNAL_TOKEN=$(random_secret)" \
    "NATS_TOKEN=$(random_secret)" \
    "REDIS_PASSWORD=$(random_secret)" \
    "BOOTSTRAP_ADMIN_EMAIL=$ADMIN_EMAIL" \
    "BOOTSTRAP_ADMIN_PASSWORD=$(random_secret)" \
    'SEED_CATALOG=true' \
    "DB_AUTH_PASSWORD=$(random_secret)" \
    "DB_CMS_PASSWORD=$(random_secret)" \
    "DB_LEAD_PASSWORD=$(random_secret)" \
    "DB_CRM_PASSWORD=$(random_secret)" \
    "DB_PROJECT_PASSWORD=$(random_secret)" \
    "DB_FILE_PASSWORD=$(random_secret)" \
    "DB_PROPOSAL_PASSWORD=$(random_secret)" \
    "DB_BILLING_PASSWORD=$(random_secret)" \
    "DB_NOTIFICATION_PASSWORD=$(random_secret)" \
    "DB_AUTOMATION_PASSWORD=$(random_secret)" \
    "DB_MARKETING_PASSWORD=$(random_secret)" \
    "DB_ANALYTICS_PASSWORD=$(random_secret)" \
    "DB_AUDIT_PASSWORD=$(random_secret)" \
    "DB_RAG_PASSWORD=$(random_secret)" \
    "DB_CHATBOT_PASSWORD=$(random_secret)" \
    "DB_AGENT_PASSWORD=$(random_secret)" \
    'OPENAI_CHAT_MODEL=gpt-4.1-mini' \
    'OPENAI_EMBEDDING_MODEL=text-embedding-3-small' \
    'OPENAI_TRANSCRIBE_MODEL=whisper-1' \
    'STRIPE_LIVE_ENABLED=false'

  # Optional integrations remain deliberately empty until configured.
  printf '%s\n' \
    'OPENAI_API_KEY=' 'CAL_BOOKING_URL=' 'CAL_WEBHOOK_SECRET=' \
    'RESEND_API_KEY=' 'EMAIL_FROM=' 'ENQUIRY_EMAIL=' \
    'STRIPE_SECRET_KEY=' 'STRIPE_WEBHOOK_SECRET=' \
    'BANK_TRANSFER_INSTRUCTIONS=' 'R2_ENDPOINT=' 'R2_ACCESS_KEY_ID=' \
    'R2_SECRET_ACCESS_KEY=' 'R2_BUCKET=' 'N8N_WEBHOOK_URL=' \
    "N8N_WEBHOOK_SECRET=$(random_secret)" 'ACME_EMAIL=' 'BACKUP_BUCKET=' \
    'BACKUP_ENDPOINT=' 'BACKUP_ACCESS_KEY_ID=' 'BACKUP_SECRET_ACCESS_KEY='
} > "$OUT_FILE"

chmod 600 "$OUT_FILE"
printf 'Created %s with 51 variables. Import its contents into Coolify, then redeploy.\n' "$OUT_FILE"
