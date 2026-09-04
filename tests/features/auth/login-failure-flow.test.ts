import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginRequest } from "@/features/auth/api/login";
import { AUTH_STORAGE_KEY } from "@/lib/auth-storage";
import { storedSession } from "./fixtures";

const request = { username: "bad", password: "bad", machineCode: "visitor" };

describe("login failure flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedSession));
  });

  it.each([
    ["HTTP", new Response(JSON.stringify({ Status: 8, Message: "Invalid credentials", Data: null }), { status: 401 })],
    ["malformed success", new Response(JSON.stringify({ Status: 1, Message: "ok", Data: null }), { status: 200 })],
    ["invalid JSON", new Response("not-json", { status: 200 })],
  ])("does not alter an existing session after a %s response", async (_label, response) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    await loginRequest(request).catch(() => undefined);

    expect(JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "null")).toEqual(storedSession);
  });

  it("does not alter an existing session after a network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    await loginRequest(request).catch(() => undefined);
    expect(JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "null")).toEqual(storedSession);
  });
});
