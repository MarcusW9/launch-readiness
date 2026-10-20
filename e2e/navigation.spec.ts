import { expect, test } from "@playwright/test";

test.describe("navigation", () => {
  test("moves between the main pages from the header", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("banner");

    await nav.getByRole("link", { name: "Products", exact: true }).click();
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await nav.getByRole("link", { name: /^Action Required/ }).click();
    await expect(page).toHaveURL(/\/action-required$/);
    await expect(page.getByRole("heading", { level: 1, name: "Action Required" })).toBeVisible();

    await nav.getByRole("link", { name: "How it works" }).click();
    await expect(page).toHaveURL(/\/how-it-works$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("opens a product from Action Required and returns to the list", async ({ page }) => {
    await page.goto("/action-required");

    await page.getByRole("link", { name: /Little Acorn Wooden Play Kitchen/ }).first().click();
    await expect(page).toHaveURL(/\/products\/5678901$/);
    await expect(page.getByRole("heading", { level: 1, name: /Little Acorn Wooden Play Kitchen/ })).toBeVisible();

    await page.goBack();
    await expect(page.getByRole("heading", { level: 1, name: "Action Required" })).toBeVisible();
  });

  test("has no activity pages any more", async ({ page }) => {
    const response = await page.goto("/products/5678901/activities/does-not-exist");

    expect(response?.status()).toBe(404);
  });
});
