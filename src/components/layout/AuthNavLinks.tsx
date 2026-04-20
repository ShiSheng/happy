"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

/** 仅在开启全站登录且根布局已挂 SessionProvider 时渲染（见 MainShell） */
export function AuthNavLinks({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { status } = useSession();
  if (status === "authenticated") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="compact"
        className="mt-2 w-full justify-start text-sm text-ink-muted"
        onClick={() => {
          onNavigate?.();
          void signOut({ callbackUrl: "/login" });
        }}
      >
        退出登录
      </Button>
    );
  }
  return (
    <Link
      href="/login"
      onClick={onNavigate}
      className="mt-2 flex min-h-11 items-center rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface-muted"
    >
      登录
    </Link>
  );
}
