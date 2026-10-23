import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
// This legacy scaffolder is for new skeletons, not migrations of deployed systems.
if (existsSync("compose.yml") || existsSync("infra/postgres/init.sh")) {
  throw new Error("Infrastructure already exists. Edit the maintained deployment files directly; regenerating this legacy skeleton would discard deployment fixes.");
}
const modules = JSON.parse(readFileSync("contracts/modules.json", "utf8"));
const ai = ["rag", "chatbot", "agent"];
const names = [...modules.map((m) => m.id), ...ai];
mkdirSync("infra/postgres", { recursive: true });
mkdirSync("infra/traefik", { recursive: true });
const baseEnv = ["NODE_ENV", "PUBLIC_URL", "JWT_SECRET", "INTERNAL_TOKEN", "NATS_TOKEN"];
const providerVars = {
  auth: ["BOOTSTRAP_ADMIN_EMAIL", "BOOTSTRAP_ADMIN_PASSWORD"],
  cms: ["SEED_CATALOG"],
  lead: ["CAL_BOOKING_URL", "CAL_WEBHOOK_SECRET"],
  billing: [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_LIVE_ENABLED",
    "BANK_TRANSFER_INSTRUCTIONS",
  ],
  notification: ["RESEND_API_KEY", "EMAIL_FROM", "ENQUIRY_EMAIL"],
  file: ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"],
  automation: ["N8N_WEBHOOK_URL", "N8N_WEBHOOK_SECRET"],
};
let compose = `name: fangscript\nservices:\n  postgres:\n    image: pgvector/pgvector:pg17\n    restart: unless-stopped\n    env_file: .env\n    environment:\n      POSTGRES_USER: postgres\n    volumes:\n      - postgres-data:/var/lib/postgresql/data\n      - ./infra/postgres/init.sh:/docker-entrypoint-initdb.d/10-modules.sh:ro\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      timeout: 3s\n      retries: 20\n  redis:\n    image: redis:7-alpine\n    restart: unless-stopped\n    command: ["redis-server", "--appendonly", "yes", "--requirepass", "\${REDIS_PASSWORD}"]\n    volumes: ["redis-data:/data"]\n  nats:\n    image: nats:2-alpine\n    restart: unless-stopped\n    command: ["-js", "-sd", "/data", "--auth", "\${NATS_TOKEN}"]\n    volumes: ["nats-data:/data"]\n`;
for (const m of modules) {
  compose += `  ${m.id}:\n    build: ./services/${m.id}\n    restart: unless-stopped\n    environment:\n      PORT: ${m.port}\n      DATABASE_URL: postgresql://fs_${m.id}:\${DB_${m.id.toUpperCase()}_PASSWORD}@postgres:5432/fs_${m.id}\n      REDIS_URL: redis://:\${REDIS_PASSWORD}@redis:6379\n      NATS_URL: nats://nats:4222\n`;
  for (const key of [...baseEnv, ...(providerVars[m.id] || [])])
    compose += `      ${key}: \${${key}:-}\n`;
  compose += `    depends_on:\n      postgres: { condition: service_healthy }\n      redis: { condition: service_started }\n      nats: { condition: service_started }\n    healthcheck:\n      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:${m.port}/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]\n      interval: 30s\n      timeout: 5s\n      retries: 3\n`;
}
for (const m of ai) {
  compose += `  ${m}:\n    build: ./services/${m}\n    restart: unless-stopped\n    environment:\n      DATABASE_URL: postgresql://fs_${m}:\${DB_${m.toUpperCase()}_PASSWORD}@postgres:5432/fs_${m}\n      REDIS_URL: redis://:\${REDIS_PASSWORD}@redis:6379\n      NATS_URL: nats://nats:4222\n      CMS_URL: http://cms:4201\n      RAG_URL: http://rag:4300\n      NOTIFICATION_URL: http://notification:4208\n`;
  for (const key of [
    ...baseEnv,
    "OPENAI_API_KEY",
    "OPENAI_CHAT_MODEL",
    "OPENAI_EMBEDDING_MODEL",
    "OPENAI_TRANSCRIBE_MODEL",
  ])
    compose += `      ${key}: \${${key}:-}\n`;
  compose += `    depends_on:\n      postgres: { condition: service_healthy }\n      redis: { condition: service_started }\n    healthcheck:\n      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:4300/health/ready')"]\n      interval: 30s\n      timeout: 5s\n      retries: 3\n`;
}
compose += `  gateway:\n    build: ./services/gateway\n    restart: unless-stopped\n    ports: ["127.0.0.1:4100:4100"]\n    environment:\n      PORT: 4100\n`;
for (const m of modules) compose += `      ${m.id.toUpperCase()}_URL: http://${m.id}:${m.port}\n`;
for (const m of ai) compose += `      ${m.toUpperCase()}_URL: http://${m}:4300\n`;
compose += `  web:\n    build: .\n    restart: unless-stopped\n    profiles: ["production"]\n    environment:\n      API_GATEWAY_URL: http://gateway:4100\n  admin:\n    build: ./apps/admin\n    restart: unless-stopped\n    ports: ["127.0.0.1:4101:80"]\n  portal:\n    build: ./apps/portal\n    restart: unless-stopped\n    ports: ["127.0.0.1:4102:80"]\n  traefik:\n    image: traefik:v3.6\n    restart: unless-stopped\n    profiles: ["production"]\n    ports: ["80:80", "443:443"]\n    command:\n      - --providers.file.filename=/etc/traefik/routes.yml\n      - --entrypoints.web.address=:80\n      - --entrypoints.websecure.address=:443\n      - --entrypoints.web.http.redirections.entrypoint.to=websecure\n      - --certificatesresolvers.letsencrypt.acme.email=\${ACME_EMAIL}\n      - --certificatesresolvers.letsencrypt.acme.storage=/certificates/acme.json\n      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web\n    volumes:\n      - ./infra/traefik/routes.yml:/etc/traefik/routes.yml:ro\n      - certificates:/certificates\n  n8n:\n    image: n8nio/n8n:latest\n    restart: unless-stopped\n    profiles: ["automation"]\n    ports: ["127.0.0.1:5678:5678"]\n    environment:\n      N8N_ENCRYPTION_KEY: \${N8N_WEBHOOK_SECRET}\n      N8N_DIAGNOSTICS_ENABLED: "false"\n    volumes: ["n8n-data:/home/node/.n8n"]\nvolumes:\n  postgres-data:\n  redis-data:\n  nats-data:\n  certificates:\n  n8n-data:\n`;
compose = compose.replace(
  "volumes:\n  postgres-data:",
  `  backup:
    build: ./infra/backup
    profiles: ["backup"]
    restart: on-failure
    environment:
      PGPASSWORD: \${POSTGRES_PASSWORD}
      BACKUP_BUCKET: \${BACKUP_BUCKET:-}
      BACKUP_ENDPOINT: \${BACKUP_ENDPOINT:-}
      AWS_ACCESS_KEY_ID: \${BACKUP_ACCESS_KEY_ID:-}
      AWS_SECRET_ACCESS_KEY: \${BACKUP_SECRET_ACCESS_KEY:-}
    depends_on:
      postgres: { condition: service_healthy }
volumes:
  postgres-data:`,
);
compose = compose
  .replace("    env_file: .env\n", "")
  .replace(
    "      POSTGRES_USER: postgres\n",
    "      POSTGRES_USER: postgres\n      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}\n" +
      names
        .map(
          (name) =>
            "      DB_" +
            name.toUpperCase() +
            "_PASSWORD: ${DB_" +
            name.toUpperCase() +
            "_PASSWORD}\n",
        )
        .join(""),
  );
writeFileSync("compose.yml", compose);
let init = "#!/bin/sh\nset -eu\n";
for (const name of names)
  init += `psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -v pass="$DB_${name.toUpperCase()}_PASSWORD" <<'SQL'\nCREATE ROLE fs_${name} LOGIN PASSWORD :'pass';\nCREATE DATABASE fs_${name} OWNER fs_${name};\nREVOKE ALL ON DATABASE fs_${name} FROM PUBLIC;\n\\connect fs_${name}\n${name === "rag" ? "CREATE EXTENSION IF NOT EXISTS vector;\n" : ""}REVOKE CREATE ON SCHEMA public FROM PUBLIC;\nGRANT ALL ON SCHEMA public TO fs_${name};\nSQL\n`;
writeFileSync("infra/postgres/init.sh", init);
writeFileSync(
  "infra/traefik/routes.yml",
  `http:\n  routers:\n    api:\n      rule: "PathPrefix(\u0060/api/v1\u0060)"\n      service: gateway\n      entryPoints: [websecure]\n      tls: { certResolver: letsencrypt }\n      priority: 100\n    admin:\n      rule: "PathPrefix(\u0060/admin\u0060)"\n      service: admin\n      entryPoints: [websecure]\n      tls: { certResolver: letsencrypt }\n      priority: 90\n    portal:\n      rule: "PathPrefix(\u0060/portal\u0060)"\n      service: portal\n      entryPoints: [websecure]\n      tls: { certResolver: letsencrypt }\n      priority: 90\n    web:\n      rule: "PathPrefix(\u0060/\u0060)"\n      service: web\n      entryPoints: [websecure]\n      tls: { certResolver: letsencrypt }\n  services:\n    gateway:\n      loadBalancer:\n        servers: [{url: "http://gateway:4100"}]\n    admin:\n      loadBalancer:\n        servers: [{url: "http://admin:80"}]\n    portal:\n      loadBalancer:\n        servers: [{url: "http://portal:80"}]\n    web:\n      loadBalancer:\n        servers: [{url: "http://web:3000"}]\n`,
);
// Host rules are rendered from deployment configuration without rewriting source history.
writeFileSync(
  "infra/traefik/README.md",
  "Before production, run `node tooling/configure-domain.mjs` after setting DOMAIN in .env. This adds explicit host rules required for certificate issuance.\n",
);
