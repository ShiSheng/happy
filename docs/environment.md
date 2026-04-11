# 环境变量

复制仓库根目录的 `.env.example` 为 `.env` 并按需修改。

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Prisma 连接串。开发默认 SQLite：`file:./dev.db`（文件位于项目根目录）。生产可换为 PostgreSQL。 |
| `DEFAULT_USER_ID` | 可选。指定默认操作所绑定的用户 id；不设置时取数据库中最早创建的用户（seed 后的演示账号）。 |

## 本地初始化数据库

```bash
npx prisma migrate dev
npx prisma db seed
```

## CI

流水线使用 `file:./prisma/ci.db` 执行 `prisma migrate deploy` 与 `db seed`，与本地 `dev.db` 分离。

## 界面与 E2E

- 当前为**浅色暖色**主题，未提供暗色模式。
- `npm run test:e2e` 使用 `next start -p 3005`，**需先**成功执行 `npm run build`（且已配置 `DATABASE_URL`）。
- 可选截图回归：见仓库内 `e2e/visual.spec.ts`，需设置 `VISUAL_SNAPSHOT=1`；首次基线加 `--update-snapshots`。
