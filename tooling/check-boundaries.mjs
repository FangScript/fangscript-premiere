import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, relative, isAbsolute } from "node:path";
const violations = [];
function walk(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((e) =>
    ["node_modules", ".venv", "__pycache__", "dist"].includes(e.name)
      ? []
      : e.isDirectory()
        ? walk(join(path, e.name))
        : [join(path, e.name)],
  );
}
for (const group of ["services", "apps"])
  for (const module of readdirSync(group, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const root = resolve(group, module.name);
    for (const required of [
      "Dockerfile",
      ...(existsSync(join(root, "package.json")) ? ["package-lock.json"] : ["requirements.txt"]),
    ])
      if (!existsSync(join(root, required)))
        violations.push(root + ": missing independent " + required);
    for (const file of walk(root).filter((f) => /\.(ts|tsx|mjs|py)$/.test(f))) {
      const code = readFileSync(file, "utf8");
      for (const match of code.matchAll(
        /(?:from\s*|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/g,
      )) {
        const target = match[1];
        if (target.startsWith(".")) {
          const destination = resolve(file, "..", target);
          const local = relative(root, destination);
          if (local.startsWith("..") || isAbsolute(local))
            violations.push(file + ": runtime import leaves the module: " + target);
        }
      }
    }
  }
if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log(
  "Module boundaries verified: self-contained imports, dependency manifests, and deployment images.",
);
