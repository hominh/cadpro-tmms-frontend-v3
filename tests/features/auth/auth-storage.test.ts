import { beforeEach, describe, expect, it } from "vitest";
import {
  AUTH_STORAGE_KEY,
  readAuthSession,
  saveAuthSession,
} from "@/lib/auth-storage";
import {
  lowercaseOnlyResponse,
  storedSession,
  successData,
} from "./fixtures";

describe("auth storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists the nested allowlisted session atomically", () => {
    saveAuthSession(storedSession);

    expect(readAuthSession()).toEqual(storedSession);
    expect(JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "null")).toEqual(
      storedSession,
    );
  });

  it("does not persist password, Message, or unknown response fields", () => {
    const unsafeInput = {
      Status: 1,
      Message: "should-not-persist",
      password: "secret",
      unknown: "extra",
      Data: { ...successData, password: "nested-secret", unknown: "nested-extra" },
    };

    saveAuthSession(unsafeInput as typeof storedSession);

    expect(readAuthSession()).toEqual(storedSession);
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "";
    expect(raw).not.toContain("secret");
    expect(raw).not.toContain("Message");
    expect(raw).not.toContain("unknown");
  });

  it.each([
    ["lowercase legacy", lowercaseOnlyResponse],
    ["primitive", "invalid"],
    ["null Data", { Status: 1, Data: null }],
    ["partial Data", { Status: 1, Data: { access_token: "access" } }],
    ["blank access token", { ...storedSession, Data: { ...successData, access_token: "" } }],
    ["blank refresh token", { ...storedSession, Data: { ...successData, refresh_token: "" } }],
    ["blank user", { ...storedSession, Data: { ...successData, user_name: " " } }],
    ["blank organization", { ...storedSession, Data: { ...successData, ToChuc_Id: "" } }],
  ])("clears an invalid stored session: %s", (_label, value) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));

    expect(readAuthSession()).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("clears malformed JSON", () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "{bad-json");
    expect(readAuthSession()).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("accepts intentionally empty roles and permissions", () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedSession));
    expect(readAuthSession()).toEqual(storedSession);
  });

  it("returns a stable snapshot while localStorage is unchanged", () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedSession));
    const first = readAuthSession();
    expect(readAuthSession()).toBe(first);
  });
});
