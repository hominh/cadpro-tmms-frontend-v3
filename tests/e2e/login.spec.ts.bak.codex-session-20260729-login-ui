import { expect, test } from "@playwright/test";

test("submits the login form with keyboard access and includes machineCode", async ({ page }) => {
  let capturedRequest = false;
  let requestBody: {
    username?: unknown;
    password?: unknown;
    machineCode?: unknown;
  } = {};

  await page.route("**/api/test-login", async (route) => {
    capturedRequest = true;
    requestBody = route.request().postDataJSON() as typeof requestBody;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: 1,
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "user-1", username: "demo" },
      }),
    });
  });

  await page.goto("/login");
  await expect(page.locator("#username")).toHaveAccessibleName(/username/i);
  await expect(page.locator("#password")).toHaveAccessibleName(/khau/i);

  await page.keyboard.press("Tab");
  await expect(page.locator("#username")).toBeFocused();
  await page.keyboard.type("demo");

  await page.keyboard.press("Tab");
  await expect(page.locator("#password")).toBeFocused();
  await page.keyboard.type("secret");

  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  if (!capturedRequest) {
    throw new Error("Expected login request body to be captured.");
  }
  expect(requestBody.username).toBe("demo");
  expect(requestBody.password).toBe("secret");
  const machineCode = requestBody.machineCode;
  if (typeof machineCode !== "string") {
    throw new Error("Expected login request to include machineCode.");
  }
  expect(machineCode.length).toBeGreaterThan(0);
});
