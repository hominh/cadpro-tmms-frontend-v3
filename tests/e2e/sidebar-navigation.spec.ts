import { expect, test, type Page } from "@playwright/test";
import { legacyDestinations } from "../features/layout/destination-fixtures";

const permissions = [...new Set(
  legacyDestinations
    .map(([, , permission]) => permission)
    .filter((permission) => permission !== "all"),
)].map((FunctionCode) => ({ FunctionCode, PermissionsCode: ["VIEW"] }));

const authenticatedSession = {
  Status: 1,
  Data: {
    user_id: "sidebar-user",
    user_name: "Nguyễn Văn A",
    ToChuc_Id: "sidebar-org",
    access_token: "access-token",
    refresh_token: "refresh-token",
    roles: [{ roleName: "Quản trị viên" }],
    permissions,
    exp_refresh: 2_000_000_000,
  },
};

async function activateFooterButton(page: Page, name: string): Promise<void> {
  const button = page.getByRole("button", { name });
  await button.focus();
  await page.keyboard.press("Enter");
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((session) => {
    if (!window.localStorage.getItem("cadpro:auth-session")) {
      window.localStorage.setItem("cadpro:auth-session", JSON.stringify(session));
    }
    if (!window.sessionStorage.getItem("sidebar_collapsed")) {
      window.sessionStorage.setItem("sidebar_collapsed", "true");
    }
  }, authenticatedSession);
});

const unavailableStatus = (page: Page) =>
  page.locator('[role="status"][aria-live="polite"]');

test("collapsed sidebar matches legacy measurements", async ({ page }) => {
  await page.goto("/dashboard");
  const sidebar = page.getByLabel("Điều hướng chính");
  await expect(sidebar).toHaveCSS("width", "48px");
  await expect(page.getByRole("main")).toHaveCSS("margin-left", "50px");
  await expect(page.getByTestId("sidebar-notifications")).toHaveCSS("height", "72px");
  await expect(page.getByTestId("sidebar-footer")).toHaveCSS("height", "77px");
});

test("expanded sidebar matches legacy measurements", async ({ page }) => {
  await page.goto("/dashboard");
  await activateFooterButton(page, "Mở rộng thanh điều hướng");
  await expect(page.getByLabel("Điều hướng chính")).toHaveCSS("width", "238px");
  await expect(page.getByRole("main")).toHaveCSS("margin-left", "238px");
});

test("expanded groups toggle without navigation and active routes open ancestors", async ({ page }) => {
  await page.goto("/dashboard");
  await activateFooterButton(page, "Mở rộng thanh điều hướng");
  const currentUrl = page.url();
  const monitor = page.getByRole("button", { name: "Giám sát", exact: true });

  await monitor.click();
  await expect(monitor).toHaveAttribute("aria-expanded", "true");
  await expect(page).toHaveURL(currentUrl);
});

test("expanded unavailable destinations never navigate to a missing Next route", async ({ page }) => {
  await page.goto("/dashboard");
  await activateFooterButton(page, "Mở rộng thanh điều hướng");
  await page.getByRole("button", { name: "Giám sát", exact: true }).click();
  await page.getByRole("button", { name: "Giám sát hình ảnh", exact: true }).click();

  await expect(unavailableStatus(page)).toContainText("chưa được migrate");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("expanded direct, second-level, and third-level destinations use guarded outcomes", async ({ page }) => {
  await page.goto("/dashboard");
  await activateFooterButton(page, "Mở rộng thanh điều hướng");

  await page.getByRole("button", { name: "Tìm kiếm vi phạm", exact: true }).click();
  await expect(unavailableStatus(page)).toContainText("chưa được migrate");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("button", { name: "Giám sát", exact: true }).click();
  await page.getByRole("button", { name: "Giám sát camera", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("button", { name: "Loại thiết bị", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("Bản đồ and Báo cáo expose their current adapters across history navigation", async ({ page }) => {
  await page.goto("/dashboard");
  await activateFooterButton(page, "Mở rộng thanh điều hướng");
  await expect(page.getByRole("link", { name: "Bản đồ" })).toHaveAttribute("aria-current", "page");

  await page.getByRole("link", { name: "Báo cáo" }).click();
  await expect(page).toHaveURL(/\/reports$/);
  await expect(page.getByRole("heading", { name: "Báo cáo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Báo cáo" })).toHaveAttribute("aria-current", "page");

  await page.goBack();
  await expect(page.getByRole("link", { name: "Bản đồ" })).toHaveAttribute("aria-current", "page");
  await page.goForward();
  await expect(page.getByRole("link", { name: "Báo cáo" })).toHaveAttribute("aria-current", "page");
});

test("Tuyến số remains unavailable without an explicit legacy deployment target", async ({ page }) => {
  await page.goto("/dashboard");
  await activateFooterButton(page, "Mở rộng thanh điều hướng");
  const busRoute = page.getByRole("button", { name: "Tuyến số", exact: true });
  await busRoute.focus();
  await page.keyboard.press("Enter");
  await expect(unavailableStatus(page)).toContainText("Tuyến số");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("collapsed System popup cascades, stays inside the viewport, and supports Escape", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 480 });
  await page.goto("/dashboard");
  const system = page.getByRole("button", { name: "Hệ thống" });
  await system.click();
  const root = page.getByRole("navigation", { name: "Hệ thống" });
  await expect(root).toBeVisible();
  await expect(root).toHaveCSS("min-width", "200px");

  const disclosure = page.getByRole("button", { name: "Quản lý thiết bị" });
  await disclosure.click();
  const nested = page.getByRole("navigation", { name: "Quản lý thiết bị" });
  await expect(nested).toBeVisible();
  await expect(nested).toHaveCSS("min-width", "180px");
  const box = await nested.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(8);
  expect(box!.x + box!.width).toBeLessThanOrEqual(632);

  await page.keyboard.press("Escape");
  await expect(nested).toBeHidden();
  await expect(disclosure).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(root).toBeHidden();
  await expect(system).toBeFocused();
});

test("all 34 legacy leaves are represented without missing-route hrefs", async ({ page }) => {
  await page.goto("/dashboard");
  await activateFooterButton(page, "Mở rộng thanh điều hướng");
  await page.getByRole("button", { name: "Giám sát", exact: true }).click();

  const uniqueLabels = [...new Set(legacyDestinations.map(([label]) => label))];
  for (const label of uniqueLabels) {
    const controls = page.getByRole("link", { name: label, exact: true }).or(
      page.getByRole("button", { name: label, exact: true }),
    );
    const expectedCount = label === "Cấu hình bảng điện tử" ? 2 : 1;
    await expect(controls).toHaveCount(expectedCount);
  }

  const navigableHrefs = await page
    .getByLabel("Điều hướng chính")
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(navigableHrefs).toEqual(expect.arrayContaining(["/dashboard", "/reports"]));
  expect(navigableHrefs.every((href) => href === "/dashboard" || href === "/reports")).toBe(true);
});

test("permission variants, logout, and collapsed preference remain session-safe", async ({ page }) => {
  await page.goto("/dashboard");
  await page.evaluate(() => {
    const raw = window.localStorage.getItem("cadpro:auth-session");
    const session = JSON.parse(raw!);
    session.Data.permissions = [];
    window.localStorage.setItem("cadpro:auth-session", JSON.stringify(session));
    window.dispatchEvent(
      new StorageEvent("storage", { key: "cadpro:auth-session" }),
    );
  });
  await expect(page.getByRole("link", { name: "Bản đồ" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hệ thống" })).toHaveCount(0);

  await activateFooterButton(page, "Mở rộng thanh điều hướng");
  await page.reload();
  await expect(page.getByLabel("Điều hướng chính")).toHaveCSS("width", "238px");

  await activateFooterButton(page, "Đăng xuất");
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => window.localStorage.getItem("cadpro:auth-session"))).toBeNull();
});
