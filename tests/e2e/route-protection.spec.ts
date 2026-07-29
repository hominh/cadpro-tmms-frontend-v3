import { expect, test } from "@playwright/test";

const AUTH_STORAGE_KEY = "cadpro:auth-session";
const validSession = {
  status: 1,
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: { id: "user-1", username: "demo" },
};

test("redirects anonymous users away from protected routes", async ({ page }) => {
  const protectedRoutes = [
    { path: "/dashboard", protectedHeading: "Dashboard" },
    { path: "/reports", protectedHeading: "Reports" },
  ];

  for (const route of protectedRoutes) {
    await page.goto(route.path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.getByRole("heading", { name: route.protectedHeading })).toHaveCount(0);
  }
});

test("redirects authenticated users from entry routes to dashboard", async ({ page }) => {
  await page.addInitScript(
    ([storageKey, session]) => {
      window.localStorage.setItem(storageKey, JSON.stringify(session));
    },
    [AUTH_STORAGE_KEY, validSession] as const,
  );

  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
