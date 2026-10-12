import http from "node:http";
import { Readable } from "node:stream";
const names = [
  "auth",
  "cms",
  "lead",
  "crm",
  "project",
  "file",
  "proposal",
  "billing",
  "notification",
  "automation",
  "marketing",
  "analytics",
  "audit",
];
const targets = Object.fromEntries(
  names.map((name, i) => [
    name,
    process.env[name.toUpperCase() + "_URL"] || "http://127.0.0.1:" + (4200 + i),
  ]),
);
Object.assign(targets, {
  rag: process.env.RAG_URL || "http://127.0.0.1:4300",
  chatbot: process.env.CHATBOT_URL || "http://127.0.0.1:4301",
  agent: process.env.AGENT_URL || "http://127.0.0.1:4302",
});
const server = http.createServer(async (req, res) => {
  const requestId = crypto.randomUUID();
  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  const path = (req.url || "/").split("?")[0];
  if (path === "/health/live") {
    res.setHeader("Content-Type", "application/json");
    res.end('{"ok":true}');
    return;
  }
  const module = path.split("/")[3];
  if (path.includes("/internal/") || path.includes("/..")) {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    if (path === "/api/v1/gateway/status") {
      const identity = await fetch(targets.auth + "/api/v1/auth/me", {
        headers: { cookie: req.headers.cookie || "" },
        signal: AbortSignal.timeout(4000),
      });
      if (!identity.ok) {
        res.writeHead(401);
        res.end('{"error":"Please sign in"}');
        return;
      }
      const account = await identity.json();
      if (!["admin", "team"].includes(account.role)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const modules = await Promise.all(
        Object.entries(targets).map(async ([id, url]) => {
          try {
            const r = await fetch(url + "/health/ready", { signal: AbortSignal.timeout(2500) });
            return { id, ready: r.ok, ...(await r.json()) };
          } catch {
            return { id, ready: false };
          }
        }),
      );
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ modules }));
      return;
    }
    if (!targets[module]) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end('{"error":"Unknown module"}');
      return;
    }
    if (Number(req.headers["content-length"] || 0) > 11 * 1024 * 1024) {
      res.writeHead(413, { "Content-Type": "application/json" });
      res.end('{"error":"Request is too large"}');
      return;
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (
        value &&
        ![
          "host",
          "connection",
          "content-length",
          "x-internal-token",
          "x-forwarded-for",
          "x-forwarded-host",
          "x-forwarded-proto",
          "transfer-encoding",
          "accept-encoding",
        ].includes(key)
      )
        headers.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    headers.set("X-Request-Id", requestId);
    headers.set("X-Forwarded-For", req.socket.remoteAddress || "unknown");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);
    res.on("close", () => {
      if (!res.writableEnded) controller.abort();
    });
    const upstream = await fetch(targets[module] + req.url, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
      duplex: "half",
      signal: controller.signal,
      redirect: "manual",
    });
    clearTimeout(timer);
    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      if (
        ![
          "set-cookie",
          "transfer-encoding",
          "connection",
          "content-encoding",
          "content-length",
        ].includes(key)
      )
        res.setHeader(key, value);
    });
    const cookies = upstream.headers.getSetCookie();
    if (cookies.length) res.setHeader("Set-Cookie", cookies);
    if (upstream.body) Readable.fromWeb(upstream.body).pipe(res);
    else res.end();
  } catch (error) {
    console.error(JSON.stringify({ requestId, module, message: error.message }));
    if (!res.headersSent) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "This module is temporarily unavailable. Your request was not confirmed.",
          requestId,
        }),
      );
    } else res.end();
  }
});
server.listen(Number(process.env.PORT || 4100), "0.0.0.0");
process.on("SIGTERM", () => server.close());
