/** 与 NextAuth / getToken 共用，避免 middleware 与 auth 配置重复散落 */
export function getAuthSecret(): string | undefined {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "development-only-auth-secret-min-32-characters!")
  );
}
