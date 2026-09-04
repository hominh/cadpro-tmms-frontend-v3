import {
  AuthApiError,
  type LoginResponse,
  type LoginSuccessData,
  type StoredAuthSession,
} from "@/features/auth/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIdentifier(value: unknown): value is string | number {
  return isNonEmptyString(value) || (typeof value === "number" && Number.isFinite(value));
}

function isExpiry(value: unknown): value is string | number {
  return isNonEmptyString(value) || (typeof value === "number" && Number.isFinite(value));
}

export function isLoginSuccessData(value: unknown): value is LoginSuccessData {
  if (!isRecord(value)) return false;

  return (
    isIdentifier(value.user_id) &&
    isNonEmptyString(value.user_name) &&
    isIdentifier(value.ToChuc_Id) &&
    isNonEmptyString(value.access_token) &&
    isNonEmptyString(value.refresh_token) &&
    Array.isArray(value.roles) &&
    Array.isArray(value.permissions) &&
    isExpiry(value.exp_refresh)
  );
}

export function isStoredAuthSession(value: unknown): value is StoredAuthSession {
  if (!isRecord(value) || value.Status !== 1) return false;
  return isLoginSuccessData(value.Data);
}

export function mapLoginResponse(response: LoginResponse): StoredAuthSession {
  if (response.Status !== 1) {
    throw new AuthApiError(
      "Phản hồi đăng nhập chưa thành công.",
      "LOGIN_NOT_SUCCESSFUL",
      undefined,
      response.Status,
    );
  }

  if (!isLoginSuccessData(response.Data)) {
    throw new AuthApiError(
      "Phản hồi đăng nhập thiếu thông tin cần thiết.",
      "MALFORMED_RESPONSE",
    );
  }

  const data = response.Data;
  return {
    Status: 1,
    Data: {
      user_id: data.user_id,
      user_name: data.user_name,
      ToChuc_Id: data.ToChuc_Id,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      roles: [...data.roles],
      permissions: [...data.permissions],
      exp_refresh: data.exp_refresh,
    },
  };
}
