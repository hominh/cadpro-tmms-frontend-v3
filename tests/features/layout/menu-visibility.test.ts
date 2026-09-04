import { describe, expect, it } from "vitest";
import { filterVisibleMenuItems } from "@/components/layout/menu-access";
import { MENU_ITEMS } from "@/components/layout/menu-items";

describe("sidebar tree visibility", () => {
  it("always keeps all destinations and removes empty groups", () => {
    const visible = filterVisibleMenuItems(MENU_ITEMS, []);
    expect(visible.map((item) => item.key)).toEqual(["map"]);
  });

  it("preserves stable order and the ancestor chain for coded leaves", () => {
    const visible = filterVisibleMenuItems(MENU_ITEMS, [
      { functionCode: "FUNC_TEC_TRUYVET", permissionCodes: ["VIEW"] },
      { functionCode: "FUNC_DEVICE_TYPE", permissionCodes: ["VIEW"] },
    ]);

    expect(visible.map((item) => item.key)).toEqual(["map", "trace", "system"]);
    expect(visible[1].children?.map((item) => item.key)).toEqual(["object-trace"]);
    expect(visible[2].children?.map((item) => item.key)).toEqual([
      "device-management",
    ]);
    expect(visible[2].children?.[0].children?.map((item) => item.key)).toEqual([
      "device-type",
    ]);
  });

  it("retains duplicate destinations when their permission is granted", () => {
    const visible = filterVisibleMenuItems(MENU_ITEMS, [
      { functionCode: "FUNC_CAU_HINH_BDT", permissionCodes: ["VIEW"] },
    ]);
    const paths = visible.flatMap(function collectPaths(item): string[] {
      return item.children?.length
        ? item.children.flatMap(collectPaths)
        : item.path
          ? [item.path]
          : [];
    });
    expect(paths.filter((path) => path === "/electronic-board")).toHaveLength(2);
  });
});
