"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

/** AUTH_ENABLED 时在侧栏显示登录 / 退出 */
export function AuthNavLinks({
  enabled,
  onNavigate,
}: {
  enabled: boolean;
  onNavigate?: () => void;
}) {
  const { status } = useSession();
  if (!enabled) return null;
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
