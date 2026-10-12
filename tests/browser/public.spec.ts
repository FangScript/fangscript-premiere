import { test, expect } from "@playwright/test";
test("homepage renders a live canvas and complete capabilities", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Build.Automate.Grow.");
  await expect(page.locator("canvas")).toBeVisible({ timeout: 30000 });
  await page.locator(".skip-animation").click();
  await expect(page.locator(".service-card")).toHaveCount(5);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("canvas").waitFor();
  await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });
  await page.screenshot({ path: "artifacts/hero-desktop.png" });
  expect(errors).toEqual([]);
});
test("all five service pages expose the full canonical list", async ({ page }) => {
  const categories = [
    ["technology-software-development", 12],
    ["ai-intelligent-automation", 10],
    ["digital-marketing-growth", 8],
    ["content-creative", 9],
    ["business-systems-data-integrations", 9],
  ] as const;
  for (const [slug, count] of categories) {
    await page.goto("/services/" + slug);
    await expect(page.locator(".offering")).toHaveCount(count);
  }
});
test("a failed enquiry stays visibly unconfirmed", async ({ page }) => {
  await page.route("**/api/v1/lead/leads", (r) =>
    r.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "The enquiry service is temporarily unavailable." }),
    }),
  );
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Test User");
  await page.getByLabel("Email address").fill("test@example.com");
  await page
    .getByLabel("A little about your project")
    .fill("A useful new website for our business.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send your project brief" }).click();
  await expect(page.getByRole("alert")).toContainText("temporarily unavailable");
  await expect(page.getByText("Your brief is with us.")).toHaveCount(0);
});
test("successful enquiry is acknowledged only after persistence response", async ({ page }) => {
  await page.route("**/api/v1/lead/leads", (r) =>
    r.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, id: "test-id" }),
    }),
  );
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Test User");
  await page.getByLabel("Email address").fill("test@example.com");
  await page
    .getByLabel("A little about your project")
    .fill("A useful new website for our business.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send your project brief" }).click();
  await expect(page.getByRole("status")).toContainText("Your brief is with us.");
});
test("mobile navigation and chat are usable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await page.getByRole("button", { name: "Close navigation" }).click();
  await page.getByRole("button", { name: "Ask FangScript" }).click();
  await expect(page.getByRole("region", { name: "FangScript Assistant" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: "artifacts/home-mobile-chat.png", fullPage: false });
});
test("independent admin and portal show sign-in without fake operational data", async ({
  page,
}) => {
  for (const route of ["/admin/", "/portal/"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "Good to see you." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  }
  await page.screenshot({ path: "artifacts/portal-login.png" });
});
test("workspace presents provider disconnection and remains navigable", async ({ page }) => {
  await page.route("**/api/v1/auth/me", (r) =>
    r.fulfill({ json: { name: "FangScript Team", email: "team@example.com", role: "admin" } }),
  );
  await page.route(/\/api\/v1\/(lead|crm|project|billing)\/records/, (r) =>
    r.fulfill({ json: { items: [] } }),
  );
  await page.goto("/admin/");
  await expect(page.getByRole("heading", { name: "Hello, FangScript." })).toBeVisible();
  await page.screenshot({ path: "artifacts/admin-overview.png", fullPage: true });
});
test("3D failure leaves readable content and navigation available", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind: any, ...args: any[]) {
      if (String(kind).startsWith("webgl")) return null;
      return original.apply(this, [kind, ...args] as any);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".scene-fallback")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book a discovery call" }).first()).toBeVisible();
});
test("unpublished CMS records are not replaced by fallback content", async ({ page }) => {
  await page.route("**/api/v1/cms/public", (r) => r.fulfill({ json: { items: [] } }));
  await page.goto("/services");
  await expect(page.locator(".service-card")).toHaveCount(0);
  await page.goto("/work");
  await expect(page.locator(".project-card")).toHaveCount(0);
});
test("CMS editor saves a real draft request and reports failure", async ({ page }) => {
  await page.route("**/api/v1/auth/me", (r) =>
    r.fulfill({ json: { name: "Editor", role: "admin" } }),
  );
  await page.route("**/api/v1/*/records?*", (r) => r.fulfill({ json: { items: [] } }));
  await page.route("**/api/v1/cms/records", (r) =>
    r.fulfill({ status: 503, json: { error: "Content storage is unavailable." } }),
  );
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Content studio" }).click();
  await page.getByRole("button", { name: "Page", exact: true }).click();
  await page.getByRole("button", { name: "New page", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("A new page");
  await page.getByLabel("Body", { exact: true }).fill("A useful page draft.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Content storage is unavailable");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
