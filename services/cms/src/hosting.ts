import { randomUUID } from "node:crypto";
import { z } from "zod";

import {
  hostingInput,
  hostingConfig,
  applicationPayload,
  applicationUpdatePayload,
  coolifyClient,
  deploymentState,
  readableLogs,
} from "./hosting-provider.ts";

export function registerHosting(
  app: any,
  user: (req: any) => Promise<any>,
  admin: (u: any) => void,
  redis: any,
  store: { pool: any; transaction: any; createRecord: any; emit: any },
  provider = coolifyClient(),
) {
  const { pool, transaction, createRecord, emit } = store;
  const prefix = "/api/v1/cms/hosting";
  const pending = (status: string) =>
    ["provisioning", "submitting", "building", "starting"].includes(status);
  const guard = async (req: any) => {
    const u = await user(req);
    admin(u);
    return u;
  };
  const locked = async (id: string, fn: (c: any, row: any) => Promise<any>) => {
    const c = await pool.connect();
    let acquired = false;
    try {
      acquired = (
        await c.query("SELECT pg_try_advisory_lock(hashtext($1)) AS locked", ["hosting:" + id])
      ).rows[0].locked;
      if (!acquired)
        throw Object.assign(new Error("A project operation is already in progress."), {
          statusCode: 409,
        });
      const row = (await c.query("SELECT * FROM hosted_projects WHERE id=$1", [id])).rows[0];
      if (!row) throw Object.assign(new Error("Hosted project not found."), { statusCode: 404 });
      return await fn(c, row);
    } finally {
      try { if (acquired) await c.query("SELECT pg_advisory_unlock(hashtext($1))", ["hosting:" + id]); }
      finally { c.release(); }
    }
  };
  const save = async (c: any, row: any) => {
    await c.query(
      "UPDATE hosted_projects SET status=$2,application_uuid=$3,deployment_uuid=$4,error=$5,submitted_at=$6,updated_at=now() WHERE id=$1",
      [
        row.id,
        row.status,
        row.application_uuid,
        row.deployment_uuid,
        row.error || null,
        row.submitted_at || null,
      ],
    );
    return row;
  };
  async function prepare(c: any, row: any) {
    if (row.application_uuid) return row;
    if (row.status === "provisioning")
      throw Object.assign(new Error("Refresh to reconcile the pending application creation."), {
        statusCode: 409,
      });
    const payload = applicationPayload(hostingInput.parse(row.input), row.id);
    payload.domains = row.url;
    row.status = "provisioning";
    await save(c, row);
    try {
      const created = await provider(
        row.input.privateRepo ? "/applications/private-github-app" : "/applications/public",
        "POST",
        payload,
      );
      if (!created.uuid) throw new Error("Hosting server did not return an application ID.");
      row.application_uuid = created.uuid;
      row.status = "draft";
      row.error = null;
      return save(c, row);
    } catch (error: any) {
      if (error.rejected) row.status = "failed";
      row.error = error.message;
      await save(c, row);
      throw error;
    }
  }
  async function refresh(c: any, row: any) {
    // Never create another application after an ambiguous provider timeout.
    if (!row.application_uuid && row.status === "provisioning") {
      const applications = await provider("/applications");
      const found = applications.find((a: any) => a.name === `fangscript-preview-${row.id}`);
      if (found?.uuid) {
        row.application_uuid = found.uuid;
        row.status = "draft";
        row.error = null;
      } else {
        // A timed-out create request must not leave the project permanently
        // stuck in "Creating application". The next explicit Prepare/Deploy
        // action can safely retry after the administrator has checked Coolify.
        row.status = "failed";
        row.error =
          "Coolify did not confirm application creation. Check Coolify, then retry preparation.";
      }
    }
    if (row.status === "submitting") {
      const history = await provider(
        "/deployments/applications/" + encodeURIComponent(row.application_uuid) + "?take=10",
      );
      const entries = Array.isArray(history) ? history : history.deployments || [];
      const latest = entries.find(
        (d: any) =>
          d.deployment_uuid &&
          new Date(d.created_at).getTime() >= new Date(row.submitted_at).getTime() - 5000,
      );
      if (latest) {
        row.deployment_uuid = latest.deployment_uuid;
        row.status = "building";
      } else {
        row.error =
          "Submission is unconfirmed. Check deployment history in Coolify before retrying.";
        return save(c, row);
      }
    }
    if (row.deployment_uuid) {
      const deployment = await provider("/deployments/" + encodeURIComponent(row.deployment_uuid));
      const application = await provider(
        "/applications/" + encodeURIComponent(row.application_uuid),
      );
      row.status = deploymentState(deployment.status, application.status || "");
      row.error = row.status === "failed" ? "Build failed. Open build logs for details." : null;
      row.logs = readableLogs(deployment.logs);
    }
    return save(c, row);
  }
  app.get(prefix, async (req: any) => {
    await guard(req);
    return {
      ...hostingConfig(),
      items: (await pool.query("SELECT * FROM hosted_projects ORDER BY created_at DESC LIMIT 100"))
        .rows,
    };
  });
  app.post(prefix, async (req: any, reply: any) => {
    const u = await guard(req);
    const input = hostingInput.parse(req.body);
    const id = randomUUID();
    const payload = applicationPayload(input, id);
    try {
      const row = await transaction(async (c: any) => {
        const r = (
          await c.query(
            "INSERT INTO hosted_projects(id,slug,input,url) VALUES($1,$2,$3,$4) RETURNING *",
            [id, input.slug, input, payload.domains],
          )
        ).rows[0];
        await emit(c, "cms.hosting.created.v1", { id, repository: input.repository }, u);
        return r;
      });
      return reply.code(201).send(row);
    } catch (error: any) {
      if (error.code === "23505")
        throw Object.assign(new Error("That project address is already in use."), {
          statusCode: 409,
        });
      throw error;
    }
  });
  app.get(prefix + "/:id", async (req: any) => {
    await guard(req);
    return locked(z.string().uuid().parse(req.params.id), refresh);
  });
  app.post(prefix + "/:id/prepare", async (req: any) => {
    await guard(req);
    return locked(z.string().uuid().parse(req.params.id), prepare);
  });
  app.patch(prefix + "/:id/environment", async (req: any) => {
    await guard(req);
    const data = z
      .array(
        z
          .object({
            key: z
              .string()
              .regex(/^[A-Za-z_][A-Za-z0-9_]*$/)
              .max(120),
            value: z.string().max(16000),
            is_buildtime: z.boolean(),
            is_runtime: z.boolean(),
          })
          .strict(),
      )
      .min(1)
      .max(100)
      .parse(req.body);
    return locked(z.string().uuid().parse(req.params.id), async (_c, row) => {
      if (!row.application_uuid || pending(row.status))
        throw Object.assign(
          new Error("Prepare the application and wait for any running build first."),
          { statusCode: 409 },
        );
      await provider(
        "/applications/" + encodeURIComponent(row.application_uuid) + "/envs/bulk",
        "PATCH",
        {
          data: data.map((item) => ({
            ...item,
            is_literal: true,
            is_multiline: item.value.includes("\n"),
            is_preview: false,
            is_shown_once: true,
          })),
        },
      );
      return { ok: true }; // Never return or store provider responses containing secret values.
    });
  });
  app.put(prefix + "/:id", async (req: any) => {
    await guard(req);
    const input = hostingInput.parse(req.body);
    return locked(z.string().uuid().parse(req.params.id), async (c, row) => {
      if (["provisioning", "submitting", "building", "starting"].includes(row.status))
        throw Object.assign(new Error("Wait for the current operation before editing."), {
          statusCode: 409,
        });
      if (input.slug !== row.slug || input.privateRepo !== row.input.privateRepo)
        throw Object.assign(
          new Error("The address and repository access type cannot be changed after import."),
          { statusCode: 400 },
        );
      applicationPayload(input, row.id);
      return (
        await c.query(
          "UPDATE hosted_projects SET input=$2,updated_at=now() WHERE id=$1 RETURNING *",
          [row.id, input],
        )
      ).rows[0];
    });
  });
  app.post(prefix + "/:id/deploy", async (req: any) => {
    await guard(req);
    return locked(z.string().uuid().parse(req.params.id), async (c, row) => {
      if (["provisioning", "submitting", "building", "starting"].includes(row.status))
        throw Object.assign(new Error("Refresh the current deployment before starting another."), {
          statusCode: 409,
        });
      try {
        if (!row.application_uuid) {
          await prepare(c, row);
        } else {
          const payload: any = applicationUpdatePayload(hostingInput.parse(row.input), row.id);
          for (const key of [
            "project_uuid",
            "server_uuid",
            "environment_name",
            "destination_uuid",
            "github_app_uuid",
            "instant_deploy",
          ])
            delete payload[key];
          // Keep the original assigned domain even if the installation's default changes.
          payload.domains = row.url;
          await provider(
            "/applications/" + encodeURIComponent(row.application_uuid),
            "PATCH",
            payload,
          );
        }
        row.status = "submitting";
        row.error = null;
        row.deployment_uuid = null;
        row.submitted_at = new Date().toISOString();
        await save(c, row);
        const started = await provider(
          "/deploy?uuid=" + encodeURIComponent(row.application_uuid),
          "POST",
        );
        const deployment =
          started.deployments?.find((d: any) => d.resource_uuid === row.application_uuid) ||
          started.deployments?.[0];
        if (!deployment?.deployment_uuid)
          throw new Error("Deployment submission is unconfirmed. Check Coolify before retrying.");
        row.deployment_uuid = deployment.deployment_uuid;
        row.status = "building";
        return save(c, row);
      } catch (error: any) {
        if (error.rejected && ["provisioning", "submitting"].includes(row.status))
          row.status = "failed";
        row.error = error.message;
        await save(c, row);
        throw error;
      }
    });
  });
  app.post(prefix + "/:id/publish", async (req: any) => {
    const u = await guard(req);
    return locked(z.string().uuid().parse(req.params.id), async (c, row) => {
      await refresh(c, row);
      if (row.status !== "ready")
        throw Object.assign(
          new Error("Wait for a successful build and a running application before publishing."),
          { statusCode: 409 },
        );
      const result = await transaction(async (db: any) => {
        let record;
        if (row.case_study_id) {
          record = (
            await db.query(
              "UPDATE records SET status='published',data=data||$2::jsonb,version=version+1,updated_at=now() WHERE id=$1 RETURNING *",
              [
                row.case_study_id,
                JSON.stringify({ liveUrl: row.url, hostingId: row.id, openLivePreview: true }),
              ],
            )
          ).rows[0];
        } else {
          const existing = await db.query("SELECT id FROM records WHERE kind='case-study' AND slug=$1", [row.slug]);
          if (existing.rows.length) throw Object.assign(new Error('A case study already uses this address. Set its live URL in Content, or change that case study slug before publishing this project.'), { statusCode: 409 });
          record = await createRecord(
            db,
            "case-study",
            row.input.title,
            {
              description: row.input.description,
              image: row.input.image,
              type: "Live project",
              category: "technology",
              liveUrl: row.url,
              hostingId: row.id,
              openLivePreview: true,
            },
            null,
            "published",
            row.slug,
            u,
          );
          await db.query("UPDATE hosted_projects SET case_study_id=$2 WHERE id=$1", [
            row.id,
            record.id,
          ]);
        }
        await emit(db, "cms.content.changed.v1", { id: record.id }, u);
        return record;
      });
      await redis.del("cms:public");
      return { caseStudyId: result.id, url: row.url };
    });
  });
}
