param([switch]$DesktopOnly)
$ErrorActionPreference='Stop'
& (Join-Path $PSScriptRoot 'sync-version.ps1')
$desktopBuildDir=Split-Path -Parent $PSScriptRoot
$compiler=Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
& $compiler /nologo /target:winexe ('/win32manifest:'+(Join-Path $PSScriptRoot 'app.manifest')) /platform:x64 /optimize+ ('/win32icon:'+(Join-Path $desktopBuildDir 'FramingStudio.ico')) ('/out:'+(Join-Path $desktopBuildDir 'FramingStudio.exe')) /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.Web.Extensions.dll /reference:System.Net.Http.dll ('/reference:'+(Join-Path $desktopBuildDir 'Microsoft.Web.WebView2.Core.dll')) ('/reference:'+(Join-Path $desktopBuildDir 'Microsoft.Web.WebView2.WinForms.dll')) (Join-Path $PSScriptRoot 'FramingStudio.cs')
if($LASTEXITCODE -ne 0){throw 'Desktop compile failed'}
if($DesktopOnly){exit 0}
& $compiler /nologo /target:exe /platform:x64 /optimize+ ('/out:'+(Join-Path $desktopBuildDir 'Excel/ExcelBridge.exe')) /reference:System.Web.Extensions.dll /reference:Microsoft.CSharp.dll (Join-Path $PSScriptRoot 'ExcelBridge.cs')
if($LASTEXITCODE -ne 0){throw 'Excel bridge compile failed'}
