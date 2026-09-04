import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanupSidebar, renderSidebar } from "./sidebar-test-utils";

const navigation = vi.hoisted(() => ({
  pathname: "/dashboard",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
}));

describe("AppSidebar expanded navigation", () => {
  afterEach(() => {
    navigation.pathname = "/dashboard";
    vi.clearAllMocks();
    cleanupSidebar();
  });

  it("opens an active ancestor after a direct nested route", () => {
    navigation.pathname = "/image-monitor/42";
    renderSidebar({ collapsed: false });

    expect(screen.getByRole("button", { name: "Giám sát" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Giám sát hình ảnh")).toBeVisible();
  });

  it("toggles a group without navigating", async () => {
    const user = userEvent.setup();
    renderSidebar({ collapsed: false });
    const monitor = screen.getByRole("button", { name: "Giám sát" });

    await user.click(monitor);
    expect(monitor).toHaveAttribute("aria-expanded", "true");
    expect(navigation.push).not.toHaveBeenCalled();
  });

  it("marks the current direct destination for assistive technology", () => {
    renderSidebar({ collapsed: false });
    expect(screen.getByRole("link", { name: "Bản đồ" })).toHaveAttribute("aria-current", "page");
  });

  it("renders unmigrated destinations as unavailable controls instead of broken links", async () => {
    const user = userEvent.setup();
    renderSidebar({ collapsed: false });

    await user.click(screen.getByRole("button", { name: "Giám sát" }));
    await user.click(screen.getByRole("button", { name: "Giám sát hình ảnh" }));
    expect(screen.getByRole("status")).toHaveTextContent("chưa được migrate");
    expect(screen.queryByRole("link", { name: "Giám sát hình ảnh" })).not.toBeInTheDocument();
  });
});
