import { afterEach, describe, expect, it, vi } from "vitest";
import { loginRequest } from "@/features/auth/api/login";
import { AuthApiError } from "@/features/auth/types";
import {
  lowercaseOnlyResponse,
  successResponse,
  twoFactorResponse,
} from "./fixtures";

const endpoint = "https://api.example.test/login";
const request = { username: "demo", password: "secret", machineCode: "visitor-1" };

function mockJsonResponse(payload: unknown, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }),
    );
}

describe("loginRequest", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sends the agreed request and accepts an exact uppercase success envelope", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", endpoint);
    const fetchMock = mockJsonResponse(successResponse);

    await expect(loginRequest(request)).resolves.toEqual(successResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      endpoint,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(request),
      }),
    );
  });

  it("accepts the exact fields regardless of property order", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", endpoint);
    mockJsonResponse({ Data: successResponse.Data, Message: successResponse.Message, Status: 1 });

    await expect(loginRequest(request)).resolves.toEqual(successResponse);
  });

  it.each([
    ["lowercase-only envelope", lowercaseOnlyResponse],
    ["missing Status", { Message: "ok", Data: successResponse.Data }],
    ["missing Message", { Status: 1, Data: successResponse.Data }],
    ["missing Data", { Status: 1, Message: "ok" }],
  ])("rejects a malformed %s", async (_label, payload) => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", endpoint);
    mockJsonResponse(payload);

    await expect(loginRequest(request)).rejects.toMatchObject({ code: "MALFORMED_RESPONSE" });
  });

  it("rejects invalid JSON as MALFORMED_RESPONSE", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", endpoint);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("not-json", { status: 200 }));

    await expect(loginRequest(request)).rejects.toMatchObject({ code: "MALFORMED_RESPONSE" });
  });

  it("returns parseable business failures on HTTP success", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", endpoint);
    mockJsonResponse(twoFactorResponse);

    await expect(loginRequest(request)).resolves.toEqual(twoFactorResponse);
  });

  it("uses only uppercase Message and retains Status for non-OK responses", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", endpoint);
    mockJsonResponse({ Status: 7, Message: "Backend message", Data: null }, 401);

    const error = await loginRequest(request).catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(AuthApiError);
    expect(error).toMatchObject({ message: "Backend message", statusCode: 401, backendStatus: 7 });
  });

  it("does not consume lowercase message on a non-OK response", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", endpoint);
    mockJsonResponse({ Status: 7, message: "lowercase leak", Data: null }, 401);

    const error = await loginRequest(request).catch((reason: unknown) => reason);
    expect(error).toMatchObject({ code: "MALFORMED_RESPONSE" });
    expect((error as Error).message).not.toContain("lowercase leak");
  });
});
