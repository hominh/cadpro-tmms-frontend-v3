import {
  DEFAULT_EXPANDED_MENU_KEYS,
  type MenuItem,
} from "@/components/layout/menu-items";

export function isPathActive(path: string | undefined, pathname: string): boolean {
  return Boolean(path && (pathname === path || pathname.startsWith(`${path}/`)));
}

export function isMenuItemActive(item: MenuItem, pathname: string): boolean {
  return (
    isPathActive(item.path, pathname) ||
    (item.children?.some((child) => isMenuItemActive(child, pathname)) ?? false)
  );
}

export function findActiveAncestorKeys(
  items: MenuItem[],
  pathname: string,
): string[] {
  return items
    .filter((item) => item.children?.length && isMenuItemActive(item, pathname))
    .map((item) => item.key);
}

export function createInitialExpandedState(
  items: MenuItem[],
  pathname: string,
): Record<string, boolean> {
  const activeKeys = new Set(findActiveAncestorKeys(items, pathname));

  return Object.fromEntries(
    items
      .filter((item) => item.children?.length)
      .map((item) => [
        item.key,
        DEFAULT_EXPANDED_MENU_KEYS.has(item.key) || activeKeys.has(item.key),
      ]),
  );
}

export function mergeExpandedStateForPath(
  current: Record<string, boolean>,
  items: MenuItem[],
  pathname: string,
): Record<string, boolean> {
  const next = { ...current };

  for (const item of items) {
    if (!item.children?.length) continue;
    if (next[item.key] === undefined) {
      next[item.key] = DEFAULT_EXPANDED_MENU_KEYS.has(item.key);
    }
  }

  for (const key of findActiveAncestorKeys(items, pathname)) {
    next[key] = true;
  }

  return next;
}
