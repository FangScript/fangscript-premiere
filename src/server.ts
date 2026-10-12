import "./lib/error-capture";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function serveWorkspaceEntry(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;
  const workspace = url.pathname === "/admin" || url.pathname === "/admin/"
    ? "admin"
    : url.pathname === "/portal" || url.pathname === "/portal/"
      ? "portal"
      : undefined;
  if (!workspace) return undefined;
  try {
    const html = await readFile(join(process.cwd(), ".output", "public", workspace, "index.html"), "utf8");
    // Rotate delivery URLs after the previous HTML fallback was cached by the CDN.
    const body = html.replace(/(\/(?:admin|portal)\/assets\/[^"?]+)(")/g, "$1?delivery=2$2");
    return new Response(request.method === "HEAD" ? null : body, {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" },
    });
  } catch {
    return undefined;
  }
}

async function serveWorkspaceAsset(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;
  const match = url.pathname.match(/^\/(admin|portal)\/(.+)$/);
  if (!match) return undefined;
  const workspace = match[1]!;
  const relative = match[2]!;
  const root = join(process.cwd(), ".output", "public", workspace);
  const file = normalize(join(root, relative));
  if (file !== root && !file.startsWith(root + sep)) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(file);
    const contentTypes: Record<string, string> = {
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
    };
    return new Response(request.method === "HEAD" ? null : body, {
      headers: {
        "content-type": contentTypes[extname(file).toLowerCase()] ?? "application/octet-stream",
        "cache-control": relative.startsWith("assets/") ? "public, max-age=31536000, immutable" : "no-cache",
      },
    });
  } catch {
    return new Response("Workspace asset not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function proxyApiGateway(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/v1")) return undefined;
  const gatewayUrl = (process.env["API_GATEWAY_URL"] || "http://127.0.0.1:4100").replace(/\/$/, "");
  const target = new URL(url.pathname + url.search, gatewayUrl);
  const headers = new Headers(request.headers);
  headers.delete("host");
  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    // @ts-expect-error duplex required by node fetch when body is a ReadableStream
    init.duplex = "half";
  }
  return fetch(target, init);
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResponse = await proxyApiGateway(request);
      if (apiResponse) return apiResponse;
      const workspaceResponse = await serveWorkspaceEntry(request);
      if (workspaceResponse) return workspaceResponse;
      const workspaceAssetResponse = await serveWorkspaceAsset(request);
      if (workspaceAssetResponse) return workspaceAssetResponse;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

