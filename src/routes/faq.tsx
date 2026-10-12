import { createFileRoute } from "@tanstack/react-router";
import { FAQPage } from "@/features/public/Pages";
export const Route = createFileRoute("/faq")({
  component: FAQPage,
});
