import { afterEach, describe, expect, it, vi } from "vitest";
import { loginRequest } from "@/features/auth/api/login";

describe("loginRequest", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends the agreed username, password, and machineCode body", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: 1, accessToken: "a", refreshToken: "r", user: { id: "1" } }), { status: 200 }),
    );

    await loginRequest({ username: "demo", password: "secret", machineCode: "visitor-1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "demo", password: "secret", machineCode: "visitor-1" }),
      }),
    );
  });

  it("rejects a response without status", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await expect(loginRequest({ username: "demo", password: "secret", machineCode: "visitor-1" })).rejects.toThrow("không hợp lệ");
  });
});
