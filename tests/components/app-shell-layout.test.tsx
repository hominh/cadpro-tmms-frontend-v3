import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/layout/app-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("@/components/layout/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="mock-sidebar" />,
}));

describe("AppShell legacy layout contract", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("keeps collapsed content at the legacy 50px offset with synchronized timing", () => {
    window.sessionStorage.setItem("sidebar_collapsed", "true");
    render(<AppShell><p>Content</p></AppShell>);

    const main = screen.getByRole("main");
    expect(main).toHaveClass("ml-[50px]", "duration-[400ms]", "will-change-[margin-left]", "overflow-y-auto");
    expect(main.parentElement).not.toHaveClass("bg-[#f8fafc]");
  });
});
