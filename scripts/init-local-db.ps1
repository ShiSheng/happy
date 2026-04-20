# 在已安装的 PostgreSQL 上创建本机开发库（默认 happy_dev）
# 说明：docs/postgresql-windows-non-c.md
#
# 用法：
#   .\scripts\init-local-db.ps1
#   .\scripts\init-local-db.ps1 -PgBin "E:\PostgreSQL\16\bin" -DatabaseName "happy_dev"
#
# 也可先设环境变量再运行（避免交互输入）：
#   $env:PGPASSWORD = "你的postgres密码"
#   .\scripts\init-local-db.ps1
param(
  [string] $DatabaseName = "happy_dev",
  [string] $PgBin = "",
  [string] $Host = "127.0.0.1",
  [string] $Port = "5432",
  [string] $User = "postgres"
)

$ErrorActionPreference = "Stop"

function Find-Psql {
  $cmd = Get-Command psql -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($p in @(
      "D:\soft\PostgreSQL\bin\psql.exe",
      "E:\PostgreSQL\18\bin\psql.exe",
      "E:\PostgreSQL\17\bin\psql.exe",
      "E:\PostgreSQL\16\bin\psql.exe",
      "D:\PostgreSQL\16\bin\psql.exe"
    )) {
    if (Test-Path $p) { return $p }
  }
  return $null
}

$psql = if ($PgBin) {
  Join-Path $PgBin.TrimEnd("\") "psql.exe"
} else {
  Find-Psql
}

if (-not $psql -or -not (Test-Path $psql)) {
  Write-Error "找不到 psql.exe。请先按 docs/postgresql-windows-non-c.md 安装到 E:/ 或 D:/，或用 -PgBin 指定 bin 目录。"
}

if (-not $env:PGPASSWORD) {
  $env:PGPASSWORD = Read-Host "输入 PostgreSQL 用户 [$User] 的密码"
}

# 单行便于 psql -c；库名仅允许字母数字下划线
if ($DatabaseName -notmatch '^[a-zA-Z0-9_]+$') {
  Write-Error "DatabaseName 仅允许字母、数字、下划线。"
}
$sql = "SELECT format('CREATE DATABASE %I', '$DatabaseName') WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '$DatabaseName');"

$tmp = [System.IO.Path]::GetTempFileName() + ".sql"
try {
  $gen = & $psql -U $User -h $Host -p $Port -d postgres -t -A -c $sql 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Error "查询失败: $gen"
  }
  $createStmt = ($gen | Out-String).Trim()
  if (-not $createStmt) {
    Write-Host "数据库已存在，跳过创建: $DatabaseName"
    exit 0
  }
  Set-Content -Path $tmp -Value "$createStmt;" -Encoding utf8
  & $psql -U $User -h $Host -p $Port -d postgres -v ON_ERROR_STOP=1 -f $tmp
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "已创建数据库: $DatabaseName"
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  if (Test-Path $tmp) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
}
