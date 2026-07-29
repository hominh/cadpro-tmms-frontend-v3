export type LoginRequest = {
  username: string;
  password: string;
  machineCode: string;
};

export type UserProfile = Record<string, unknown>;

export type LoginResponse = {
  status: number;
  accessToken?: string;
  refreshToken?: string;
  user?: UserProfile;
  [key: string]: unknown;
};

export type StoredAuthSession = Omit<LoginResponse, "password">;

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

export const TWO_FACTOR_MESSAGE = "Tính năng xác thực 2 yếu tố đang phát triển";
