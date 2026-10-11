/**
 * FangScript Public RAG Knowledge Base and Retrieval Engine
 * Conforming to SRS Section 4.5 & 4.6 (FR-CHAT-01, FR-CHAT-02, FR-CHAT-06, FR-RAG-01)
 */

export interface KnowledgeChunk {
  id: string;
  sourceDoc: string;
  section: string;
  topic: string;
  keywords: string[];
  content: string;
  suggestedAction?: {
    type: "book_call" | "view_services" | "contact_form";
    label: string;
  };
}

export const PUBLIC_KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: "kb-01",
    sourceDoc: "FangScript SRS & Positioning",
    section: "Brand & Core Value Proposition",
    topic: "About FangScript",
    keywords: ["who", "what", "agency", "fangscript", "positioning", "build automate grow", "philosophy"],
    content:
      "FangScript is an elite digital engineering and AI agency positioned under the manifesto 'Build. Automate. Grow.' We specialize in building custom software, production-ready AI agents, robust API systems, and resilient workflow automation for ambitious brands and operating teams.",
    suggestedAction: { type: "view_services", label: "Explore Capabilities" },
  },
  {
    id: "kb-02",
    sourceDoc: "Service Catalogue v1.0",
    section: "Category 1: Technology & Software Development",
    topic: "Custom Software Engineering",
    keywords: ["software", "web development", "react", "typescript", "backend", "cloud", "apps", "microservices", "code"],
    content:
      "Our Technology & Software Development arm engineers high-performance web applications, scalable REST/gRPC backend microservices, modern cloud platforms, and relational database systems (PostgreSQL). We don't use generic templates—everything is purpose-built, accessible (WCAG 2.1 AA), and built for endurance.",
    suggestedAction: { type: "book_call", label: "Discuss Tech Specs" },
  },
  {
    id: "kb-03",
    sourceDoc: "Service Catalogue v1.0",
    section: "Category 2: AI & Intelligent Automation",
    topic: "AI Agents & RAG Knowledge Systems",
    keywords: ["ai", "agents", "rag", "chatbots", "hermes", "copilot", "llm", "automation", "hallucination", "safety"],
    content:
      "We design approval-gated AI agents (Hermes architecture), enterprise Retrieval-Augmented Generation (RAG) hubs with pgvector, and multi-modal conversational systems. Our systems operate under strict human-in-the-loop governance: agents propose actions, but sensitive executions require explicit human approval.",
    suggestedAction: { type: "book_call", label: "Schedule AI Demo" },
  },
  {
    id: "kb-04",
    sourceDoc: "Service Catalogue v1.0",
    section: "Category 3: Digital Marketing & Growth",
    topic: "Growth Engineering & Analytics",
    keywords: ["marketing", "growth", "seo", "conversion", "cro", "landing page", "funnel", "analytics", "acquisition"],
    content:
      "We treat growth as an engineering discipline. We build sub-second landing pages (Lighthouse 95+), full-funnel UTM and server-side tracking, technical SEO with structured schema markup, and conversion rate optimization (CRO) engines.",
    suggestedAction: { type: "contact_form", label: "Request Growth Audit" },
  },
  {
    id: "kb-05",
    sourceDoc: "Service Catalogue v1.0",
    section: "Category 4: Content & Creative",
    topic: "Brand & UI/UX Design Systems",
    keywords: ["design", "ui", "ux", "branding", "figma", "creative", "copywriting", "design system", "identity"],
    content:
      "Our Content & Creative practice designs high-fidelity UI/UX, unified Figma design systems, striking brand identities, and authoritative technical copy. Every interface is designed with a deep indigo and gold aesthetic, rigorous typography hierarchy, and WCAG AA contrast compliance.",
    suggestedAction: { type: "view_services", label: "View Design Systems" },
  },
  {
    id: "kb-06",
    sourceDoc: "Service Catalogue v1.0",
    section: "Category 5: Business Systems, Data & Integrations",
    topic: "Workflow Automation & CRM Integrations",
    keywords: ["integrations", "n8n", "crm", "workflow", "data", "webhooks", "erp", "stripe", "sync", "automation"],
    content:
      "We connect fragmented platforms through event-driven architectures, self-hosted n8n workflows, CRM synchronizations, and automated billing pipelines. We implement the transactional outbox pattern to guarantee zero data loss and automated retry recovery.",
    suggestedAction: { type: "book_call", label: "Explore Integrations" },
  },
  {
    id: "kb-07",
    sourceDoc: "Engagement & Pricing Guidelines",
    section: "Commercial Engagement Models",
    topic: "Pricing & Timelines",
    keywords: ["cost", "price", "pricing", "budget", "timeline", "how much", "rate", "how long", "terms"],
    content:
      "FangScript operates on transparent milestone-based engagements with fixed project scopes. Focused websites typically deliver in 4 to 8 weeks ($5,000–$15,000+), while custom web applications, complex RAG AI deployments, and multi-system integrations range from 8 to 16+ weeks ($15,000–$30,000+). We provide detailed proposals before work begins.",
    suggestedAction: { type: "book_call", label: "Get a Fixed Estimate" },
  },
  {
    id: "kb-08",
    sourceDoc: "Technical Architecture Blueprint",
    section: "Data Privacy & Intellectual Property",
    topic: "Data Privacy & Code Ownership",
    keywords: ["ownership", "ip", "code", "privacy", "gdpr", "security", "copyright", "contracts"],
    content:
      "Clients maintain 100% intellectual property ownership of all custom code, schemas, and design assets upon project delivery. We maintain zero data retention with AI model providers, meaning your private business data is never used to train public foundation models.",
    suggestedAction: { type: "contact_form", label: "Review Security Model" },
  },
  {
    id: "kb-09",
    sourceDoc: "Delivery Roadmap",
    section: "Project Phases & Collaboration",
    topic: "Delivery Process",
    keywords: ["process", "steps", "discovery", "sprints", "launch", "how do you work", "methodology"],
    content:
      "Our proven 4-stage process includes: 1) Discover (commercial goals and domain boundaries), 2) Plan (system architecture and milestone roadmaps), 3) Build (rapid sprints with automated tests and weekly working demos), and 4) Launch (zero-downtime deployment, observability, and continuous support).",
    suggestedAction: { type: "book_call", label: "Start Discovery" },
  },
];

export interface RAGSearchResult {
  answer: string;
  citation?: {
    source: string;
    section: string;
  } | undefined;
  confidence: number;
  suggestedAction?: KnowledgeChunk["suggestedAction"] | undefined;
  qualificationPrompt?: string | undefined;
  isFallback: boolean;
}

export function searchKnowledgeBase(query: string): RAGSearchResult {
  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/[\s,?.!-]+/).filter((t) => t.length > 2);

  if (!queryTokens.length) {
    return {
      answer: "Hello! I am FangScript's AI Assistant. How can I help you today? You can ask about our 5 service categories, technology stack, pricing models, or book a discovery consultation.",
      confidence: 1.0,
      isFallback: false,
    };
  }

  let bestMatch: KnowledgeChunk | null = null;
  let highestScore = 0;

  for (const chunk of PUBLIC_KNOWLEDGE_BASE) {
    let score = 0;

    // Check keywords
    for (const kw of chunk.keywords) {
      if (cleanQuery.includes(kw)) {
        score += 3;
      }
      for (const token of queryTokens) {
        if (kw.includes(token)) {
          score += 2;
        }
      }
    }

    // Check content text match
    for (const token of queryTokens) {
      if (chunk.content.toLowerCase().includes(token)) {
        score += 1;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = chunk;
    }
  }

  // Qualification detection
  let qualificationPrompt: string | undefined;
  if (cleanQuery.includes("price") || cleanQuery.includes("cost") || cleanQuery.includes("budget") || cleanQuery.includes("quote")) {
    qualificationPrompt = "What is your target budget and ideal launch timeframe?";
  } else if (cleanQuery.includes("build") || cleanQuery.includes("need") || cleanQuery.includes("hire") || cleanQuery.includes("project")) {
    qualificationPrompt = "Which of our 5 capabilities best fits your upcoming project?";
  }

  // Strict fallback when confidence is too low (FR-CHAT-06)
  if (highestScore < 3 || !bestMatch) {
    return {
      answer:
        "I want to make sure you get the most accurate answer. That specific detail isn't fully detailed in our public knowledge index. Would you like to connect directly with our engineering team for a personalized answer?",
      confidence: 0.2,
      isFallback: true,
      suggestedAction: { type: "book_call", label: "Speak with Team" },
    };
  }

  return {
    answer: bestMatch.content,
    citation: {
      source: bestMatch.sourceDoc,
      section: bestMatch.section,
    },
    confidence: Math.min(1.0, highestScore / 10),
    suggestedAction: bestMatch.suggestedAction,
    qualificationPrompt,
    isFallback: false,
  };
}
