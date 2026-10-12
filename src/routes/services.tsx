import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/features/public/Pages";
export const Route = createFileRoute("/services")({
  component: ServicesPage,
});
