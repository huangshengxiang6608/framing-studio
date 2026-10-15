param([Parameter(Mandatory=$true)][string]$DataDir,[Parameter(Mandatory=$true)][string]$Output)
$ErrorActionPreference='Stop'
$appDir=Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$data=(Resolve-Path -LiteralPath $DataDir).Path
$outputDir=[IO.Path]::GetFullPath($Output)
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$env:FRAMING_CACHE_DIR=Join-Path $outputDir 'cache'
$results=@()
foreach($phase in @('check','check-live','report','check-reuse','report-reuse')){
 $dir=Join-Path $outputDir $phase
 if(Test-Path -LiteralPath $dir){throw "Use new output folder: $dir"}
 New-Item -ItemType Directory -Path $dir | Out-Null
 $isCheck=$phase.StartsWith('check')
 $source=if($isCheck){'check-request.json'}else{'report-request.json'}
 $jobFile=Join-Path $dir 'request.json';Copy-Item -LiteralPath (Join-Path $data $source) -Destination $jobFile
 $clock=[Diagnostics.Stopwatch]::StartNew()
 $worker=Start-Process -FilePath (Join-Path $appDir 'FramingStudio.exe') -ArgumentList @('--local-report251',('"'+$jobFile+'"')) -WindowStyle Hidden -PassThru
 $worker.WaitForExit();$clock.Stop()
 $events=@(Get-ChildItem -LiteralPath (Join-Path $dir 'events') -Filter '*.json' | Sort-Object Name | ForEach-Object {Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json})
 $records=@($events | Where-Object {$_.record} | ForEach-Object {$_.record})
 $expected=(Get-Content -LiteralPath $jobFile -Raw | ConvertFrom-Json).jobs.Count
 $item=[pscustomobject]@{phase=$phase;seconds=$clock.Elapsed.TotalSeconds;records=@($records | Select-Object reportSection,compared,cached,preparedRC279,reusedCheck279,continuedLive280,liveReady280,workerPid280,ok,error,workbookHash,runId);cache=$env:FRAMING_CACHE_DIR}
 $results+=$item;$results | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $outputDir 'benchmark.json') -Encoding utf8
 $item | ConvertTo-Json -Depth 8 -Compress
 if(-not $events[-1].done -or $events[-1].error -or $records.Count -ne $expected -or @($records | Where-Object {-not $_.ok -or $_.differences.Count -gt 0}).Count){throw "Native phase failed: $phase"}
 if($isCheck -and @($records | Where-Object {-not $_.preparedRC279}).Count){throw 'Missing verified RC checkpoint'}
 if($phase -eq 'report' -and @($records | Where-Object {$_.type -eq 'RC' -and -not $_.reusedCheck279}).Count){throw 'Report did not resume Check workbook'}
 if($phase -eq 'check' -and @($records | Where-Object {-not $_.liveReady280}).Count){throw 'Check did not retain native workers'}
 if($phase -eq 'check-live' -and @($records | Where-Object {-not $_.cached -or -not $_.liveVerified280}).Count){throw 'Repeat Check did not reuse open workbooks'}
 if($phase -eq 'report' -and @($records | Where-Object {-not $_.continuedLive280}).Count){throw 'Report reopened a checkpoint instead of continuing live'}
 if($phase.EndsWith('reuse') -and @($records | Where-Object {-not $_.cached}).Count){throw 'Unchanged work started native calculation again'}
}
$original=$results | Where-Object {$_.phase -eq 'report'}
foreach($record in ($results | Where-Object {$_.phase -eq 'report-reuse'}).records){
 $prior=$original.records | Where-Object {$_.reportSection -eq $record.reportSection}
 if($prior.workbookHash -ne $record.workbookHash){throw 'Reused report workbook bytes changed'}
}
$checkPids=@(($results | Where-Object {$_.phase -eq 'check'}).records.workerPid280)
$reportRoot=Join-Path $outputDir 'report/worker-data/ExcelRuns'
foreach($file in (Get-ChildItem -LiteralPath $reportRoot -Recurse -Filter result.json)){
 $record=Get-Content -LiteralPath $file.FullName -Raw | ConvertFrom-Json
 if($record.continuedWorker280 -and $checkPids -notcontains $record.continuedWorker280){throw 'Report used a different native worker'}
}
if(@(Get-ChildItem -LiteralPath (Join-Path $outputDir 'cache/live280') -Filter '*.json').Count){throw 'Consumed session not cleaned up'}
'PASS same native worker Check-to-report, repeated live Check, durable Check/report reuse and cleanup'

