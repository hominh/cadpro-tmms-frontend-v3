import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useLogin } from "@/features/auth/hooks/use-login";

const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("@fingerprintjs/fingerprintjs", () => ({
  default: { load: vi.fn().mockResolvedValue({ get: vi.fn().mockResolvedValue({ visitorId: "visitor-test" }) }) },
}));

function Probe() {
  const login = useLogin();
  return <button onClick={() => login.mutate({ username: "demo", password: "secret" })}>submit</button>;
}

describe("useLogin", () => {
  it("stores a successful response and redirects to dashboard", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: 1, accessToken: "a", refreshToken: "r", user: { id: "1" } }), { status: 200 }),
    );
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const user = userEvent.setup();
    render(<QueryClientProvider client={client}><Probe /></QueryClientProvider>);

    await user.click(screen.getByRole("button", { name: "submit" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
    expect(window.localStorage.getItem("cadpro:auth-session")).toContain('"accessToken":"a"');
  });
});
