import { z } from "zod";

const reserved = new Set([
  "www",
  "admin",
  "portal",
  "api",
  "mail",
  "smtp",
  "coolify",
  "n8n",
  "status",
  "autodiscover",
]);
const path = z
  .string()
  .max(200)
  .regex(/^\/[a-zA-Z0-9_./-]*$/)
  .refine((v) => !v.split("/").includes(".."), "Use a path inside the repository");
export const hostingInput = z
  .object({
    title: z.string().trim().min(1).max(120),
    repository: z
      .string()
      .trim()
      .regex(
        /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/,
        "Paste a GitHub repository URL",
      ),
    branch: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-zA-Z0-9_./-]+$/),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(40)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .refine((v) => !reserved.has(v), "Choose another project address"),
    mode: z.enum(["static", "node", "dockerfile"]),
    privateRepo: z.boolean().default(false),
    baseDirectory: path.default("/"),
    publishDirectory: path.default("/dist"),
    buildCommand: z.string().trim().max(500).default("npm run build"),
    installCommand: z.string().trim().max(500).default("npm ci"),
    startCommand: z.string().trim().max(500).default("npm start"),
    port: z.coerce.number().int().min(1).max(65535).default(3000),
    dockerfile: path.default("/Dockerfile"),
    description: z.string().trim().max(2000).default(""),
    image: z
      .union([
        z.literal(""),
        z
          .string()
          .url()
          .refine((v) => new URL(v).protocol === "https:"),
      ])
      .default(""),
  })
  .strict();
export type HostingInput = z.infer<typeof hostingInput>;
export function hostingConfig(env: NodeJS.ProcessEnv = process.env) {
  const required = [
    "HOSTING_COOLIFY_URL",
    "HOSTING_COOLIFY_TOKEN",
    "HOSTING_PROJECT_UUID",
    "HOSTING_SERVER_UUID",
    "HOSTING_BASE_DOMAIN",
  ];
  const missing = required.filter((k) => !env[k]);
  const domain = (env.HOSTING_BASE_DOMAIN || "").toLowerCase();
  if (domain && !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain))
    missing.push("HOSTING_BASE_DOMAIN (invalid)");
  if (env.HOSTING_COOLIFY_URL) {
    try {
      const url = new URL(env.HOSTING_COOLIFY_URL);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        throw new Error();
    } catch {
      missing.push("HOSTING_COOLIFY_URL (invalid)");
    }
  }
  return {
    configured: !missing.length,
    missing,
    domain,
    privateRepositories: !!env.HOSTING_GITHUB_APP_UUID,
  };
}
export function applicationPayload(
  input: HostingInput,
  id: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const config = hostingConfig(env);
  if (!config.configured)
    throw Object.assign(new Error("Configure project hosting in the CMS service first."), {
      statusCode: 503,
    });
  if (input.privateRepo && !env.HOSTING_GITHUB_APP_UUID)
    throw Object.assign(
      new Error("Connect a GitHub App in Coolify before importing a private repository."),
      { statusCode: 400 },
    );
  return {
    project_uuid: env.HOSTING_PROJECT_UUID,
    server_uuid: env.HOSTING_SERVER_UUID,
    environment_name: env.HOSTING_ENVIRONMENT || "production",
    ...(env.HOSTING_DESTINATION_UUID ? { destination_uuid: env.HOSTING_DESTINATION_UUID } : {}),
    ...(input.privateRepo ? { github_app_uuid: env.HOSTING_GITHUB_APP_UUID } : {}),
    name: `fangscript-preview-${id}`,
    git_repository: input.repository.replace(/\/$/, ""),
    git_branch: input.branch,
    build_pack: input.mode === "dockerfile" ? "dockerfile" : "nixpacks",
    domains: `https://${input.slug}.${config.domain}`,
    ports_exposes: String(input.mode === "static" ? 80 : input.port),
    is_static: input.mode === "static",
    is_spa: input.mode === "static",
    base_directory: input.baseDirectory,
    publish_directory: input.publishDirectory,
    ...(input.mode !== "dockerfile"
      ? {
          install_command: input.installCommand,
          build_command: input.buildCommand,
          start_command: input.startCommand,
        }
      : { dockerfile_location: input.dockerfile }),
    instant_deploy: false,
    is_auto_deploy_enabled: false,
    is_force_https_enabled: true,
    limits_memory: env.HOSTING_MEMORY_LIMIT || "512m",
    limits_cpus: env.HOSTING_CPU_LIMIT || "1",
  };
}
export function applicationUpdatePayload(
  input: HostingInput,
  id: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const payload = applicationPayload(input, id, env);
  // Coolify's create endpoint accepts a clone URL and normalizes GitHub sources
  // to owner/repository. Its update endpoint writes git_repository directly,
  // so sending the URL again makes the deployer prepend github.com twice.
  payload.git_repository = new URL(input.repository).pathname.replace(/^\/+|\/+$/g, "");
  return payload;
}
export function coolifyClient(env: NodeJS.ProcessEnv = process.env, fetcher: typeof fetch = fetch) {
  return async (path: string, method = "GET", body?: unknown) => {
    if (!hostingConfig(env).configured)
      throw Object.assign(new Error("Project hosting is not configured."), { statusCode: 503 });
    let response: Response;
    try {
      response = await fetcher(`${env.HOSTING_COOLIFY_URL!.replace(/\/$/, "")}/api/v1${path}`, {
        method,
        redirect: "error",
        signal: AbortSignal.timeout(20_000),
        headers: {
          Authorization: `Bearer ${env.HOSTING_COOLIFY_TOKEN}`,
          "Content-Type": "application/json",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch {
      throw Object.assign(
        new Error("Hosting server did not respond. Refresh status before trying again."),
        { statusCode: 502 },
      );
    }
    if (!response.ok)
      throw Object.assign(
        new Error(
          `Hosting server returned HTTP ${response.status}. Check its token permissions and configuration.`,
        ),
        { statusCode: 502, rejected: response.status >= 400 && response.status < 500 },
      );
    try {
      return await response.json();
    } catch {
      throw Object.assign(new Error("Hosting server returned an invalid response."), {
        statusCode: 502,
      });
    }
  };
}
export function deploymentState(status: string, running: string) {
  if (status === "finished")
    return running.startsWith("running") && !running.includes("unhealthy") ? "ready" : "starting";
  if (["failed", "cancelled", "canceled"].includes(status)) return "failed";
  return "building";
}
export function readableLogs(value: unknown, token = process.env.HOSTING_COOLIFY_TOKEN || "") {
  let logs = value;
  if (typeof logs === "string") {
    try {
      logs = JSON.parse(logs);
    } catch {
      /* plain logs */
    }
  }
  const text = Array.isArray(logs)
    ? logs.map((l) => (typeof l === "string" ? l : l.output || l.message || "")).join("\n")
    : typeof logs === "string"
      ? logs
      : "";
  return (token ? text.split(token).join("[redacted]") : text)
    .replace(/\u001b\[[0-9;]*m/g, "")
    .slice(-40_000);
}
