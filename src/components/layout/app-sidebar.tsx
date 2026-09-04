"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ScanFace,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  clearAuthSession,
  readAuthSession,
  subscribeToAuthSession,
} from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import {
  MENU_DIVIDERS,
  MENU_ITEMS,
  type MenuItem,
} from "@/components/layout/menu-items";
import { resolveDestination } from "@/components/layout/menu-navigation";
import {
  createInitialExpandedState,
  isMenuItemActive,
  mergeExpandedStateForPath,
} from "@/components/layout/menu-route-state";
import { SidebarUnavailableStatus } from "@/components/layout/sidebar-unavailable-status";
import {
  filterVisibleMenuItems,
  normalizeSidebarPermissions,
} from "@/components/layout/menu-access";
import {
  getNestedPopupPosition,
  getRootPopupPosition,
  type PopupPosition,
} from "@/components/layout/sidebar-popup-position";

type AppSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

type PopupState = {
  key: string;
  position: PopupPosition;
} | null;

type NestedPopupState = {
  item: MenuItem;
  position: PopupPosition;
} | null;

const EMPTY_SESSION = null;

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact ? "justify-center" : "gap-2")}>
      <svg
        aria-hidden="true"
        data-testid="sidebar-brand-logo"
        className={compact ? "h-[22px] w-[18px]" : "h-[22px] w-[22px]"}
        viewBox="0 0 32 33"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.6404 21.8474C29.0947 15.9014 33.8707 8.23942 31.3079 4.73383C28.745 1.22823 19.8139 3.20656 11.3596 9.15254C2.90527 15.0985 -1.87071 22.7605 0.692121 26.2661C3.25496 29.7717 12.1861 27.7934 20.6404 21.8474ZM18.8884 21.2591C25.9208 17.6168 30.2516 12.1193 28.5616 8.98019C26.8716 5.84107 19.8006 6.24902 12.7682 9.89137C5.73575 13.5337 1.40489 19.0312 3.09493 22.1703C4.78497 25.3094 11.8559 24.9015 18.8884 21.2591Z"
          fill="#0e3472"
        />
        <path
          d="M21.6196 7.26807H19V28.2681H24.75C20.837 20.0181 21.5326 10.8514 21.6196 7.26807Z"
          fill="#0e3472"
        />
      </svg>
      {!compact && <span className="text-[14px] font-bold text-[#0e3472]">TMMS</span>}
    </div>
  );
}

function getTextField(source: unknown, keys: string[]): string | undefined {
  if (!source || typeof source !== "object") return undefined;
  const record = source as Record<string, unknown>;

  for (const key of keys) {
    if (typeof record[key] === "string" && record[key]) return record[key];
  }

  return undefined;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

type DestinationControlProps = {
  item: MenuItem;
  active: boolean;
  className: string;
  children: React.ReactNode;
  onBeforeActivate?: () => void;
  onUnavailable: (message: string) => void;
  title?: string;
  ariaLabel?: string;
};

function DestinationControl({
  item,
  active,
  className,
  children,
  onBeforeActivate,
  onUnavailable,
  title,
  ariaLabel,
}: DestinationControlProps) {
  const destination = resolveDestination(item);
  const sharedProps = {
    className,
    title,
    "aria-label": ariaLabel,
    "aria-current": active ? ("page" as const) : undefined,
  };

  if (destination.kind === "internal") {
    return (
      <Link href={destination.href} onClick={onBeforeActivate} {...sharedProps}>
        {children}
      </Link>
    );
  }

  if (destination.kind === "external-replace") {
    return (
      <a
        href={destination.href}
        onClick={(event) => {
          event.preventDefault();
          onBeforeActivate?.();
          window.location.replace(destination.href);
        }}
        {...sharedProps}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        onBeforeActivate?.();
        onUnavailable(destination.message);
      }}
      {...sharedProps}
    >
      {children}
    </button>
  );
}

function CollapsedMenuPopup({
  item,
  position,
  pathname,
  onClose,
  onUnavailable,
  nestedPopup,
  onToggleNested,
}: {
  item: MenuItem;
  position: PopupPosition;
  pathname: string;
  onClose: () => void;
  onUnavailable: (message: string) => void;
  nestedPopup: NestedPopupState;
  onToggleNested: (item: MenuItem, trigger: HTMLButtonElement) => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <nav
      id={`sidebar-popup-${item.key}`}
      className="sidebar-popup fixed z-[10000] min-w-[200px] overflow-y-auto rounded-lg bg-white py-2 shadow-xl"
      style={position}
      aria-label={item.label}
    >
      <p className="border-b border-[#e5e7eb] px-3 py-2 text-sm font-semibold text-[#374151]">
        {item.label}
      </p>
      {item.children?.map((child) => {
        if (child.children) {
          const isOpen = nestedPopup?.item.key === child.key;
          return (
            <button
              key={child.key}
              type="button"
              className={cn(
                "flex w-full items-center justify-between px-4 py-2 text-left text-sm text-[#4b5563] hover:bg-[#f3f4f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d4ed8]",
                isOpen && "bg-[#f3f4f6] font-medium",
              )}
              aria-haspopup="true"
              aria-expanded={isOpen}
              aria-controls={`sidebar-nested-popup-${child.key}`}
              onClick={(event) => onToggleNested(child, event.currentTarget)}
            >
              <span>{child.label}</span>
              <ChevronRight size={14} />
            </button>
          );
        }

        return (
          <SidebarPopupLink
            key={child.key}
            item={child}
            pathname={pathname}
            onClose={onClose}
            onUnavailable={onUnavailable}
          />
        );
      })}
      {nestedPopup && (
        <CollapsedNestedPopup
          state={nestedPopup}
          pathname={pathname}
          onClose={onClose}
          onUnavailable={onUnavailable}
        />
      )}
    </nav>,
    document.body,
  );
}

function CollapsedNestedPopup({
  state,
  pathname,
  onClose,
  onUnavailable,
}: {
  state: NonNullable<NestedPopupState>;
  pathname: string;
  onClose: () => void;
  onUnavailable: (message: string) => void;
}) {
  return createPortal(
    <nav
      id={`sidebar-nested-popup-${state.item.key}`}
      className="sidebar-popup fixed z-[10001] min-w-[180px] overflow-y-auto rounded-lg bg-white py-2 shadow-xl"
      style={state.position}
      aria-label={state.item.label}
    >
      <p className="border-b border-[#e5e7eb] px-3 py-2 text-sm font-semibold text-[#374151]">
        {state.item.label}
      </p>
      {state.item.children?.map((child) => (
        <SidebarPopupLink
          key={child.key}
          item={child}
          pathname={pathname}
          onClose={onClose}
          onUnavailable={onUnavailable}
        />
      ))}
    </nav>,
    document.body,
  );
}

function SidebarPopupLink({
  item,
  pathname,
  onClose,
  onUnavailable,
}: {
  item: MenuItem;
  pathname: string;
  onClose: () => void;
  onUnavailable: (message: string) => void;
}) {
  if (!item.path) return null;
  const active = isMenuItemActive(item, pathname);

  return (
    <DestinationControl
      item={item}
      active={active}
      onBeforeActivate={onClose}
      onUnavailable={onUnavailable}
      className={cn(
        "block py-2 pr-4 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d4ed8]",
        "pl-4",
        active
          ? "bg-[#eff6ff] font-medium text-[#1d4ed8]"
          : "text-[#4b5563] hover:bg-[#f3f4f6]",
      )}
    >
      {item.label}
    </DestinationControl>
  );
}

function ExpandedChildren({
  item,
  pathname,
  onUnavailable,
}: {
  item: MenuItem;
  pathname: string;
  onUnavailable: (message: string) => void;
}) {
  return (
    <div>
      {item.children?.map((child) => {
        if (child.children) {
          return (
            <div key={child.key}>
              <p className="flex h-6 items-center px-3 pl-[38px] text-xs font-medium text-[#6b7280]">
                {child.label}
              </p>
              {child.children.map((nested) => (
                <ExpandedLink
                  key={nested.key}
                  item={nested}
                  pathname={pathname}
                  onUnavailable={onUnavailable}
                />
              ))}
            </div>
          );
        }

        return (
          <ExpandedLink
            key={child.key}
            item={child}
            pathname={pathname}
            onUnavailable={onUnavailable}
          />
        );
      })}
    </div>
  );
}

function ExpandedLink({
  item,
  pathname,
  onUnavailable,
}: {
  item: MenuItem;
  pathname: string;
  onUnavailable: (message: string) => void;
}) {
  if (!item.path) return null;
  const active = isMenuItemActive(item, pathname);

  return (
    <DestinationControl
      item={item}
      active={active}
      onUnavailable={onUnavailable}
      className={cn(
        "flex h-6 items-center px-3 pl-[38px] text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d4ed8]",
        active
          ? "font-medium text-[#1d4ed8]"
          : "text-[#6b7280] hover:bg-[#f3f4f6]",
      )}
    >
      {item.label}
    </DestinationControl>
  );
}

export function AppSidebar({ collapsed, onCollapsedChange }: AppSidebarProps) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeToAuthSession,
    readAuthSession,
    () => EMPTY_SESSION,
  );
  const permissionRecords = useMemo(
    () => normalizeSidebarPermissions(session?.Data.permissions),
    [session],
  );
  const visibleMenuItems = useMemo(
    () => filterVisibleMenuItems(MENU_ITEMS, permissionRecords),
    [permissionRecords],
  );
  const [popup, setPopup] = useState<PopupState>(null);
  const [nestedPopup, setNestedPopup] = useState<NestedPopupState>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    createInitialExpandedState(visibleMenuItems, pathname),
  );
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const rootTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const nestedTriggerRef = useRef<HTMLButtonElement | null>(null);

  const userName = useMemo(
    () =>
      getTextField(session?.Data, ["user_name"]) ??
      "Nguyễn Văn A",
    [session],
  );
  const userRole = useMemo(
    () =>
      getTextField(session?.Data.roles[0], ["roleName", "RoleName", "name", "Name"]) ??
      "Quản trị viên",
    [session],
  );
  const initials = getInitials(userName) || "NA";

  useEffect(() => {
    if (!popup) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const activeTrigger = rootTriggerRefs.current[popup.key];
      if (
        !activeTrigger?.contains(target) &&
        !(target instanceof Element && target.closest(".sidebar-popup"))
      ) {
        setPopup(null);
        setNestedPopup(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [popup]);

  useEffect(() => {
    if (!popup) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();

      if (nestedPopup) {
        setNestedPopup(null);
        nestedTriggerRef.current?.focus();
        return;
      }

      const trigger = rootTriggerRefs.current[popup.key];
      setPopup(null);
      trigger?.focus();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [nestedPopup, popup]);

  const popupKey = popup?.key;
  const nestedPopupKey = nestedPopup?.item.key;

  useEffect(() => {
    if (!popupKey) return;

    const updatePositions = () => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const rootTrigger = rootTriggerRefs.current[popupKey];
      if (rootTrigger) {
        setPopup((current) =>
          current?.key === popupKey
            ? {
                ...current,
                position: getRootPopupPosition(
                  rootTrigger.getBoundingClientRect(),
                  viewport,
                ),
              }
            : current,
        );
      }
      if (nestedPopupKey && nestedTriggerRef.current) {
        setNestedPopup((current) =>
          current
            ? {
                ...current,
                position: getNestedPopupPosition(
                  nestedTriggerRef.current!.getBoundingClientRect(),
                  viewport,
                ),
              }
            : current,
        );
      }
    };

    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);
    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [nestedPopupKey, popupKey]);

  useEffect(() => {
    // Route and permission changes intentionally synchronize this controlled UI state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpanded((current) =>
      mergeExpandedStateForPath(current, visibleMenuItems, pathname),
    );
    setPopup(null);
    setNestedPopup(null);
    setUnavailableMessage(null);
  }, [pathname, visibleMenuItems]);

  useEffect(() => {
    if (!collapsed) {
      // A parent-controlled mode change must dismiss portal state immediately.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPopup(null);
      setNestedPopup(null);
    }
  }, [collapsed]);

  const togglePopup = (item: MenuItem, event: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isSamePopup = popup?.key === item.key;
    setNestedPopup(null);
    nestedTriggerRef.current = null;
    setPopup(
      isSamePopup
        ? null
        : {
            key: item.key,
            position: getRootPopupPosition(rect, {
              width: window.innerWidth,
              height: window.innerHeight,
            }),
          },
    );
  };

  const toggleNestedPopup = (item: MenuItem, trigger: HTMLButtonElement) => {
    if (nestedPopup?.item.key === item.key) {
      setNestedPopup(null);
      nestedTriggerRef.current = null;
      return;
    }

    nestedTriggerRef.current = trigger;
    setNestedPopup({
      item,
      position: getNestedPopupPosition(trigger.getBoundingClientRect(), {
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    });
  };

  const closePopups = () => {
    setNestedPopup(null);
    setPopup(null);
  };

  const handleLogout = () => {
    closePopups();
    setUnavailableMessage(null);
    clearAuthSession();
    router.replace("/login");
  };

  return (
    <>
    <aside
      ref={sidebarRef}
      className={cn(
        "fixed inset-y-0 left-0 z-[100] border-r border-[#e5e7eb] bg-white transition-[width] duration-[400ms] ease-in-out will-change-[width]",
        collapsed ? "w-12 overflow-visible" : "w-[238px] overflow-hidden",
      )}
      aria-label="Điều hướng chính"
    >
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex h-11 shrink-0 items-center border-b border-[#e5e7eb]",
            collapsed ? "justify-center" : "px-3",
          )}
        >
          <BrandMark compact={collapsed} />
        </div>

        <div
          className={cn(
            "flex h-12 shrink-0 items-center border-b border-[#e5e7eb]",
            collapsed ? "justify-center" : "gap-2 px-3",
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] text-[11px] font-semibold text-white">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#111827]">{userName}</p>
                <p className="truncate text-[11px] text-[#6b7280]">{userRole}</p>
              </div>
              <div data-testid="sidebar-notification-actions" className="flex shrink-0 items-center gap-1">
                <NotificationButton label="Cảnh báo vi phạm" icon={Bell} />
                <NotificationButton label="Cảnh báo khuôn mặt" icon={ScanFace} />
              </div>
            </>
          )}
        </div>

        {collapsed && (
          <div data-testid="sidebar-notifications" className="flex h-[72px] shrink-0 flex-col border-b border-[#e5e7eb]">
            <div className="flex h-9 items-center justify-center">
              <NotificationButton label="Cảnh báo vi phạm" icon={Bell} collapsed />
            </div>
            <div className="flex h-9 items-center justify-center">
              <NotificationButton label="Cảnh báo khuôn mặt" icon={ScanFace} collapsed />
            </div>
          </div>
        )}

        <nav
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            collapsed ? "overflow-x-hidden py-2" : "pb-2 pt-2",
          )}
        >
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isMenuItemActive(item, pathname);
            const hasChildren = Boolean(item.children?.length);

            return (
              <div key={item.key}>
                {MENU_DIVIDERS.has(item.key) && (
                  <div
                    className={cn(
                      "my-2 h-px bg-[#e5e7eb]",
                      collapsed ? "mx-auto w-[22px]" : "mx-3",
                    )}
                  />
                )}

                {collapsed ? (
                  hasChildren ? (
                    <button
                      ref={(element) => {
                        rootTriggerRefs.current[item.key] = element;
                      }}
                      type="button"
                      className={cn(
                        "relative flex h-[34px] w-full items-center justify-center text-[#374151] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d4ed8]",
                        active
                          ? "border-l-2 border-[#1d4ed8] bg-[#eff6ff]"
                          : "hover:bg-[#f3f4f6]",
                      )}
                      title={item.label}
                      aria-label={item.label}
                      aria-expanded={popup?.key === item.key}
                      aria-controls={`sidebar-popup-${item.key}`}
                      aria-haspopup="true"
                      onClick={(event) => togglePopup(item, event)}
                    >
                      {Icon && <Icon size={18} />}
                    </button>
                  ) : (
                    <DestinationControl
                      item={item}
                      active={active}
                      onUnavailable={setUnavailableMessage}
                      className={cn(
                        "flex h-[34px] w-full items-center justify-center text-[#374151] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d4ed8]",
                        active
                          ? "border-l-2 border-[#1d4ed8] bg-[#eff6ff]"
                          : "hover:bg-[#f3f4f6]",
                      )}
                      title={item.label}
                      ariaLabel={item.label}
                    >
                      {Icon && <Icon size={18} />}
                    </DestinationControl>
                  )
                ) : hasChildren ? (
                  <>
                    <button
                      type="button"
                      className={cn(
                        "flex h-[30px] w-full items-center gap-2 px-3 text-left text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d4ed8]",
                        active
                          ? "border-l-2 border-[#1d4ed8] bg-[#eff6ff] pl-[10px] text-[#1d4ed8]"
                          : "text-[#374151] hover:bg-[#f3f4f6]",
                      )}
                      aria-expanded={Boolean(expanded[item.key])}
                      aria-controls={`sidebar-children-${item.key}`}
                      onClick={() =>
                        setExpanded((current) => ({
                          ...current,
                          [item.key]: !current[item.key],
                        }))
                      }
                    >
                      {Icon && <Icon size={18} />}
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          !expanded[item.key] && "-rotate-90",
                        )}
                      />
                    </button>
                    {expanded[item.key] && (
                      <div id={`sidebar-children-${item.key}`}>
                        <ExpandedChildren
                          item={item}
                          pathname={pathname}
                          onUnavailable={setUnavailableMessage}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <DestinationControl
                    item={item}
                    active={active}
                    onUnavailable={setUnavailableMessage}
                    className={cn(
                      "flex h-[30px] items-center gap-2 px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d4ed8]",
                      active
                        ? "border-l-2 border-[#1d4ed8] bg-[#eff6ff] pl-[10px] text-[#1d4ed8]"
                        : "text-[#374151] hover:bg-[#f3f4f6]",
                    )}
                  >
                    {Icon && <Icon size={18} />}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </DestinationControl>
                )}

                {popup?.key === item.key && (
                  <CollapsedMenuPopup
                    item={item}
                    position={popup.position}
                    pathname={pathname}
                    onClose={closePopups}
                    onUnavailable={setUnavailableMessage}
                    nestedPopup={nestedPopup}
                    onToggleNested={toggleNestedPopup}
                  />
                )}
              </div>
            );
          })}
        </nav>

        <div
          data-testid="sidebar-footer"
          className={cn(
            "shrink-0 border-t border-[#e5e7eb] px-2 pt-[9px]",
            collapsed && "h-[77px]",
          )}
        >
          <Button
            variant="outline"
            className={cn(
              "h-[30px] w-full rounded-[4px] border-0 text-[12px] font-normal text-[#6b7280] shadow-none hover:bg-[#f3f4f6]",
              collapsed ? "justify-center px-0" : "justify-start gap-2 pl-1 pr-0",
            )}
            title={collapsed ? "Đăng xuất" : undefined}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            {!collapsed && <span>Đăng xuất</span>}
          </Button>
          <Button
            variant="outline"
            className={cn(
              "h-[30px] w-full rounded-[4px] border-0 text-[12px] font-normal text-[#9ca3af] shadow-none hover:bg-[#f3f4f6]",
              collapsed ? "justify-center px-0" : "justify-start gap-2 pl-1 pr-0",
            )}
            title={collapsed ? "Mở rộng" : undefined}
            aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
            onClick={() => {
              closePopups();
              onCollapsedChange(!collapsed);
            }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Thu gọn</span>}
          </Button>
        </div>
      </div>
    </aside>
      <SidebarUnavailableStatus
        message={unavailableMessage}
        onDismiss={() => setUnavailableMessage(null)}
      />
    </>
  );
}

function NotificationButton({
  label,
  icon: Icon,
  collapsed = false,
}: {
  label: string;
  icon: typeof Bell;
  collapsed?: boolean;
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        "relative rounded-full border-0 p-0 text-[#6b7280] shadow-none hover:bg-[#f3f4f6]",
        collapsed ? "h-7 w-7" : "h-8 w-8",
      )}
      title={label}
      aria-label={label}
    >
      <Icon size={16} strokeWidth={1.8} />
    </Button>
  );
}
