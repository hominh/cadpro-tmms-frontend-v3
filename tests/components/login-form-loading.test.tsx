import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/components/login-form";

vi.mock("@fingerprintjs/fingerprintjs", () => ({
  default: { load: vi.fn().mockResolvedValue({ get: vi.fn().mockResolvedValue({ visitorId: "visitor-test" }) }) },
}));
const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

function renderForm() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe("LoginForm loading state", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

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
    resolveRequest?.(
      new Response(
        JSON.stringify({
          Status: -131,
          Message: "Yêu cầu xác thực hai yếu tố",
          Data: null,
        }),
        { status: 200 },
      ),
    );
    expect(await screen.findByText("Tính năng xác thực 2 yếu tố đang phát triển")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
  });

  it("settles a generic business failure and displays uppercase Message", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ Status: 0, Message: "Sai thông tin đăng nhập", Data: null }),
        { status: 200 },
      ),
    );
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Username hoặc email"), "demo");
    await user.type(screen.getByLabelText("Mật khẩu"), "secret");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByText("Sai thông tin đăng nhập")).toBeVisible();
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("settles a transport failure without duplicate navigation", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ Status: 9, Message: "Hệ thống tạm thời không khả dụng", Data: null }),
        { status: 503 },
      ),
    );
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Username hoặc email"), "demo");
    await user.type(screen.getByLabelText("Mật khẩu"), "secret");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByText("Hệ thống tạm thời không khả dụng")).toBeVisible();
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("settles success and navigates once", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOGIN_API_URL", "https://api.example.test/login");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          Status: 1,
          Message: "Đăng nhập thành công",
          Data: {
            user_id: "user-1",
            user_name: "demo",
            ToChuc_Id: "org-1",
            access_token: "access",
            refresh_token: "refresh",
            roles: [],
            permissions: [],
            exp_refresh: 1760000000,
          },
        }),
        { status: 200 },
      ),
    );
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Username hoặc email"), "demo");
    await user.type(screen.getByLabelText("Mật khẩu"), "secret");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
  });
});
