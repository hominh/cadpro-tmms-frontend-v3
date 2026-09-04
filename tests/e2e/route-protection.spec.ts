import { expect, test } from "@playwright/test";

const AUTH_STORAGE_KEY = "cadpro:auth-session";
const validSession = {
  Status: 1,
  Data: {
    user_id: "user-1",
    user_name: "demo",
    ToChuc_Id: "org-1",
    access_token: "access-token",
    refresh_token: "refresh-token",
    roles: [],
    permissions: [],
    exp_refresh: 1760000000,
  },
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

for (const [label, invalidSession] of [
  ["lowercase legacy", { status: 1, data: validSession.Data }],
  ["partial nested", { Status: 1, Data: { access_token: "access-token" } }],
] as const) {
  test(`rejects ${label} stored sessions`, async ({ page }) => {
    await page.addInitScript(
      ([storageKey, session]) => {
        window.localStorage.setItem(storageKey, JSON.stringify(session));
      },
      [AUTH_STORAGE_KEY, invalidSession] as const,
    );

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toHaveCount(0);
  });
}
