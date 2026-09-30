import { test, expect } from "@playwright/test";
import { createTrip, signUp } from "./helpers";

test.describe("trips", () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page);
  });

  test("creates a trip and displays it in the trip list", async ({ page }) => {
    const trip = await createTrip(page);

    await page.goto("/trips");

    await expect(page.getByRole("heading", { name: trip.name })).toBeVisible();
    await expect(page.getByText(trip.destination)).toBeVisible();
    await expect(page.getByText("Apr 10, 2027 – Apr 12, 2027")).toBeVisible();
  });

  test("edits a trip", async ({ page }) => {
    const trip = await createTrip(page);

    await page.getByRole("link", { name: "Edit trip" }).click();

    await expect(page).toHaveURL(/\/trips\/[^/]+\/edit$/);

    await page.getByLabel("Trip name").fill("Tokyo E2E Trip Updated");
    await page.getByLabel("Destination").fill("Kyoto, Japan");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/trips\/[^/]+$/);
    await expect(
      page.getByRole("heading", { name: "Tokyo E2E Trip Updated" }),
    ).toBeVisible();
    await expect(page.getByText("Kyoto, Japan")).toBeVisible();
  });

  test("deletes a trip and returns to the trip list", async ({ page }) => {
    const trip = await createTrip(page);

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toBe(
        "Delete this trip? This will also remove its saved places and itinerary.",
      );
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Delete trip" }).click();

    await expect(page).toHaveURL(/\/trips$/);
    await expect(
      page.getByRole("heading", { name: trip.name }),
    ).not.toBeVisible();
  });

  test("does not allow a trip date range to exclude existing itinerary activities", async ({
    page,
  }) => {
    const trip = await createTrip(page);

    await page.getByRole("button", { name: /Apr 11/ }).click();
    await page.getByRole("button", { name: "Add activity" }).click();

    await page.getByRole("textbox", { name: "Activity" }).fill("Visit Shibuya");
    await page.getByLabel("Start time").fill("10:00");
    await page.getByLabel("End time").fill("11:00");

    await page.getByRole("button", { name: "Add activity" }).click();

    await expect(page.getByText("Visit Shibuya")).toBeVisible();

    await page.getByRole("link", { name: "Edit trip" }).click();
    await page.getByLabel("End date").fill("2027-04-10");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(
      page.getByText(
        "Trip dates cannot exclude existing itinerary activities.",
        { exact: true },
      ),
    ).toBeVisible();
  });
});
