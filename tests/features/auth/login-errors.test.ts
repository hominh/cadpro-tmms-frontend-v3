import { describe, expect, it } from "vitest";
import { mapLoginResponse } from "@/features/auth/mappers/login-response";
import { TWO_FACTOR_MESSAGE } from "@/features/auth/types";
import { genericFailureResponse, twoFactorResponse } from "./fixtures";

describe("login business outcomes", () => {
  it("recognizes -131 as a business outcome rather than malformed success data", () => {
    expect(twoFactorResponse).toMatchObject({ Status: -131, Data: null });
    expect(TWO_FACTOR_MESSAGE).toBe("Tính năng xác thực 2 yếu tố đang phát triển");
    expect(() => mapLoginResponse(twoFactorResponse)).toThrowError(
      expect.objectContaining({ code: "LOGIN_NOT_SUCCESSFUL", backendStatus: -131 }),
    );
  });

  it("retains the safe uppercase Message for another business failure", () => {
    expect(genericFailureResponse.Message).toBe("Tên đăng nhập hoặc mật khẩu không đúng");
    expect(() => mapLoginResponse(genericFailureResponse)).toThrowError(
      expect.objectContaining({ code: "LOGIN_NOT_SUCCESSFUL", backendStatus: 0 }),
    );
  });
});
