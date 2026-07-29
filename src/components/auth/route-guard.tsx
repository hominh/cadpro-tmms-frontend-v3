"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readStoredAuthState, resolveRouteDecision, type AuthState } from "@/features/auth/route-access";
import { subscribeToAuthSession } from "@/lib/auth-storage";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const authState = useSyncExternalStore<AuthState>(
    subscribeToAuthSession,
    readStoredAuthState,
    () => "checking",
  );

  const decision = useMemo(() => {
    if (authState === "checking") {
      return null;
    }

    return resolveRouteDecision(pathname, authState);
  }, [authState, pathname]);

  useEffect(() => {
    if (decision?.type === "redirect") {
      router.replace(decision.destination);
    }
  }, [decision, router]);

  if (authState === "checking" || decision?.type === "redirect") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" role="status" aria-live="polite">
        <p className="text-sm text-slate-500">Dang kiem tra phien dang nhap...</p>
      </div>
    );
  }

  return <>{children}</>;
}
