[CmdletBinding()]
param(
  [string]$Branch = "",
  [switch]$Force,
  [switch]$SkipGitPull,
  [int]$HealthTimeoutSec = 120
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $RepoRoot

# Load .env values if present (does not overwrite existing environment variables)
$EnvFile = Join-Path $RepoRoot ".env"
if (Test-Path $EnvFile) {
  Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
      $key = $matches[1]
      $val = $matches[2].Trim().Trim('"').Trim("'")
      if (-not [Environment]::GetEnvironmentVariable($key)) {
        [Environment]::SetEnvironmentVariable($key, $val)
      }
    }
  }
}

if (-not $Branch) {
  $Branch = if ($env:DEPLOY_BRANCH) { $env:DEPLOY_BRANCH } else { "main" }
}
$AppPort = if ($env:APP_PORT) { $env:APP_PORT } else { "3000" }
$HealthUrl = "http://127.0.0.1:$AppPort/api/health"

# Prepare log directory & lock file
$LogDir = Join-Path $RepoRoot "deploy-logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$LogFile = Join-Path $LogDir "deploy.log"
$LockFile = Join-Path $LogDir "deploy.lock"

function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $entry = "[$ts] [$Level] $Message"
  Write-Host $entry
  Add-Content -Path $LogFile -Value $entry
}

if (Test-Path $LockFile) {
  $lockAge = (Get-Date) - (Get-Item $LockFile).LastWriteTime
  if ($lockAge.TotalMinutes -lt 30) {
    Write-Log "Another deployment is currently in progress (lock: $LockFile). Exiting." "WARN"
    exit 0
  }
  Write-Log "Removing stale deploy lock file (age: $([int]$lockAge.TotalMinutes)m)." "WARN"
  Remove-Item $LockFile -Force
}

Set-Content -Path $LockFile -Value "PID=$PID Started=$(Get-Date -Format o)"

try {
  Write-Log "=== Deploy started (branch: $Branch, force: $Force, skipGitPull: $SkipGitPull) ==="

  if (-not $SkipGitPull) {
    Write-Log "Fetching origin/$Branch..."
    git fetch origin $Branch
    if ($LASTEXITCODE -ne 0) { throw "git fetch origin $Branch failed." }

    $localSha = (git rev-parse HEAD).Trim()
    $remoteSha = (git rev-parse "origin/$Branch").Trim()

    if ($localSha -eq $remoteSha -and -not $Force) {
      Write-Log "Already up to date at $($localSha.Substring(0, 7)). No deploy needed."
      exit 0
    }

    # Protect local uncommitted changes
    $dirty = git status --porcelain
    if ($dirty) {
      Write-Log "Working tree has uncommitted changes. Aborting auto-pull to prevent data loss." "ERROR"
      Write-Log "Commit or stash your changes first, or run with -SkipGitPull to deploy current files." "ERROR"
      exit 1
    }

    $currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
    if ($currentBranch -ne $Branch) {
      Write-Log "Switching branch from $currentBranch to $Branch..."
      git checkout $Branch
      if ($LASTEXITCODE -ne 0) { throw "git checkout $Branch failed." }
    }

    Write-Log "Pulling latest commits from origin/$Branch ($($localSha.Substring(0,7)) -> $($remoteSha.Substring(0,7)))..."
    git pull --ff-only origin $Branch
    if ($LASTEXITCODE -ne 0) { throw "git pull --ff-only origin $Branch failed." }
  }

  $deployedCommit = (git log -1 --format="%h %s").Trim()
  Write-Log "Building and starting Docker Compose stack for commit: $deployedCommit"

  docker compose up -d --build --remove-orphans
  if ($LASTEXITCODE -ne 0) { throw "docker compose up -d --build failed." }

  Write-Log "Waiting for health check at $HealthUrl (timeout: ${HealthTimeoutSec}s)..."
  $deadline = (Get-Date).AddSeconds($HealthTimeoutSec)
  $healthy = $false

  while ((Get-Date) -lt $deadline) {
    try {
      $resp = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 5
      if ($resp.StatusCode -eq 200) {
        $healthy = $true
        Write-Log "Health check PASSED (HTTP 200): $($resp.Content)"
        break
      }
    } catch {
      Start-Sleep -Seconds 3
    }
  }

  if (-not $healthy) {
    Write-Log "Health check TIMED OUT after ${HealthTimeoutSec}s. Recent web container logs:" "ERROR"
    docker compose logs web --tail 40 | ForEach-Object { Write-Log $_ "DOCKER" }
    throw "Deployment failed health check."
  }

  Write-Log "Pruning dangling Docker images..."
  docker image prune -f | Out-Null

  Write-Log "=== Deploy SUCCEEDED ($deployedCommit) | App: http://localhost:$AppPort ==="
  exit 0
}
catch {
  Write-Log "Deploy FAILED: $($_.Exception.Message)" "ERROR"
  exit 1
}
finally {
  if (Test-Path $LockFile) {
    Remove-Item $LockFile -Force -ErrorAction SilentlyContinue
  }
}
