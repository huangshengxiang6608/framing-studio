param([Parameter(Mandatory=$true)][string]$Request,[Parameter(Mandatory=$true)][string]$Output)
$ErrorActionPreference='Stop'
$appDir=Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$requestPath=(Resolve-Path -LiteralPath $Request).Path
$outputDir=[IO.Path]::GetFullPath($Output)
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$env:FRAMING_CACHE_DIR=Join-Path $outputDir ('cache-'+[Guid]::NewGuid().ToString('N'))
$results=@()
foreach($trial in @('cold','warm','warm2')){
 $dir=Join-Path $outputDir $trial
 if(Test-Path -LiteralPath $dir){throw "Use a new output folder: $dir"}
 New-Item -ItemType Directory -Path $dir | Out-Null
 $jobFile=Join-Path $dir 'request.json';Copy-Item -LiteralPath $requestPath -Destination $jobFile
 $clock=[Diagnostics.Stopwatch]::StartNew()
 $worker=Start-Process -FilePath (Join-Path $appDir 'FramingStudio.exe') -ArgumentList @('--local-report251',('"'+$jobFile+'"')) -WindowStyle Hidden -PassThru
 $worker.WaitForExit();$clock.Stop()
 $events=@(Get-ChildItem -LiteralPath (Join-Path $dir 'events') -Filter '*.json' | Sort-Object Name | ForEach-Object {Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json})
 if(-not $events[-1].done -or $events[-1].error){throw "Host failed: $trial"}
 $records=@($events | Where-Object {$_.record} | ForEach-Object {$_.record})
 if($records.Count -ne 2 -or @($records | Where-Object {-not $_.ok -or $_.differences.Count -gt 0}).Count){throw "Expected two verified RC outputs: $trial"}
 if($trial -eq 'cold' -and @($records | Where-Object {$_.cached}).Count){throw 'Cold run unexpectedly reused cache'}
 if($trial -ne 'cold' -and @($records | Where-Object {-not $_.cached}).Count){throw 'Warm run did not reuse both complete outputs'}
 $item=[pscustomobject]@{trial=$trial;seconds=$clock.Elapsed.TotalSeconds;records=@($records | Select-Object reportSection,compared,cached,verifiedAt,workbookHash,runId);cache=$env:FRAMING_CACHE_DIR}
 $results+=$item
 $results | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $outputDir 'benchmark.json') -Encoding utf8
 $item | ConvertTo-Json -Depth 6 -Compress
}
$cold=$results[0];foreach($trial in $results | Select-Object -Skip 1){foreach($record in $trial.records){$original=$cold.records | Where-Object {$_.reportSection -eq $record.reportSection};if($original.workbookHash -ne $record.workbookHash){throw 'Cached workbook differs from verified original'}}}
'PASS native cold/warm/warm2, two verified outputs, exact workbook hashes'
