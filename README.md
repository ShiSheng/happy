# 宠物乐园（happy）

Next.js 16 + Prisma + PostgreSQL 的行为激励与宠物养成演示应用。

## 本地开发

需本机 **PostgreSQL**（与 Vercel 线上库分开，本地库名建议 `happy_dev`）。**无 Docker 的 Windows** 且不想装 C 盘：按 [`docs/postgresql-windows-non-c.md`](docs/postgresql-windows-non-c.md) 安装到 E:/ 或 D:/，可选运行 `.\scripts\init-local-db.ps1` 创建库。有 Docker 时可用：`docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=happy_dev postgres:16-alpine`。在 `.env` 中设置 `DATABASE_URL` 与 `DIRECT_URL`，见 `[.env.example](.env.example)`。

```bash
npm install
cp .env.example .env   # 按需填写 DATABASE_URL、DIRECT_URL（示例已用 127.0.0.1，减少 Windows 上 localhost/IPv6 问题）
npm run env:check      # 校验变量格式并 prisma validate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)，会进入宠物乐园。

### 环境变量

见根目录 `[.env.example](.env.example)` 与 [`docs/environment.md`](docs/environment.md)。**勿**将含真实密钥的 `.env` 提交到 Git。

用手机/局域网 IP 访问且开启 `AUTH_ENABLED` 时，建议在 `.env` 设置 **`AUTH_URL`**（与浏览器地址栏根 URL 一致，含 `http://` 与端口）。

### Prisma（Windows `EPERM`）

若 `npx prisma generate` 报错无法替换 `query_engine-windows.dll.node`，请先**关闭**正在运行的 `next dev` / 其他占用该文件的进程，再执行 generate。

### 当前参展宠物

多宠时，侧栏可切换「当前宠物」；系统设置里也可「设为当前参展」。乐园互动、历史与经验结算均绑定该宠物。

### 可选多用户登录（`AUTH_ENABLED`）

默认关闭：使用 `DEFAULT_USER_ID` 或库内最早用户。

开启步骤：

1. `.env` 中设置 `AUTH_ENABLED=true`
2. 设置 `AUTH_SECRET`（或 `NEXTAUTH_SECRET`，随机字符串，生产必填）
3. 访问 `**/register`** 自助注册账号（2～20 位小写字母/数字/下划线，密码至少 6 位），或 seed 后使用演示账号 `**demo**`（密码见环境变量 `SEED_DEMO_PASSWORD`，默认 `demo123`）
4. 访问 `**/login**` 用账号密码登录；未登录访问业务页会被中间件重定向到登录页

生产环境若需更高安全（验证码、OAuth、邮箱验证等），可在 `src/auth.ts` 与注册逻辑上扩展。

---

## 推送到 GitHub

1. 在 GitHub 新建空仓库（可不勾选自动添加 README，减少首次 push 冲突）。
2. 本地确认 `[.gitignore](.gitignore)` 已忽略：`node_modules`、`.env*`、`.next`、`*.db`、`public/uploads/pets/` 等。
3. 关联远程并推送：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<你>/<仓库>.git
git branch -M main
git push -u origin main
```

---

## Vercel 部署

1. [Vercel](https://vercel.com) → New Project → Import 上述 GitHub 仓库，Framework Preset 选 **Next.js**。
2. **Build Command** 建议使用：
  ```bash
   npm run vercel-build
  ```
   其中已包含 `prisma migrate deploy` → `prisma generate` → `prisma db seed` → `next build`（**generate 须在 seed 之前**，否则 Client 与 schema 不一致）。
3. **数据库**：在 Vercel **Environment Variables** 中配置（**Production** 与需要的 **Preview** 都要勾选）：
  - `**DATABASE_URL`**：运行时连接串。**Neon** 建议用控制台里的 **Pooled**（若列出 `?sslmode=require` 请保留）。
  - `**DIRECT_URL`**：**迁移专用**直连串。Neon 用 **Direct**（非 `-pooler` 主机名）；Supabase 常用 **Session mode** 或直连端口。本地若只用一条串，两处可填相同值。
   `vercel-build` 会在构建时执行 `prisma migrate deploy`，需能连上 `DIRECT_URL`。若日志仍失败，请把 **Prisma 报错全文**（`Error code: P…` 起）复制出来排查。
   **构建报 `P3018`，日志里 `-- CreateTable` 前有多余不可见字符**：多为 **UTF-8 BOM**（例如用 PowerShell `Out-File` 生成迁移时）。`migration.sql` 须为 **UTF-8 无 BOM**，文件开头应直接是 `--`。
   **构建报 `P3009`（migrate found failed migrations）**：目标库里 `_prisma_migrations` 中有一条**失败**记录，新迁移会被拒绝。处理思路：
  - **库可清空**（常见：第一次部署试错了）：在托管方 SQL 控制台执行 `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`（并恢复 `public` 的默认权限，依提供商文档为准），再 Redeploy。
  - **保留库、只清失败标记**：在本机配置与 Vercel 相同的 `DIRECT_URL` 后执行  
  `npx prisma migrate resolve --rolled-back 20260412180000_init_postgres`  
  然后重新部署；若表结构其实已经建好，可改用 `--applied`（需确认与真实库一致）。
4. **上传图片**：`public/uploads` 在 Serverless 上**非持久**。生产环境长期方案为对象存储（S3 / R2 等）；当前实现适合本地开发。
5. 若启用登录：在 Vercel 中同样配置 `AUTH_ENABLED`、`AUTH_SECRET`（或 `NEXTAUTH_SECRET`）；构建会执行 `prisma db seed` 创建演示用户 `demo`（密码默认 `demo123`，可用 `SEED_DEMO_PASSWORD` 覆盖）。用户也可访问 `/register` 注册新账号。

---

## 脚本说明


| 命令                     | 说明                                          |
| ---------------------- | ------------------------------------------- |
| `npm run env:check`    | 检查 `.env` 数据库变量并 `prisma validate`        |
| `npm run dev`          | 开发服务器                                       |
| `npm run build`        | 本地构建（不含 migrate deploy）                     |
| `npm run vercel-build` | 适合 CI/Vercel：migrate → generate → seed → build |
| `npm run test`         | Vitest 单元测试                                 |
| `npm run test:e2e`     | Playwright E2E（需先 `npx playwright install`） |
| `npm run db:seed`      | 写入演示用户/规则/礼物等                               |


---

## 许可证

私有项目按仓库设定为准。