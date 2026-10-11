import {
  Code2,
  Cpu,
  TrendingUp,
  Palette,
  Network,
  Globe,
  Database,
  Bot,
  Brain,
  Layers,
  Sparkles,
  Workflow,
  BarChart3,
  Search,
  PenTool,
  Share2,
  FileCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ServiceAvailability = "available" | "custom" | "coming_soon";

export interface SubService {
  id: string;
  name: string;
  description: string;
  availability: ServiceAvailability;
  features: string[];
}

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  icon: LucideIcon;
  badge: ServiceAvailability;
  problemSolved: string;
  deliverables: string[];
  processSteps: { step: string; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  subServices: SubService[];
  metrics: { label: string; value: string }[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "tech-software",
    slug: "technology-software-development",
    title: "Technology & Software Development",
    shortTitle: "Tech & Software",
    tagline: "High-performance digital products engineered for resilience and scale.",
    icon: Code2,
    badge: "available",
    problemSolved:
      "Off-the-shelf software forces businesses into rigid constraints, clunky integrations, and costly licensing models that fail under growth. We engineer tailored, high-performance web applications and cloud architectures specifically mapped to your operating model.",
    deliverables: [
      "Full-stack custom web applications (React, TypeScript, Node.js, Python)",
      "Modern microservices & API gateway architectures",
      "High-throughput relational & vector database engineering",
      "Cloud native deployments (Docker, Kubernetes, VPS & CI/CD)",
      "Legacy system modernization & headless platform transitions",
    ],
    processSteps: [
      {
        step: "01",
        title: "Architecture & Schema Design",
        description: "We map domain boundaries, entity models, and API contracts before writing code.",
      },
      {
        step: "02",
        title: "Agile Milestone Build",
        description: "Iterative sprints with working deployments, automated contract tests, and direct demos.",
      },
      {
        step: "03",
        title: "Hardening & Security Audits",
        description: "Zero-trust auth verification, load testing, SQL indexing, and OWASP compliance checks.",
      },
      {
        step: "04",
        title: "Zero-Downtime Deployment",
        description: "CI/CD pipelines with rollback guarantees, observability telemetry, and team documentation.",
      },
    ],
    faqs: [
      {
        question: "Do we retain full ownership of the intellectual property?",
        answer: "Yes. Upon completion and settlement, your business owns 100% of the custom source code, database schemas, and documentation. No vendor lock-in.",
      },
      {
        question: "What technical stack do you recommend for new platforms?",
        answer: "We primarily build frontend surfaces with modern React/TypeScript and backends with Node.js or Python (FastAPI for AI workloads), backed by PostgreSQL and Redis.",
      },
      {
        question: "Can you take over or rebuild an existing software application?",
        answer: "Yes. We begin with a structural code and database audit, identify bottlenecks, and plan a progressive migration without interrupting live users.",
      },
    ],
    subServices: [
      {
        id: "web-apps",
        name: "Custom Web Applications",
        description: "Mission-critical internal tools, client portals, and SaaS software.",
        availability: "available",
        features: ["Role-based access", "Real-time updates", "Responsive UI", "Audit logs"],
      },
      {
        id: "api-backends",
        name: "API Design & Distributed Systems",
        description: "Contract-driven REST/gRPC backends and event brokers.",
        availability: "available",
        features: ["OpenAPI 3 specs", "Outbox pattern", "Rate limiting", "Idempotency"],
      },
      {
        id: "cloud-devops",
        name: "Cloud Architecture & DevOps",
        description: "Infrastructure as code, automated pipelines, and telemetry.",
        availability: "available",
        features: ["Docker Compose/K8s", "GitHub Actions CI", "Grafana/Loki", "Backups"],
      },
      {
        id: "legacy-modernization",
        name: "Legacy System Modernization",
        description: "De-monolithing legacy apps into clean, maintainable services.",
        availability: "custom",
        features: ["Database splitting", "Strangler fig pattern", "Data migration"],
      },
    ],
    metrics: [
      { label: "P95 Gateway Latency", value: "<300ms" },
      { label: "Code Coverage", value: "90%+" },
      { label: "Uptime Reliability", value: "99.9%" },
    ],
  },
  {
    id: "ai-automation",
    slug: "ai-intelligent-automation",
    title: "AI & Intelligent Automation",
    shortTitle: "AI & Automation",
    tagline: "Autonomous agents, enterprise RAG, and human-in-the-loop workflows.",
    icon: Cpu,
    badge: "available",
    problemSolved:
      "Operational teams drown in repetitive triage, disconnected support tickets, and unanalyzed documents. We build grounded AI systems that draft work, answer complex queries with verified citations, and execute operations under strict human oversight.",
    deliverables: [
      "Approval-gated agency & enterprise AI agents (Hermes architecture)",
      "High-precision RAG knowledge systems with vector search (pgvector)",
      "Multi-modal conversational chatbots (voice, image, document ingest)",
      "Automated prompt engineering, token budgeting, and guardrails",
      "Autonomous lead qualification and support routing copilots",
    ],
    processSteps: [
      {
        step: "01",
        title: "Knowledge Audit & Corpus Ingestion",
        description: "We cleanse, chunk, and embed your business documentation into isolated vector collections.",
      },
      {
        step: "02",
        title: "Agent Tool Registry & Approval Gate",
        description: "We configure tool actions with strict approval gates: agents propose; humans click approve.",
      },
      {
        step: "03",
        title: "Evaluation & Anti-Hallucination Testing",
        description: "Continuous benchmarking against real prompt sets to guarantee strict fidelity to facts.",
      },
      {
        step: "04",
        title: "Telemetry & Cost Optimization",
        description: "Token usage logging, latency monitoring, and automated fallback caching in production.",
      },
    ],
    faqs: [
      {
        question: "How do you prevent AI hallucinations?",
        answer: "We enforce strict Retrieval-Augmented Generation (RAG) with source citations. If an answer cannot be grounded in your indexed knowledge base, the agent explicitly says so and routes to a human.",
      },
      {
        question: "Can an AI agent perform irreversible actions automatically?",
        answer: "Never by default. Under our Hermes architecture, all sensitive actions (sending proposals, executing payments, publishing content) require explicit human approval via the Admin App.",
      },
      {
        question: "Is our proprietary data used to train public models?",
        answer: "No. We utilize enterprise API agreements that guarantee zero data retention and zero training on your corporate knowledge.",
      },
    ],
    subServices: [
      {
        id: "rag-systems",
        name: "Enterprise RAG Knowledge Hubs",
        description: "Instant, citation-backed intelligence over PDFs, docs, and databases.",
        availability: "available",
        features: ["Vector embeddings", "Semantic chunking", "Hybrid search", "Citations"],
      },
      {
        id: "agency-agents",
        name: "Approval-Gated Copilots (Hermes)",
        description: "Autonomous workers with human review checkpoints.",
        availability: "available",
        features: ["Tool calling", "Human-in-the-loop", "Audit trail", "Token budgets"],
      },
      {
        id: "smart-chatbots",
        name: "Conversational Customer Chatbots",
        description: "24/7 lead intake, qualification, and interactive support.",
        availability: "available",
        features: ["Text/Voice input", "Lead scoring", "Calendar booking", "CRM handoff"],
      },
      {
        id: "custom-finetuning",
        name: "Custom Model Fine-Tuning",
        description: "Domain-adapted open-source models for specialized tasks.",
        availability: "custom",
        features: ["LoRA fine-tuning", "Synthetic data generation", "Self-hosted weights"],
      },
    ],
    metrics: [
      { label: "First Token Latency", value: "<1.8s" },
      { label: "Grounding Accuracy", value: "99.4%" },
      { label: "Human Review Gate", value: "100%" },
    ],
  },
  {
    id: "marketing-growth",
    slug: "digital-marketing-growth",
    title: "Digital Marketing & Growth",
    shortTitle: "Marketing & Growth",
    tagline: "Engineered acquisition engines powered by precision analytics and conversion UX.",
    icon: TrendingUp,
    badge: "custom",
    problemSolved:
      "Trapped between escalating ad costs and poor conversion rates, brands struggle to forecast revenue. We treat growth as an engineering problem: building lightning-fast landing experiences, tracking every attribution touchpoint, and closing the lead-to-deal loop.",
    deliverables: [
      "High-velocity conversion landing page architectures",
      "Full-funnel attribution and UTM tracking infrastructure",
      "Technical search engine optimization (Core Web Vitals 95+)",
      "Conversion Rate Optimization (CRO) with multivariate testing",
      "Content calendar automation with human review workflows",
    ],
    processSteps: [
      {
        step: "01",
        title: "Funnel & Attribution Audit",
        description: "We map user drop-offs, fix broken tracking tags, and audit page speed bottlenecks.",
      },
      {
        step: "02",
        title: "High-Converting Experience Design",
        description: "We craft targeted value propositions, contrast hierarchy, and friction-free forms.",
      },
      {
        step: "03",
        title: "Data Pipeline & Pixel Instrumentation",
        description: "Server-side event dispatching for cookieless attribution and accurate CRM source tracking.",
      },
      {
        step: "04",
        title: "Iterative Experimentation Sprints",
        description: "Weekly hypotheses, copy testing, and layout adjustments backed by empirical conversion math.",
      },
    ],
    faqs: [
      {
        question: "Why is marketing categorized under 'custom' availability?",
        answer: "We accept marketing clients selectively, pairing our growth services exclusively with brands using our custom technical or automation infrastructure to ensure measurable impact.",
      },
      {
        question: "How do you track attribution without third-party cookies?",
        answer: "We deploy first-party server-side event tracking and URL query parameter preservation that sync directly into your CRM database.",
      },
    ],
    subServices: [
      {
        id: "landing-pages",
        name: "High-Conversion Landing Pages",
        description: "Engineered for sub-second loads and maximum conversion.",
        availability: "available",
        features: ["Lighthouse 95+", "Dynamic UTM copy", "Lead validation", "A/B testing"],
      },
      {
        id: "technical-seo",
        name: "Technical SEO & Schema Optimization",
        description: "Clean semantic markup and fast architecture search engines love.",
        availability: "available",
        features: ["JSON-LD schemas", "Core Web Vitals", "Automated sitemaps", "SSR/SSG"],
      },
      {
        id: "growth-engine",
        name: "Full-Funnel Growth Engineering",
        description: "Integrated paid, organic, and automation engine.",
        availability: "custom",
        features: ["Attribution modelling", "Retargeting flows", "CRM lifecycle sync"],
      },
    ],
    metrics: [
      { label: "Lighthouse Performance", value: "95+" },
      { label: "Avg. Form Conversion", value: "+38%" },
      { label: "Attribution Accuracy", value: "99.1%" },
    ],
  },
  {
    id: "content-creative",
    slug: "content-creative",
    title: "Content & Creative",
    shortTitle: "Content & Creative",
    tagline: "Distinguished design systems, brand identities, and compelling technical narrative.",
    icon: Palette,
    badge: "available",
    problemSolved:
      "Generic templates and bland corporate messaging fail to convey the depth of serious technical products. We build distinct visual identities, cohesive design systems, and sharp copy that make complex solutions immediately compelling.",
    deliverables: [
      "Comprehensive digital brand identity and design tokens",
      "Figma design systems with accessible token hierarchies",
      "High-fidelity UI/UX design for web, dashboard, and mobile surfaces",
      "Technical product copywriting, whitepapers, and case studies",
      "Motion design, micro-interactions, and visual storytelling",
    ],
    processSteps: [
      {
        step: "01",
        title: "Brand Ideation & Narrative Workshop",
        description: "Uncovering your distinctive positioning, tone of voice, and competitive edge.",
      },
      {
        step: "02",
        title: "Design System Architecture",
        description: "Building component libraries, color palettes, typography scales, and token systems.",
      },
      {
        step: "03",
        title: "Interactive Prototyping",
        description: "High-fidelity Figma prototypes with realistic content and micro-interaction states.",
      },
      {
        step: "04",
        title: "Asset Production & Handoff",
        description: "Production-ready SVG/vector assets, animation code, and engineering guidelines.",
      },
    ],
    faqs: [
      {
        question: "Do you supply Figma source files?",
        answer: "Yes, all source components, auto-layout frames, variable tokens, and design files are fully transferred to your team.",
      },
      {
        question: "Are your design systems accessible?",
        answer: "Every palette and typographic hierarchy is designed to meet or exceed WCAG 2.1 AA standards for contrast and legibility.",
      },
    ],
    subServices: [
      {
        id: "ui-ux-design",
        name: "UI/UX & Product Design",
        description: "Intuitive dashboards and interfaces crafted for daily power users.",
        availability: "available",
        features: ["Wireframes", "Figma design systems", "Interactive prototypes", "WCAG AA"],
      },
      {
        id: "brand-identity",
        name: "Brand Strategy & Visual Identity",
        description: "Memorable logos, color palettes, and typographic voice.",
        availability: "available",
        features: ["Logo mark", "Typography systems", "Brand guidelines", "Vector icon sets"],
      },
      {
        id: "technical-copy",
        name: "Technical Copywriting & Docs",
        description: "Clear, authoritative copy that articulates complex engineering value.",
        availability: "available",
        features: ["Value propositions", "API documentation", "Product storytelling"],
      },
    ],
    metrics: [
      { label: "WCAG Compliance", value: "AA Level" },
      { label: "Component Reusability", value: "100%" },
      { label: "Delivery Time", value: "2-4 Weeks" },
    ],
  },
  {
    id: "systems-data",
    slug: "business-systems-data-integrations",
    title: "Business Systems, Data & Integrations",
    shortTitle: "Systems & Integrations",
    tagline: "Connecting tools, synchronizing data, and eliminating operational friction.",
    icon: Network,
    badge: "available",
    problemSolved:
      "Valuable company knowledge is trapped across disparate CRMs, billing systems, and spreadsheets. Manual data entry leads to discrepancies and missed opportunities. We engineer resilient event-driven integrations and workflow engines that run silently in the background.",
    deliverables: [
      "Custom n8n and webhook-driven event orchestration pipelines",
      "Two-way synchronization between CRM, billing, and project platforms",
      "Executive business intelligence dashboards and automated alerts",
      "Relational data warehouse schemas and automated outbox relays",
      "Fault-tolerant integration bridges with dead-letter queue retries",
    ],
    processSteps: [
      {
        step: "01",
        title: "Process & Tool Mapping",
        description: "Auditing all current business touchpoints and identifying manual bottlenecks.",
      },
      {
        step: "02",
        title: "Event & Webhook Schema Definition",
        description: "Standardizing versioned payloads (e.g. deal.won.v1, invoice.paid.v1) across tools.",
      },
      {
        step: "03",
        title: "Workflow Engine Configuration",
        description: "Building resilient n8n pipelines with idempotent consumers and exponential backoff.",
      },
      {
        step: "04",
        title: "Telemetry & Health Monitoring",
        description: "Setting up real-time error alerts and outbox queue depth monitoring.",
      },
    ],
    faqs: [
      {
        question: "What happens if a third-party API goes down temporarily?",
        answer: "Our event architectures implement transactional outbox publishing and idempotent consumer queues with automatic retries and dead-letter queues. No state is lost.",
      },
      {
        question: "Can you connect on-premise or legacy databases?",
        answer: "Yes, we build secure VPN or reverse-proxy bridges with signed authorization to sync legacy databases into modern tools.",
      },
    ],
    subServices: [
      {
        id: "n8n-automation",
        name: "Event-Driven n8n Workflows",
        description: "Automate complex business logic between multiple apps.",
        availability: "available",
        features: ["Self-hosted n8n", "Custom webhooks", "Retry backoffs", "Run audit logs"],
      },
      {
        id: "crm-finance-sync",
        name: "CRM & Finance Integrations",
        description: "Auto-generate proposals and invoices when deals close.",
        availability: "available",
        features: ["Stripe/PayPal sync", "HubSpot/Salesforce", "Proposal generators"],
      },
      {
        id: "bi-dashboards",
        name: "Executive BI & Analytics Portals",
        description: "Real-time visibility into pipeline, revenue, and delivery velocity.",
        availability: "available",
        features: ["Custom Metabase/Grafana", "SQL pipelines", "Automated Slack alerts"],
      },
      {
        id: "custom-erp",
        name: "Custom ERP Connectors",
        description: "Enterprise bridges tailored to bespoke inventory or ERP systems.",
        availability: "custom",
        features: ["High-throughput sync", "Data sanitization", "Two-way reconciliation"],
      },
    ],
    metrics: [
      { label: "Sync Latency", value: "<1.2s" },
      { label: "Zero Data Loss", value: "Outbox Pattern" },
      { label: "Operational Hours Saved", value: "25+ hrs/wk" },
    ],
  },
];
