import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn("text-sm font-medium text-ink-muted", className)}
    >
      {children}
    </span>
  );
}
