import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3005",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    /** 迁移 + seed 写入独立 e2e DB；NextAuth 中间件需 AUTH_SECRET */
    command:
      "npx prisma migrate deploy && npx prisma db seed && npx next start -p 3005",
    url: "http://127.0.0.1:3005",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL ?? "file:./prisma/e2e-local.db",
      AUTH_SECRET:
        process.env.AUTH_SECRET ??
        "playwright-e2e-auth-secret-min-32-characters!!",
    },
  },
});
