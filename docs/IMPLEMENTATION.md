# FangScript Lab platform

## Independent deployment units

The public TanStack Start application remains at the repository root so the Lovable connection continues working. `apps/admin` and `apps/portal` are independently built React applications. Every directory in `services` has its own manifest, server, image, configuration, and API contract. No service imports another service's runtime code. Run `node tooling/check-boundaries.mjs` to enforce this rule.

`tooling/*-template*` and the scaffold scripts are **build-time source templates**, not runtime libraries. The generated service directories are checked in and deploy without the tooling directory. Change a template deliberately when applying a common fix, regenerate, and review all resulting module diffs. A change to one deployed service does not require deploying its peers.

Business services use their own database and credentials on one PostgreSQL instance. Sharing the database server does not grant access to sibling databases. APIs use `/api/v1/<module>`; events use versioned `fangscript.<module>.*.v1` subjects. Contracts are in `contracts` and each service's `openapi.json`; Python services also expose FastAPI's OpenAPI document.

## Local setup

1. Install Node 24, Python 3.11+ for development checks, pnpm, and Docker with a running Linux engine.
2. Run `pnpm install --frozen-lockfile`.
3. Run `node tooling/prepare-env.mjs`. It generates private local secrets in `.env` without printing them. Read the local bootstrap email and password from that file to sign in; replace the initial password/account before production. Never commit this file.
4. Run `docker compose up --build -d`. This starts databases, the event bus, independent APIs, gateway, admin, portal, and the public production image (port 3001 by default).
5. Run `pnpm dev`. Open the printed local URL. The public development server proxies `/api/v1`, `/admin`, and `/portal` to their independent local services.
6. CMS seed data imports the complete five-category service catalogue. Illustrative showcase entries remain clearly labelled. Replace them with verified work through the CMS.

If Docker is unavailable, the public frontend and both independent workspaces can still be built and visually tested. Persisted workflows require the backend; the UI shows unavailable or unconfigured states instead of claiming a successful submission.

## Configuration

See `docs/deployment-repair.md` for the audit repairs, existing-database reconciliation, explicit administrator recovery, required secrets, and separate Coolify frontend networking. Production deployments must supply existing credentials; there are no shared fallback passwords. Normal auth restarts preserve the bootstrap account.

Provider secrets stay server-side. Set a real `PUBLIC_URL`, `DOMAIN`, enquiry email, bootstrap account, and provider settings in `.env` before deployment. `OPENAI_API_KEY` enables AI generation and embeddings. Model identifiers are explicit environment settings. Cal.com requires a booking URL and webhook signing secret. Resend requires a verified sender and API key. R2 requires endpoint, bucket, access key, and secret; configure bucket CORS for the public origin and PUT/GET/HEAD with Content-Type to support signed uploads.

Stripe uses test credentials by default; live keys are rejected unless `STRIPE_LIVE_ENABLED=true`. Confirm the merchant account can accept the invoice currency before enabling live checkout. A browser redirect never marks an invoice paid: only a verified webhook with matching amount/currency, or an administrator's bank-transfer verification, can do so.

Cal.com webhook URL: `/api/v1/lead/webhooks/cal`. Stripe webhook URL: `/api/v1/billing/webhooks/stripe`. Gateway blocks all `/internal/` endpoints from the public network. Public chatbot retrieval uses the separate public knowledge collection. An unpublished CMS record is removed before the next public retrieval.

## Production

Set `NODE_ENV=production`, `PUBLIC_URL=https://your-domain`, `DOMAIN=your-domain`, and `ACME_EMAIL`. Run `node tooling/configure-domain.mjs`, then `docker compose --profile production up --build -d`. The public image uses Nitro's Node deployment preset; Lovable's existing Cloudflare build remains supported. Only Traefik's HTTP/HTTPS ports are public; development API/admin/portal ports bind to loopback.

Inspect VPS CPU, memory, disk, and existing workloads before launch. No production sizing claim has been verified against your VPS yet. Pin tested container image digests in the deployment environment. External provider accounts and DNS are not created by this repository.

Enable the `automation` Compose profile for the separately managed n8n instance. Configure its own owner account and workflow webhook authentication. Automation event deliveries include an idempotency key; the receiving workflow must deduplicate before performing an external action. AI-generated external actions require recorded approval and separate execution.

## Persistence and recovery

Each mutation writes its event to an outbox in the same transaction. Consumers deduplicate by event ID. Failed deliveries retry with backoff; exhausted messages are retained as records for investigation. Each service exposes `/health/live` and `/health/ready`. JSON logs include request IDs; gateway error messages never include credentials.

Enable the `backup` profile after setting `BACKUP_BUCKET`, `BACKUP_ENDPOINT`, `BACKUP_ACCESS_KEY_ID`, and `BACKUP_SECRET_ACCESS_KEY`. The backup image uploads a daily archive per module, fails visibly when a dump/upload fails, and verifies archive manifests. Configure external alerting on a stopped backup container. Object storage media is separate from database backups; keep bucket retention/versioning appropriate to your storage provider.

Monthly, download an archive and run `infra/restore-drill.sh` in a PostgreSQL client container on the private network. The drill creates a separate database and never overwrites the production database. Inspect records and run application smoke tests against the restored copy. A manifest check alone is not a restore test.

Rollback application images to the previous known-good digest. Migrations are additive and recorded per service; never roll back by deleting a live database or rewriting published Git history. Restore data only into a new database first, verify, then schedule a controlled switch.

## Validation

- `pnpm typecheck` — public frontend types.
- `pnpm test:boundaries` — module isolation.
- `pnpm test:domain` — tenant visibility, invoice arithmetic, input constraints.
- `sh tests/backup.sh` — isolated backup checks with mocked database/storage commands; verifies dump, archive validation, and upload failures stop the job without a success message. Included in CI; does not replace a real restore drill.
- `pnpm test:browser` — responsive public pages, 3D canvas, enquiry states, and independent workspace entry points. Browser fixtures are test-only; no fake metrics are shipped.
- `pnpm test:integration` — requires the running Compose stack; verifies persisted workflows and isolation.
- `pnpm build:all` — public Node production build plus independent admin and portal builds.
- Python tests: create a local venv, install each AI service's requirements, and run `python -m unittest discover -s tests` from the corresponding service directory.

Live email, scheduling, AI, storage, and payment acceptance must also be checked with the actual configured provider accounts before launch.

## Current verification limits

The public, admin, and portal production builds have been checked locally. Browser checks cover actual WebGL rendering, unavailable WebGL, reduced motion/mobile navigation, the complete service catalogue, CMS empty publication state, editor errors, and enquiry acknowledgement/failure. Domain checks exercise consent, tenant visibility, invoice arithmetic, and unsafe links. These are not a substitute for the persisted integration suite.

The local Docker Linux engine was unavailable during implementation. Consequently the Compose application startup, database migrations, event delivery, cross-company HTTP journeys, live provider webhooks, and backup restoration have not yet been executed locally. CI includes a real Compose integration job; it must pass before deployment. No production deployment or provider account activation has been performed.

The latest local checks passed all 78 domain cases across 13 business services, module boundaries, frontend types, and four isolated backup scenarios. Invoice/proposal validation now uses decimal arithmetic for half-cent rounding and rejects totals exceeding safe integer limits after tax. Backup failures propagate explicitly from dump, manifest verification, and upload commands. These checks do not establish live payment or backup restoration readiness.

Marketing includes a month calendar, editable drafts, campaign records, and approval actions. The funnel report shows durable event counts and verified revenue by currency; it does not claim cohort conversion rates. CMS page sections are ordered text sections, with server-rendered SEO and private draft preview. Internal drafting retrieves private notes through a service-authenticated endpoint; public retrieval excludes those notes. All backend-driven features still require the persisted and provider checks above before being considered launch-ready.
