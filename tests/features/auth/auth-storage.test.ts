import { beforeEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY, readAuthSession, saveAuthSession } from "@/lib/auth-storage";

describe("auth storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists the approved response and excludes password", () => {
    saveAuthSession({
      status: 1,
      accessToken: "access",
      refreshToken: "refresh",
      user: { id: "1" },
      password: "secret",
    });

    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeTruthy();
    expect(readAuthSession()).toEqual({
      status: 1,
      accessToken: "access",
      refreshToken: "refresh",
      user: { id: "1" },
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).not.toContain("secret");
  });
});
