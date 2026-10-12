import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/public/Pages";
export const Route = createFileRoute("/terms")({
  component: () => <LegalPage type="terms" />,
});
