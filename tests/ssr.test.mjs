import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";

test("production server renders published CMS sections and SEO", async () => {
  const gateway = http.createServer((req, res) => {
    if (req.url === "/api/v1/test-ping") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true, proxied: true }));
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        items: [
          {
            id: "cms-about",
            kind: "page",
            slug: "about",
            title: "About our studio",
            status: "published",
            version: 1,
            data: {
              seoTitle: "CMS studio title",
              seoDescription: "A published description from the CMS.",
              sections: [
                { title: "Our published principles", body: "Useful work, thoughtfully delivered." },
              ],
            },
          },
        ],
      }),
    );
  });
  await new Promise((r) => gateway.listen(0, "127.0.0.1", r));
  const port = gateway.address().port;
  const listener = http.createServer();
  await new Promise((r) => listener.listen(0, "127.0.0.1", r));
  const websitePort = listener.address().port;
  await new Promise((r) => listener.close(r));
  const child = spawn(process.execPath, [".output/server/index.mjs"], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      HOST: "127.0.0.1",
      PORT: String(websitePort),
      API_GATEWAY_URL: `http://127.0.0.1:${port}`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let diagnostics = "";
  child.stderr.on("data", (d) => (diagnostics += d));
  child.stdout.on("data", (d) => (diagnostics += d));
  try {
    let html = "";
    for (let attempt = 0; attempt < 40; attempt++) {
      try {
        const response = await fetch(`http://127.0.0.1:${websitePort}/about`);
        html = await response.text();
        assert.equal(response.status, 200, html);
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 150));
      }
    }
    assert.ok(html, "Production server did not respond: " + diagnostics);
    assert.match(html, /<title[^>]*>CMS studio title<\/title>/, diagnostics.slice(-6000));
    assert.ok(html.includes("A published description from the CMS."));
    assert.ok(html.includes("Our published principles"));
    assert.ok(html.includes("Useful work, thoughtfully delivered."));

    const apiResponse = await fetch(`http://127.0.0.1:${websitePort}/api/v1/test-ping`);
    assert.equal(apiResponse.status, 200);
    const apiJson = await apiResponse.json();
    assert.equal(apiJson.proxied, true);
  } finally {
    child.kill();
    await new Promise((r) => gateway.close(r));
  }
});

