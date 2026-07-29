import { AuthApiError, type LoginRequest, type LoginResponse } from "@/features/auth/types";

export async function loginRequest(request: LoginRequest): Promise<LoginResponse> {
  const endpoint = process.env.NEXT_PUBLIC_LOGIN_API_URL;
  if (!endpoint) {
    throw new AuthApiError("Chưa cấu hình địa chỉ API đăng nhập.", "MISSING_LOGIN_ENDPOINT");
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new AuthApiError("Không thể kết nối đến hệ thống. Vui lòng thử lại.", "NETWORK_ERROR");
  }

  let payload: LoginResponse;
  try {
    payload = (await response.json()) as LoginResponse;
  } catch {
    throw new AuthApiError("Phản hồi từ hệ thống không hợp lệ.", "MALFORMED_RESPONSE", response.status);
  }

  if (!response.ok) {
    const message = typeof payload.message === "string" ? payload.message : "Thông tin đăng nhập không hợp lệ.";
    throw new AuthApiError(message, typeof payload.code === "string" ? payload.code : undefined, response.status);
  }

  if (typeof payload.status !== "number") {
    throw new AuthApiError("Phản hồi từ hệ thống không hợp lệ.", "MALFORMED_RESPONSE", response.status);
  }

  return payload;
}
