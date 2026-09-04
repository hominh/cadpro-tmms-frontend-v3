"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/features/auth/api/login";
import { getMachineCode } from "@/features/auth/machine-code";
import { mapLoginResponse } from "@/features/auth/mappers/login-response";
import {
  AuthApiError,
  GENERIC_LOGIN_ERROR,
  TWO_FACTOR_MESSAGE,
  type LoginOutcome,
} from "@/features/auth/types";
import { saveAuthSession } from "@/lib/auth-storage";

export function useLogin() {
  const router = useRouter();
  const mutation = useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }): Promise<LoginOutcome> => {
      const machineCode = await getMachineCode();
      const response = await loginRequest({ username, password, machineCode });

      if (response.Status === 1) {
        const session = mapLoginResponse(response);
        return { type: "success", response: { ...response, Status: 1, Data: session.Data }, session };
      }

      if (response.Status === -131) {
        return { type: "two-factor-unavailable", response };
      }

      return { type: "business-error", response };
    },
    onSuccess: (outcome) => {
      if (outcome.type !== "success") return;
      saveAuthSession(outcome.session);
      router.push("/dashboard");
    },
  });

  const isTwoFactorOutcome =
    mutation.data?.type === "two-factor-unavailable" ||
    (mutation.error instanceof AuthApiError && mutation.error.backendStatus === -131);

  return {
    ...mutation,
    twoFactorMessage: isTwoFactorOutcome ? TWO_FACTOR_MESSAGE : null,
    businessErrorMessage:
      mutation.data?.type === "business-error"
        ? mutation.data.response.Message?.trim() || GENERIC_LOGIN_ERROR
        : null,
  };
}
