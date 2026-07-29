import type { LoginResponse } from "@/features/auth/types";

export const successResponse: LoginResponse = {
  status: 1,
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: { id: "user-1", username: "demo" },
};

export const twoFactorResponse: LoginResponse = { status: -131 };
