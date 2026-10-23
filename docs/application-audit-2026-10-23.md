# FangScript Lab — application audit and feature inventory

Audited 23 October 2026. Source revision: `9faa8ad`. This is a functional, architecture, deployment and test-coverage review of the local repository. It is not a certification of the running VPS or an exhaustive penetration test.

## What you are building

An agency operating platform with three user experiences: a public website that attracts enquiries, an admin workspace for your team, and a client workspace for delivery and commercial approvals. There are 16 business services plus an API gateway. PostgreSQL, Redis and NATS support them.

The intended business journey is: visitor → enquiry → CRM contact/deal → proposal → client acceptance → project and draft invoice → delivery and payment. The code contains several of these connections already. Your existing prospecting and proposal automations have not yet been imported or recreated.

The public website navigates between pages without a full reload. Admin and portal are separate applications. Individual backend modules have independent code and images, but deliberately communicate through APIs and events. Independent deployment does not mean zero operational dependencies: authentication depends on PostgreSQL and Redis, while cross-module workflows depend on NATS and downstream services.

## What was verified

- Public, admin and portal production builds: passed. Both workspaces also passed their build-time TypeScript checks.
- Public TypeScript check and module-boundary check: passed.
- Domain tests: 78 passed. These are six repeated helper tests across 13 services, not 78 different business journeys.
- Production SSR/SEO and API forwarding test: passed with a mock gateway. Its first attempt was blocked by restricted local networking; the unrestricted local retry passed.
- Existing browser suite against the local assembled production output: 9 passed, 3 failed. Backend responses were absent or mocked; this did not test real login, payments or persistence.
- Additional browser check: footer “Client portal” leads to the public 404; direct `/portal/` reaches the login screen.
- Additional contact checks: with reduced motion, a mocked successful submission displayed confirmation. With normal motion and early interaction, field values were lost and no request was sent. No JavaScript exception was captured in that reproduction.
- Lint: 8,534 errors and 19 warnings across the checked files. Of the errors, 8,145 concern formatting and 389 concern explicit `any`. These are maintenance issues, not 8,534 confirmed runtime bugs.
- Python test attempt: blocked by missing local `asyncpg`; no Python pass is claimed.
- Docker integration, actual database initialization, external-provider calls, payment settlement and restore drill: not run. Virtualization is unavailable. Production configuration and current container health were not independently inspected in this audit.

## Fix first

### 1. Database initialization can fail before creating module accounts — high priority

`infra/postgres/init.sh:14` places `:'pass'` inside a dollar-quoted `DO` body. psql does not substitute variables inside quoted SQL literals. The resulting statement is invalid rather than receiving the password. This is a source-level defect consistent with the missing-role failures seen earlier; it has not been reproduced against a local PostgreSQL server here.

Use safely formatted SQL outside the dollar-quoted body, and add a clean-database integration check. Existing production volumes also need an explicit, non-destructive repair/migration path; changing an initialization file alone is not a repair procedure for an existing database.

Reference: [PostgreSQL psql SQL interpolation documentation](https://www.postgresql.org/docs/current/app-psql.html#APP-PSQL-INTERPOLATION).

### 2. Client portal link opens the wrong application — confirmed in browser

`src/features/public/Chrome.tsx:48` intercepts same-origin links and passes every path to the public router. `/portal` is not handled by `src/routes/$.tsx`, so the footer click renders the public 404. Direct entry reaches the separate portal login. Exclude workspace routes from public client-side routing, or implement an explicit application handoff. Add click-through tests, not only direct URL tests.

### 3. Early contact-form interaction can lose input — reproduced, precise cause still needs isolation

The two existing enquiry tests fail before an API response is displayed. A separate normal-motion reproduction recorded empty name/email/message inputs and zero submissions after filling them. A reduced-motion reproduction succeeded. Investigate hydration and the welcome overlay timing (`src/features/intro/WelcomeIntro.tsx`, `src/routes/__root.tsx`, `src/features/public/Pages.tsx:563`). Preserve inputs and prevent interaction before the form is ready. Do not merely weaken the tests.

### 4. Work and FAQ fallback logic is unreachable — confirmed in source

`src/features/public/Pages.tsx:58` and `:484` use an array as a truth condition after `filter()`. An empty array is truthy, so the illustrative projects and FAQ fallback are never selected. Empty/unavailable CMS data therefore leaves these sections empty. Decide separately whether an intentionally unpublished collection should stay empty and whether a disconnected CMS should show fallback content. Never present illustrative projects as your real work.

The work listing is currently a grid, not the carousel previously requested. Your real portfolio items must exist as published CMS case studies; this audit cannot recover or verify production content from source alone.

### 5. Startup can overwrite the bootstrap administrator account

At the end of `services/auth/src/server.ts`, every auth restart resets the configured bootstrap account's password, role and active status. A changed password or suspended bootstrap account can be reverted by restart. Make bootstrap a first-run operation; provide a separate intentional recovery procedure.

### 6. Deployment defaults need tightening

`compose.yml` supplies shared fallback passwords/tokens and a bootstrap login when variables are missing, and defaults auth to permissive origins. API/admin/portal ports are published on all interfaces. These settings require production review rather than being relied on as safe defaults. Whether those ports are externally reachable also depends on the VPS firewall.

The standalone website proxy defaults to localhost inside its container (`src/server.ts`). A separate Coolify frontend deployment needs a persistent shared network and an explicit gateway URL. The full Compose web service already sets `http://gateway:4100`; mixing the two deployment approaches creates configuration drift. An unavailable gateway currently becomes an HTML 500 at the website layer rather than a useful JSON service error.

### 7. “Healthy” is not proof that workflows work

Service readiness checks verify database/Redis and often only the presence of provider settings. They do not establish that NATS delivery or a provider credential works. A lead can save while its CRM/email follow-up is delayed. Add event-backlog visibility, provider connection tests and an actionable failed-work queue.

## Public website inventory

- **Home:** brand intro, animated 3D hero, reduced-motion support, WebGL fallback, calls to action, five capability cards, selected-work grid, process steps, FAQ section, closing contact invitation.
- **Navigation:** sticky header, responsive menu, footer links, public SPA navigation, skip link and assistant launcher. Workspace handoff has the confirmed defect above.
- **Services:** category overview and individual service pages. The catalogue contains 48 offerings across five disciplines; the full list is appended below.
- **Work:** category filters, case-study cards and detail pages with challenge, approach and outcomes. CMS-driven; illustrative project data exists but the listing fallback is defective. No active carousel implementation was found in the public feature code.
- **About:** agency positioning and process content; CMS page sections can supplement public pages.
- **Insights:** published article listing and individual articles; an honest empty state when there are no posts.
- **FAQs:** expandable answers; currently empty when the CMS collection is empty because of the fallback issue.
- **Contact:** name, email, company, service, budget, brief, explicit consent, honeypot and attribution parameters; sends an enquiry to the lead service. Real persistence remains unverified here.
- **Booking:** embedded Cal.com URL with an external-calendar link and contact fallback. Requires booking configuration; signed webhooks record confirmations/cancellations.
- **Privacy and terms:** public legal copy. Suitability for your actual practices needs owner review; code existence is not legal validation.
- **SEO/content:** server-rendered content, route titles/descriptions, social metadata, CMS overrides and staff preview route. CMS pages are ordered text sections, not a visual website builder.
- **Public assistant:** streamed answers, cited published sources, short conversation history, image/text/PDF attachments, voice transcription, error states and contact/booking guidance. Requires AI, retrieval, database and Redis services. It directs visitors to the enquiry form rather than saving leads automatically.

## Admin and service inventory

“Implemented” below means a code path exists. It does not mean the VPS or a provider integration was proven operational.

### Identity and access — auth

Implemented: email or email-prefix login, passwords, cookie sessions, refresh/logout, three roles (admin/team/client), company assignment, invitations, one-time password-setting links, password reset and a suspension endpoint. Admin has People & access and an invitation form. Email delivery requires notification/Resend. No suspension control was found in the workspace UI. No MFA or fine-grained per-module role editor was found. Bootstrap overwrite needs repair.

### Content studio — cms

Implemented: categories, pages, case studies, posts, FAQs, testimonials, settings and media metadata; drafts, publishing/unpublishing, ordering, slugs, SEO fields, preview, revision history, restore-as-draft and optimistic version conflict checks. Public published-content API is cached. The catalogue seeds five categories. Testimonials can be stored, but no testimonial display was found in the current public feature pages. Media metadata is distinct from the file-upload service. CMS records do not amount to an arbitrary page-layout designer.

### Enquiries — lead

Implemented: website enquiry capture, consent timestamp, source/attribution fields, bookings, touchpoint records, public form limits and honeypot, calendar configuration and signed Cal.com webhooks. Enquiries emit events for CRM and notifications. Qualification is record/status management, not an automated scoring engine. No prospect discovery, scraping, enrichment or email verification pipeline was found.

### CRM and pipeline — crm

Implemented: contacts, companies, deals and activities; search/pagination; deal stage, value, currency and contact references. A new enquiry creates/deduplicates a contact by email and creates a deal through events. It does not automatically create a company/client account. The UI is a record list/editor, not a drag-and-drop pipeline. Bulk imports, automatic enrichment, lead scoring, outreach sequences and reply synchronization were not found.

### Projects — project

Implemented: projects, milestones, tasks and updates; company ownership, client visibility, progress, due dates, assignee/priority fields, completion and milestone approval. Proposal acceptance creates a project. No full project-plan template expansion, dependency chart, time tracking or threaded client collaboration was found. Several relationships are typed IDs rather than guided pickers.

### Proposals — proposal

Implemented: proposal and template records; summary, recipient email, company, currency, line items, tax and calculated totals; send/accept/reject actions; client visibility and browser print/save-PDF. “Send” changes status and emits an event; the notification service emails a portal link when a recipient exists. Acceptance triggers project creation and a draft invoice.

Missing for your workflow: a lead-to-proposal wizard, applying a stored template through the UI, importing AI draft text into a structured proposal, richer proposal sections/branding, email tracking, scheduled follow-ups and an external signature workflow. Current acceptance is an application action, not a signature-provider integration. Missing recipient email can leave a proposal marked sent without a customer email; sent status must not be treated as confirmed delivery.

### Billing — billing

Implemented: invoice and receipt records, line items and tax totals in minor units, currency default PKR, draft invoice from accepted proposal, send, client review, Stripe Checkout, signed payment webhooks, bank-transfer instructions and admin mark-paid action. Live Stripe requires explicit enablement. Browser print/save-PDF exists.

Gaps: bank verification is a manual administrator action, not bank reconciliation; receipt records are not a connected reconciliation flow. No recurring billing, instalment/deposit plan, refund flow or accounting export was found. The arithmetic assumes 100 minor units per currency although input accepts any three-letter currency; explicitly limit currencies or add currency-aware precision.

### Files and media — file

Implemented: company-scoped uploads through signed R2/S3 URLs, restricted declared MIME types and 20 MB limit, upload confirmation against stored object metadata, short-lived download links and client visibility. Requires configured object storage and browser CORS. No version history, virus-scanning workflow or retention interface was found. Public CMS images use URLs; this is not yet a unified visual asset library.

### Notifications — notification

Implemented: event-triggered enquiry alerts, invitation/reset emails, proposal/invoice portal links and booking notices; Resend delivery, idempotency keys, retries, pending delivery records when unconfigured, and a manual retry endpoint/UI for eligible pending deliveries. Notifications and deliveries are separate record types. No email inbox, bounce/unsubscribe dashboard, SMS or WhatsApp connector was found. Pending/queued is not equivalent to delivered.

### Automations — automation

Implemented: workflow records with an event name and description, active/inactive-style record status, matching incoming events, POST to one configured n8n webhook, idempotency header, success-run records and failure handling.

Not implemented: a native multi-step workflow engine/editor, per-step data mapping, branching/delays, a scheduler, connector credentials UI, visual execution trace, workflow import or replay controls. All matching workflows use the same configured webhook and send a workflow ID. This is an n8n bridge, not a replacement for your existing automations.

### Marketing — marketing

Implemented: editable content drafts, channel and scheduled date fields, monthly calendar, campaign records with manually entered spend/clicks/leads, approve and mark-posted actions. Scheduling records a plan; it does not publish to social platforms. No social-account OAuth, publishing worker, channel analytics import or campaign attribution connector was found.

### Analytics — analytics

Implemented: durable event counts by day, all-time enquiry/proposal/acceptance/payment counts and verified-payment revenue by currency. Dashboard overview cards count the latest 100 records. These are not complete all-time entity totals, a matched conversion funnel, attribution reporting or forecasting. Metric definitions and date/cohort filters need expansion before business decisions rely on them.

### Audit history — audit

Implemented: event-consumer history, redaction of selected sensitive fields and immutable-row migration. This tracks emitted events; it is not guaranteed to capture every login/read or administration change. Failed consumers may create dead-letter records without a dedicated recovery UI. Log retention/export and full operation coverage need definition.

### Knowledge base — rag

Implemented: published CMS synchronization, keyword search, optional semantic embeddings, source listing, private text-note ingestion and separate public/private retrieval endpoints. Public retrieval synchronizes content before answering to avoid retaining unpublished material. No general website crawler, Drive/Notion importer, private-note edit/delete UI or large-document ingestion manager was found. Syncing before retrieval can affect answer latency and availability.

### Public AI assistant — chatbot

Implemented: visitor sessions, stored conversation messages, streamed AI responses, public-source references, attachments and transcription. It is separate from the internal AI workspace. Provider setup and realistic answer evaluation remain necessary. No live-agent handoff queue, admin transcript browser or automatic chat-to-CRM lead conversion was found. Retention is defined for expiring attachment use, but a complete conversation deletion/retention workflow was not found.

### Internal AI workspace — agent

Implemented: proposal/follow-up/marketing text drafts using private knowledge, review inbox, recorded approvals and a separately executed email action via notifications. There is an API to propose email, but no compose-email form was found in the current AI UI. Approving a proposal draft does not create a proposal record. No workflow-specific agents, automatic lead research, tool orchestration or complete lead-to-proposal automation was found.

### API gateway and Connections screen

Implemented: routing to all 16 services, forwarded cookie sessions, request IDs, internal-route blocking, request limits, upstream timeout/error handling and authenticated service-status view. Connections shows readiness/configuration; it is not a credential-editing or provider-authentication screen. Credentials remain deployment configuration.

## Client portal inventory

Clients have their own login/reset/invitation experience and company-scoped views of projects, milestones, tasks, updates, proposals, invoices and shared files. They can review/accept/decline sent proposals, approve eligible milestones, pay eligible invoices, view bank details, print documents and use the file-upload/download flow. Their overview links into these areas.

They do not get CMS, CRM, marketing, automations, internal knowledge, staff AI, analytics or user administration. The current portal is mainly a delivery-and-approval area. No client support-ticket system, chat with your team, onboarding questionnaire or meeting management workspace was found. Navigation within the workspace uses component state; a refresh returns to its initial section rather than a durable deep-linked screen.

## Connections already coded

1. Website enquiry → saved lead → event → CRM contact/deal and team notification.
2. Proposal send → status event → recipient portal-link email, if recipient and email configuration are available.
3. Client/admin accepts proposal → event → new project and draft invoice.
4. Invoice send → portal-link email; Stripe confirmation or bank verification → paid event → revenue metrics.
5. CMS publish → public content → retrieval index → public assistant knowledge.
6. Internal AI email proposal → recorded administrator approval → explicit execution → notification queue.
7. Matching event → active automation record → configured n8n webhook.

These are asynchronous connections. Saving a record successfully does not prove that every downstream step completed. Outbox/deduplication mechanisms exist, but full recovery and provider behavior need integration testing.

## Operational and maintenance gaps

- The repository has 53 distinct `${...}` Compose input variables and 171 references, not 284 distinct required secrets. The earlier Coolify UI count cannot be reconciled without inspecting that application's configuration. Many inputs are optional provider settings; some values are generated secrets and others are service addresses.
- Required external systems are Resend for email, Cal.com for booking, R2/S3 for files, Stripe for online payment, OpenAI for AI, n8n for current event workflows, and off-server storage for backups. Which are configured on the VPS is unknown here.
- Backup and isolated restore-drill scripts exist for all 16 databases. Backup is an optional Compose profile. No live restore or complete object-storage/event-bus recovery was verified.
- Shared infrastructure and a single VPS remain common failure points even with independent services.
- Generated service code and admin/portal UI are substantially duplicated. Boundary tests enforce import independence, not semantic consistency. Auth origin/bootstrap behavior already differs from other generated copies. Regeneration must not silently overwrite fixes.
- Documentation is stale in places: it describes the production website as excluded from default Compose startup, while the current web service has no such profile. The short roadmap also describes an older contact flow.
- Browser tests are not invoked in the current CI workflow. Integration CI exists, but excludes several services and does not prove real provider delivery. Python helper tests are small and repeated; they do not exercise live AI workflows.
- The built lazy 3D chunk is about 918 kB minified / 244 kB gzip. It is a performance measurement target for low-end mobile devices, not proof the site is slow.
- Generic forms expose statuses that creation endpoints reject, and broad data objects are only strongly validated for selected record types. Several UI actions need module-specific forms, state rules, relationship pickers and clearer empty/unavailable states.

## Recommended implementation order

1. Repair database setup and persistent deployment networking; verify all services and event consumers after both fresh deployment and restart.
2. Fix public-to-portal navigation, early form interaction, work/FAQ empty states and bootstrap account reset behavior.
3. Run a real business journey: submit enquiry, observe CRM/email, invite client, send/accept proposal, observe project/invoice, verify a test payment, upload/download a file. Include failure/retry cases.
4. Choose your actual lead workflow from the automation exports: source → deduplicate → enrich → qualify → review → draft proposal → approve → send → follow-up → record reply. Define required providers, fields and stop conditions from those exports.
5. Build that one journey into the existing admin modules. Connect AI output to structured proposals and surface execution status/retry controls. Decide explicitly whether execution remains in n8n or moves into a native engine.
6. Add secondary channels, marketing publishing and deeper analytics only after the first journey works reliably.

This audit added documentation and generated local test artifacts only. It did not change application behavior, database contents, deployment configuration or GitHub history.

## Full advertised service catalogue

The catalogue below describes services your agency offers customers. These 48 offerings are not 48 implemented software modules inside this platform.

### Technology & Software Development

- Business & corporate websites
- E-commerce websites & online stores
- Web applications
- SaaS platforms
- Custom software development
- ERP systems
- CRM systems
- CMS platforms
- Admin panels & analytics dashboards
- Booking & appointment systems
- APIs & microservices
- Website redesign, maintenance & optimization

### AI & Intelligent Automation

- AI chatbots
- AI agents & intelligent assistants
- RAG systems & knowledge-base chatbots
- Customer support automation
- Lead capture, qualification & follow-up automation
- Workflow & business process automation
- Document processing & data extraction
- AI integrations into existing applications
- Custom AI solutions & model fine-tuning
- OCR and intelligent document workflows

### Digital Marketing & Growth

- Meta Ads (Facebook & Instagram)
- Paid advertising campaign management
- Lead generation
- Social media marketing & management
- Marketing funnels
- Conversion rate optimization
- Growth strategy
- Analytics, tracking & reporting

### Content & Creative

- Website copywriting
- Advertising copy
- Social media posts & carousels
- Social media creatives and promotional graphics
- Blog posts & articles
- Product descriptions
- Brand messaging
- Content strategy
- Marketing content & ad creatives

### Business Systems, Data & Integrations

- CRM & ERP implementation or custom development
- Database synchronization
- Third-party API integrations
- Payment gateway integrations
- Database design, optimization & indexing
- Analytics and reporting dashboards
- System integration & data migration
- Internal business tools
- Operational workflow integration
