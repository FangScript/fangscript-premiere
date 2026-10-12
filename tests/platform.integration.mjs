import { test } from "node:test";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
const env = parseEnv(readFileSync(".env", "utf8"));
const base = process.env.TEST_API_URL || "http://127.0.0.1:4100/api/v1";
let cookies = "";
async function request(path, body, method = body ? "POST" : "GET", session = cookies) {
  const response = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", Cookie: session, Origin: env.PUBLIC_URL },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}
test("persisted lead, version conflict, publishing, proposal and invoice lifecycle", async () => {
  const login = await request("/auth/login", {
    email: env.BOOTSTRAP_ADMIN_EMAIL,
    password: env.BOOTSTRAP_ADMIN_PASSWORD,
  });
  assert.equal(login.response.status, 200);
  cookies = login.response.headers
    .getSetCookie()
    .map((v) => v.split(";")[0])
    .join("; ");
  const suffix = Date.now();
  const lead = await request("/lead/leads", {
    name: "Integration Test",
    email: "integration-" + suffix + "@example.com",
    message: "A test enquiry for the approved website workflow.",
    consent: true,
  });
  assert.equal(lead.response.status, 201);
  const listing = await request("/lead/records?kind=leads");
  assert.ok(listing.data.items.some((i) => i.id === lead.data.id));
  const company = await request("/crm/records", {
    kind: "companies",
    title: "Integration client " + suffix,
    data: { email: "client@example.com" },
    status: "active",
  });
  assert.equal(company.response.status, 201);
  const tenantId = company.data.id;
  const clientEmail = "portal-" + suffix + "@example.com";
  const clientPassword = "Integration-only-password-123!";
  const invitation = await request("/auth/invite", {
    email: clientEmail,
    name: "Client test",
    role: "client",
    tenantId,
  });
  assert.equal(invitation.response.status, 200);
  const inviteText = execFileSync(
    "docker",
    [
      "compose",
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      "postgres",
      "-d",
      "fs_auth",
      "-At",
      "-c",
      `SELECT payload->'data'->>'text' FROM outbox WHERE payload->>'type'='auth.email.v1' AND payload->'data'->>'email'='${clientEmail}' ORDER BY created_at DESC LIMIT 1`,
    ],
    { encoding: "utf8" },
  );
  const token = inviteText.match(/token=([a-f0-9]{64})/)?.[1];
  assert.ok(token, "An invitation must have a one-time token");
  assert.equal(
    (await request("/auth/set-password", { token, password: clientPassword })).response.status,
    200,
  );
  const clientLogin = await request("/auth/login", {
    email: clientEmail,
    password: clientPassword,
  });
  assert.equal(clientLogin.response.status, 200);
  const clientCookies = clientLogin.response.headers
    .getSetCookie()
    .map((v) => v.split(";")[0])
    .join("; ");
  const otherCompany = await request("/crm/records", {
    kind: "companies",
    title: "Other company " + suffix,
    status: "active",
    data: {},
  });
  const privateProject = await request("/project/records", {
    kind: "projects",
    title: "Other client project",
    tenantId: otherCompany.data.id,
    status: "active",
    data: { clientVisible: true },
  });
  assert.equal(
    (await request("/project/records/" + privateProject.data.id, undefined, "GET", clientCookies))
      .response.status,
    404,
  );
  const clientProjects = await request(
    "/project/records?kind=projects",
    undefined,
    "GET",
    clientCookies,
  );
  assert.ok(!clientProjects.data.items.some((i) => i.id === privateProject.data.id));
  assert.equal(
    (await request("/cms/records", undefined, "GET", clientCookies)).response.status,
    403,
  );
  const hidden = await request("/project/records", {
    kind: "projects",
    title: "Internal notes",
    tenantId,
    status: "active",
    data: { clientVisible: false },
  });
  assert.equal(
    (await request("/project/records/" + hidden.data.id, undefined, "GET", clientCookies)).response
      .status,
    404,
  );

  const draft = await request("/cms/records", {
    kind: "post",
    title: "Integration article",
    slug: "integration-" + suffix,
    status: "draft",
    data: { body: "An integration verification article." },
  });
  assert.equal(draft.response.status, 201);
  const published = await request("/cms/records/" + draft.data.id + "/action", {
    action: "publish",
    version: draft.data.version,
  });
  assert.equal(published.response.status, 200);
  let content = await request("/cms/public", undefined, "GET", "");
  assert.ok(content.data.items.some((i) => i.id === draft.data.id));
  const conflict = await request(
    "/cms/records/" + draft.data.id,
    {
      kind: "post",
      title: "Stale update",
      slug: "integration-" + suffix,
      status: "draft",
      data: {},
      version: draft.data.version,
    },
    "PUT",
  );
  assert.equal(conflict.response.status, 409);
  const unpublish = await request("/cms/records/" + draft.data.id + "/action", {
    action: "unpublish",
    version: published.data.version,
  });
  assert.equal(unpublish.response.status, 200);
  content = await request("/cms/public", undefined, "GET", "");
  assert.ok(!content.data.items.some((i) => i.id === draft.data.id));
  const proposal = await request("/proposal/records", {
    kind: "proposals",
    title: "Integration proposal " + suffix,
    tenantId,
    status: "draft",
    data: {
      summary: "A test project",
      currency: "PKR",
      taxPercent: 5,
      clientVisible: true,
      lines: [{ description: "Test delivery", quantity: 3, unitPrice: 10.1 }],
    },
  });
  assert.equal(proposal.response.status, 201);
  const sent = await request("/proposal/records/" + proposal.data.id + "/action", {
    action: "send",
    version: proposal.data.version,
  });
  assert.equal(sent.response.status, 200);
  const accepted = await request(
    "/proposal/records/" + proposal.data.id + "/action",
    { action: "accept", version: sent.data.version },
    "POST",
    clientCookies,
  );
  assert.equal(accepted.response.status, 200);
  assert.equal(
    (
      await request("/proposal/records/" + proposal.data.id + "/action", {
        action: "send",
        version: accepted.data.version,
      })
    ).response.status,
    409,
  );
  let invoice;
  for (let i = 0; i < 25; i++) {
    const invoices = await request("/billing/records?kind=invoices&limit=100");
    invoice = invoices.data.items.find((r) => r.data.proposalId === proposal.data.id);
    if (invoice) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert.ok(invoice, "Accepted proposal must produce a durable draft invoice");
  assert.equal(invoice.data.total, 3182);
  const issued = await request("/billing/records/" + invoice.id + "/action", {
    action: "send",
    version: invoice.version,
  });
  assert.equal(issued.response.status, 200);
  const paid = await request("/billing/records/" + invoice.id + "/action", {
    action: "mark-paid",
    version: issued.data.version,
  });
  assert.equal(paid.response.status, 200);
  assert.equal(paid.data.status, "paid");
  const publicPrivate = await request("/billing/records?kind=invoices", undefined, "GET", "");
  assert.equal(publicPrivate.response.status, 401);
  const blocked = await request("/cms/internal/published", undefined, "GET", "");
  assert.equal(blocked.response.status, 404);
});
