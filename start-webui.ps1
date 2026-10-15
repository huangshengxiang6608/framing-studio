param(
    [int]$Port = 8783,
    [switch]$NoBrowser,
    [switch]$NoSync,
    [switch]$Foreground
)

$ErrorActionPreference = 'Stop'
$WorkspaceRoot = $PSScriptRoot
$AppRoot = Join-Path $WorkspaceRoot 'FramingStudio'
$SourceDir = Join-Path $AppRoot 'source'
$SyncScript = Join-Path $SourceDir 'sync-web.py'
$ServerScript = Join-Path $SourceDir 'preview-server251.py'
$Url = "http://127.0.0.1:$Port/"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Framing Studio WebUI Test Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Check Python environment
$PythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $PythonCmd) {
    throw "Python not found in PATH."
}

# 2. Sync frontend source modules into assets/index.html
if (-not $NoSync -and (Test-Path $SyncScript)) {
    Write-Host "[1/3] Syncing latest UI modules (sync-web.py)..." -ForegroundColor Yellow
    & $PythonCmd.Source $SyncScript
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to synchronize UI modules."
    }
} else {
    Write-Host "[1/3] Skipping source sync." -ForegroundColor DarkGray
}

# 3. Check if preview server is already running
function Test-WebUiReady([int]$TargetPort) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $async = $client.BeginConnect('127.0.0.1', $TargetPort, $null, $null)
        $wait = $async.AsyncWaitHandle.WaitOne(500, $false)
        if ($wait -and $client.Connected) {
            return $true
        }
        return $false
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

if (Test-WebUiReady $Port) {
    Write-Host "[2/3] Preview server is already running at: $Url" -ForegroundColor Green
} else {
    Write-Host "[2/3] Starting local preview server at: $Url ..." -ForegroundColor Yellow
    if ($Foreground) {
        if (-not $NoBrowser) {
            Start-Job -ScriptBlock {
                param($p, $u)
                for ($i = 0; $i -lt 30; $i++) {
                    Start-Sleep -Milliseconds 250
                    $c = New-Object System.Net.Sockets.TcpClient
                    try {
                        $a = $c.BeginConnect('127.0.0.1', $p, $null, $null)
                        if ($a.AsyncWaitHandle.WaitOne(300, $false) -and $c.Connected) {
                            Start-Process $u
                            break
                        }
                    } catch {} finally { $c.Close() }
                }
            } -ArgumentList $Port, $Url | Out-Null
        }
        Write-Host "[3/3] Running in foreground (Press Ctrl+C to stop): $Url" -ForegroundColor Green
        & $PythonCmd.Source $ServerScript --root $AppRoot --port $Port
        exit 0
    }

    Start-Process -FilePath $PythonCmd.Source `
        -ArgumentList @("`"$ServerScript`"", "--root", "`"$AppRoot`"", "--port", "$Port") `
        -WorkingDirectory $AppRoot `
        -WindowStyle Hidden

    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 250
        if (Test-WebUiReady $Port) {
            $ready = $true
            break
        }
    }

    if (-not $ready) {
        throw "Server failed to start within timeout on port $Port."
    }
    Write-Host "      Preview server started!" -ForegroundColor Green
}

# 4. Open default browser
if (-not $NoBrowser) {
    Write-Host "[3/3] Opening browser: $Url" -ForegroundColor Green
    Start-Process $Url
} else {
    Write-Host "[3/3] Ready at: $Url (Browser launch skipped)" -ForegroundColor Green
}
