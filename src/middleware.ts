import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthSecret } from "@/lib/auth-secret";

/**
 * 不在此引用 @/auth 或 Prisma：NextAuth 包装器会把 Prisma WASM 打进 Edge，超过 Vercel 1MB 限额。
 * 开启登录时仅用 JWT cookie 校验，与 Credentials + JWT 会话策略一致。
 */
export async function middleware(req: NextRequest) {
  if (process.env.AUTH_ENABLED !== "true") {
    return NextResponse.next();
  }
  const p = req.nextUrl.pathname;
  if (
    p.startsWith("/login") ||
    p.startsWith("/register") ||
    p.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const secret = getAuthSecret();

  const isHttps = req.nextUrl.protocol === "https:";
  const token = await getToken({
    req,
    secret,
    secureCookie: isHttps,
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
