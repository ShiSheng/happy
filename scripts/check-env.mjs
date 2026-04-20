/**
 * 校验本地 .env / .env.local 中的数据库与关键变量（不连库，仅格式与必填项）。
 * 用法：在项目根目录执行 `npm run env:check`
 */
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq <= 0) continue;
    const key = s.slice(0, eq).trim();
    let val = s.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

// 与 Next 类似：shell 环境优先，其次 .env.local 覆盖 .env
const merged = {
  ...parseEnvFile(".env"),
  ...parseEnvFile(".env.local"),
};
for (const [k, v] of Object.entries(merged)) {
  if (process.env[k] === undefined) process.env[k] = v;
}

let failed = false;

function needPostgresUrl(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`[env] 缺少 ${name}。请复制 .env.example 为 .env 并填写。`);
    failed = true;
    return;
  }
  if (!/^postgres(ql)?:\/\//i.test(v.trim())) {
    console.error(
      `[env] ${name} 须为 PostgreSQL 连接串（以 postgresql:// 或 postgres:// 开头），当前值不符合。`,
    );
    failed = true;
  }
}

needPostgresUrl("DATABASE_URL");
needPostgresUrl("DIRECT_URL");

if (process.env.AUTH_ENABLED === "true") {
  if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    console.error(
      "[env] AUTH_ENABLED=true 时必须设置 AUTH_SECRET 或 NEXTAUTH_SECRET。",
    );
    failed = true;
  }
  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!authUrl) {
    console.warn(
      "[env] 提示：已开启登录。用手机/局域网 IP 访问时，建议在 .env 设置 AUTH_URL 为浏览器地址栏的根 URL，例如 http://192.168.1.5:3000，避免 NextAuth 回调异常。",
    );
  }
}

if (failed) {
  process.exit(1);
}

try {
  execSync("npx prisma validate", { stdio: "inherit" });
} catch {
  process.exit(1);
}

console.log("[env] DATABASE_URL / DIRECT_URL 与 prisma validate 检查通过。");
