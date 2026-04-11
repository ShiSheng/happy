"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Modal({
  open,
  onClose,
  title,
  children,
  /** 无顶栏（如庆祝全幅内容） */
  hideTitleBar = false,
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  hideTitleBar?: boolean;
  /** hideTitleBar 时用于 aria-label */
  ariaLabel?: string;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 pb-6 backdrop-blur-[2px] sm:items-center sm:pb-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[min(90dvh,720px)] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-line bg-surface shadow-[0_24px_64px_-20px_rgba(61,52,41,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={hideTitleBar ? undefined : titleId}
        aria-label={hideTitleBar ? (ariaLabel ?? title) : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideTitleBar ? (
          <div className="border-b border-line px-5 py-4">
            <h2 id={titleId} className="text-lg font-bold text-ink">
              {title}
            </h2>
          </div>
        ) : null}
        <div className={hideTitleBar ? "p-5" : "px-5 py-4"}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
