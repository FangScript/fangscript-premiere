import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
for (const name of ["admin", "portal"]) {
  const dir = "apps/" + name;
  mkdirSync(dir + "/src", { recursive: true });
  const pkg = JSON.parse(readFileSync("tooling/workspace-template/package.json", "utf8"));
  pkg.name = "@fangscript/" + name;
  writeFileSync(dir + "/package.json", JSON.stringify(pkg, null, 2));
  for (const file of ["App.tsx", "Workspace.tsx", "Records.tsx", "Operations.tsx", "Hosting.tsx", "hosting.css"])
    writeFileSync(
      dir + "/src/" + file,
      readFileSync("tooling/workspace-template/" + file, "utf8").replace(
        "__PORTAL__",
        String(name === "portal"),
      ),
    );
  writeFileSync(
    dir + "/src/workspace.css",
    readFileSync("tooling/workspace-template/workspace.css"),
  );
  writeFileSync(
    dir + "/index.html",
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta name="robots" content="noindex,nofollow"/><title>FangScript Lab — ${name === "admin" ? "Agency workspace" : "Client portal"}</title></head><body><div id="root"></div><script type="module" src="/src/App.tsx"></script></body></html>`,
  );
  writeFileSync(
    dir + "/vite.config.ts",
    `import{defineConfig}from'vite';import react from'@vitejs/plugin-react';export default defineConfig({plugins:[react()],base:'/${name}/',server:{port:${name === "admin" ? 4101 : 4102},proxy:{'/api/v1':{target:'http://127.0.0.1:4100',changeOrigin:false}}},build:{target:'es2022'}});`,
  );
  writeFileSync(
    dir + "/tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          allowImportingTsExtensions: true,
          types: ["vite/client"],
        },
        include: ["src", "vite.config.ts"],
      },
      null,
      2,
    ),
  );
  writeFileSync(
    dir + "/Dockerfile",
    `FROM node:24-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --ignore-scripts --no-audit --no-fund\nCOPY . .\nRUN npm run build\nFROM nginx:alpine\nCOPY nginx.conf /etc/nginx/conf.d/default.conf\nCOPY --from=build /app/dist /usr/share/nginx/html/${name}\nEXPOSE 80\n`,
  );
  writeFileSync(
    dir + "/nginx.conf",
    `server { listen 80; server_name _; root /usr/share/nginx/html; location /${name}/ { try_files $uri $uri/ /${name}/index.html; } location /${name}/assets/ { expires 1y; add_header Cache-Control "public, immutable"; } }`,
  );
  writeFileSync(dir + "/.dockerignore", "node_modules\ndist\n.env\n");
}
