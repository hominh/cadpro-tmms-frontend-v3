import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginRequest } from "@/features/auth/api/login";
import { AUTH_STORAGE_KEY } from "@/lib/auth-storage";

describe("login failure flow", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ status: 1, accessToken: "old" }));
  });

  it("does not alter the existing session when credentials are rejected", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "INVALID_CREDENTIALS", message: "Invalid credentials" }), { status: 401 }),
    );

    await expect(loginRequest({ username: "bad", password: "bad", machineCode: "visitor" })).rejects.toThrow();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toContain('"old"');
  });
});
