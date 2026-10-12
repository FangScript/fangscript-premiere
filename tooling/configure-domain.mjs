import { readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
const env = parseEnv(readFileSync(".env", "utf8"));
const domain = env.DOMAIN;
if (!domain || domain === "localhost" || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain))
  throw Error("Set a valid DOMAIN in .env");
let text = readFileSync("infra/traefik/routes.yml", "utf8");
text = text.replace(
  /rule: "(?:Host\(`[^`]+`\) && )?PathPrefix\(([^)]+)\)"/g,
  (_, path) => 'rule: "Host(`' + domain + "`) && PathPrefix(" + path + ')"',
);
writeFileSync("infra/traefik/routes.yml", text);
console.log("Configured HTTPS routing for the deployment domain.");
