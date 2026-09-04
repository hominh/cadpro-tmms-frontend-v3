import type {
  LoginResponse,
  LoginSuccessData,
  LoginSuccessResponse,
  StoredAuthSession,
} from "@/features/auth/types";

export const successData: LoginSuccessData = {
  user_id: "user-1",
  user_name: "demo",
  ToChuc_Id: "org-1",
  access_token: "access-token",
  refresh_token: "refresh-token",
  roles: [],
  permissions: [],
  exp_refresh: 1_760_000_000,
};

export const successResponse: LoginSuccessResponse = {
  Status: 1,
  Message: "Đăng nhập thành công",
  Data: successData,
};

export const storedSession: StoredAuthSession = {
  Status: 1,
  Data: successData,
};

export const twoFactorResponse: LoginResponse = {
  Status: -131,
  Message: "Yêu cầu xác thực hai yếu tố",
  Data: null,
};

export const genericFailureResponse: LoginResponse = {
  Status: 0,
  Message: "Tên đăng nhập hoặc mật khẩu không đúng",
  Data: null,
};

export const lowercaseOnlyResponse = {
  status: 1,
  message: "ok",
  data: successData,
};

export function createSuccessResponse(
  overrides: Partial<LoginSuccessData> = {},
): LoginSuccessResponse {
  return {
    ...successResponse,
    Data: { ...successData, ...overrides },
  };
}
