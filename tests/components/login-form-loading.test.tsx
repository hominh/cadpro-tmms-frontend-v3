import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/components/login-form";

vi.mock("@fingerprintjs/fingerprintjs", () => ({
  default: { load: vi.fn().mockResolvedValue({ get: vi.fn().mockResolvedValue({ visitorId: "visitor-test" }) }) },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function renderForm() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe("LoginForm loading state", () => {
  it("disables the submit button while login is pending", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
    let resolveRequest: ((value: Response) => void) | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise<Response>((resolve) => { resolveRequest = resolve; }),
    );
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Username hoặc email"), "demo");
    await user.type(screen.getByLabelText("Mật khẩu"), "secret");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByRole("button", { name: "Đang đăng nhập..." })).toBeDisabled();
    resolveRequest?.(new Response(JSON.stringify({ status: -131 }), { status: 200 }));
    expect(await screen.findByText("Tính năng xác thực 2 yếu tố đang phát triển")).toBeInTheDocument();
  });
});
