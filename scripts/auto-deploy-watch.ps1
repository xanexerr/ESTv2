[CmdletBinding()]
param(
  [string]$Branch = "",
  [int]$IntervalSec = 0
)

$ErrorActionPreference = "Continue"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $RepoRoot

# Load .env values if present
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
if ($IntervalSec -le 0) {
  $IntervalSec = if ($env:DEPLOY_POLL_SECONDS) { [int]$env:DEPLOY_POLL_SECONDS } else { 30 }
}

$DeployScript = Join-Path $PSScriptRoot "deploy.ps1"

Write-Host "[auto-deploy] Watching origin/$Branch every ${IntervalSec}s (Press Ctrl+C to stop)..."

while ($true) {
  try {
    $remoteLine = (git ls-remote origin "refs/heads/$Branch" 2>$null | Select-Object -First 1)
    if ($remoteLine) {
      $remoteSha = ($remoteLine -split "\s+")[0].Trim()
      $localSha = (git rev-parse HEAD 2>$null).Trim()

      if ($remoteSha -and $localSha -and $remoteSha -ne $localSha) {
        $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$ts] [auto-deploy] Detected new commit on origin/${Branch}: $($localSha.Substring(0,7)) -> $($remoteSha.Substring(0,7))"
        & $DeployScript -Branch $Branch
      }
    }
  }
  catch {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$ts] [auto-deploy] Poll error: $($_.Exception.Message)"
  }

  Start-Sleep -Seconds $IntervalSec
}
