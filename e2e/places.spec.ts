import { test, expect } from "@playwright/test";

import { createTrip, signUp } from "./helpers";

const restaurantPlace = {
  externalId: "geoapify-restaurant-1",
  name: "Tokyo E2E Restaurant",
  address: "1 E2E Street, Tokyo, Japan",
  latitude: 35.6762,
  longitude: 139.6503,
  category: "catering.restaurant",
  imageUrl: null,
};

const cafePlace = {
  externalId: "geoapify-cafe-1",
  name: "Tokyo E2E Cafe",
  address: "2 E2E Street, Tokyo, Japan",
  latitude: 35.6772,
  longitude: 139.6513,
  category: "catering.cafe",
  imageUrl: null,
};

test.describe("places", () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page);
  });

  test("searches, saves, and removes a place", async ({ page }) => {
    await createTrip(page);

    await page.route("**/api/trips/*/places?categories=*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [restaurantPlace],
        }),
      });
    });

    await page.getByRole("button", { name: "Search" }).click();

    await expect(
      page.getByRole("heading", { name: "Tokyo E2E Restaurant" }),
    ).toBeVisible();

    await expect(page.getByText("1 E2E Street, Tokyo, Japan")).toBeVisible();

    const restaurant = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "Tokyo E2E Restaurant",
      }),
    });

    await restaurant.getByRole("button", { name: "Save" }).click();

    const savedPlaces = page.getByRole("region", {
      name: "Saved places",
    });

    await expect(savedPlaces.getByText("Tokyo E2E Restaurant")).toBeVisible();

    await expect(
      savedPlaces.getByText("1 E2E Street, Tokyo, Japan"),
    ).toBeVisible();

    await savedPlaces.getByRole("button", { name: "Remove" }).click();

    await expect(
      savedPlaces.getByText("Tokyo E2E Restaurant"),
    ).not.toBeVisible();

    await expect(
      page.getByText("Places you save for this trip will appear here."),
    ).toBeVisible();
  });

  test("supports changing the place category", async ({ page }) => {
    await createTrip(page);

    await page.route(
      "**/api/trips/*/places?categories=catering.restaurant",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [restaurantPlace],
          }),
        });
      },
    );

    await page.route(
      "**/api/trips/*/places?categories=catering.cafe",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [cafePlace],
          }),
        });
      },
    );

    await page.getByRole("button", { name: "Cafés" }).click();
    await page.getByRole("button", { name: "Search" }).click();

    await expect(
      page.getByRole("heading", { name: "Tokyo E2E Cafe" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Tokyo E2E Restaurant" }),
    ).not.toBeVisible();
  });

  test("shows an empty state when the provider returns no places", async ({
    page,
  }) => {
    await createTrip(page);

    await page.route("**/api/trips/*/places?categories=*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [],
        }),
      });
    });

    await page.getByRole("button", { name: "Search" }).click();

    await expect(
      page.getByText("Search for places near your destination."),
    ).toBeVisible();
  });
});
