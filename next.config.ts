import type { NextConfig } from "next";

/**
 * next-auth/react 客户端打包时只读 NEXTAUTH_URL，不读 AUTH_URL。
 * 只配 AUTH_URL 时，这里把同源地址同步给 NEXTAUTH_URL，避免仍回落到 localhost。
 * 若终端里曾 export 过 NEXTAUTH_URL=localhost，会覆盖 .env —— 启动前可先清环境变量。
 */
const authCanonical = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";

/** 供 Server Actions CSRF 校验：Origin 的 host（含端口，如 192.168.1.2:3000），无协议。 */
function hostFromAppUrl(url: string): string | null {
  const t = url.trim();
  if (!t) return null;
  try {
    const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    return new URL(withScheme).host;
  } catch {
    return null;
  }
}

function parseOriginHosts(s: string | undefined): string[] {
  if (!s) return [];
  return s
    .split(/[, \n\r\t]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** allowedDevOrigins 用：文档要求是域名/主机（不支持 CIDR），这里统一解析成 host（可含端口也无妨）。 */
const devOriginFromAuthUrl = hostFromAppUrl(authCanonical);
const extraAllowedDevOrigins = parseOriginHosts(
  process.env.ALLOWED_DEV_ORIGINS ?? process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS,
);

/**
 * 用局域网 IP 打开站点时，浏览器 Origin 为 192.168.x.x:3000，而 Host 常为 localhost:3000，
 * 二者不一致会导致 Next.js 拒绝 Server Actions（控制台 Invalid Server Actions request），
 * 表现为表单像刷新、按钮点击无反应。把实际访问地址写进 AUTH_URL / 或 SERVER_ACTIONS_ALLOWED_ORIGINS。
 */
const authUrlHost = hostFromAppUrl(authCanonical);
const serverActionAllowedOrigins = [
  ...new Set([
    "localhost:3000",
    "127.0.0.1:3000",
    ...parseOriginHosts(process.env.SERVER_ACTIONS_ALLOWED_ORIGINS),
    ...(authUrlHost ? [authUrlHost] : []),
  ]),
];

const nextConfig: NextConfig = {
  ...(authCanonical
    ? { env: { NEXTAUTH_URL: authCanonical } }
    : {}),
  /**
   * 局域网用 IP 访问 dev（如 http://192.168.x.x:3000）时需放行，否则 Next dev 会拦截 dev-only 资源，
   * 造成 `/_next/*` / `/__nextjs_*` 403，最终表现为「页面能显示但所有按钮都没反应」。
   *
   * 注意：allowedDevOrigins 不支持 CIDR（如 192.168.0.0/16），需写具体 host 或通配域名。
   */
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    ...(devOriginFromAuthUrl ? [devOriginFromAuthUrl] : []),
    ...extraAllowedDevOrigins,
  ],
  /** 勿把 next-auth 列入此列表，否则易导致客户端与 SessionProvider/React 解析异常 */
  serverExternalPackages: ["bcryptjs", "@prisma/client"],
  /**
   * Server Actions 默认仅允许约 1MB 请求体；形象上传允许 4MB，超限会导致连接中断，
   * 浏览器侧表现为 TypeError: Failed to fetch。
   */
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
      allowedOrigins: serverActionAllowedOrigins,
    },
  },
};

export default nextConfig;
