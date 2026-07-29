import type { LoginResponse, StoredAuthSession } from "@/features/auth/types";

export const AUTH_STORAGE_KEY = "cadpro:auth-session";
const AUTH_STORAGE_EVENT = "cadpro:auth-session-change";

function notifyAuthStorageChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
  }
}

function toSafeSession(response: LoginResponse): StoredAuthSession {
  const { password: _password, ...safeResponse } = response as LoginResponse & { password?: unknown };
  return safeResponse;
}

export function saveAuthSession(response: LoginResponse | StoredAuthSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toSafeSession(response as LoginResponse)));
  notifyAuthStorageChanged();
}

export function readAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as StoredAuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    notifyAuthStorageChanged();
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
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
