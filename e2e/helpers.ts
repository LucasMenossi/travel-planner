import { expect, type Page } from "@playwright/test";

export const E2E_PASSWORD = "TestPassword123!";

export function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function signUp(
  page: Page,
  options?: { name?: string; email?: string },
) {
  const name = options?.name ?? "E2E Traveler";
  const email = options?.email ?? uniqueEmail();

  await page.goto("/auth/signup");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(E2E_PASSWORD);
  await page.getByLabel("Confirm password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/trips$/);
  await expect(
    page.getByRole("heading", { name: "Your trips", exact: true }),
  ).toBeVisible();

  return { name, email, password: E2E_PASSWORD };
}

export async function signIn(
  page: Page,
  email: string,
  password = E2E_PASSWORD,
) {
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/trips$/);
}

export async function createTrip(
  page: Page,
  options?: {
    name?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
  },
) {
  const trip = {
    name: options?.name ?? "Tokyo E2E Trip",
    destination: options?.destination ?? "Tokyo, Japan",
    startDate: options?.startDate ?? "2027-04-10",
    endDate: options?.endDate ?? "2027-04-12",
  };

  await page.goto("/trips/new");

  await page.getByLabel("Trip name").fill(trip.name);
  await page.getByLabel("Destination").fill(trip.destination);
  await page.getByLabel("Start date").fill(trip.startDate);
  await page.getByLabel("End date").fill(trip.endDate);

  await page.getByRole("button", { name: "Create trip" }).click();

  await expect(page).toHaveURL(/\/trips$/);

  const tripLink = page.getByRole("link").filter({
    has: page.getByRole("heading", {
      name: trip.name,
      exact: true,
    }),
  });

  await expect(tripLink).toBeVisible();

  await tripLink.click();

  await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  await expect(
    page.getByRole("heading", {
      name: trip.name,
      exact: true,
    }),
  ).toBeVisible();

  return trip;
}
