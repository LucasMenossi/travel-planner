import { test, expect } from "@playwright/test";
import { E2E_PASSWORD, signIn, signUp, uniqueEmail } from "./helpers";

test.describe("authentication", () => {
  test("redirects unauthenticated users from protected routes", async ({ page }) => {
    await page.goto("/trips");

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("signs up, signs out, and signs back in", async ({ page }) => {
    const email = uniqueEmail();

    await signUp(page, { email });

    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await signIn(page, email, E2E_PASSWORD);
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test("shows an authentication error for invalid credentials", async ({ page }) => {
    const email = uniqueEmail();

    await signUp(page, { email });
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("WrongPassword123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
