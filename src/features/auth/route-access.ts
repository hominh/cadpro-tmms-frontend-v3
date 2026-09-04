import { readAuthSession } from "@/lib/auth-storage";
import { isStoredAuthSession } from "@/features/auth/mappers/login-response";
import type { StoredAuthSession } from "@/features/auth/types";

export const LOGIN_ROUTE = "/login";
export const DASHBOARD_ROUTE = "/dashboard";

export type RouteKind = "entry" | "public" | "protected";
export type AuthState = "checking" | "anonymous" | "authenticated";

type RouteDecision =
  | { type: "allow" }
  | { type: "redirect"; destination: string };

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function classifyRoute(pathname: string): RouteKind {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/") return "entry";
  if (normalizedPath === LOGIN_ROUTE) return "public";

  return "protected";
}

export function isAuthenticatedSession(session: unknown): session is StoredAuthSession {
  return isStoredAuthSession(session);
}

export function resolveAuthState(session: unknown): Exclude<AuthState, "checking"> {
  return isAuthenticatedSession(session) ? "authenticated" : "anonymous";
}

export function resolveRouteDecision(pathname: string, authState: Exclude<AuthState, "checking">): RouteDecision {
  const routeKind = classifyRoute(pathname);

  if (routeKind === "entry") {
    return {
      type: "redirect",
      destination: authState === "authenticated" ? DASHBOARD_ROUTE : LOGIN_ROUTE,
    };
  }

  if (routeKind === "public") {
    return authState === "authenticated"
      ? { type: "redirect", destination: DASHBOARD_ROUTE }
      : { type: "allow" };
  }

  return authState === "authenticated"
    ? { type: "allow" }
    : { type: "redirect", destination: LOGIN_ROUTE };
}

export function readStoredAuthState(): AuthState {
  return resolveAuthState(readAuthSession());
}
