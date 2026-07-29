"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getMachineCode } from "@/features/auth/machine-code";
import { loginRequest } from "@/features/auth/api/login";
import { mapLoginResponse } from "@/features/auth/mappers/login-response";
import { saveAuthSession } from "@/lib/auth-storage";
import { TWO_FACTOR_MESSAGE, type LoginResponse } from "@/features/auth/types";

export function useLogin() {
  const router = useRouter();
  const mutation = useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const machineCode = await getMachineCode();
      const response = await loginRequest({ username, password, machineCode });
      return {
        response,
        session: response.status === 1 ? mapLoginResponse(response) : null,
      };
    },
    onSuccess: ({ response, session }: { response: LoginResponse; session: ReturnType<typeof mapLoginResponse> | null }) => {
      if (response.status === -131 || !session) return;
      saveAuthSession(session);
      router.push("/dashboard");
    },
  });

  return {
    ...mutation,
    twoFactorMessage: mutation.data?.response.status === -131 ? TWO_FACTOR_MESSAGE : null,
  };
}
