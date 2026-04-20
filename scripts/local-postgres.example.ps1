# 复制为 local-postgres.ps1（已 gitignore）后修改密码再运行；或直接调用 setup-local-dev.ps1
# Copy-Item scripts\local-postgres.example.ps1 scripts\local-postgres.ps1
$ErrorActionPreference = "Stop"
& "$PSScriptRoot\setup-local-dev.ps1" `
  -PostgresRoot 'D:\soft\PostgreSQL' `
  -Password '请改成你的postgres密码' `
  -RunMigrations `
  -ForceEnv
