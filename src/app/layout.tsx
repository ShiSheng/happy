import type { Metadata } from "next";
import { auth } from "@/auth";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "宠物乐园 · 行为激励",
  description: "宠物养成与行为激励演示应用",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authEnabled = process.env.AUTH_ENABLED === "true";
  const session = authEnabled ? await auth() : null;

  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        {authEnabled ? (
          <AuthProvider session={session}>{children}</AuthProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
