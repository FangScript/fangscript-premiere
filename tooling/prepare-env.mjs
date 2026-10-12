import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".env")) {
  console.log("Existing .env preserved.");
  process.exit(0);
}
const random = () => randomBytes(32).toString("hex");
const modules = [
  "auth",
  "cms",
  "lead",
  "crm",
  "project",
  "file",
  "proposal",
  "billing",
  "notification",
  "automation",
  "marketing",
  "analytics",
  "audit",
  "rag",
  "chatbot",
  "agent",
];
const lines = [
  "# Local development only. Change PUBLIC_URL and configure providers before deployment.",
  "DOMAIN=localhost",
  "PUBLIC_URL=http://localhost:8080",
  "NODE_ENV=development",
  "POSTGRES_PASSWORD=" + random(),
  "JWT_SECRET=" + random(),
  "INTERNAL_TOKEN=" + random(),
  "NATS_TOKEN=" + random(),
  "REDIS_PASSWORD=" + random(),
  "BOOTSTRAP_ADMIN_EMAIL=owner@fangscript.local",
  "BOOTSTRAP_ADMIN_PASSWORD=" + random(),
  "SEED_CATALOG=true",
  ...modules.map((m) => "DB_" + m.toUpperCase() + "_PASSWORD=" + random()),
  "OPENAI_API_KEY=",
  "OPENAI_CHAT_MODEL=gpt-4.1-mini",
  "OPENAI_EMBEDDING_MODEL=text-embedding-3-small",
  "OPENAI_TRANSCRIBE_MODEL=whisper-1",
  "CAL_BOOKING_URL=",
  "CAL_WEBHOOK_SECRET=",
  "RESEND_API_KEY=",
  "EMAIL_FROM=",
  "ENQUIRY_EMAIL=",
  "STRIPE_SECRET_KEY=",
  "STRIPE_WEBHOOK_SECRET=",
  "STRIPE_LIVE_ENABLED=false",
  "BANK_TRANSFER_INSTRUCTIONS=",
  "R2_ENDPOINT=",
  "R2_ACCESS_KEY_ID=",
  "R2_SECRET_ACCESS_KEY=",
  "R2_BUCKET=",
  "N8N_WEBHOOK_URL=",
  "N8N_WEBHOOK_SECRET=" + random(),
  "ACME_EMAIL=",
  "BACKUP_BUCKET=",
  "BACKUP_ENDPOINT=",
  "BACKUP_ACCESS_KEY_ID=",
  "BACKUP_SECRET_ACCESS_KEY=",
];
writeFileSync(".env", lines.join("\n") + "\n", { mode: 0o600 });
console.log("Created private .env with generated local secrets. Credentials are not printed.");
