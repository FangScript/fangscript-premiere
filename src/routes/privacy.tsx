import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/features/public/Pages";
export const Route = createFileRoute("/privacy")({
  component: () => <LegalPage type="privacy" />,
});
