/**
 * 与 NextAuth / getToken 共用。
 *
 * 未开启 AUTH_ENABLED 时根布局不挂 SessionProvider；仅 /login、/register 路由在 (auth) 布局下按需挂载。
 * 生产且未设 AUTH_SECRET、但有人访问登录页时 Auth.js 仍需要 secret，此时使用固定占位（勿在开启登录时依赖此值）。
 * 生产且 AUTH_ENABLED=true 时必须配置 AUTH_SECRET 或 NEXTAUTH_SECRET。
 */
const PRODUCTION_DEMO_AUTH_SECRET =
  "happy-demo-auth-secret-min-32-chars-do-not-use-with-login-enabled";

export function getAuthSecret(): string {
  const fromEnv = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") {
    return "development-only-auth-secret-min-32-characters!";
  }
  if (process.env.AUTH_ENABLED === "true") {
    throw new Error(
      "生产环境已设置 AUTH_ENABLED=true，必须在环境变量中配置 AUTH_SECRET 或 NEXTAUTH_SECRET（建议 openssl rand -base64 32）。",
    );
  }
  return PRODUCTION_DEMO_AUTH_SECRET;
}
