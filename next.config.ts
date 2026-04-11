import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Playwright / 非 localhost 访问 dev 时需放行 */
  allowedDevOrigins: ["127.0.0.1"],
  /**
   * Server Actions 默认仅允许约 1MB 请求体；形象上传允许 4MB，超限会导致连接中断，
   * 浏览器侧表现为 TypeError: Failed to fetch。
   */
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
