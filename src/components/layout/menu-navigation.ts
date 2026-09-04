import type { MenuItem } from "@/components/layout/menu-items";

export type DestinationResolution =
  | { kind: "internal"; href: string }
  | { kind: "external-replace"; href: string }
  | { kind: "unavailable"; message: string };

export function resolveDestination(item: MenuItem): DestinationResolution {
  if (item.navigationStrategy === "internal" && item.path) {
    return { kind: "internal", href: item.path };
  }

  if (item.navigationStrategy === "external-replace" && item.externalPath) {
    return { kind: "external-replace", href: item.externalPath };
  }

  return {
    kind: "unavailable",
    message:
      item.unavailableReason ??
      `Chức năng ${item.label} hiện chưa khả dụng trên hệ thống mới.`,
  };
}
