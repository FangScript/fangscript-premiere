import { categories } from "../features/public/content";
import { WelcomeIntro } from "../features/intro/WelcomeIntro";
import { contentItems } from "../features/public/api";
import { publishedContent } from "../features/public/content.server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { useEffect, useState, type ReactNode } from "react";

import labCss from "../features/public/lab.css?url";

import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            to="/"

            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();

              reset();
            }}

            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>

          <a
            href="/"

            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => ({ content: await publishedContent() }),
  head: ({ loaderData, matches }) => {
    const path = matches.at(-1)?.pathname || "/";
    const slug = path === "/" ? "home" : path.split("/").filter(Boolean).at(-1);
    const record = contentItems(loaderData?.content).find((i) => i.slug === slug);
    const fallback =
      categories.find((c) => c.slug === slug)?.title ||
      (
        {
          about: "About us",
          services: "Our capabilities",
          work: "Our work",
          contact: "Start a project",
          faq: "Frequently asked questions",
          insights: "Insights",
          privacy: "Privacy",
          terms: "Terms",
          book: "Book a discovery call",
        } as Record<string, string>
      )[slug || ""];
    const title =
      record?.data["seoTitle"] ||
      (record
        ? record.title + " | FangScript Lab"
        : fallback
          ? fallback + " | FangScript Lab"
          : "FangScript Lab — Build. Automate. Grow.");
    return {
      meta: [
        { charSet: "utf-8" },

        { name: "viewport", content: "width=device-width, initial-scale=1" },

        { title: title },

        {
          name: "description",
          content:
            record?.data["seoDescription"] ||
            record?.data["summary"] ||
            "Technology, AI automation, marketing, creative content, and connected business systems. Build. Automate. Grow.",
        },

        { name: "author", content: "FangScript" },

        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        ...(record?.data["socialImage"]
          ? [{ property: "og:image", content: record.data["socialImage"] }]
          : []),
        ...(path.startsWith("/preview/") ? [{ name: "robots", content: "noindex,nofollow" }] : []),

        { name: "twitter:card", content: "summary_large_image" },
      ],

      links: [
        {
          rel: "stylesheet",

          href: labCss,
        },

        { rel: "preconnect", href: "https://fonts.googleapis.com" },

        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },

        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap",
        },

        { rel: "icon", href: "/favicon.svg?v=2", type: "image/svg+xml" },
      ],
    };
  },

  shellComponent: RootShell,

  component: RootComponent,

  notFoundComponent: NotFoundComponent,

  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}

        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { content } = Route.useLoaderData();
  useState(() => {
    if (content) queryClient.setQueryData(["published-content"], content);
  });
  useEffect(() => {
    if (content) queryClient.setQueryData(["published-content"], content);
  }, [content, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}

      <WelcomeIntro>
        <Outlet />
      </WelcomeIntro>
    </QueryClientProvider>
  );
}
