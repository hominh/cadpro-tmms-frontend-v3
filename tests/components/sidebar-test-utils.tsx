import { cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { StoredAuthSession } from "@/features/auth/types";
import { clearAuthSession, saveAuthSession } from "@/lib/auth-storage";
import { fullPermissions } from "../features/layout/sidebar-fixtures";

export function createSidebarSession(
  permissions: unknown[] = fullPermissions,
): StoredAuthSession {
  return {
    Status: 1,
    Data: {
      user_id: "sidebar-user",
      user_name: "Nguyễn Văn A",
      ToChuc_Id: "sidebar-org",
      access_token: "sidebar-access",
      refresh_token: "sidebar-refresh",
      roles: [{ roleName: "Quản trị viên" }],
      permissions,
      exp_refresh: 2_000_000_000,
    },
  };
}

export function renderSidebar({
  collapsed = false,
  permissions = fullPermissions,
  onCollapsedChange = () => undefined,
}: {
  collapsed?: boolean;
  permissions?: unknown[];
  onCollapsedChange?: (collapsed: boolean) => void;
} = {}) {
  saveAuthSession(createSidebarSession(permissions));
  return render(
    <AppSidebar collapsed={collapsed} onCollapsedChange={onCollapsedChange} />,
  );
}

export function renderWithSidebar(element: ReactElement, permissions: unknown[] = []) {
  saveAuthSession(createSidebarSession(permissions));
  return render(element);
}

export function cleanupSidebar(): void {
  cleanup();
  clearAuthSession();
  window.sessionStorage.clear();
  document.body.innerHTML = "";
}
