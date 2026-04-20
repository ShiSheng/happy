"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthNavLinks } from "@/components/layout/AuthNavLinks";
import { PetNavSwitcher } from "@/components/layout/PetNavSwitcher";
import { cn } from "@/lib/utils";

const nav = [
  {
    href: "/pet-paradise",
    label: "宠物乐园",
    icon: IconPaw,
  },
  {
    href: "/shop",
    label: "小卖部",
    icon: IconShop,
  },
  {
    href: "/rules",
    label: "分值规则",
    icon: IconRules,
  },
  {
    href: "/settings",
    label: "系统设置",
    icon: IconGear,
  },
] as const;

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
              active
                ? "bg-peach text-white shadow-sm"
                : "text-ink hover:bg-surface-muted",
            )}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/dev/progress"
        onClick={onNavigate}
        className="mt-3 min-h-11 rounded-2xl px-3 py-2.5 text-xs font-medium text-coral hover:bg-bubble/60"
      >
        开发进度
      </Link>
    </nav>
  );
}

export function MainShell({
  children,
  pets = [],
  currentPetId,
  showLoginLink = false,
}: {
  children: React.ReactNode;
  pets?: { id: string; name: string }[];
  currentPetId: string;
  showLoginLink?: boolean;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="isolate flex min-h-0 flex-1 flex-col bg-canvas md:flex-row">
      <header className="flex min-h-14 items-center justify-between border-b border-line bg-surface/90 px-4 py-2 backdrop-blur-md md:hidden">
        <div className="flex flex-col">
          <span className="text-base font-bold text-ink">宠物乐园</span>
          <span className="text-[0.65rem] text-ink-muted">陪宠物一起成长</span>
        </div>
        <button
          type="button"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl border-2 border-line bg-surface-muted text-ink"
          aria-expanded={drawerOpen}
          aria-label={drawerOpen ? "关闭菜单" : "打开菜单"}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          {drawerOpen ? <IconClose /> : <IconMenu />}
        </button>
      </header>

      {drawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[45] bg-ink/20 md:hidden"
          aria-label="关闭菜单"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 max-w-[85vw] border-r border-line bg-surface p-4 shadow-xl transition-transform duration-200 ease-out md:static md:shadow-none",
          /* 抽屉打开时盖在主内容之上；收起时降 z-index 并禁用命中，避免挡主区（仅靠 pointer-events 在部分内核仍异常） */
          drawerOpen
            ? "z-[50] translate-x-0 pointer-events-auto"
            : "-translate-x-full z-[30] max-md:pointer-events-none md:translate-x-0 md:z-0 md:pointer-events-auto",
        )}
      >
        <div className="mb-6 hidden md:block">
          <div className="text-lg font-bold tracking-tight text-ink">
            宠物乐园
          </div>
          <p className="mt-1 text-xs leading-snug text-ink-muted">
            陪宠物一起成长 · 暖色浅色模式
          </p>
        </div>
        <PetNavSwitcher pets={pets} currentPetId={currentPetId} />
        <NavLinks
          pathname={pathname}
          onNavigate={() => setDrawerOpen(false)}
        />
        {showLoginLink ? (
          <AuthNavLinks onNavigate={() => setDrawerOpen(false)} />
        ) : null}
      </aside>

      <main className="relative z-[40] min-h-0 flex-1 overflow-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPaw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 14c-2 0-3.5 1.5-4 3.5-.3 1.2.5 2.5 1.8 2.5h4.4c1.3 0 2.1-1.3 1.8-2.5-.5-2-2-3.5-4-3.5zM6.5 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM9 7a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
    </svg>
  );
}

function IconShop({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M3 10h18l-1.5 9H4.5L3 10z" strokeLinejoin="round" />
      <path d="M16 10V7a4 4 0 00-8 0v3" strokeLinecap="round" />
    </svg>
  );
}

function IconRules({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function IconGear({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Zm7.43-2.57a7.95 7.95 0 0 0 .07-1 7.95 7.95 0 0 0-.07-1l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.35 7.35 0 0 0-1.73-1l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42L9.13 5.07c-.62.24-1.2.55-1.73 1l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64L4.54 9.9a7.95 7.95 0 0 0-.07 1c0 .34.02.67.07 1l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.53.45 1.11.76 1.73 1l.38 2.65a.5.5 0 0 0 .49.42h4a.5.5 0 0 0 .49-.42l.38-2.65c.62-.24 1.2-.55 1.73-1l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65Z" />
    </svg>
  );
}
