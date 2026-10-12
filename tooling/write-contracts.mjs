import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const modules = JSON.parse(readFileSync("contracts/modules.json", "utf8"));
for (const m of modules) {
  const base = "/api/v1/" + m.id;
  const schema = {
    openapi: "3.1.0",
    info: { title: "FangScript " + m.label, version: "1.0.0" },
    security: [{ session: [] }],
    paths: {
      [base + "/records"]: {
        get: {
          summary: "Paginated authorized records",
          parameters: [
            { in: "query", name: "kind", schema: { type: "string", enum: m.kinds } },
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", minimum: 1, maximum: 100, default: 30 },
            },
            { in: "query", name: "offset", schema: { type: "integer", minimum: 0, default: 0 } },
          ],
          responses: {
            200: { description: "Record page" },
            401: { description: "Sign in required" },
            403: { description: "Role or tenant not authorized" },
          },
        },
        post: {
          summary: "Create an authorized record",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/RecordInput" } },
            },
          },
          responses: {
            201: { description: "Persisted record" },
            400: { description: "Invalid input" },
          },
        },
      },
      [base + "/records/{id}"]: {
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } },
        ],
        put: {
          summary: "Optimistic update; version required",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/RecordInput" } },
            },
          },
          responses: {
            200: { description: "Updated record" },
            409: { description: "Version conflict" },
          },
        },
      },
      "/health/live": {
        get: { security: [], responses: { 200: { description: "Process alive" } } },
      },
      "/health/ready": {
        get: {
          security: [],
          responses: {
            200: { description: "Dependencies ready" },
            503: { description: "Not ready" },
          },
        },
      },
    },
    components: {
      securitySchemes: { session: { type: "apiKey", in: "cookie", name: "fs_access" } },
      schemas: {
        RecordInput: {
          type: "object",
          required: ["kind", "title", "data"],
          additionalProperties: false,
          properties: {
            kind: { type: "string", enum: m.kinds },
            title: { type: "string", maxLength: 300 },
            slug: { type: ["string", "null"] },
            tenantId: { type: ["string", "null"], format: "uuid" },
            status: { type: "string" },
            data: { type: "object" },
            version: { type: "integer", minimum: 1 },
          },
        },
      },
    },
  };
  // Include every implemented module route in the versioned interface document.
  const source = readFileSync("services/" + m.id + "/src/server.ts", "utf8");
  for (const match of source.matchAll(
    /app\.(get|post|put|delete)\(\s*prefix\s*\+\s*["']([^"']+)["']/g,
  )) {
    const method = match[1];
    const route = match[2];
    if (route === "/internal/notify" && m.id !== "notification") continue;
    const path = base + route.replace(/:([a-zA-Z]+)/g, "{$1}");
    schema.paths[path] ??= {};
    schema.paths[path][method] ??= {
      summary: m.label + " " + route,
      parameters: [...route.matchAll(/:([a-zA-Z]+)/g)].map((p) => ({
        in: "path",
        name: p[1],
        required: true,
        schema: { type: "string", format: "uuid" },
      })),
      responses: {
        200: { description: "Successful persisted operation" },
        400: { description: "Invalid input" },
        401: { description: "Authentication required" },
        403: { description: "Permission denied" },
        409: { description: "Workflow or version conflict" },
        503: { description: "Provider or dependency unavailable" },
      },
    };
    if (route.endsWith("/action"))
      schema.paths[path][method].requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["action", "version"],
              properties: {
                action: {
                  type: "string",
                  enum: [
                    "publish",
                    "unpublish",
                    "send",
                    "accept",
                    "reject",
                    "approve",
                    "mark-paid",
                    "mark-posted",
                    "complete",
                  ],
                },
                version: { type: "integer", minimum: 1 },
              },
            },
          },
        },
      };
    if (
      [
        "/public",
        "/leads",
        "/booking-config",
        "/login",
        "/reset-request",
        "/set-password",
        "/webhooks/cal",
        "/webhooks/stripe",
      ].includes(route)
    )
      schema.paths[path][method].security = [];
  }
  writeFileSync("services/" + m.id + "/openapi.json", JSON.stringify(schema, null, 2) + "\n");
}
writeFileSync(
  "contracts/event.schema.json",
  JSON.stringify(
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "FangScript event v1",
      type: "object",
      required: ["id", "type", "occurred_at", "source", "actor", "tenant_id", "data"],
      properties: {
        id: { type: "string", format: "uuid" },
        type: { type: "string", pattern: "^[a-z.-]+\\.v1$" },
        occurred_at: { type: "string", format: "date-time" },
        source: { type: "string" },
        tenant_id: { type: ["string", "null"] },
        actor: {
          type: "object",
          required: ["kind", "id"],
          properties: { kind: { enum: ["user", "system", "agent"] }, id: { type: "string" } },
        },
        data: { type: "object" },
      },
    },
    null,
    2,
  ),
);
