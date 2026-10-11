# FangScript Platform: Architecture and Technical Documentation

**Version:** 0.1 (Draft)\
**Date:** October 11, 2026\
**Owner:** FangScript AI\
**Companion documents:** Software Requirements Specification (SRS); `fangscript-db` schema package

## 1. Overview

The FangScript Platform is a microservice system with three front-end apps, an API gateway, an event bus and 16 backend services. Each service is a separate deployable with its own code folder, Dockerfile, database and pipeline. The repository is organised by service, not as a monolith.

```
Clients:  web-public    admin-app    client-portal
              |             |             |
              +-------------+-------------+
                            |
                      API gateway  (routing, rate limits, token check)
                            |
     +----------+-----------+-----------+-------------+
     | Growth   | Delivery  | Finance   | Intelligence|
     | cms      | project   | proposal  | chatbot     |
     | lead     | file      | billing   | rag         |
     | crm      | notific.  |           | agent       |
     | marketing|           |           | automation  |
     |          |           |           | analytics   |
     +----------+-----------+-----------+-------------+
  Edge/Platform: auth-service, audit-service
                            |
                  Event bus (NATS JetStream or RabbitMQ)
                            |
   Postgres (one per service)  Redis  Object storage  Vector index
```

## 2. Architecture Principles

1. **One service, one responsibility, one database.** No service reads another's tables.
2. **Contracts over code sharing.** The only shared package is `contracts/` (OpenAPI specs and event schemas).
3. **Commands synchronous, facts asynchronous.** Queries that need an answer now use REST/gRPC. State changes are published as events.
4. **Design for failure.** Outbox publishing, idempotent consumers, retries with backoff, health checks and timeouts everywhere.
5. **Human-in-the-loop AI.** Agents propose; people approve. This is enforced in the database as well as in code.
6. **Start small, split later.** Build the Phase 1 services first; keep boundaries clean so later services plug in without rewrites.

## 3. Service Catalogue

| Domain | Service | Responsibility | Stack |
| --- | --- | --- | --- |
| Edge | `api-gateway` | Routing, rate limiting, JWT validation, CORS | Traefik or Kong |
| Edge | `auth-service` | Users, roles, permissions, sessions, API keys, invitations | Node.js / TypeScript |
| Growth | `cms-service` | Service categories, services, pages, posts, case studies, revisions | Node.js / TypeScript |
| Growth | `lead-service` | Lead intake, scoring, touchpoints, bookings, consent | Node.js / TypeScript |
| Growth | `crm-service` | Companies, contacts, deals, pipeline, activities | Node.js / TypeScript |
| Growth | `marketing-service` | Content calendar, approvals, campaign metrics | Node.js / TypeScript |
| Delivery | `project-service` | Projects, milestones, tasks, status updates | Node.js / TypeScript |
| Delivery | `file-service` | Uploads, versions, signed URLs, shares | Node.js / TypeScript |
| Delivery | `notification-service` | Email, in-app, outbound webhooks | Node.js / TypeScript |
| Finance | `proposal-service` | Templates, proposals, status history | Node.js / TypeScript |
| Finance | `billing-service` | Invoices, payments, provider webhooks | Node.js / TypeScript |
| Intelligence | `chatbot-service` | Public and internal chat, qualification, feedback | Python / FastAPI |
| Intelligence | `rag-service` | Ingestion, chunking, embeddings, retrieval | Python / FastAPI |
| Intelligence | `agent-service` | Approval-gated agents (Hermes) | Python / FastAPI |
| Intelligence | `automation-service` | n8n bridge, event-to-workflow mapping, run logs | Node.js / TypeScript |
| Intelligence | `analytics-service` | Funnel and revenue metrics from events | Node.js or Python |
| Platform | `audit-service` | Append-only audit log | Node.js / TypeScript |

Front ends: `web-public`, `admin-app`, `client-portal` (Vite + React). They talk only to the gateway.

## 4. Communication

### 4.1 Synchronous

REST with OpenAPI 3 specs. Examples: the client portal asking `project-service` for a project, `chatbot-service` asking `rag-service` for retrieval. Every call carries a timeout, retry policy and circuit breaker. Service-to-service calls use short-lived service tokens.

### 4.2 Asynchronous

All state changes publish events through the outbox. Consumers record each processed event id (`processed_events`) so a replay causes no duplicate effects.

**Event envelope**

```json
{
  "id": "uuid",
  "type": "lead.created.v1",
  "occurred_at": "2026-10-11T09:00:00Z",
  "source": "lead-service",
  "correlation_id": "uuid",
  "actor": { "kind": "user|agent|system|api_key", "id": "uuid" },
  "tenant_id": "uuid or null",
  "data": { }
}
```

### 4.3 Initial event catalogue

| Event | Producer | Consumers |
| --- | --- | --- |
| `user.created.v1`, `user.invited.v1` | auth | notification, audit |
| `content.published.v1` | cms | rag, analytics |
| `lead.created.v1` | lead | crm, notification, automation, analytics |
| `lead.qualified.v1` | lead | crm, notification, automation |
| `booking.scheduled.v1` | lead | crm, notification, analytics |
| `chat.qualified.v1` | chatbot | lead, analytics |
| `contact.created.v1` | crm | lead (stores contact id), analytics |
| `deal.stage_changed.v1` | crm | analytics, audit, automation |
| `deal.won.v1` | crm | proposal, project, notification, analytics |
| `proposal.sent.v1`, `proposal.accepted.v1` | proposal | crm, project, billing, notification |
| `project.created.v1` | project | notification, analytics |
| `milestone.completed.v1` | project | billing, notification |
| `file.uploaded.v1` | file | rag (if marked for the knowledge base), notification |
| `invoice.sent.v1`, `invoice.paid.v1`, `invoice.overdue.v1` | billing | notification, crm, project, automation, analytics |
| `document.indexed.v1` | rag | analytics |
| `agent.action_proposed.v1` | agent | notification (approval inbox) |
| `agent.action_approved.v1` | admin app via agent | agent, audit |
| `content.draft_submitted.v1`, `content.approved.v1` | marketing | notification, audit |
| `workflow.failed.v1` | automation | notification |

### 4.4 Key flows

**Lead to client**

1. Visitor submits the form or finishes a chat. `lead-service` stores the lead and publishes `lead.created.v1`.
2. `crm-service` creates the contact and company; `notification-service` alerts the team; `automation-service` starts the follow-up workflow.
3. A deal is won (`deal.won.v1`). `proposal-service` prepares the proposal; on `proposal.accepted.v1`, `project-service` creates the project and `billing-service` creates the deposit invoice.
4. `invoice.paid.v1` updates the CRM and notifies the client.

**Chat answer**

1. Browser sends the message to `chatbot-service` through the gateway.
2. `chatbot-service` requests relevant chunks from `rag-service` (public collection only).
3. The LLM answers with citations; the message, citations and token metrics are stored.
4. When qualification is complete, `chat.qualified.v1` goes to `lead-service`.

## 5. Data Architecture

- PostgreSQL, one database and one role per service; roles cannot connect to other databases.
- Soft references between services (plain `uuid`, no foreign keys). A read-model copy is kept only when a service must display another's data frequently, updated from events.
- Money: `numeric(14,2)` plus a currency code. Timestamps: UTC `timestamptz`.
- Redis for cache, rate limiting and short-lived state. Object storage for file bytes (metadata in `file-service`). Vector search in `rag-service` via pgvector (embedding column `vector(1536)`, HNSW index).
- Migrations are versioned per service (`migrations/001_init.sql` and onward). Schema details are in the `fangscript-db` package and its `README`.

## 6. Security Architecture

| Area | Design |
| --- | --- |
| Transport | TLS at the edge; internal traffic on a private network |
| Authentication | Short-lived JWT access tokens and rotating refresh tokens issued by `auth-service` |
| Authorization | Role permissions checked at the gateway and again in each service; tenant id applied to every client query |
| Secrets | Environment variables or a secrets manager; never in the repo or the front ends |
| Public endpoints | Rate limiting, honeypots or Turnstile, payload size limits; chatbot token budgets |
| Webhooks | Signature verification and an idempotency key (`provider_webhook_events`) |
| AI controls | Allowed-tools list per agent; `requires_approval` locked to true; execution impossible without an approver |
| Audit | Append-only `audit_log` with update, delete and truncate blocked by triggers |
| Privacy | Consent timestamps, data export and deletion procedures, cookie consent |

## 7. Repository Structure

```
fangscript/
  services/
    auth-service/        # each: src/{api,domain,events,db}, migrations/, Dockerfile, openapi.yaml, tests/
    lead-service/
    crm-service/
    chatbot-service/     # Python
    rag-service/         # Python
    ...                  # one folder per service
  apps/
    web-public/
    admin-app/
    client-portal/
  contracts/             # OpenAPI specs and event schemas only
  infra/
    docker-compose.yml
    gateway/
    postgres/init.sql
    k8s/                 # later
  docs/
  .github/workflows/     # path-filtered pipeline per service
```

**Boundary rules:** no cross-service imports; no shared database access; shared code only via `contracts/`. A monorepo is used for convenience; any service can move to its own repository without code changes.

## 8. Deployment

### 8.1 Environments

`local` (Docker Compose), `staging` and `production` on a Linux VPS with Docker. Move to k3s or managed Kubernetes when load or team size justifies it.

### 8.2 Infrastructure

- Reverse proxy and gateway (Traefik or Kong) with automatic TLS.
- Postgres (managed, or self-hosted with scheduled backups), Redis, object storage (R2 or S3), broker (NATS JetStream or RabbitMQ), n8n instance.
- Minimum starting size for Phase 1: 4 vCPU, 8 GB RAM. Resize as services are added.

### 8.3 CI/CD

- GitHub Actions with path filters: a change in `services/lead-service/**` builds, tests and deploys only that service.
- Pipeline: lint, unit tests, API contract check, build image, scan image, push, deploy to staging, smoke test, manual promote to production.
- Database migrations run as a step before the new version starts, and must be backward compatible for one release.

### 8.4 Configuration

Twelve-factor: all settings through environment variables; one `.env.example` per service.

## 9. Observability and Operations

- **Logging:** structured JSON with `request_id` and `correlation_id`, aggregated in Loki.
- **Metrics and tracing:** OpenTelemetry to Grafana; dashboards per service (latency, errors, queue depth).
- **Errors:** Sentry for services and front ends.
- **Health:** `/health/live` and `/health/ready` on every service.
- **Alerts:** gateway 5xx rate, outbox backlog, consumer lag, failed payments or webhooks, backup failures, agent actions pending too long.
- **Backups:** daily per-database dumps to object storage, restore tested monthly.
- **Incident basics:** identify the failing service from the correlation id, check the outbox and consumer lag, replay events if needed (safe because consumers are idempotent), and write a short post-incident note.

## 10. Testing Strategy

| Level | Scope |
| --- | --- |
| Unit | Domain logic inside each service |
| API / contract | Each service against its `openapi.yaml`; event payloads against `contracts/` schemas |
| Integration | Service plus its database and broker in Compose |
| End to end | Key journeys: lead to won deal, chat to booking, proposal to paid invoice |
| Security | Auth and tenant-isolation tests; dependency and image scans |
| Performance | Load test public pages and the chat endpoint before launch |

## 11. Local Development

1. Clone the repository and copy each `.env.example` to `.env`.
2. Start infrastructure: `docker compose up postgres redis broker minio`.
3. Create databases with `infra/postgres/init.sql`, then run each service's migrations.
4. Start the services you need plus the gateway; run front ends with their dev servers.
5. Seed data: pipeline stages, role permissions, the five service categories.

## 12. Architecture Decision Records

| # | Decision | Reason | Trade-off |
| --- | --- | --- | --- |
| ADR-1 | Microservices with a database per service | Independent change, scaling and failure isolation; matches the requirement that every module is its own service | More operational work; mitigated by phasing and a uniform service template |
| ADR-2 | Monorepo with strict boundaries | One place for contracts and tooling for a small team | Needs discipline to avoid coupling |
| ADR-3 | Outbox plus idempotent consumers | No lost or duplicated events | Extra tables and a relay process |
| ADR-4 | NATS JetStream or RabbitMQ over Kafka | Far lighter to run at this scale | Smaller ecosystem than Kafka; final choice still open |
| ADR-5 | TypeScript for business services, Python for AI services | Matches the existing stack and the AI tooling ecosystem | Two runtimes to maintain |
| ADR-6 | Soft references, no cross-database foreign keys | Preserves service ownership of data | Integrity enforced by events and code, not the database |
| ADR-7 | Approval gates enforced in the schema | AI safety rule that cannot be bypassed by a code bug | Slightly slower agent workflows |
| ADR-8 | VPS with Docker instead of cPanel | Shared hosting cannot run queues, a vector store or n8n | Hosting cost and server administration |

## 13. Delivery Roadmap

| Phase | Services and apps | Exit criteria |
| --- | --- | --- |
| P1: Sell | gateway, auth, cms, lead, crm, chatbot (with RAG), notification; web-public, admin-app | A visitor can chat or book; the lead reaches the CRM; the team is notified |
| P2: Operate | project, file, proposal, billing, automation; client portal | A won deal becomes a proposal, project and paid invoice; clients see only their own data |
| P3: Intelligence | agent, marketing, analytics, audit; split RAG; internal chat | No agent action executes without approval; audit log is immutable |

## 14. Open Decisions

1. Event broker: NATS JetStream or RabbitMQ.
2. Gateway: Traefik or Kong.
3. Vector store: pgvector or a dedicated service (Qdrant).
4. Hosting provider and size.
5. Whether the platform will later be offered to other agencies (affects multi-tenancy design).
6. Migration tooling per runtime (Prisma or node-pg-migrate; Alembic for Python).
