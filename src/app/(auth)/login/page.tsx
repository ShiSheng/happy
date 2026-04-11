"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field-label";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function LoginPage() {
  const [secret, setSecret] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="登录"
        description="AUTH_ENABLED=true 时使用；口令由环境变量 DEMO_LOGIN_SECRET 配置。"
      />
      {err ? (
        <p className="rounded-2xl bg-terracotta-soft px-4 py-2 text-sm text-terracotta">
          {err}
        </p>
      ) : null}
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          setPending(true);
          try {
            const r = await signIn("credentials", {
              secret,
              redirect: false,
            });
            if (r?.error) {
              setErr("口令错误或登录未启用");
              return;
            }
            window.location.href = "/pet-paradise";
          } finally {
            setPending(false);
          }
        }}
      >
        <label className="flex flex-col gap-1.5">
          <FieldLabel>登录口令</FieldLabel>
          <Input
            type="password"
            name="secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            autoComplete="current-password"
            disabled={pending}
          />
        </label>
        <Button type="submit" variant="positive" className="w-full" disabled={pending}>
          {pending ? "登录中…" : "进入"}
        </Button>
      </form>
    </div>
  );
}
