# GitHub projects on your own domain

The agency workspace now includes **Project hosting**. An administrator can import a GitHub repository, configure its build, deploy it through Coolify, inspect build logs and publish a live-preview card to Work. The project runs in its own application container. The CMS never runs repository code or mounts Docker's socket.

## One-time setup

Create a dedicated Coolify project/environment for portfolio previews. Connect the hosting server and its reverse proxy. Set these runtime variables on the **CMS service**, then redeploy the CMS:

```dotenv
HOSTING_COOLIFY_URL=https://your-coolify-host
HOSTING_COOLIFY_TOKEN=your-provider-token
HOSTING_PROJECT_UUID=your-preview-project-uuid
HOSTING_SERVER_UUID=your-server-uuid
HOSTING_BASE_DOMAIN=fangscriptlab.com
```

The URL is the Coolify origin, without `/api/v1`. The token requires read, write and deploy permissions for that team. Keep it in deployment environment settings, never a frontend variable or a committed file. The CMS container needs network access to that URL. Use HTTPS across untrusted networks; an internal HTTP URL can be used on a trusted server network.

Optional runtime settings: `HOSTING_ENVIRONMENT` (default `production`), `HOSTING_DESTINATION_UUID` (when the server has multiple destinations), `HOSTING_GITHUB_APP_UUID` (private repositories), `HOSTING_MEMORY_LIMIT` (default `512m`), `HOSTING_CPU_LIMIT` (default `1`). These limits constrain running applications; builds still need enough server capacity. Private repositories require installing the connected GitHub App with access to those repositories.

Point `*.fangscriptlab.com` to the preview server in DNS, or add individual project records. Preserve existing website, API, mail and Coolify records. Ensure the proxy can issue certificates for project hosts and that ports 80/443 reach it. The feature assigns the hostname in Coolify; it does not manage DNS records. If using a different base domain, configure its wildcard instead. Domain names such as `admin`, `api` and `coolify` are reserved by the importer, but existing manually configured hostnames must also be avoided.

## Everyday workflow

1. Open Admin → Project hosting → Import from GitHub.
2. Paste the repository URL, enter its branch, name and unique address. For example, `novexa` becomes `https://novexa.fangscriptlab.com`.
3. Choose frontend, Node application or Dockerfile. For a Vite frontend, the usual settings are `npm ci`, `npm run build`, and `/dist`. Adjust these for the repository's actual package manager and output. For a monorepo choose the repository folder. Node/Docker applications must listen on all interfaces on the configured application port.
4. Save. If configuration is needed before the first build, choose **Prepare environment**, then add the project's variables. Runtime-only is the default. Build-time frontend variables become public in the browser bundle; do not put database passwords or private API keys in them. Values are forwarded directly to Coolify and are not saved in CMS project records or returned to the browser. Variables can be updated by saving the same name; deletion and advanced multiline/bulk configuration remain available in Coolify.
5. Choose Deploy project. The selected project polls status; leaving the page does not cancel the server's build. Reopen it or Refresh status & logs to catch up. Edit settings and redeploy after a failed build. Automatic deploy-on-push is disabled; redeploy explicitly from this screen.
6. After the build finishes and Coolify reports the container running, open the live preview and check it. DNS, HTTPS and application-level behavior still need this check.
7. Choose Publish to Work. A published case study is created with the preview URL, description and optional image. Its Work/home card opens the project in a new tab under your domain. Edit its full case study or unpublish it through Content. Repeated publishing updates the same case study.

## Full applications and limits

Dockerfile mode can host a complete application served from one container; Node mode supports server-rendered Node apps. Neither automatically creates databases, reconstructs missing secrets nor deploys a multi-container Compose stack. Provision those dependencies in Coolify and supply their URLs first. Preview environments should use demo data and separate credentials. Projects do not inherit the agency application's secrets.

Build logs are administrator-only and rendered as text. The hosting token is redacted, but a repository's own build command can print its other secrets: avoid commands that dump environment variables. App records retain provider IDs so retries use the same application. Ambiguous create/deploy timeouts are reconciled against Coolify rather than immediately creating duplicates. If reconciliation cannot confirm the operation, the UI asks you to inspect Coolify; it does not pretend the build succeeded.

The initial implementation covers imports, build settings, private GitHub App access, environment updates, deployment, status/logs, redeployment and portfolio publishing. Application deletion, rollback, runtime-log browsing and database provisioning remain in Coolify. There is no same-origin iframe: projects open on their own subdomain, so project code does not run inside the admin application's origin.

## Validation and deployment

Local verification on 26 October 2026 passed: production builds for all three apps, TypeScript checks, module boundary checks, 100 backend/domain checks (including nine hosting checks), server rendering/proxy checks, the existing 15 browser regressions and three new hosting browser checks. Desktop/mobile screenshots use test data, not an actual deployed Novexa application. Nothing was deployed to the VPS during implementation.

`node --test services/cms/test/hosting.test.ts` checks input validation, provider requests, status transitions, administrator access, reconciliation and publishing with mocked provider/storage dependencies. `pnpm test:browser` covers import-to-publish UI and public preview links against mocked APIs. These tests do not prove DNS, TLS, a live Coolify version or an actual repository build works. Test a small repository after configuring the runtime variables and deploying this change. Migration `002_hosted_projects.sql` runs on CMS startup and creates only the new hosting table.

Provider contracts: [create public app](https://coolify.io/docs/api/endpoints/applications/create-public-application), [create private GitHub app](https://coolify.io/docs/api/endpoints/applications/create-private-github-app-application), [deploy](https://coolify.io/docs/api/endpoints/deployments/deploy-by-tag-or-uuid), [get deployment](https://coolify.io/docs/api/endpoints/deployments/get-deployment-by-uuid), [update environment](https://coolify.io/docs/api/endpoints/applications/update-envs-by-application-uuid).
