"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, Suspense } from "react";
import { loginUser } from "@/app/actions/login-actions";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field-label";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [state, formAction, pending] = useActionState(loginUser, undefined);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="登录"
        description="使用已注册的账号与密码。开启 AUTH_ENABLED 后生效。"
      />
      {registered ? (
        <p className="rounded-2xl bg-peach-soft px-4 py-2 text-sm text-ink">
          注册成功，请登录。
        </p>
      ) : null}
      {state?.ok === false ? (
        <p className="rounded-2xl bg-terracotta-soft px-4 py-2 text-sm text-terracotta">
          {state.error}
        </p>
      ) : null}
      <form method="post" className="space-y-4" action={formAction}>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>账号</FieldLabel>
          <Input
            type="text"
            name="username"
            autoComplete="username"
            disabled={pending}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>密码</FieldLabel>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            disabled={pending}
            required
          />
        </label>
        <Button type="submit" variant="positive" className="w-full" disabled={pending}>
          {pending ? "登录中…" : "进入"}
        </Button>
      </form>
      <p className="text-center text-sm text-ink-muted">
        还没有账号？{" "}
        <Link href="/register" className="font-medium text-peach underline-offset-2 hover:underline">
          注册
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md animate-pulse text-ink-muted">加载中…</div>}>
      <LoginForm />
    </Suspense>
  );
}
