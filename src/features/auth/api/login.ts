import {
  AuthApiError,
  GENERIC_LOGIN_ERROR,
  type LoginRequest,
  type LoginResponse,
} from "@/features/auth/types";

const MALFORMED_MESSAGE = "Phản hồi từ hệ thống không hợp lệ.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeLoginResponse(payload: unknown, statusCode: number): LoginResponse {
  if (
    !isRecord(payload) ||
    !Object.prototype.hasOwnProperty.call(payload, "Status") ||
    !Object.prototype.hasOwnProperty.call(payload, "Message") ||
    !Object.prototype.hasOwnProperty.call(payload, "Data") ||
    typeof payload.Status !== "number" ||
    !Number.isFinite(payload.Status) ||
    (typeof payload.Message !== "string" && payload.Message !== null)
  ) {
    throw new AuthApiError(MALFORMED_MESSAGE, "MALFORMED_RESPONSE", statusCode);
  }

  return {
    Status: payload.Status,
    Message: payload.Message,
    Data: payload.Data,
  };
}

export async function loginRequest(request: LoginRequest): Promise<LoginResponse> {
  const endpoint = process.env.NEXT_PUBLIC_LOGIN_API_URL;
  if (!endpoint) {
    throw new AuthApiError(
      "Chưa cấu hình địa chỉ API đăng nhập.",
      "MISSING_LOGIN_ENDPOINT",
    );
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new AuthApiError(
      "Không thể kết nối đến hệ thống. Vui lòng thử lại.",
      "NETWORK_ERROR",
    );
  }

  let rawPayload: unknown;
  try {
    rawPayload = await response.json();
  } catch {
    throw new AuthApiError(
      MALFORMED_MESSAGE,
      "MALFORMED_RESPONSE",
      response.status,
    );
  }

  const payload = decodeLoginResponse(rawPayload, response.status);

  if (!response.ok) {
    throw new AuthApiError(
      payload.Message?.trim() || GENERIC_LOGIN_ERROR,
      "HTTP_ERROR",
      response.status,
      payload.Status,
    );
  }

  return payload;
}
