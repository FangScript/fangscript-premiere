import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/features/public/Pages";
export const Route = createFileRoute("/contact")({
  component: ContactPage,
});
