import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLogin } from "@/features/auth/hooks/use-login";
import { AUTH_STORAGE_KEY } from "@/lib/auth-storage";
import {
  genericFailureResponse,
  storedSession,
  successResponse,
  twoFactorResponse,
} from "./fixtures";

const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("@fingerprintjs/fingerprintjs", () => ({
  default: {
    load: vi.fn().mockResolvedValue({
      get: vi.fn().mockResolvedValue({ visitorId: "visitor-test" }),
    }),
  },
}));

function Probe() {
  const login = useLogin();
  return <>
    <button onClick={() => login.mutate({ username: "demo", password: "secret" })}>
      submit
    </button>
    {login.twoFactorMessage && <span>{login.twoFactorMessage}</span>}
    {login.businessErrorMessage && <span>{login.businessErrorMessage}</span>}
    {login.error instanceof Error && <span>{login.error.message}</span>}
  </>;
}

function renderProbe() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );
}

describe("useLogin", () => {
  beforeEach(() => {
    pushMock.mockReset();
    window.localStorage.clear();
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("stores every approved Data field and redirects once for Status 1", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(successResponse), { status: 200 }),
    );
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: "submit" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
    expect(JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "null")).toEqual(
      storedSession,
    );
  });

  it("shows the exact two-factor message without storing or navigating", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(twoFactorResponse), { status: 200 }),
    );
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(await screen.findByText("Tính năng xác thực 2 yếu tố đang phát triển")).toBeVisible();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("preserves -131 through an HTTP error and still shows the exact two-factor message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(twoFactorResponse), { status: 401 }),
    );
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(await screen.findByText("Tính năng xác thực 2 yếu tố đang phát triển")).toBeVisible();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows uppercase Message for a generic business failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(genericFailureResponse), { status: 200 }),
    );
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(await screen.findByText(genericFailureResponse.Message ?? "")).toBeVisible();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("does not store or navigate for an HTTP error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ Status: 9, Message: "Service unavailable", Data: null }), {
        status: 503,
      }),
    );
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(await screen.findByText("Service unavailable")).toBeVisible();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
