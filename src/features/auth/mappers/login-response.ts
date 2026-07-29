import { AuthApiError, type LoginResponse, type StoredAuthSession } from "@/features/auth/types";

export function mapLoginResponse(response: LoginResponse): StoredAuthSession {
  if (response.status !== 1) {
    throw new AuthApiError("Phản hồi đăng nhập chưa thành công.", "LOGIN_NOT_SUCCESSFUL");
  }
  if (!response.accessToken || !response.refreshToken || !response.user) {
    throw new AuthApiError("Phản hồi đăng nhập thiếu thông tin cần thiết.", "MALFORMED_RESPONSE");
  }
  const { password: _password, ...safeResponse } = response as LoginResponse & { password?: unknown };
  return safeResponse;
}
