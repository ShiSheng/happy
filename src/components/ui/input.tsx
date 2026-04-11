import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-2xl border-2 border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 transition-colors focus:border-peach focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-2xl border-2 border-line bg-surface px-3 py-2 text-sm text-ink focus:border-peach focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
