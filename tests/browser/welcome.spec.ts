import { test, expect } from "@playwright/test";
test("welcome writes the brand, dismisses, and returns on reload", async ({ page }) => {
  await page.goto("/");
  const welcome = page.getByRole("dialog", { name: "Welcome to FangScript Lab" });
  await expect(welcome).toBeVisible();
  await expect(welcome.locator("path")).toHaveCount(13);
  await page.evaluate(() =>
    document
      .querySelector(".welcome-intro")
      ?.getAnimations({ subtree: true })
      .forEach((a) => {
        a.currentTime = 2700;
        a.pause();
      }),
  );
  await page.screenshot({ path: "artifacts/welcome-desktop.png" });
  await page.getByRole("button", { name: "Enter the lab" }).click();
  await expect(welcome).toHaveCount(0);
  await expect(page.locator("[inert]")).toHaveCount(0);
  await page.reload();
  await expect(welcome).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(welcome).toHaveCount(0);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.svg?v=2");
});
test("welcome automatically reveals the site and respects reduced motion", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "Welcome to FangScript Lab" })).toHaveCount(0, {
    timeout: 6500,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByRole("dialog", { name: "Welcome to FangScript Lab" })).toHaveCount(0);
  await expect(page.locator("[inert]")).toHaveCount(0);
});
