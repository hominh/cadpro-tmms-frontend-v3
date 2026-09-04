import type { StoredAuthSession } from "@/features/auth/types";

export type RawPermissionFixture = {
  FunctionCode: string;
  PermissionsCode: string[];
};

export const emptyPermissions: unknown[] = [];

export const limitedPermissions: RawPermissionFixture[] = [
  { FunctionCode: "FUNC_DEVICE_TYPE", PermissionsCode: ["VIEW"] },
  { FunctionCode: "FUNC_TEC_TRUYVET", PermissionsCode: ["VIEW"] },
];

export const malformedPermissions: unknown[] = [
  null,
  {},
  { FunctionCode: "", PermissionsCode: ["VIEW"] },
  { FunctionCode: "FUNC_DEVICE_TYPE", PermissionsCode: "VIEW" },
];

export const fullPermissions: RawPermissionFixture[] = [
  ["FUNC_GIAMSAT_HT", "FUNC_GIAMSAT_CAMERA", "FUNC_TEC_TIMKIEM_VP"],
  ["FUNC_TEC_TRUYVET", "FUNC_NHANDIEN_KM", "FUNC_LAN_SONG_XANH"],
  ["FUNC_NUT_GIAO_THONG", "FUNC_TRAM_DUNG", "FUNC_QL_HA_TANG"],
  ["FUNC_TUYEN_XE", "FUNC_CAU_HINH_BDT", "FUNC_LICH_TRINH"],
  ["FUNC_OBJECT", "FUNC_LAIXE", "FUNC_BAO_CAO", "FUNC_CHIA_SE"],
  ["FUNC_TMMS_LS", "FUNC_DEVICE_TYPE", "FUNC_THIET_BI", "FUNC_BIEU_TUONG"],
  ["FUNC_MAU", "FUNC_LOAI_HINH_VAN_TAI", "FUNC_LOAI_PHUONG_TIEN"],
  ["FUNC_TUYEN_DUONG", "FUNC_NGUOI_SU_DUNG", "FUNC_TO_CHUC"],
  ["FUNC_GOI_DUAN", "FUNC_ALERT_TYPE", "FUNC_THONG_BAO", "FUNC_BAIBAO"],
  ["FUNC_PHAN_HOI", "FUNC_DS_KIEM_SOAT"],
].flatMap((codes) =>
  codes.map((FunctionCode) => ({ FunctionCode, PermissionsCode: ["VIEW"] })),
);

export function sidebarSession(permissions: unknown[]): StoredAuthSession {
  return {
    Status: 1,
    Data: {
      user_id: "sidebar-user",
      user_name: "Nguyễn Văn A",
      ToChuc_Id: "sidebar-org",
      access_token: "access-token",
      refresh_token: "refresh-token",
      roles: [{ roleName: "Quản trị viên" }],
      permissions,
      exp_refresh: 2_000_000_000,
    },
  };
}
