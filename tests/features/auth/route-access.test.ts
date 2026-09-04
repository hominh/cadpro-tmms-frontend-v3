import { describe, expect, it } from "vitest";
import {
  classifyRoute,
  resolveAuthState,
  resolveRouteDecision,
} from "@/features/auth/route-access";
import {
  lowercaseOnlyResponse,
  storedSession,
  successData,
} from "./fixtures";

describe("route access", () => {
  it("treats missing and malformed values as anonymous", () => {
    expect(resolveAuthState(null)).toBe("anonymous");
    expect(resolveAuthState("invalid")).toBe("anonymous");
    expect(resolveAuthState([])).toBe("anonymous");
    expect(resolveAuthState(lowercaseOnlyResponse)).toBe("anonymous");
  });

  it.each([
    ["wrong status", { ...storedSession, Status: 0 }],
    ["null Data", { Status: 1, Data: null }],
    ["partial Data", { Status: 1, Data: { access_token: "access" } }],
    ["blank user id", { ...storedSession, Data: { ...successData, user_id: "" } }],
    ["blank user name", { ...storedSession, Data: { ...successData, user_name: " " } }],
    ["blank organization", { ...storedSession, Data: { ...successData, ToChuc_Id: "" } }],
    ["blank access token", { ...storedSession, Data: { ...successData, access_token: "" } }],
    ["blank refresh token", { ...storedSession, Data: { ...successData, refresh_token: "" } }],
    ["invalid roles", { ...storedSession, Data: { ...successData, roles: null } }],
    ["invalid permissions", { ...storedSession, Data: { ...successData, permissions: null } }],
    ["invalid expiry", { ...storedSession, Data: { ...successData, exp_refresh: null } }],
  ])("treats an incomplete nested session as anonymous: %s", (_label, session) => {
    expect(resolveAuthState(session)).toBe("anonymous");
  });

  it("accepts a complete nested session with empty role/permission arrays", () => {
    expect(resolveAuthState(storedSession)).toBe("authenticated");
  });

  it("classifies entry, public, and protected routes consistently", () => {
    expect(classifyRoute("/")).toBe("entry");
    expect(classifyRoute("/login/")).toBe("public");
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
