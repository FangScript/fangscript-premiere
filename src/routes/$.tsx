import { createFileRoute, useLocation } from "@tanstack/react-router";
import {
  ServicePage,
  CaseStudyPage,
  InsightsPage,
  BookingPage,
  ContentPreviewPage,
  Missing,
} from "@/features/public/Pages";
export const Route = createFileRoute("/$")({ component: DetailRoute });
function DetailRoute() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "services" && parts[1]) return <ServicePage slug={parts[1]} />;
  if (parts[0] === "work" && parts[1]) return <CaseStudyPage slug={parts[1]} />;
  if (parts[0] === "insights") return <InsightsPage {...(parts[1] ? { slug: parts[1] } : {})} />;
  if (parts[0] === "preview" && parts[1]) return <ContentPreviewPage id={parts[1]} />;
  if (parts[0] === "book") return <BookingPage />;
  return <Missing />;
}
