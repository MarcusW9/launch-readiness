import { expect, test } from "@playwright/test";

const PLAY_KITCHEN = "/products/5678901";

async function missingCount(page: import("@playwright/test").Page) {
  const heading = page.getByRole("heading", { level: 3, name: /^Missing \(\d+\)$/ });
  const text = (await heading.textContent()) ?? "";
  return Number(/\((\d+)\)/.exec(text)?.[1]);
}

test.describe("providing missing information", () => {
  test("moves an item from Missing to Available once it is saved", async ({ page }) => {
    await page.goto(PLAY_KITCHEN);
    const before = await missingCount(page);
    expect(before).toBeGreaterThan(0);

    await page.getByRole("button", { name: /^Provide / }).first().click();
    const save = page.getByRole("button", { name: "Save information" });
    await expect(save).toBeDisabled();

    await page.getByRole("textbox").fill("Confirmed by the supplier on the demo day.");
    await expect(save).toBeEnabled();
    await save.click();

    await expect(page.getByRole("heading", { level: 3, name: new RegExp(`^Missing \\(${before - 1}\\)$`) })).toBeVisible();
  });

  test("keeps the item missing when the form is cancelled", async ({ page }) => {
    await page.goto(PLAY_KITCHEN);
    const before = await missingCount(page);

    await page.getByRole("button", { name: /^Provide / }).first().click();
    await page.getByRole("textbox").fill("Draft that will be discarded");
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByRole("textbox")).toHaveCount(0);
    expect(await missingCount(page)).toBe(before);
  });
});
