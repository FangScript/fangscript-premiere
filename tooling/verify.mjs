import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
const mode = process.argv[2];
const run = (args, options = {}) => {
  const r = spawnSync(process.execPath, args, { stdio: "inherit", ...options });
  if (r.status !== 0) process.exit(r.status || 1);
};
if (mode === "public") {
  run(["node_modules/vite/bin/vite.js", "build"], {
    env: { ...process.env, NODE_ENV: "production" },
  });
} else if (mode === "domain") {
  for (const name of readdirSync("services"))
    if (!["gateway", "rag", "chatbot", "agent"].includes(name))
      run(["--test", "services/" + name + "/test/domain.test.ts"]);
} else if (mode === "build") {
  run(["node_modules/vite/bin/vite.js", "build"], {
    env: { ...process.env, NITRO_PRESET: "node-server", NODE_ENV: "production" },
  });
  for (const name of ["admin", "portal"]) {
    run(["node_modules/typescript/bin/tsc", "--noEmit", "-p", "apps/" + name + "/tsconfig.json"]);
    run([
      "node_modules/vite/bin/vite.js",
      "build",
      "apps/" + name,
      "--config",
      "apps/" + name + "/vite.config.ts",
    ]);
  }
} else throw Error("Use public, domain or build");
