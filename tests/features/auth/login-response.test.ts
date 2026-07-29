import { describe, expect, it } from "vitest";
import { mapLoginResponse } from "@/features/auth/mappers/login-response";

describe("mapLoginResponse", () => {
  it("maps a successful status 1 response", () => {
    const response = {
      status: 1,
      accessToken: "access",
      refreshToken: "refresh",
      user: { id: "1" },
    };

    expect(mapLoginResponse(response)).toEqual(response);
  });

  it("rejects a response missing required session fields", () => {
    expect(() => mapLoginResponse({ status: 1, accessToken: "access" })).toThrow("thiếu thông tin");
  });

  it("does not treat status -131 as a successful session", () => {
    expect(() => mapLoginResponse({ status: -131 })).toThrow();
  });
});
