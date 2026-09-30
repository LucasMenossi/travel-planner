import { test, expect } from "@playwright/test";
import { createTrip, signUp } from "./helpers";

test.describe("itinerary", () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page);
  });

  test("creates, edits, reorders, and removes itinerary activities", async ({
    page,
  }) => {
    await createTrip(page);

    await page.getByRole("button", { name: "Add activity" }).click();
    await page.getByRole("textbox", { name: "Activity" }).fill("Visit Shibuya");
    await page.getByLabel("Start time").fill("10:00");
    await page.getByLabel("End time").fill("11:00");
    await page
      .getByLabel("Notes")
      .fill("Explore the crossing and nearby streets.");
    await page.getByRole("button", { name: "Add activity" }).click();

    await expect(
      page.getByRole("heading", { name: "Visit Shibuya" }),
    ).toBeVisible();
    await expect(
      page.getByText("Explore the crossing and nearby streets."),
    ).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).click();
    await page
      .getByRole("textbox", { name: "Activity" })
      .fill("Visit Shibuya Crossing");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(
      page.getByRole("heading", { name: "Visit Shibuya Crossing" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Add activity" }).click();
    await page
      .getByRole("textbox", { name: "Activity" })
      .fill("Dinner in Shibuya");
    await page.getByLabel("Start time").fill("19:00");
    await page.getByLabel("End time").fill("20:00");
    await page.getByRole("button", { name: "Add activity" }).click();

    await expect(
      page.getByRole("heading", { name: "Dinner in Shibuya" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Move Dinner in Shibuya up" })
      .click();

    const activityTitles = page.locator("h4");
    await expect(activityTitles.nth(0)).toHaveText("Dinner in Shibuya");
    await expect(activityTitles.nth(1)).toHaveText("Visit Shibuya Crossing");

    await page.getByRole("button", { name: "Remove" }).first().click();

    await expect(
      page.getByRole("heading", { name: "Dinner in Shibuya" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Visit Shibuya Crossing" }),
    ).toBeVisible();
  });

  test("rejects overlapping activities", async ({ page }) => {
    await createTrip(page);

    await page.getByRole("button", { name: "Add activity" }).click();
    await page
      .getByRole("textbox", { name: "Activity" })
      .fill("Morning Activity");
    await page.getByLabel("Start time").fill("10:00");
    await page.getByLabel("End time").fill("12:00");
    await page.getByRole("button", { name: "Add activity" }).click();

    await page.getByRole("button", { name: "Add activity" }).click();
    await page
      .getByRole("textbox", { name: "Activity" })
      .fill("Overlapping Activity");
    await page.getByLabel("Start time").fill("11:00");
    await page.getByLabel("End time").fill("13:00");
    await page.getByRole("button", { name: "Add activity" }).click();

    await expect(
      page.getByText("This time overlaps with “Morning Activity”.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByText("Overlapping Activity")).not.toBeVisible();
  });

  test("allows adjacent activities without overlap", async ({ page }) => {
    await createTrip(page);

    await page.getByRole("button", { name: "Add activity" }).click();
    await page
      .getByRole("textbox", { name: "Activity" })
      .fill("Morning Activity");
    await page.getByLabel("Start time").fill("10:00");
    await page.getByLabel("End time").fill("11:00");
    await page.getByRole("button", { name: "Add activity" }).click();

    await page.getByRole("button", { name: "Add activity" }).click();
    await page.getByRole("textbox", { name: "Activity" }).fill("Next Activity");
    await page.getByLabel("Start time").fill("11:00");
    await page.getByLabel("End time").fill("12:00");
    await page.getByRole("button", { name: "Add activity" }).click();

    await expect(
      page.getByRole("heading", { name: "Morning Activity" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Next Activity" }),
    ).toBeVisible();
  });
});
