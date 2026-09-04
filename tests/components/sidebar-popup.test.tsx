import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { cleanupSidebar, renderSidebar } from "./sidebar-test-utils";

const navigation = vi.hoisted(() => ({
  pathname: "/dashboard",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
}));

describe("AppSidebar collapsed popup", () => {
  afterEach(() => {
    navigation.pathname = "/dashboard";
    vi.clearAllMocks();
    cleanupSidebar();
  });

  it("opens one root popup and replaces it when another root is selected", async () => {
    const user = userEvent.setup();
    renderSidebar({ collapsed: true });

    await user.click(screen.getByRole("button", { name: "Hệ thống" }));
    expect(screen.getByRole("navigation", { name: "Hệ thống" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Giám sát" }));
    expect(screen.queryByRole("navigation", { name: "Hệ thống" })).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Giám sát" })).toBeVisible();
  });

  it("opens a separate nested popup from an intermediate disclosure", async () => {
    const user = userEvent.setup();
    renderSidebar({ collapsed: true });

    await user.click(screen.getByRole("button", { name: "Hệ thống" }));
    const disclosure = screen.getByRole("button", { name: "Quản lý thiết bị" });
    await user.click(disclosure);

    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Quản lý thiết bị" })).toBeVisible();
  });

  it("closes the deepest layer first with Escape and restores focus", async () => {
    const user = userEvent.setup();
    renderSidebar({ collapsed: true });
    const system = screen.getByRole("button", { name: "Hệ thống" });

    await user.click(system);
    const disclosure = screen.getByRole("button", { name: "Quản lý thiết bị" });
    await user.click(disclosure);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("navigation", { name: "Quản lý thiết bị" })).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Hệ thống" })).toBeVisible();
    expect(disclosure).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("navigation", { name: "Hệ thống" })).not.toBeInTheDocument();
    expect(system).toHaveFocus();
  });

  it("closes all layers on outside interaction and when expanding", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    const view = renderSidebar({ collapsed: true, onCollapsedChange });

    await user.click(screen.getByRole("button", { name: "Hệ thống" }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("navigation", { name: "Hệ thống" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hệ thống" }));
    view.rerender(
      <AppSidebar collapsed={false} onCollapsedChange={onCollapsedChange} />,
    );
    expect(screen.queryByRole("navigation", { name: "Hệ thống" })).not.toBeInTheDocument();
  });

  it("closes the popup when an unrelated sidebar control is activated", async () => {
    const user = userEvent.setup();
    renderSidebar({ collapsed: true });

    await user.click(screen.getByRole("button", { name: "Hệ thống" }));
    await user.click(screen.getByRole("button", { name: "Cảnh báo vi phạm" }));
    expect(screen.queryByRole("navigation", { name: "Hệ thống" })).not.toBeInTheDocument();
  });

  it("cleans up popup state on pathname change and logout", async () => {
    const user = userEvent.setup();
    const view = renderSidebar({ collapsed: true });

    await user.click(screen.getByRole("button", { name: "Hệ thống" }));
    navigation.pathname = "/reports";
    view.rerender(
      <AppSidebar collapsed={true} onCollapsedChange={() => undefined} />,
    );
    expect(screen.queryByRole("navigation", { name: "Hệ thống" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hệ thống" }));
    await user.click(screen.getByRole("button", { name: "Đăng xuất" }));
    expect(screen.queryByRole("navigation", { name: "Hệ thống" })).not.toBeInTheDocument();
    expect(navigation.replace).toHaveBeenCalledWith("/login");
  });

  it("closes popup layers before unavailable leaf feedback", async () => {
    const user = userEvent.setup();
    renderSidebar({ collapsed: true });

    await user.click(screen.getByRole("button", { name: "Giám sát" }));
    await user.click(screen.getByRole("button", { name: "Giám sát hình ảnh" }));

    expect(screen.queryByRole("navigation", { name: "Giám sát" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("chưa được migrate");
  });
});
