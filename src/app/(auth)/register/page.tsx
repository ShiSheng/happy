"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "@/app/actions/register-actions";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field-label";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, undefined);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="注册"
        description="账号仅含小写字母、数字与下划线（2～20 位）；密码至少 6 位。"
      />
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
            autoComplete="new-password"
            disabled={pending}
            required
            minLength={6}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>确认密码</FieldLabel>
          <Input
            type="password"
            name="confirm"
            autoComplete="new-password"
            disabled={pending}
            required
            minLength={6}
          />
        </label>
        <Button type="submit" variant="positive" className="w-full" disabled={pending}>
          {pending ? "提交中…" : "注册"}
        </Button>
      </form>
      <p className="text-center text-sm text-ink-muted">
        已有账号？{" "}
        <Link href="/login" className="font-medium text-peach underline-offset-2 hover:underline">
          登录
        </Link>
      </p>
    </div>
  );
}
