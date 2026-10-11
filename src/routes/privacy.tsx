import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/LegalPages";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Compliance — FangScript" },
      { name: "description", content: "FangScript's privacy policy, GDPR compliance, consent logging standards, and data retention safeguards." },
      { property: "og:title", content: "FangScript Privacy Policy" },
      { property: "og:description", content: "Zero-retention AI model standards and complete client data protection." },
    ],
  }),
  component: PrivacyPage,
});
