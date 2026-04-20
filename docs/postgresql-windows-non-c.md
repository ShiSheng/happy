# Windows：PostgreSQL 安装到非 C 盘（无 Docker / 无 WSL）

本机开发库与 Vercel 线上库分离：本地连接串写在 `.env`，不要用线上 `DATABASE_URL`。

## 1. 下载安装包

打开：[https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)  
点击 **Download the installer**，选择 **Windows x86-64**（版本选 **16** 或 **17** 均可）。

## 2. 运行安装向导（关键：改路径）

1. **Installation Directory（安装目录）**
  不要保留默认的 `C:\Program Files\PostgreSQL\...`。  
   改为例如：
  - `E:\PostgreSQL\16`  
   或  
  - `D:\Apps\PostgreSQL\16`
2. **Data Directory（数据目录）**
  同样放到**同一盘**下，例如：
  - `E:\PostgreSQL\16\data`  
   与安装目录分开即可（不要放在项目仓库 `E:\code\happy` 里，避免误删）。
3. **密码**
  为超级用户 `**postgres`** 设置密码并**记下来**（本地开发用）。
4. **端口**
  保持默认 **5432**（若已被占用，可改 5433，并在连接串里改端口）。
5. **Locale**
  默认即可。
6. 完成安装。安装程序会注册 **Windows 服务**（服务名类似 `postgresql-x64-16`），数据在你在第 2 步选的目录。

## 3. 把 `psql` 加到 PATH（可选）

若命令行里直接打 `psql` 提示找不到：

- **设置 → 系统 → 关于 → 高级系统设置 → 环境变量 → Path**  
新增一项，例如：`E:\PostgreSQL\16\bin`（按你实际安装目录改）。

新开一个 **PowerShell** 窗口后再试 `psql --version`。

## 4. 创建本机开发库

在 **PowerShell** 中（把路径、密码换成你的）：

```powershell
# 若未加 PATH，用完整路径：
# & "E:\PostgreSQL\16\bin\psql.exe" -U postgres -h 127.0.0.1 -d postgres -c "CREATE DATABASE happy_dev;"
psql -U postgres -h 127.0.0.1 -d postgres -c "CREATE DATABASE happy_dev;"
```

提示输入密码时，填安装时为 `postgres` 设的密码。

也可用仓库脚本（见下）。

## 5. 一键生成 `.env` 并建库（推荐）

在仓库根目录用 **PowerShell** 执行（将路径、密码改成你的；密码勿提交到 Git）：

```powershell
.\scripts\setup-local-dev.ps1 -PostgresRoot "D:\soft\PostgreSQL" -Password "你的密码" -RunMigrations -ForceEnv
```

或先设环境变量再运行（避免出现在命令行历史里）：

```powershell
$env:HAPPY_LOCAL_POSTGRES_PASSWORD = "你的密码"
npm run setup:local -- -RunMigrations -ForceEnv
```

说明：`setup-local-dev.ps1` 会在 `D:\soft\PostgreSQL`（或你指定的根目录）下查找 `psql.exe`、创建库 `happy_dev`、写入根目录 `.env`，并在 `-RunMigrations` 时执行 `prisma migrate deploy` 与 `db seed`。

若你使用本仓库提供的 `**scripts/local-postgres.ps1**`（默认已加入 `.gitignore`，可保存本机密码），直接执行：

```powershell
.\scripts\local-postgres.ps1
```

新环境可复制 `scripts/local-postgres.example.ps1` 为 `local-postgres.ps1` 再改密码。

---

## 5b. 手动配置 `.env`（不用脚本时）

```bash
copy .env.example .env
```

将 `DATABASE_URL` 与 `DIRECT_URL` 改为本机库。**注意**：密码里若含 `@ # :` 等特殊字符，需 URL 编码。

```bash
npm run env:check
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## 6. 与线上（Vercel）区分


| 项目   | 本地                        | Vercel / 线上          |
| ---- | ------------------------- | -------------------- |
| 配置位置 | 本机 `.env` / `.env.local`  | Vercel 环境变量          |
| 连接串  | `127.0.0.1` + `happy_dev` | Neon 等提供的 URL        |
| 迁移   | `migrate dev` / `deploy`  | 构建里 `migrate deploy` |


不要把 Neon 的生产连接串写进提交到 Git 的 `.env`。

## 常见问题

- **无法用 `localhost` 连接**：改用 `**127.0.0.1`**（减少 IPv6 解析问题）。  
- **防火墙**：仅本机连库一般不需要改防火墙；若从局域网其它机器连库，再单独放行端口。

