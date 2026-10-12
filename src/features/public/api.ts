import { useQuery } from "@tanstack/react-query";
import type { ContentRecord } from "./content";
export type PublishedContent = { items?: ContentRecord[] };

/** Normalize CMS responses so a transient/malformed payload cannot crash hydration. */
export function contentItems(value: PublishedContent | null | undefined): ContentRecord[] {
  return Array.isArray(value?.items) ? value.items : [];
}
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch("/api/v1" + path, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = await response
    .json()
    .catch(() => ({ error: "The service is currently unavailable. Please try again shortly." }));
  if (!response.ok)
    throw new Error(body.error || body.detail || "Unable to complete this request.");
  return body as T;
}
export function useContent() {
  return useQuery({
    queryKey: ["published-content"],
    queryFn: () => api<PublishedContent>("/cms/public"),
    staleTime: 60_000,
    retry: false,
  });
}
