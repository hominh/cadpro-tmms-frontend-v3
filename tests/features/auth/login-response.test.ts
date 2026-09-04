import { describe, expect, it } from "vitest";
import {
  isStoredAuthSession,
  mapLoginResponse,
} from "@/features/auth/mappers/login-response";
import type { LoginResponse } from "@/features/auth/types";
import {
  createSuccessResponse,
  lowercaseOnlyResponse,
  storedSession,
  successResponse,
  twoFactorResponse,
} from "./fixtures";

describe("mapLoginResponse", () => {
  it("allowlists and preserves every required nested Data field", () => {
    const response = {
      ...successResponse,
      ignored: "wire-extra",
      Data: { ...successResponse.Data, ignored: "data-extra" },
    };

    expect(mapLoginResponse(response)).toEqual(storedSession);
  });

  it("accepts empty role and permission arrays", () => {
    expect(mapLoginResponse(createSuccessResponse({ roles: [], permissions: [] }))).toEqual(storedSession);
  });

  it.each([
    ["null Data", { ...successResponse, Data: null }],
    ["array Data", { ...successResponse, Data: [] }],
    ["missing user_id", { ...successResponse, Data: { ...successResponse.Data, user_id: undefined } }],
    ["blank user_name", createSuccessResponse({ user_name: " " })],
    ["missing organization", { ...successResponse, Data: { ...successResponse.Data, ToChuc_Id: undefined } }],
    ["blank access token", createSuccessResponse({ access_token: "" })],
    ["blank refresh token", createSuccessResponse({ refresh_token: "" })],
    ["invalid roles", { ...successResponse, Data: { ...successResponse.Data, roles: null } }],
    ["invalid permissions", { ...successResponse, Data: { ...successResponse.Data, permissions: {} } }],
    ["invalid expiry", { ...successResponse, Data: { ...successResponse.Data, exp_refresh: null } }],
  ])("rejects malformed success data: %s", (_label, response) => {
    expect(() => mapLoginResponse(response)).toThrowError(expect.objectContaining({ code: "MALFORMED_RESPONSE" }));
  });

  it("does not map non-success or lowercase-only responses", () => {
    expect(() => mapLoginResponse(twoFactorResponse)).toThrowError(
      expect.objectContaining({ code: "LOGIN_NOT_SUCCESSFUL" }),
    );
    expect(() => mapLoginResponse(lowercaseOnlyResponse as unknown as LoginResponse)).toThrow();
  });
});

describe("isStoredAuthSession", () => {
  it("recognizes only the allowlisted successful nested shape", () => {
    expect(isStoredAuthSession(storedSession)).toBe(true);
    expect(isStoredAuthSession({ ...storedSession, Status: 0 })).toBe(false);
    expect(isStoredAuthSession(lowercaseOnlyResponse)).toBe(false);
  });
});
