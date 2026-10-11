# FangScript Platform: Software Requirements Specification (SRS)

**Version:** 0.1 (Draft)\
**Date:** October 11, 2026\
**Owner:** FangScript AI\
**Status:** For review and approval

## 1. Introduction

### 1.1 Purpose

This document specifies the requirements for the FangScript Platform: a custom, microservice-based system that combines FangScript's public website with the internal tools needed to run the agency (lead capture, CRM, project delivery, proposals, billing, AI assistants and automation). It is the reference for design, development, testing and acceptance.

### 1.2 Scope

The platform has three user-facing surfaces backed by independent services:

1. **Public site:** presents FangScript's five service categories, portfolio and blog, captures leads, and hosts the website chatbot.
2. **Admin app (Agency OS):** the internal workspace for leads, clients, content, projects, proposals, invoices and AI agents.
3. **Client portal:** a login area where clients see project status, files, proposals and invoices.

Out of scope for this version: native mobile apps, a public marketplace, white-labelling or reselling the platform to other agencies (see Open Issues), and automatic posting to social networks.

### 1.3 Definitions

| Term | Meaning |
| --- | --- |
| Service category | One of the five offerings: Technology & Software Development; AI & Intelligent Automation; Digital Marketing & Growth; Content & Creative; Business Systems, Data & Integrations |
| Tenant | A client company. Client users see only their tenant's data |
| Microservice | An independently deployable service that owns its own database |
| Event | An asynchronous message published when state changes (for example `lead.created.v1`) |
| RAG | Retrieval-augmented generation: the chatbot answers from indexed FangScript content |
| Hermes | FangScript's internal, approval-gated agency agent |
| Soft reference | A stored id pointing at another service's record, with no database-level foreign key |

### 1.4 References

- FangScript Complete Services List
- FangScript Platform: Architecture and Technical Documentation
- `fangscript-db` package (per-service database schemas and `README`)

### 1.5 Conventions

Requirements are identified as `FR-<MODULE>-nn` (functional) and `NFR-<AREA>-nn` (non-functional). Priority uses MoSCoW: **M** must, **S** should, **C** could. **P1, P2, P3** denote the release phase (Section 8).

## 2. Overall Description

### 2.1 Product perspective

The platform replaces a single-purpose marketing site with a system of 16 backend services, three front-end apps, an API gateway and an event bus. Services never share a database. They communicate through REST/gRPC for immediate queries and through events for state changes.

### 2.2 Product functions (summary)

- Present services and proof of work; convert visitors into leads (forms, chatbot, booking).
- Qualify and track leads and deals; manage companies and contacts.
- Generate proposals, run projects, share files, issue and track invoices.
- Provide a RAG chatbot for visitors and an internal assistant for the team.
- Automate follow-ups and integrations (n8n); report on funnel and revenue.
- Provide approval-gated AI agents that draft work but never act unilaterally.

### 2.3 User classes

| Class | Description | Access |
| --- | --- | --- |
| Visitor | Anonymous person on the public site | Public pages, chatbot, forms |
| Client | Customer user belonging to a tenant | Own tenant's projects, files, proposals, invoices |
| Team member | FangScript staff or contractor | Assigned leads, projects and content |
| Admin | Agency owner | Everything, including users, billing and settings |
| AI agent | Non-human actor (Hermes and others) | Proposes actions; a human must approve before execution |

### 2.4 Operating environment

Containerised services (Docker) on a Linux VPS, PostgreSQL per service, Redis, S3-compatible object storage, a vector store, and a message broker (NATS JetStream or RabbitMQ). Front ends run in modern evergreen browsers on desktop and mobile.

### 2.5 Constraints

- Every module is a separate microservice; the repository layout is not monolithic.
- One database per service; no cross-database foreign keys or joins.
- Shared code is limited to the `contracts/` package (API specs and event schemas).
- AI agents may not auto-post, auto-send or auto-execute; every action is approval-gated.
- The public chatbot's behaviour must not change when internal AI features are added.
- Shared cPanel hosting cannot run the full system; a VPS is required from Phase 1 onward (the existing site may remain on cPanel until cut-over).

### 2.6 Assumptions and dependencies

- Third-party providers are available: LLM API, transactional email, Stripe/PayPal/Wise, Cal.com or Calendly, n8n.
- Content for the five service pages will be supplied or approved by FangScript.
- Only services FangScript can deliver are marketed as available. Others are labelled custom or coming soon.

## 3. Service Content Requirements

The public site presents five service categories under the positioning **Build. Automate. Grow.** Each category has its own page containing: problem solved, specific deliverables, process, FAQs and a call to action. Each service carries an availability label of `available`, `custom` or `coming_soon`. The site must not state results, certifications, clients or experience that have not been established.

## 4. Functional Requirements

### 4.1 Public website (`web-public`)

- **FR-PUB-01** (M, P1) Home page presents the Build/Automate/Grow/Create positioning, the five categories and primary calls to action.
- **FR-PUB-02** (M, P1) One page per service category, rendered from CMS data.
- **FR-PUB-03** (M, P1) Portfolio and case-study pages from CMS data.
- **FR-PUB-04** (M, P1) Contact/quote form and calendar booking embed.
- **FR-PUB-05** (M, P1) Chatbot widget on every page, supporting text, file/image and voice input.
- **FR-PUB-06** (S, P2) Blog with tags and search.
- **FR-PUB-07** (S, P2) Interactive demos (for example ROI calculator, chatbot demo).
- **FR-PUB-08** (M, P1) Cookie consent, privacy policy and terms pages.

### 4.2 Content management (`cms-service`)

- **FR-CMS-01** (M, P1) Admins create, edit, publish and unpublish service categories, services, pages, posts and case studies.
- **FR-CMS-02** (M, P1) Each item has SEO fields: title, description, social image.
- **FR-CMS-03** (M, P1) Services store problem, deliverables, process steps, FAQ and availability label.
- **FR-CMS-04** (S, P2) Draft/published workflow with revision history and restore.
- **FR-CMS-05** (M, P1) Publishing emits `content.published.v1` so the knowledge base can re-index.

### 4.3 Lead capture (`lead-service`)

- **FR-LEAD-01** (M, P1) Accept leads from forms, chatbot and booking, recording source and UTM data.
- **FR-LEAD-02** (M, P1) Reject or flag spam using honeypot and rate limiting.
- **FR-LEAD-03** (M, P1) Store consent (given, timestamp) with each lead.
- **FR-LEAD-04** (M, P1) Score and qualify leads (new, qualified, disqualified, converted).
- **FR-LEAD-05** (M, P1) Record touchpoints per lead (page views, chat, booking).
- **FR-LEAD-06** (M, P1) Emit `lead.created.v1` and `lead.qualified.v1`.

### 4.4 CRM (`crm-service`)

- **FR-CRM-01** (M, P1) Manage companies, contacts and deals; create a contact from a converted lead.
- **FR-CRM-02** (M, P1) Configurable pipeline stages; moving a deal records stage history.
- **FR-CRM-03** (M, P1) Activities (notes, calls, emails, meetings, tasks) on any entity.
- **FR-CRM-04** (S, P1) Tags, search and filters; deal value in a stated currency.
- **FR-CRM-05** (M, P1) Emit `deal.stage_changed.v1` and `deal.won.v1`.

### 4.5 Chatbot (`chatbot-service`)

- **FR-CHAT-01** (M, P1) Public chat answers questions about FangScript's services using the public knowledge base, with source citations.
- **FR-CHAT-02** (M, P1) The bot qualifies visitors (service interest, budget, timeline) and offers booking or a lead form.
- **FR-CHAT-03** (M, P1) Store sessions and messages with model, token and latency metrics.
- **FR-CHAT-04** (S, P1) Thumbs up/down feedback on answers.
- **FR-CHAT-05** (S, P3) Internal chat channel for the team, kept separate from public behaviour.
- **FR-CHAT-06** (M, P1) If an answer is not in the knowledge base, the bot says so and offers a human follow-up.

### 4.6 Knowledge base (`rag-service`)

- **FR-RAG-01** (M, P1) Ingest documents from CMS content, uploaded files and URLs; chunk and embed them.
- **FR-RAG-02** (M, P1) Separate public and private collections; the public bot can read only public ones.
- **FR-RAG-03** (M, P1) Re-index automatically when source content changes.
- **FR-RAG-04** (S, P3) Run as its own service (it may start folded into `chatbot-service`).

### 4.7 Identity and access (`auth-service`)

- **FR-AUTH-01** (M, P1) Email and password sign-in with short-lived access tokens and rotating refresh tokens.
- **FR-AUTH-02** (M, P1) Roles (admin, team, client) with permission mapping; enforcement at gateway and service.
- **FR-AUTH-03** (M, P1) Invite users by email; clients are bound to a tenant.
- **FR-AUTH-04** (M, P1) Password reset, session revocation and account suspension.
- **FR-AUTH-05** (S, P2) Optional two-factor authentication; API keys with scopes.

### 4.8 Notifications (`notification-service`)

- **FR-NOTIF-01** (M, P1) Send templated emails and in-app notifications triggered by events.
- **FR-NOTIF-02** (M, P1) Retry failed deliveries and record delivery status.
- **FR-NOTIF-03** (S, P2) User notification preferences per topic.
- **FR-NOTIF-04** (S, P2) Signed outbound webhooks with retry.

### 4.9 Projects (`project-service`)

- **FR-PROJ-01** (M, P2) Create a project from a won deal, with members, milestones and tasks.
- **FR-PROJ-02** (M, P2) Task status, priority, assignee and due date; mark tasks client-visible.
- **FR-PROJ-03** (M, P2) Status updates with internal or client visibility.
- **FR-PROJ-04** (S, P2) Mark milestones billable and link them to invoices.

### 4.10 Files (`file-service`)

- **FR-FILE-01** (M, P2) Upload and download through signed URLs; bytes stored in object storage.
- **FR-FILE-02** (M, P2) File versioning and visibility (private, tenant, public).
- **FR-FILE-03** (S, P2) Expiring share links; virus scan on upload.

### 4.11 Proposals (`proposal-service`)

- **FR-PROP-01** (M, P2) Generate a proposal from a per-service template and a deal.
- **FR-PROP-02** (M, P2) Track status (draft, sent, viewed, accepted, rejected, expired) with history.
- **FR-PROP-03** (S, P2) Shareable view link and PDF export.
- **FR-PROP-04** (M, P2) Emit `proposal.accepted.v1` to trigger project and invoice creation.

### 4.12 Billing (`billing-service`)

- **FR-BILL-01** (M, P2) Create invoices with line items, tax, due date and currency.
- **FR-BILL-02** (M, P2) Accept payments through Stripe and PayPal; record bank/Wise payments manually.
- **FR-BILL-03** (M, P2) Process provider webhooks idempotently and update invoice status.
- **FR-BILL-04** (S, P2) Overdue detection and reminder events.

### 4.13 Automation (`automation-service`)

- **FR-AUTO-01** (M, P2) Map events to n8n workflows (for example new lead to follow-up email and CRM task).
- **FR-AUTO-02** (M, P2) Log every run with input, output, status and retries.
- **FR-AUTO-03** (S, P2) Enable or disable workflows from the admin app.

### 4.14 Marketing (`marketing-service`)

- **FR-MKT-01** (S, P3) Content calendar for drafts across channels.
- **FR-MKT-02** (M, P3) Items move draft, pending approval, approved; nothing is posted by the system. A human marks it as posted.
- **FR-MKT-03** (C, P3) Record campaign metrics (spend, clicks, leads) per day.

### 4.15 AI agents (`agent-service`)

- **FR-AGENT-01** (M, P3) Define agents with an allowed-tools list; log every run with tokens and cost.
- **FR-AGENT-02** (M, P3) Agents propose actions; every action requires explicit human approval before execution.
- **FR-AGENT-03** (M, P3) Reject any execution lacking an approver (enforced in database and code).

### 4.16 Analytics (`analytics-service`)

- **FR-ANL-01** (S, P3) Build funnel, lead-source, revenue and chatbot metrics from events only.
- **FR-ANL-02** (S, P3) Daily aggregated metrics exposed to the admin dashboard.

### 4.17 Audit (`audit-service`)

- **FR-AUD-01** (S, P3) Record who did what, to which entity, with before and after values.
- **FR-AUD-02** (S, P3) The log is append-only; updates and deletes are rejected.

### 4.18 Admin app and client portal

- **FR-ADM-01** (M, P1) Admin dashboard: new leads, pipeline summary, recent chats.
- **FR-ADM-02** (M, P1) Manage content, leads, contacts, deals and users from one interface.
- **FR-ADM-03** (S, P3) Approval inbox for agent actions and marketing drafts.
- **FR-POR-01** (M, P2) Clients view their projects, milestones, shared files, proposals and invoices.
- **FR-POR-02** (M, P2) Clients can approve milestones, download files and pay invoices online.
- **FR-POR-03** (M, P2) Strict tenant isolation: a client can never see another tenant's data.

## 5. External Interface Requirements

### 5.1 User interfaces

Responsive layouts from 360 px up. FangScript brand: deep indigo and gold palette, `</>` logo motif. Reduced-motion fallback for background video and particle effects.

### 5.2 Software interfaces

| System | Purpose |
| --- | --- |
| LLM provider API | Chat answers, qualification, agents, embeddings |
| Email provider (Resend or SMTP) | Transactional email |
| Stripe, PayPal, Wise | Payments and webhooks |
| Cal.com or Calendly | Booking |
| n8n | Workflow automation |
| Object storage (R2 or S3) | Files and assets |
| GA4, Meta Pixel, Search Console | Analytics and conversion tracking |

### 5.3 Internal interfaces

- REST (OpenAPI) between front ends and the gateway; REST or gRPC between services for queries.
- Events on the broker for all state changes, versioned (`*.v1`).

## 6. Non-Functional Requirements

### 6.1 Performance

- **NFR-PERF-01** Public pages: Largest Contentful Paint under 2.5 s on a 4G connection; Lighthouse performance 90 or higher.
- **NFR-PERF-02** Gateway API p95 latency under 300 ms for non-AI endpoints.
- **NFR-PERF-03** Chatbot first token within 3 s under normal load.

### 6.2 Security

- **NFR-SEC-01** TLS everywhere; passwords hashed with a modern algorithm (argon2 or bcrypt).
- **NFR-SEC-02** JWT validated at the gateway; service-to-service calls authenticated.
- **NFR-SEC-03** No secrets in code or front ends; keys held in environment or a secrets manager.
- **NFR-SEC-04** Rate limiting and bot protection on public endpoints, including the chatbot.
- **NFR-SEC-05** Role-based access and tenant scoping on every query.
- **NFR-SEC-06** Webhooks verified by signature; payment events processed idempotently.

### 6.3 Reliability and recovery

- **NFR-REL-01** Event publication via the outbox pattern so no event is lost on failure.
- **NFR-REL-02** Consumers are idempotent.
- **NFR-REL-03** Daily database backups with a tested restore; recovery point objective 24 h or better.
- **NFR-REL-04** A failure in one service must not take down others; health checks on every service.

### 6.4 Scalability and maintainability

- **NFR-SCL-01** Each service scales independently.
- **NFR-MNT-01** Uniform service layout, automated tests and a per-service CI pipeline.
- **NFR-MNT-02** Backward-compatible API and event changes; breaking changes get a new version.

### 6.5 Privacy and compliance

- **NFR-PRV-01** Cookie consent before non-essential tracking.
- **NFR-PRV-02** Support data export and deletion requests for leads and users.
- **NFR-PRV-03** Store only the minimum personal data needed; record consent timestamps.

### 6.6 Usability and accessibility

- **NFR-UX-01** WCAG 2.1 AA contrast and keyboard navigation (including gold on indigo).
- **NFR-UX-02** Chat and forms usable on mobile.

### 6.7 Observability

- **NFR-OBS-01** Structured logs with request ids, metrics and traces (OpenTelemetry), and error tracking.

## 7. Data Requirements

Each service owns its schema (see the `fangscript-db` package): `auth`, `cms`, `lead`, `crm`, `marketing`, `project`, `file`, `notification`, `proposal`, `billing`, `chatbot`, `rag`, `agent`, `automation`, `analytics`, `audit`. Cross-service links are soft references. Money uses `numeric(14,2)` plus a currency code. Timestamps are `timestamptz` (UTC).

## 8. Release Plan

| Phase | Scope |
| --- | --- |
| **P1: Sell** | Gateway, auth, CMS, lead, CRM, chatbot (with RAG folded in), notification; public site and admin app |
| **P2: Operate** | Project, file, proposal, billing, automation; client portal; blog and demos |
| **P3: Intelligence** | Agent, marketing, analytics, audit; RAG split into its own service; internal chat |

## 9. Acceptance and Verification

- Each requirement has at least one automated test (unit, API or end-to-end) or a documented manual check.
- **P1 acceptance:** a visitor can read all five service pages, chat with the bot, submit the form or book a call; the lead appears in the admin app and CRM with source and consent; the team is notified; the pipeline can be advanced to won.
- **P2 acceptance:** a won deal produces a proposal, project and invoice; a client logs in, sees only their tenant's data, and pays online.
- **P3 acceptance:** an agent action cannot execute without a recorded approver; the audit log rejects edits.

## 10. Risks

| Risk | Mitigation |
| --- | --- |
| 16 services is heavy for a small team | Phase the build; start with 7; keep boundaries clean |
| Hosting limits | Move to a VPS before Phase 1 deployment |
| LLM cost and abuse | Rate limits, token budgets, caching |
| Over-claiming on the site | Availability labels; no unproven claims |
| Distributed-monolith drift | No shared code except contracts; no shared databases |
| Payment and data errors | Idempotent webhooks, audit log, tested backups |

## 11. Open Issues

1. Client portal at launch, or Phase 2 as planned?
2. Internal use only, or a future product for other agencies (multi-tenant)?
3. VPS provider and sizing.
4. Whether to show pricing or "starting from" ranges publicly.
5. Which services to label available vs custom at launch.
6. Target markets and currencies (affects tone, booking time zones and tax).
7. Final choice of event broker (NATS JetStream or RabbitMQ).
