import { describe, expect, it } from "vitest";
import { normalizeSidebarPermissions } from "@/components/layout/menu-access";

describe("sidebar permission normalization", () => {
  it("normalizes valid records and merges duplicate function codes", () => {
    expect(
      normalizeSidebarPermissions([
        { FunctionCode: " FUNC_DEVICE_TYPE ", PermissionsCode: ["VIEW", ""] },
        { FunctionCode: "FUNC_DEVICE_TYPE", PermissionsCode: ["EDIT", "VIEW"] },
      ]),
    ).toEqual([
      {
        functionCode: "FUNC_DEVICE_TYPE",
        permissionCodes: ["VIEW", "EDIT"],
      },
    ]);
  });

  it("does not grant access from empty or malformed records", () => {
    expect(
      normalizeSidebarPermissions([
        null,
        {},
        { FunctionCode: "", PermissionsCode: ["VIEW"] },
        { FunctionCode: "FUNC_DEVICE_TYPE", PermissionsCode: "VIEW" },
        { FunctionCode: "FUNC_THIET_BI", PermissionsCode: [] },
      ]),
    ).toEqual([
      { functionCode: "FUNC_THIET_BI", permissionCodes: [] },
    ]);
  });
});
