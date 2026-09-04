import { expect, test } from "@playwright/test";

test("submits the login form with keyboard access and includes machineCode", async ({ page }) => {
  const snapshotRuntimeErrors: string[] = [];
  const captureSnapshotError = (message: string) => {
    if (
      message.includes("The result of getSnapshot should be cached") ||
      message.includes("Maximum update depth exceeded")
    ) {
      snapshotRuntimeErrors.push(message);
    }
  };
  page.on("console", (message) => {
    if (message.type() === "error") captureSnapshotError(message.text());
  });
  page.on("pageerror", (error) => captureSnapshotError(error.message));

  let capturedRequest = false;
  let requestBody: {
    username?: unknown;
    password?: unknown;
    machineCode?: unknown;
  } = {};

  await page.route("**/*", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    capturedRequest = true;
    requestBody = route.request().postDataJSON() as typeof requestBody;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        Status: 1,
        Message: "Đăng nhập thành công",
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
      }),
    });
  });

  await page.goto("/login");
  await expect(page.locator("#username")).toHaveAccessibleName(/username/i);
  await expect(page.locator("#password")).toHaveAccessibleName(/M\u1eadt kh\u1ea9u/i);

  await page.locator("#username").focus();
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

  const storedSession = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem("cadpro:auth-session") ?? "null"),
  );
  expect(storedSession).toEqual({
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
  });
  expect(snapshotRuntimeErrors).toEqual([]);
});

test("rejects a lowercase-only backend envelope without creating a session", async ({ page }) => {
  await page.route("**/*", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: 1, message: "ok", data: {} }),
    });
  });

  await page.goto("/login");
  await page.locator("#username").fill("demo");
  await page.locator("#password").fill("secret");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Phản hồi từ hệ thống không hợp lệ.")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("cadpro:auth-session")))
    .toBeNull();
});
