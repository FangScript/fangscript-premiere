# Deploying the audit repairs

These changes are source fixes; they do not modify the current VPS automatically. Keep existing database volumes and existing generated secrets. Do not regenerate passwords for an initialized installation unless intentionally synchronizing the database roles too.

## Deployment configuration

The full Compose deployment connects web to gateway through its default network and sets `API_GATEWAY_URL=http://gateway:4100`. This is the simplest supported layout. If Coolify deploys the public website separately, persistently attach both that website and the gateway to a shared Docker network and set the website's runtime gateway URL to the gateway's stable alias. A manual `docker network connect` is not persistent deployment configuration. Keep database and other service ports private.

Required passwords, JWT/internal tokens and bootstrap credentials now fail configuration validation when absent. Retain the values already used by the database and services. Set `PUBLIC_URL` to the exact HTTPS website origin and `NODE_ENV=production`. Production does not honor the permissive origin bypass. Cookie settings should match HTTPS. API and standalone workspace host ports now default to loopback; Docker-network proxies remain able to reach their service ports. Use `GATEWAY_BIND_ADDRESS` or `WORKSPACE_BIND_ADDRESS` only when external host-port access is intentionally needed.

## Repair an existing database volume

First confirm the PostgreSQL container belongs to this application, and take/verify a backup. Ensure its configured `DB_*_PASSWORD` values match the services' connection URLs. From the updated repository root run:

```sh
sh tooling/repair-databases.sh YOUR_POSTGRES_CONTAINER_NAME
```

Or omit the argument inside the correct Compose project. The script creates missing roles/databases, synchronizes role passwords from the database container's environment, and grants schema access. It never drops databases or tables. It must be run explicitly for existing volumes. Then restart affected application containers and inspect Connections. This is not a password-rotation command to run with newly generated unrelated secrets.

## Administrator recovery

Normal restarts now leave existing accounts unchanged. To intentionally recover the configured bootstrap account, set its bootstrap email/password in the auth deployment, then execute this inside the auth container's application working directory:

```sh
node src/server.ts --recover-admin
```

This explicit operation changes that account's password, enables administrator access and revokes its sessions. Normal startup does none of those things to an existing account. The password must be at least 12 characters. The production environment generator creates a random password and refuses to overwrite an existing file.

## Verification

Run `pnpm build:all`, `pnpm test:ssr`, `pnpm test:browser`, `pnpm typecheck`, `pnpm test:domain`, and `pnpm test:boundaries`. `build:all` assembles both workspaces into the public production output. Browser tests start their local production server automatically.

With Docker available, run `sh tests/database-init.sh` only against a test stack, then `pnpm test:integration`. CI does both. The initialization test checks all 16 roles and verifies that rerunning setup preserves a test row. Integration checks auth restart preserves account state.

In Connections, inspect the event connection, queued-event count and failed-event count. An administrator can review and requeue failed events. A queued retry is not proof of downstream delivery. Provider badges indicate configured settings, not verified delivery; use actual test emails, calendar callbacks, file upload/download and Stripe test payments before relying on those integrations.
