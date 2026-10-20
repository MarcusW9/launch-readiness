import { expect, test } from "@playwright/test";

const STUDIO_IMAGERY = "/products/5678901/activities/studio-imagery";

test.describe("activity workflow", () => {
  test("advances an activity one stage at a time", async ({ page }) => {
    await page.goto(STUDIO_IMAGERY);
    const workflow = page.getByRole("region", { name: /workflow/i });

    await workflow.getByRole("button", { name: /^Mark as / }).click();

    await expect(workflow.getByRole("button", { name: /^Move back to / })).toBeVisible();
  });

  test("moves back a stage after advancing", async ({ page }) => {
    await page.goto(STUDIO_IMAGERY);
    const workflow = page.getByRole("region", { name: /workflow/i });
    const advance = workflow.getByRole("button", { name: /^Mark as / });
    const advanceName = await advance.textContent();

    await advance.click();
    await workflow.getByRole("button", { name: /^Move back to / }).click();

    await expect(workflow.getByRole("button", { name: advanceName ?? "" })).toBeVisible();
  });

  test("resets the demo data from the prototype strip", async ({ page }) => {
    await page.goto(STUDIO_IMAGERY);
    const workflow = page.getByRole("region", { name: /workflow/i });
    const advance = workflow.getByRole("button", { name: /^Mark as / });
    const advanceName = await advance.textContent();

    await advance.click();
    await expect(workflow.getByRole("button", { name: advanceName ?? "" })).toHaveCount(0);

    await page.getByRole("button", { name: "Reset demo data" }).click();

    await expect(workflow.getByRole("button", { name: advanceName ?? "" })).toBeVisible();
  });
});
