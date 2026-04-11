import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatPill({
  label,
  value,
  tone = "neutral",
  className,
}: {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "xp" | "coins";
  className?: string;
}) {
  const toneClass =
    tone === "xp"
      ? "bg-leaf-soft text-leaf"
      : tone === "coins"
        ? "bg-bubble text-coral"
        : "bg-surface-muted text-ink";

  return (
    <div
      className={cn(
        "flex min-w-[5.5rem] flex-col items-center rounded-2xl px-4 py-3 text-center",
        toneClass,
        className,
      )}
    >
      <span className="text-[0.65rem] font-semibold uppercase tracking-wider opacity-80">
        {label}
      </span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
    </div>
  );
}
