import { createFileRoute } from "@tanstack/react-router";
import { FangScriptHome } from "@/components/FangScriptHome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FangScript — Websites, AI & Automation" },
      { name: "description", content: "FangScript builds premium websites, web apps, AI agents and automation that solve real business problems." },
      { property: "og:title", content: "FangScript — Intelligent Digital Products" },
      { property: "og:description", content: "Premium websites, web apps, AI agents and automation built for ambitious businesses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FangScriptHome,
});
