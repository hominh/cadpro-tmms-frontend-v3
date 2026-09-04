import type { LucideIcon } from "lucide-react";
import {
  Binoculars,
  Bus,
  Car,
  ChartNoAxesCombined,
  FolderSearch,
  Map,
  Monitor,
  Settings,
  Waves,
} from "lucide-react";

export type NavigationStrategy = "internal" | "external-replace" | "unavailable";

export type MenuItem = {
  key: string;
  label: string;
  path?: string;
  legacyPath?: string;
  icon?: LucideIcon;
  permissionCode?: string | "all";
  navigationStrategy?: NavigationStrategy;
  externalPath?: string;
  unavailableReason?: string;
  children?: MenuItem[];
};

type LeafOptions = {
  legacyPath?: string;
  strategy?: NavigationStrategy;
  externalPath?: string;
};

function leaf(
  key: string,
  label: string,
  path: string,
  permissionCode: string | "all",
  options: LeafOptions = {},
): MenuItem {
  const strategy = options.strategy ?? "unavailable";

  return {
    key,
    label,
    path,
    legacyPath: options.legacyPath ?? path,
    permissionCode,
    navigationStrategy: strategy,
    externalPath: options.externalPath,
    unavailableReason:
      strategy === "unavailable" || (strategy === "external-replace" && !options.externalPath)
        ? `Chức năng ${label} chưa được migrate sang hệ thống mới.`
        : undefined,
  };
}

export const DEFAULT_EXPANDED_MENU_KEYS = new Set([
  "trace",
  "traffic-control",
  "bus-operation",
  "fleet-management",
  "statistics",
  "system",
]);

export const MENU_DIVIDERS = new Set(["statistics", "system"]);

export const MENU_ITEMS: MenuItem[] = [
  {
    ...leaf("map", "Bản đồ", "/dashboard", "all", {
      legacyPath: "/map",
      strategy: "internal",
    }),
    icon: Map,
  },
  {
    key: "monitor",
    label: "Giám sát",
    icon: Monitor,
    children: [
      leaf("image-monitor", "Giám sát hình ảnh", "/image-monitor", "FUNC_GIAMSAT_HT"),
      leaf("video-monitor", "Giám sát camera", "/video-monitor", "FUNC_GIAMSAT_CAMERA"),
    ],
  },
  {
    ...leaf("violations", "Tìm kiếm vi phạm", "/violation", "FUNC_TEC_TIMKIEM_VP"),
    icon: FolderSearch,
  },
  {
    key: "trace",
    label: "Tìm kiếm truy vết",
    icon: Binoculars,
    children: [
      leaf("object-trace", "Truy vết đối tượng", "/nvaevents", "FUNC_TEC_TRUYVET"),
      leaf("face-recognition", "Nhận diện khuôn mặt", "/face-recognition", "FUNC_NHANDIEN_KM"),
    ],
  },
  {
    key: "traffic-control",
    label: "Kiểm soát giao thông",
    icon: Waves,
    children: [
      leaf("traffic-node", "Nút giao thông", "/trafficnode", "FUNC_LAN_SONG_XANH"),
      leaf("green-wave", "Tuyến làn sóng xanh", "/greenwave", "FUNC_NUT_GIAO_THONG"),
    ],
  },
  {
    key: "bus-operation",
    label: "Quản lý xe bus",
    icon: Bus,
    children: [
      leaf("stop-station", "Trạm dừng", "/stop-station", "FUNC_TRAM_DUNG"),
      leaf("infrastructure", "Quản lý hạ tầng", "/infrastructure", "FUNC_QL_HA_TANG"),
      leaf("bus-route", "Tuyến số", "/bus-route", "FUNC_TUYEN_XE", {
        strategy: "external-replace",
        externalPath: process.env.NEXT_PUBLIC_LEGACY_BUS_ROUTE_URL,
      }),
      leaf("electronic-board", "Cấu hình bảng điện tử", "/electronic-board", "FUNC_CAU_HINH_BDT"),
      leaf("schedule", "Lịch trình", "/schedule", "FUNC_LICH_TRINH"),
    ],
  },
  {
    key: "fleet-management",
    label: "Quản lý đội xe",
    icon: Car,
    children: [
      leaf("vehicle", "Đối tượng gán thiết bị", "/vehicle", "FUNC_OBJECT"),
      leaf("driver", "Lái xe", "/drive", "FUNC_LAIXE"),
    ],
  },
  {
    key: "statistics",
    label: "Thống kê & báo cáo",
    icon: ChartNoAxesCombined,
    children: [
      leaf("reports", "Báo cáo", "/reports", "FUNC_BAO_CAO", {
        legacyPath: "/statistic",
        strategy: "internal",
      }),
      leaf("data-sharing", "Chia sẻ dữ liệu", "/datasharing", "FUNC_CHIA_SE"),
      leaf("history", "Lịch sử", "/history", "FUNC_TMMS_LS"),
    ],
  },
  {
    key: "system",
    label: "Hệ thống",
    icon: Settings,
    children: [
      {
        key: "device-management",
        label: "Quản lý thiết bị",
        children: [
          leaf("device-type", "Loại thiết bị", "/devicetype", "FUNC_DEVICE_TYPE"),
          leaf("device", "Thiết bị", "/device", "FUNC_THIET_BI"),
          leaf("system-electronic-board", "Cấu hình bảng điện tử", "/electronic-board", "FUNC_CAU_HINH_BDT"),
          leaf("icon", "Biểu tượng", "/icon", "FUNC_BIEU_TUONG"),
          leaf("color", "Màu sắc", "/color", "FUNC_MAU"),
        ],
      },
      {
        key: "transport-configuration",
        label: "Cấu hình vận tải",
        children: [
          leaf("transport-type", "Loại hình vận tải", "/transporttype", "FUNC_LOAI_HINH_VAN_TAI"),
          leaf("vehicle-type", "Loại phương tiện", "/vehicletype", "FUNC_LOAI_PHUONG_TIEN"),
          leaf("route", "Tuyến đường", "/management-route", "FUNC_TUYEN_DUONG"),
        ],
      },
      {
        key: "user-management",
        label: "Quản lý người dùng",
        children: [
          leaf("decentralization", "Người sử dụng", "/decentralization", "FUNC_NGUOI_SU_DUNG"),
          leaf("organization", "Tổ chức", "/organization", "FUNC_TO_CHUC"),
        ],
      },
      {
        key: "system-configuration",
        label: "Cấu hình hệ thống",
        children: [
          leaf("project-package", "Gói dự án", "/project-package", "FUNC_GOI_DUAN"),
          leaf("alert-type", "Loại cảnh báo", "/alert-type", "FUNC_ALERT_TYPE"),
        ],
      },
      {
        key: "notification-information",
        label: "Thông tin thông báo",
        children: [
          leaf("notification", "Thông báo", "/notification", "FUNC_THONG_BAO"),
          leaf("news", "Tin tức", "/news", "FUNC_BAIBAO"),
          leaf("feedback", "Phản hồi", "/feedback", "FUNC_PHAN_HOI"),
        ],
      },
      leaf("whitelist", "Quản lý danh sách kiểm soát", "/whitelist", "FUNC_DS_KIEM_SOAT"),
    ],
  },
];
