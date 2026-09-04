import { isStoredAuthSession } from "@/features/auth/mappers/login-response";
import type { StoredAuthSession } from "@/features/auth/types";

export const AUTH_STORAGE_KEY = "cadpro:auth-session";
const AUTH_STORAGE_EVENT = "cadpro:auth-session-change";
let cachedRawSession: string | null | undefined;
let cachedSession: StoredAuthSession | null = null;

function notifyAuthStorageChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
  }
}

function toSafeSession(session: StoredAuthSession): StoredAuthSession {
  const data = session.Data;
  return {
    Status: 1,
    Data: {
      user_id: data.user_id,
      user_name: data.user_name,
      ToChuc_Id: data.ToChuc_Id,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      roles: [...data.roles],
      permissions: [...data.permissions],
      exp_refresh: data.exp_refresh,
    },
  };
}

export function saveAuthSession(session: StoredAuthSession): void {
  if (typeof window === "undefined" || !isStoredAuthSession(session)) return;
  const safeSession = toSafeSession(session);
  const serialized = JSON.stringify(safeSession);
  window.localStorage.setItem(AUTH_STORAGE_KEY, serialized);
  cachedRawSession = serialized;
  cachedSession = safeSession;
  notifyAuthStorageChanged();
}

export function readAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (value === cachedRawSession) return cachedSession;
  if (!value) {
    cachedRawSession = null;
    cachedSession = null;
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (isStoredAuthSession(parsed)) {
      cachedRawSession = value;
      cachedSession = toSafeSession(parsed);
      return cachedSession;
    }
  } catch {
    // Invalid browser storage is handled by clearing it below.
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  cachedRawSession = null;
  cachedSession = null;
  notifyAuthStorageChanged();
  return null;
}

export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    cachedRawSession = null;
    cachedSession = null;
    notifyAuthStorageChanged();
  }
}

export function subscribeToAuthSession(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === AUTH_STORAGE_KEY) {
      onChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_STORAGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_STORAGE_EVENT, onChange);
  };
}
