"use client";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-canvas p-8">
      <h1 className="text-xl font-bold text-ink">出错了</h1>
      <p className="max-w-md text-center text-sm leading-relaxed text-ink-muted">
        {error.message || "请稍后重试，或检查数据库是否已迁移并执行 seed。"}
      </p>
      <Button variant="primary" onClick={() => reset()}>
        重试
      </Button>
    </div>
  );
}
