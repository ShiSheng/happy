import { AuthProvider } from "@/components/providers/AuthProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const inner = (
    <div className="flex min-h-full flex-1 flex-col bg-canvas p-4 md:p-8">
      {children}
    </div>
  );
  /** 关闭全站登录时根布局不挂 SessionProvider；/login 仍依赖 next-auth/react */
  if (process.env.AUTH_ENABLED !== "true") {
    return <AuthProvider>{inner}</AuthProvider>;
  }
  return inner;
}
