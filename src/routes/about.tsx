import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/features/public/Pages";
export const Route = createFileRoute("/about")({
  component: AboutPage,
});
