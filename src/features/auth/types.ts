export type LoginRequest = {
  username: string;
  password: string;
  machineCode: string;
};

export type LoginSuccessData = {
  user_id: string | number;
  user_name: string;
  ToChuc_Id: string | number;
  access_token: string;
  refresh_token: string;
  roles: unknown[];
  permissions: unknown[];
  exp_refresh: string | number;
};

export type LoginResponse = {
  Status: number;
  Message: string | null;
  Data: unknown;
};

export type LoginSuccessResponse = LoginResponse & {
  Status: 1;
  Data: LoginSuccessData;
};

export type StoredAuthSession = {
  Status: 1;
  Data: LoginSuccessData;
};

export type SidebarPermissionRecord = {
  functionCode: string;
  permissionCodes: string[];
};

export type LoginOutcome =
  | { type: "success"; response: LoginSuccessResponse; session: StoredAuthSession }
  | { type: "two-factor-unavailable"; response: LoginResponse }
  | { type: "business-error"; response: LoginResponse };

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly backendStatus?: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

export const TWO_FACTOR_MESSAGE = "Tính năng xác thực 2 yếu tố đang phát triển";
export const GENERIC_LOGIN_ERROR = "Thông tin đăng nhập không hợp lệ.";
