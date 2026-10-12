import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/public/Pages";
export const Route = createFileRoute("/")({
  component: HomePage,
});
