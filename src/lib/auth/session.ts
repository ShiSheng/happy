/**
 * AUTH_ENABLED=true 时使用 NextAuth 会话用户 id；
 * 否则返回 null，由 getDefaultUserId 走 DEFAULT_USER_ID / 库内首用户。
 */
export async function getSessionUserId(): Promise<string | null> {
  if (process.env.AUTH_ENABLED !== "true") return null;
  const { auth } = await import("@/auth");
  const session = await auth();
  const id = session?.user?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}
