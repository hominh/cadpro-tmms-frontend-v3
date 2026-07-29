import { describe, expect, it } from "vitest";
import { mapLoginResponse } from "@/features/auth/mappers/login-response";
import { twoFactorResponse } from "./fixtures";

describe("login response errors", () => {
  it("does not create a session for the two-factor status", () => {
    expect(() => mapLoginResponse(twoFactorResponse)).toThrow();
  });
});
