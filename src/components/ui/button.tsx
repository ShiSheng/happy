import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "positive"
  | "negative";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-peach text-white shadow-sm hover:bg-peach-hover active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
  secondary:
    "border-2 border-line-strong bg-surface text-ink hover:bg-surface-muted active:scale-[0.98] disabled:opacity-50",
  ghost:
    "text-ink-muted hover:bg-surface-muted hover:text-ink active:scale-[0.98]",
  danger:
    "border-2 border-berry/40 text-berry hover:bg-terracotta-soft active:scale-[0.98] disabled:opacity-50",
  positive:
    "bg-peach text-white shadow-sm hover:bg-peach-hover active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
  negative:
    "bg-berry text-white shadow-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "default" | "compact";
  children: ReactNode;
}) {
  const sizeClass =
    size === "compact"
      ? "min-h-9 px-2 py-1.5 text-sm font-medium"
      : "min-h-11 min-w-11 px-4 py-2.5 text-sm font-semibold";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-2xl transition-all duration-200 ease-out",
        sizeClass,
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
