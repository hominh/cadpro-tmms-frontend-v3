import type { MenuItem } from "@/components/layout/menu-items";
import type { SidebarPermissionRecord } from "@/features/auth/types";

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text || null;
}

export function normalizeSidebarPermissions(
  rawPermissions: unknown,
): SidebarPermissionRecord[] {
  if (!Array.isArray(rawPermissions)) return [];

  const merged = new Map<string, string[]>();

  for (const raw of rawPermissions) {
    if (!raw || typeof raw !== "object") continue;
    const record = raw as Record<string, unknown>;
    const functionCode = normalizeText(record.FunctionCode);
    if (!functionCode || !Array.isArray(record.PermissionsCode)) continue;

    const current = merged.get(functionCode) ?? [];
    const seen = new Set(current);
    for (const value of record.PermissionsCode) {
      const permissionCode = normalizeText(value);
      if (permissionCode && !seen.has(permissionCode)) {
        current.push(permissionCode);
        seen.add(permissionCode);
      }
    }
    merged.set(functionCode, current);
  }

  return [...merged].map(([functionCode, permissionCodes]) => ({
    functionCode,
    permissionCodes,
  }));
}

export function filterVisibleMenuItems(
  items: MenuItem[],
  permissions: SidebarPermissionRecord[],
): MenuItem[] {
  const grantedCodes = new Set(
    permissions
      .filter((record) => record.permissionCodes.length > 0)
      .map((record) => record.functionCode),
  );

  return items.flatMap((item): MenuItem[] => {
    if (item.children?.length) {
      const children = filterVisibleMenuItems(item.children, permissions);
      return children.length ? [{ ...item, children }] : [];
    }

    return item.permissionCode === "all" ||
      (item.permissionCode && grantedCodes.has(item.permissionCode))
      ? [item]
      : [];
  });
}
