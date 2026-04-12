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
      /** 默认连本机 Postgres；无库时可 `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=happy_e2e postgres:16-alpine` */
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://postgres:postgres@127.0.0.1:5432/happy_e2e",
      AUTH_SECRET:
        process.env.AUTH_SECRET ??
        "playwright-e2e-auth-secret-min-32-characters!!",
    },
  },
});
