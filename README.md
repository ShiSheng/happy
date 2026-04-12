# 宠物乐园（happy）

Next.js 16 + Prisma + PostgreSQL 的行为激励与宠物养成演示应用。

## 本地开发

需本机或 Docker 可访问的 **PostgreSQL**（示例：`docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=happy postgres:16-alpine`）。在 `.env` 中设置 `DATABASE_URL`，例如 `postgresql://postgres:postgres@localhost:5432/happy`。

```bash
npm install
cp .env.example .env   # 按需填写 DATABASE_URL
npx prisma migrate deploy
npm run db:seed
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)，会进入宠物乐园。

### 环境变量

见根目录 [`.env.example`](.env.example)。**勿**将含真实密钥的 `.env` 提交到 Git。

### Prisma（Windows `EPERM`）

若 `npx prisma generate` 报错无法替换 `query_engine-windows.dll.node`，请先**关闭**正在运行的 `next dev` / 其他占用该文件的进程，再执行 generate。

### 当前参展宠物

多宠时，侧栏可切换「当前宠物」；系统设置里也可「设为当前参展」。乐园互动、历史与经验结算均绑定该宠物。

### 可选登录（`AUTH_ENABLED`）

默认关闭：使用 `DEFAULT_USER_ID` 或库内最早用户。

开启步骤：

1. `.env` 中设置 `AUTH_ENABLED=true`
2. 设置 `DEMO_LOGIN_SECRET`（登录页口令）
3. 设置 `AUTH_SECRET`（或 `NEXTAUTH_SECRET`，随机字符串）
4. 访问 `/login` 输入口令登录；未登录访问业务页会被中间件重定向到登录页

生产环境请改用正规身份方案（OAuth、邮箱魔法链接等），并替换 `src/auth.ts` 中的 Credentials 逻辑。

---

## 推送到 GitHub

1. 在 GitHub 新建空仓库（可不勾选自动添加 README，减少首次 push 冲突）。
2. 本地确认 [`.gitignore`](.gitignore) 已忽略：`node_modules`、`.env*`、`.next`、`*.db`、`public/uploads/pets/` 等。
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

   其中已包含 `prisma migrate deploy`（应用迁移）+ `prisma generate` + `next build`。

3. **数据库**：在 Vercel **Environment Variables** 中配置 `DATABASE_URL` 为托管 Postgres 连接串（**Neon / Supabase / Vercel Postgres** 等）。首次部署前在空库上执行迁移（`vercel-build` 已包含 `prisma migrate deploy`）。本地开发同样需要 Postgres，见下文。

4. **上传图片**：`public/uploads` 在 Serverless 上**非持久**。生产环境长期方案为对象存储（S3 / R2 等）；当前实现适合本地开发。

5. 若启用登录：在 Vercel 中同样配置 `AUTH_ENABLED`、`DEMO_LOGIN_SECRET`、`AUTH_SECRET`，并确保生产数据库已 `seed` 出用户后再登录。

---

## 脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run build` | 本地构建（不含 migrate deploy） |
| `npm run vercel-build` | 适合 CI/Vercel：migrate + generate + build |
| `npm run test` | Vitest 单元测试 |
| `npm run test:e2e` | Playwright E2E（需先 `npx playwright install`） |
| `npm run db:seed` | 写入演示用户/规则/礼物等 |

---

## 许可证

私有项目按仓库设定为准。
