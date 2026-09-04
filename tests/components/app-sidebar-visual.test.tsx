import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanupSidebar, renderSidebar } from "@/../tests/components/sidebar-test-utils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("AppSidebar legacy visual contract", () => {
  afterEach(cleanupSidebar);

  it("uses the collapsed legacy dimensions and visual tokens", () => {
    renderSidebar({ collapsed: true });

    const sidebar = screen.getByLabelText("Điều hướng chính");
    expect(sidebar).toHaveClass("w-12", "z-[100]", "duration-[400ms]", "will-change-[width]");
    expect(screen.getByTestId("sidebar-brand-logo")).toHaveClass("h-[22px]", "w-[18px]");
    expect(screen.getByTestId("sidebar-notifications")).toHaveClass("h-[72px]");
    expect(screen.getByTestId("sidebar-footer")).toHaveClass("h-[77px]", "pt-[9px]");
    expect(screen.getByLabelText("Bản đồ")).not.toHaveClass("text-[#1d4ed8]");
  });

  it("uses expanded legacy notification and footer spacing", () => {
    renderSidebar({ collapsed: false });

    expect(screen.getByTestId("sidebar-notification-actions")).toHaveClass("gap-1");
    expect(screen.getByLabelText("Cảnh báo vi phạm")).toHaveClass("h-8", "w-8", "rounded-full");
    expect(screen.getByTestId("sidebar-footer")).not.toHaveClass("pb-[9px]");
  });
});
