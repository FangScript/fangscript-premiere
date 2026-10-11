import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/components/LegalPages";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service & Engagement — FangScript" },
      { name: "description", content: "Client agreements, intellectual property ownership, deliverables, and service standards for FangScript engagements." },
      { property: "og:title", content: "FangScript Terms of Service" },
      { property: "og:description", content: "Commercial agreements and 100% intellectual property ownership guarantees." },
    ],
  }),
  component: TermsPage,
});
