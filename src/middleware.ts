import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (process.env.AUTH_ENABLED !== "true") {
    return NextResponse.next();
  }
  const p = req.nextUrl.pathname;
  if (p.startsWith("/login") || p.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  if (!req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
