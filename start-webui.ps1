param(
    [ValidateRange(1,65535)][int]$Port = 8783,
    [switch]$NoBrowser,
    [switch]$NoSync,
    [switch]$Foreground,
    [string]$PythonExe
)
$ErrorActionPreference = 'Stop'
$appRoot287 = Join-Path $PSScriptRoot 'FramingStudio'
$source287 = Join-Path $appRoot287 'source'
$url287 = "http://127.0.0.1:$Port/"
$html287 = Join-Path $appRoot287 'assets/index.html'
$server287 = Join-Path $source287 'preview-server251.py'
$pythonArgs287 = @()
if (-not $PythonExe) {
    $python287 = Get-Command python -ErrorAction SilentlyContinue
    if ($python287 -and $python287.Source -notmatch 'WindowsApps') { $PythonExe = $python287.Source }
    else {
        $pyLauncher287 = Get-Command py -ErrorAction SilentlyContinue
        if ($pyLauncher287) { $PythonExe = $pyLauncher287.Source; $pythonArgs287 = @('-3') }
    }
}
if (-not $PythonExe) { throw 'Python 3 is required for WebUI. Use FramingStudio/FramingStudio.exe, or supply -PythonExe with an installed Python path.' }
if (-not $NoSync) {
    & $PythonExe @pythonArgs287 (Join-Path $source287 'sync-web.py')
    if ($LASTEXITCODE -ne 0) { throw 'Source synchronization failed.' }
}
$sha287 = [System.Security.Cryptography.SHA256]::Create()
try { $expectedHash287 = ([BitConverter]::ToString($sha287.ComputeHash([IO.File]::ReadAllBytes($html287)))).Replace('-','') }
finally { $sha287.Dispose() }
function Test-Port287 {
    $client287 = New-Object System.Net.Sockets.TcpClient
    try { $pending287=$client287.BeginConnect('127.0.0.1',$Port,$null,$null); return ($pending287.AsyncWaitHandle.WaitOne(350) -and $client287.Connected) }
    finally { $client287.Dispose() }
}
function Test-Content287 {
    $request287 = [System.Net.HttpWebRequest]::Create($url287 + '?verify=' + [Guid]::NewGuid().ToString('N'))
    $request287.Timeout=2000
    $request287.ReadWriteTimeout=2000
    $request287.AllowAutoRedirect=$false
    $response287=$null
    try {
        $response287=$request287.GetResponse()
        $buffer287=New-Object System.IO.MemoryStream
        try {
            $response287.GetResponseStream().CopyTo($buffer287)
            $hash287=[System.Security.Cryptography.SHA256]::Create()
            try { $actual287=([BitConverter]::ToString($hash287.ComputeHash($buffer287.ToArray()))).Replace('-','') }
            finally { $hash287.Dispose() }
            return ($actual287 -eq $expectedHash287 -and $response287.Headers['Cache-Control'] -match 'no-store')
        } finally { $buffer287.Dispose() }
    } catch { return $false }
    finally { if ($response287) { $response287.Dispose() } }
}
if (Test-Port287) {
    if (-not (Test-Content287)) { throw "Port $Port is serving another or older application. Existing service was left running. Stop that preview explicitly, then run this launcher again." }
    Write-Host "Verified existing preview: $url287 (no forced reload)"
    exit 0
}
if ($Foreground) {
    Write-Host "Preview: $url287 (Ctrl+C stops it). Open this address when ready."
    & $PythonExe @pythonArgs287 $server287 --root $appRoot287 --port $Port
    exit $LASTEXITCODE
}
$launchArgs287 = $pythonArgs287 + @(('"' + $server287 + '"'), '--root', ('"' + $appRoot287 + '"'), '--port', [string]$Port)
$process287 = Start-Process -FilePath $PythonExe -ArgumentList $launchArgs287 -WorkingDirectory $appRoot287 -WindowStyle Hidden -PassThru
$ready287=$false
for ($i287=0; $i287 -lt 30; $i287++) {
    if ($process287.HasExited) { break }
    if (Test-Content287) { $ready287=$true; break }
    Start-Sleep -Milliseconds 250
}
if (-not $ready287) { throw "Could not verify preview startup at $url287. No other service was stopped." }
Write-Host "Verified preview: $url287"
if (-not $NoBrowser) { Start-Process $url287 }
