"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { cn } from "@/lib/utils";

const PUBLIC_ROUTES = new Set(["/login"]);
const SIDEBAR_STORAGE_KEY = "sidebar_collapsed";
const SIDEBAR_STORAGE_EVENT = "sidebar-collapsed-change";

function subscribeToSidebarState(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_STORAGE_KEY) onChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, onChange);
  };
}

function readSidebarState(): boolean {
  const saved = window.sessionStorage.getItem(SIDEBAR_STORAGE_KEY);
  return saved === null ? true : saved === "true";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const collapsed = useSyncExternalStore(
    subscribeToSidebarState,
    readSidebarState,
    () => true,
  );

  const handleCollapsedChange = (nextCollapsed: boolean) => {
    window.sessionStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextCollapsed));
    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  };

  if (PUBLIC_ROUTES.has(pathname)) return <>{children}</>;

  return (
    <div className="min-h-dvh md:h-screen md:overflow-y-auto">
      <a
        href="#main-content"
        className="fixed left-2 top-2 z-[60] -translate-y-16 rounded bg-[#0e3472] px-3 py-2 text-xs font-medium text-white transition-transform focus:translate-y-0"
      >
        Chuyển đến nội dung
      </a>
      <AppSidebar collapsed={collapsed} onCollapsedChange={handleCollapsedChange} />
      <main
        id="main-content"
        className={cn(
          "min-h-dvh overflow-x-hidden overflow-y-auto transition-[margin-left] duration-[400ms] ease-in-out will-change-[margin-left]",
          collapsed ? "ml-[50px]" : "ml-[238px]",
        )}
      >
        {children}
      </main>
    </div>
  );
}
