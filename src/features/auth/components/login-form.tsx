"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/auth/hooks/use-login";

const schema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập username hoặc email."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const login = useLogin();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { username: "", password: "" } });

  useEffect(() => {
    const firstError = form.formState.errors.username ? "username" : form.formState.errors.password ? "password" : null;
    if (firstError) form.setFocus(firstError);
  }, [form.formState.errors.password, form.formState.errors.username, form]);

  const onSubmit = form.handleSubmit((values) => {
    login.reset();
    login.mutate(values);
  });

  const serviceError = login.error instanceof Error ? login.error.message : null;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate aria-describedby="login-status">
      <div className="space-y-2">
        <Label htmlFor="username">Username hoặc email</Label>
        <Input id="username" autoComplete="username" {...form.register("username")} aria-invalid={Boolean(form.formState.errors.username)} />
        {form.formState.errors.username && <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} aria-invalid={Boolean(form.formState.errors.password)} />
        {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
      </div>
      <div id="login-status" role="status" aria-live="polite" className="min-h-5 text-sm">
        {login.twoFactorMessage && <p className="text-amber-700">{login.twoFactorMessage}</p>}
        {serviceError && <p className="text-destructive">{serviceError}</p>}
      </div>
      <Button className="w-full" type="submit" disabled={login.isPending}>
        {login.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
