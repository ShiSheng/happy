"use client";

import type { Session } from "next-auth";
import { useLayoutEffect } from "react";
import { SessionProvider, __NEXTAUTH } from "next-auth/react";

const DEFAULT_AUTH_PATH = "/api/auth";

/**
 * next-auth 在打包时用 NEXTAUTH_URL 初始化 __NEXTAUTH，易仍为 localhost。
 * 用 IP 访问时，在客户端把 origin 同步为当前页面，避免请求打到 localhost。
 */
function syncAuthClientOrigin() {
  if (typeof window === "undefined") return;
  const origin = window.location.origin;
  __NEXTAUTH.baseUrl = origin;
  __NEXTAUTH.baseUrlServer = origin;
  __NEXTAUTH.basePath = DEFAULT_AUTH_PATH;
  __NEXTAUTH.basePathServer = DEFAULT_AUTH_PATH;
}

/**
 * 客户端 chunk 加载时立即同步，确保 SessionProvider 首次 render 前 __NEXTAUTH 已是当前页 origin
 *（仅用 useLayoutEffect 会晚于子组件 render 内对 __NEXTAUTH 的读取）。
 */
if (typeof window !== "undefined") {
  syncAuthClientOrigin();
}

/**
 * @param session 由服务端 `auth()` 传入时可避免 SessionProvider 与 HTML 水合不一致（否则易出现「有点击动效但 onClick 不执行」）。
 * 未开启全站登录时 (auth) 布局可不传，由客户端自行拉 session。
 */
export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  useLayoutEffect(() => {
    syncAuthClientOrigin();
  }, []);

  return (
    <SessionProvider basePath={DEFAULT_AUTH_PATH} session={session}>
      {children}
    </SessionProvider>
  );
}
