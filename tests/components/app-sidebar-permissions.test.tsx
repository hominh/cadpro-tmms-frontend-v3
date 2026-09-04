import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanupSidebar, renderSidebar } from "./sidebar-test-utils";
import {
  emptyPermissions,
  limitedPermissions,
  malformedPermissions,
} from "@/../tests/features/layout/sidebar-fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ replace: vi.fn() }),
}));

describe("AppSidebar permission visibility", () => {
  afterEach(cleanupSidebar);

  it.each([
    { permissions: emptyPermissions },
    { permissions: malformedPermissions },
  ])(
    "shows only Bản đồ when permission data grants no coded function",
    ({ permissions }) => {
      renderSidebar({ collapsed: false, permissions });
      expect(screen.getByRole("link", { name: "Bản đồ" })).toBeVisible();
      expect(screen.queryByRole("button", { name: "Hệ thống" })).not.toBeInTheDocument();
      expect(screen.queryByText("Truy vết đối tượng")).not.toBeInTheDocument();
    },
  );

  it("keeps only permitted ancestor chains in expanded mode", () => {
    renderSidebar({ collapsed: false, permissions: limitedPermissions });
    expect(screen.getByRole("button", { name: "Tìm kiếm truy vết" })).toBeVisible();
    expect(screen.getByText("Truy vết đối tượng")).toBeVisible();
    expect(screen.getByRole("button", { name: "Hệ thống" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Giám sát" })).not.toBeInTheDocument();
  });

  it("uses the same filtered tree in collapsed popup mode", async () => {
    const user = userEvent.setup();
    renderSidebar({ collapsed: true, permissions: limitedPermissions });

    expect(screen.getByRole("button", { name: "Tìm kiếm truy vết" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Hệ thống" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Giám sát" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hệ thống" }));
    await user.click(screen.getByRole("button", { name: "Quản lý thiết bị" }));
    expect(screen.getByRole("button", { name: "Loại thiết bị" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Thiết bị" })).not.toBeInTheDocument();
  });
});
