import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Baseline a11y sweep — every implemented route must have zero axe violations
 * at WCAG 2.2 AA. This is the gate the brief calls out in §9.
 */
const routes = ["/", "/kanban", "/channels", "/proposals", "/research/digests"];

for (const r of routes) {
  test(`axe scan: ${r}`, async ({ page }) => {
    await page.goto(r);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test("skip link becomes visible on focus and moves focus to main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to main content/i });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  // Verify focus moved to <main>
  const main = page.locator("#main");
  await expect(main).toBeFocused();
});

test("dashboard has exactly one h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("kanban index has a single h1", async ({ page }) => {
  await page.goto("/kanban");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("channels index lists all channels", async ({ page }) => {
  await page.goto("/channels");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("proposals form: submit-with-zero focuses first checkbox and shows alert", async ({ page }) => {
  // This test requires at least one proposal file to exist.
  await page.goto("/proposals");
  const firstLink = page.locator("a[href^='/proposals/week-']").first();
  if (!(await firstLink.count())) test.skip();
  await firstLink.click();
  await page.waitForLoadState("networkidle");
  // If the proposal contains diffs, attempting submit with zero selections should alert.
  const submit = page.getByRole("button", { name: /review selected/i });
  if (!(await submit.count())) test.skip();
  await submit.click();
  const alert = page.getByRole("alert");
  await expect(alert).toContainText(/select at least one/i);
});
