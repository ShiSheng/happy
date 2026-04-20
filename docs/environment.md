# 环境变量

复制 [`.env.example`](../.env.example) 为 `.env`（可再建 `.env.local` 覆盖敏感项）。**不要**把真实 `.env` 提交到 Git。

Windows 无 Docker、PostgreSQL 想装在 **E:/、D:/** 等非 C 盘：见 [postgresql-windows-non-c.md](./postgresql-windows-non-c.md)。创建本机库可运行 `.\scripts\init-local-db.ps1`。

自检（不连库，会跑 `prisma validate`）：

```bash
npm run env:check
```

## 变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | 是 | Prisma **运行时**用的 PostgreSQL 连接串。Neon 等建议 **Pooled**。 |
| `DIRECT_URL` | 是 | **`prisma migrate deploy` / `migrate dev`** 等迁移命令使用的直连串；本地可与 `DATABASE_URL` 相同。Neon 用 **Direct**。 |
| `DEFAULT_USER_ID` | 否 | 演示模式下固定绑定的用户 id；不设则取库内 `createdAt` 最早的用户。 |
| `AUTH_ENABLED` | 否 | 设为 `true` 启用账号登录与中间件保护。 |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | 条件 | `AUTH_ENABLED=true` 时**必须**设置其一（随机长串）。 |
| `AUTH_URL` / `NEXTAUTH_URL` | 建议 | **与浏览器地址栏完全一致**（含 `http://`、主机名或 IP、端口）。`localhost` 与 `192.168.x.x` 是不同站点；若只配了 `http://localhost:3000`，用局域网 IP 打开时登录会失败，会话 Cookie 也不会在两者之间共享。 |
| `SEED_DEMO_PASSWORD` | 否 | `prisma db seed` 创建 `demo` 用户时的密码，默认 `demo123`。 |

## 本地初始化数据库

确保 Postgres 已启动且库已创建（与连接串中的库名一致），然后：

```bash
npm run env:check
npx prisma migrate deploy
npm run db:seed
npm run dev
```

开发中改 schema 可用 `npx prisma migrate dev` 代替 `migrate deploy`。

## 常见错误

- **`Environment variable not found: DATABASE_URL` / `DIRECT_URL`**：根目录缺少 `.env`，或变量名拼错；两者都要为 **PostgreSQL** 协议（`postgresql://`），不能与仍使用 SQLite 的旧教程混用。
- **`Can't reach database server`**：检查 Postgres 是否监听、防火墙、以及是否应使用 `127.0.0.1` 替代 `localhost`。
- **Prisma Client 类型与 `schema.prisma` 不一致**：关闭占用文件的进程后执行 `npx prisma generate`（Windows 上勿同时跑 `next dev` 时再 generate）。

## CI

GitHub Actions 使用 `services: postgres`，`DATABASE_URL` 与 `DIRECT_URL` 均为 `postgresql://postgres:postgres@localhost:5432/happy_ci`。

## 界面与 E2E

- `npm run test:e2e` 需已配置数据库环境变量（见 `playwright.config.ts` 默认值或自行覆盖）。
- 可选截图回归：仓库内 `e2e/visual.spec.ts`，`VISUAL_SNAPSHOT=1`，首次基线加 `--update-snapshots`。
