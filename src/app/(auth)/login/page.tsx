import { LoginForm } from "@/features/auth/components/login-form";

function CadProLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 33" fill="none" aria-hidden="true">
      <g clipPath="url(#cadpro-logo-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.6404 21.8474C29.0947 15.9014 33.8707 8.23942 31.3079 4.73383C28.745 1.22823 19.8139 3.20656 11.3596 9.15254C2.90527 15.0985 -1.87071 22.7605 0.692121 26.2661C3.25496 29.7717 12.1861 27.7934 20.6404 21.8474ZM18.8884 21.2591C25.9208 17.6168 30.2516 12.1193 28.5616 8.98019C26.8716 5.84107 19.8006 6.24902 12.7682 9.89137C5.73575 13.5337 1.40489 19.0312 3.09493 22.1703C4.78497 25.3094 11.8559 24.9015 18.8884 21.2591Z"
          fill="#0E3472"
        />
        <path d="M21.6196 7.26782H19V28.2678H24.75C20.837 20.0178 21.5326 10.8512 21.6196 7.26782Z" fill="#0E3472" />
      </g>
      <defs>
        <clipPath id="cadpro-logo-clip">
          <rect width="32" height="32" fill="white" transform="translate(0 0.5)" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-8">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <CadProLogo />
            <span className="text-lg font-semibold text-slate-900">CadPro TMMS</span>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900">Xin chào</h1>
            <p className="text-sm text-slate-500">Đăng nhập để tiếp tục vào hệ thống.</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
