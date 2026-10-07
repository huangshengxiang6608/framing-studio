$ErrorActionPreference='Stop'
$versionRoot=Split-Path -Parent $PSScriptRoot
$releaseVersion=Get-Content -LiteralPath (Join-Path $versionRoot 'version.json') -Raw | ConvertFrom-Json
if($releaseVersion.version -notmatch '^E2\.[0-9]+$'){throw 'Invalid release version'}
$windowsVersion=$releaseVersion.version.Substring(1)+'.0.0'
$versionFiles=@{}
$htmlPath=Join-Path $versionRoot 'assets/index.html'
$htmlText=[IO.File]::ReadAllText($htmlPath)
$htmlText=[regex]::Replace($htmlText,'<title>Framing Studio[^<]*</title>',('<title>Framing Studio · '+$releaseVersion.version+'</title>'))
$htmlText=[regex]::Replace($htmlText,'探索版 · E2\.\d+',('探索版 · '+$releaseVersion.version))
$htmlText=[regex]::Replace($htmlText,'(<div class="nav-bottom">)E2\.\d+',('$1'+$releaseVersion.version))
$versionFiles[$htmlPath]=$htmlText
$hostPath=Join-Path $PSScriptRoot 'FramingStudio.cs'
$hostText=[IO.File]::ReadAllText($hostPath)
$hostText=[regex]::Replace($hostText,'(Assembly(?:File)?Version\(")[^"]+("\))',('${1}'+$windowsVersion+'${2}'))
$hostText=[regex]::Replace($hostText,'E2\.\d+(?= Desktop)',$releaseVersion.version)
$hostText=[regex]::Replace($hostText,'(离线模式 · )E2\.\d+',('${1}'+$releaseVersion.version))
$versionFiles[$hostPath]=$hostText
$manifestPath=Join-Path $PSScriptRoot 'app.manifest'
$manifestText=[IO.File]::ReadAllText($manifestPath)
$manifestText=[regex]::Replace($manifestText,'(<assemblyIdentity version=")[^"]+(" name="FramingStudio.app")',('${1}'+$windowsVersion+'${2}'))
$versionFiles[$manifestPath]=$manifestText
$utf8NoBom=New-Object System.Text.UTF8Encoding($false)
foreach($versionFile in $versionFiles.Keys){[IO.File]::WriteAllText($versionFile,$versionFiles[$versionFile],$utf8NoBom)}
Write-Output ('Synchronized '+$releaseVersion.version+' display and Windows version')
