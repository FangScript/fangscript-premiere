import { createServerFn } from "@tanstack/react-start";
import type { ContentRecord } from "./content";

// Only the server sees the internal gateway address. A disconnected CMS does
// not prevent the canonical website from rendering.
export const publishedContent = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const response = await fetch(
      (process.env["API_GATEWAY_URL"] || "http://127.0.0.1:4100") + "/api/v1/cms/public",
      { signal: AbortSignal.timeout(1500) },
    );
    if (!response.ok) return null;
    return (await response.json()) as { items: ContentRecord[] };
  } catch {
    return null;
  }
});
