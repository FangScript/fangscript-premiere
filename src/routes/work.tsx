import { createFileRoute } from "@tanstack/react-router";
import { WorkPage } from "@/features/public/Pages";
export const Route = createFileRoute("/work")({
  component: WorkPage,
});
