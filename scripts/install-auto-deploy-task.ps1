[CmdletBinding()]
param(
  [switch]$Uninstall,
  [string]$Branch = "main",
  [int]$IntervalSec = 30
)

$ErrorActionPreference = "Stop"
$TaskName = "ESTv2-AutoDeploy"
$WatchScript = (Resolve-Path (Join-Path $PSScriptRoot "auto-deploy-watch.ps1")).Path

if ($Uninstall) {
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed Windows Scheduled Task '$TaskName'."
  } else {
    Write-Host "Scheduled Task '$TaskName' does not exist."
  }
  exit 0
}

$pwshPath = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
if (-not $pwshPath) {
  $pwshPath = (Get-Command powershell).Source
}

$action = New-ScheduledTaskAction `
  -Execute $pwshPath `
  -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$WatchScript`" -Branch $Branch -IntervalSec $IntervalSec"

$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit (New-TimeSpan -Seconds 0)

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Auto-pulls origin/$Branch and redeploys ESTv2 Docker Compose stack." `
  -Force | Out-Null

Start-ScheduledTask -TaskName $TaskName
Write-Host "Registered & started Scheduled Task '$TaskName' (polling origin/$Branch every ${IntervalSec}s)."
Write-Host "Logs: deploy-logs/deploy.log | To remove: pwsh -File scripts/install-auto-deploy-task.ps1 -Uninstall"
