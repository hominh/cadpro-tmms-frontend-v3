import { describe, expect, it } from "vitest";
import { classifyRoute, resolveAuthState, resolveRouteDecision } from "@/features/auth/route-access";

describe("route access", () => {
  it("treats a missing session as anonymous", () => {
    expect(resolveAuthState(null)).toBe("anonymous");
  });

  it("treats malformed and incomplete sessions as anonymous", () => {
    expect(resolveAuthState("invalid")).toBe("anonymous");
    expect(resolveAuthState({ status: 1, accessToken: "access-token" })).toBe("anonymous");
    expect(resolveAuthState({ status: 1, accessToken: "access-token", refreshToken: "refresh-token" })).toBe("anonymous");
    expect(resolveAuthState({ status: 1, accessToken: "access-token", refreshToken: "refresh-token", user: null })).toBe("anonymous");
  });

  it("accepts a complete stored session as authenticated", () => {
    expect(
      resolveAuthState({
        status: 1,
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "user-1" },
      }),
    ).toBe("authenticated");
  });

  it("classifies entry, public, and protected routes consistently", () => {
    expect(classifyRoute("/")).toBe("entry");
    expect(classifyRoute("/login")).toBe("public");
    expect(classifyRoute("/dashboard")).toBe("protected");
  });

  it("redirects users according to route kind and auth state", () => {
    expect(resolveRouteDecision("/", "anonymous")).toEqual({ type: "redirect", destination: "/login" });
    expect(resolveRouteDecision("/", "authenticated")).toEqual({ type: "redirect", destination: "/dashboard" });
    expect(resolveRouteDecision("/login", "anonymous")).toEqual({ type: "allow" });
    expect(resolveRouteDecision("/login", "authenticated")).toEqual({ type: "redirect", destination: "/dashboard" });
    expect(resolveRouteDecision("/dashboard", "anonymous")).toEqual({ type: "redirect", destination: "/login" });
    expect(resolveRouteDecision("/dashboard", "authenticated")).toEqual({ type: "allow" });
  });
});
