"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/auth/hooks/use-login";

const schema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập username hoặc email."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const login = useLogin();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", remember: false },
  });

  useEffect(() => {
    const firstError = form.formState.errors.username ? "username" : form.formState.errors.password ? "password" : null;
    if (firstError) form.setFocus(firstError);
  }, [form.formState.errors.password, form.formState.errors.username, form]);

  const onSubmit = form.handleSubmit(({ username, password }) => {
    login.reset();
    login.mutate({ username, password });
  });

  const serviceError = login.error instanceof Error ? login.error.message : null;
  const visibleError = login.twoFactorMessage
    ? null
    : login.businessErrorMessage ?? serviceError;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate aria-describedby="login-status">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-slate-700">
          Username hoặc email
        </Label>
        <Input
          id="username"
          autoComplete="username"
          placeholder="Nhập username hoặc email"
          className="h-11 border-slate-300 bg-slate-50 focus-visible:border-blue-700 focus-visible:ring-blue-200"
          {...form.register("username")}
          aria-invalid={Boolean(form.formState.errors.username)}
          aria-describedby={form.formState.errors.username ? "username-error" : undefined}
        />
        {form.formState.errors.username && (
          <p id="username-error" role="alert" className="text-sm text-destructive">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700">
          Mật khẩu
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            className="h-11 border-slate-300 bg-slate-50 pr-11 focus-visible:border-blue-700 focus-visible:ring-blue-200"
            {...form.register("password")}
            aria-invalid={Boolean(form.formState.errors.password)}
            aria-describedby={form.formState.errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300"
            aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p id="password-error" role="alert" className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <Controller
          name="remember"
          control={form.control}
          render={({ field }) => (
            <Checkbox
              id="remember"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              aria-label="Ghi nhớ đăng nhập"
            />
          )}
        />
        <Label htmlFor="remember" className="ml-2.5 cursor-pointer font-normal text-slate-600">
          Ghi nhớ đăng nhập
        </Label>
      </div>

      <div id="login-status" role="status" aria-live="polite" className="min-h-5 text-sm">
        {login.twoFactorMessage && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">{login.twoFactorMessage}</p>
        )}
        {visibleError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-destructive">{visibleError}</p>
        )}
      </div>

      <Button
        className="h-11 w-full bg-blue-800 font-semibold hover:bg-blue-900 focus-visible:ring-blue-300"
        type="submit"
        disabled={login.isPending}
      >
        {login.isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
        {login.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
