/** Build-time templates only. Generated modules have no shared runtime imports. */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
const modules = {
  auth: { kinds: ["users", "invitations"], label: "Identity" },
  cms: {
    kinds: ["category", "page", "case-study", "post", "faq", "testimonial", "settings", "media"],
    label: "Content",
  },
  lead: { kinds: ["leads", "bookings", "touchpoints"], label: "Enquiries" },
  crm: { kinds: ["contacts", "companies", "deals", "activities"], label: "CRM" },
  project: { kinds: ["projects", "milestones", "tasks", "updates"], label: "Projects" },
  file: { kinds: ["files"], label: "Files" },
  proposal: { kinds: ["proposals", "templates"], label: "Proposals" },
  billing: { kinds: ["invoices", "receipts"], label: "Billing" },
  notification: { kinds: ["notifications", "deliveries"], label: "Notifications" },
  automation: { kinds: ["workflows", "runs"], label: "Automation" },
  marketing: { kinds: ["drafts", "campaigns"], label: "Marketing" },
  analytics: { kinds: ["metrics"], label: "Analytics" },
  audit: { kinds: ["events"], label: "Audit" },
};
const base = JSON.parse(readFileSync("tooling/templates/package.json", "utf8"));
let port = 4200;
for (const [name, config] of Object.entries(modules)) {
  const dir = join("services", name);
  mkdirSync(join(dir, "src"), { recursive: true });
  mkdirSync(join(dir, "migrations"), { recursive: true });
  mkdirSync(join(dir, "test"), { recursive: true });
  const dependencies = { ...base.dependencies };
  if (name !== "billing") delete dependencies.stripe;
  if (name !== "file") {
    delete dependencies["@aws-sdk/client-s3"];
    delete dependencies["@aws-sdk/s3-request-presigner"];
  }
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ ...base, dependencies, name: "@fangscript/" + name }, null, 2) + "\n",
  );
  for (const file of ["server.ts", "database.ts", "domain.ts", "events.ts"]) {
    let source = readFileSync(join("tooling/templates", file), "utf8").replaceAll(
      "__MODULE__",
      name,
    );
    if (file === "server.ts")
      source = source.replace(/^if\(config.name==='(\w+)'\)\{\r?\n[\s\S]*?^\}/gm, (block, owner) =>
        owner === name ? block : "",
      );
    writeFileSync(join(dir, "src", file), source);
  }
  writeFileSync(
    join(dir, "src/module.ts"),
    `export default ${JSON.stringify({ ...config, name, port: port++ }, null, 2)} as const;\n`,
  );
  writeFileSync(
    join(dir, "migrations/001_initial.sql"),
    readFileSync("tooling/templates/001_initial.sql", "utf8"),
  );
  writeFileSync(
    join(dir, "test/domain.test.ts"),
    readFileSync("tooling/templates/domain.test.ts", "utf8"),
  );
  writeFileSync(
    join(dir, "Dockerfile"),
    readFileSync("tooling/templates/Dockerfile", "utf8").replace(
      "USER node",
      name === "cms" ? "COPY catalog.json ./catalog.json\nUSER node" : "USER node",
    ),
  );
  if (name === "cms")
    writeFileSync(join(dir, "catalog.json"), readFileSync("contracts/catalog.json"));
  if (name === "cms") {
    for (const file of ["hosting.ts", "hosting-provider.ts"]) writeFileSync(join(dir, "src", file), readFileSync(join("tooling/templates", file)));
    writeFileSync(join(dir, "migrations/002_hosted_projects.sql"), readFileSync("tooling/templates/002_hosted_projects.sql"));
  }
  if (name === "audit")
    writeFileSync(
      join(dir, "migrations/002_immutable.sql"),
      `CREATE OR REPLACE FUNCTION reject_audit_change() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Audit history is append-only'; END $$;\nCREATE TRIGGER audit_immutable BEFORE UPDATE OR DELETE OR TRUNCATE ON records FOR EACH STATEMENT EXECUTE FUNCTION reject_audit_change();\n`,
    );
  writeFileSync(join(dir, ".dockerignore"), "node_modules\n.env\n*.log\n");
  writeFileSync(
    join(dir, "README.md"),
    `# ${config.label} service\n\nIndependently built and deployed. Owns its database and migrations. No imports from sibling services.\n\nRun: npm install; npm run migrate; npm start. Tests: npm test. Configuration: DATABASE_URL, JWT_SECRET, INTERNAL_TOKEN, REDIS_URL, NATS_URL, PORT.\n\nHTTP contract: /api/v1/${name}; health: /health/live and /health/ready. Events: fangscript.${name}.*.v1.\n\nRecords: ${config.kinds.join(", ")}. Update requests require the current version to prevent lost writes.\n`,
  );
}
mkdirSync("contracts", { recursive: true });
writeFileSync(
  "contracts/modules.json",
  JSON.stringify(
    Object.entries(modules).map(([id, c], index) => ({ ...c, id, port: 4200 + index })),
    null,
    2,
  ),
);
