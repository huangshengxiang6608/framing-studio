param([Parameter(Mandatory=$true)][string]$RunDir)
$ErrorActionPreference='Stop'
$run=(Resolve-Path -LiteralPath $RunDir).Path
$result=Get-Content -Raw -LiteralPath (Join-Path $run 'result.json') | ConvertFrom-Json
$job=Get-Content -Raw -LiteralPath (Join-Path $run 'job.json') | ConvertFrom-Json
if(-not $result.ok -or $result.differences.Count){throw 'Use a verified combined output'}
$test=Join-Path $run 'isolation-test.xlsm'
Copy-Item -LiteralPath (Join-Path $run $result.workbook) -Destination $test
$excel=$null;$book=$null;$source=$null
try{
 $excel=New-Object -ComObject Excel.Application
 $excel.Visible=$false;$excel.DisplayAlerts=$false;$excel.EnableEvents=$false;$excel.AutomationSecurity=1
 $book=$excel.Workbooks.Open($test,0,$false);$excel.Calculation=-4135
 $a=$book.Worksheets.Item('1F AC2');$b=$book.Worksheets.Item('1F AC10')
 $input=if($job.section -eq 'B'){'C3'}else{'B9'}
 $output=if($job.section -eq 'B'){'C16'}else{'E5'}
 $initialA=$a.Range($output).Value2;$initialB=$b.Range($output).Value2;$initialInput=$b.Range($input).Value2
 $b.Range($input).Value2=[double]$initialInput+1
 $excel.CalculateFull()
 if($a.Range($output).Value2 -ne $initialA){throw 'AC10 edit changed AC2'}
 if($b.Range($output).Value2 -eq $initialB){throw 'AC10 formula did not recalculate'}
 $b.Range($input).Value2=$initialInput;$excel.CalculateFull()
 if($a.Range($output).Value2 -ne $initialA -or $b.Range($output).Value2 -ne $initialB){throw 'Restore mismatch'}
 $shared=$book.Worksheets.Item('Input');$prior=$shared.Range('C9').Value2
 $axial=if($job.section -eq 'B'){'C28'}else{'E38'}
 $loadA=$a.Range($axial).Value2;$loadB=$b.Range($axial).Value2
 $shared.Range('C9').Value2=[double]$prior+17;$excel.CalculateFull()
 if($a.Range($axial).Value2 -ne $loadA -or $b.Range($axial).Value2 -ne $loadB){throw 'Shared input overwrote private column'}
 $shared.Range('C9').Value2=$prior;$excel.CalculateFull()
 if($book.LinkSources(1)){throw 'External workbook links'}
 # Export the exact original print areas from the merged workbook and each source.
 $report='Section '+$job.section+' 抄'
 $book.Worksheets.Item($report).ExportAsFixedFormat(0,(Join-Path $run 'layout-merged-primary.pdf'))
 $book.Worksheets.Item($result.mergedColumns274[0].report).ExportAsFixedFormat(0,(Join-Path $run 'layout-merged-column.pdf'))
 foreach($part in 1,2){
  $sourcePath=Join-Path $run "column-part-$part/RC-filled.xlsm"
  $source=$excel.Workbooks.Open($sourcePath,0,$true)
  $target=if($part -eq 1){'layout-source-primary.pdf'}else{'layout-source-column.pdf'}
  $source.Worksheets.Item($report).ExportAsFixedFormat(0,(Join-Path $run $target))
  $source.Close($false);$source=$null
 }
 @{section=$job.section;independentInputRecalculation=$true;sharedInputIsolation=$true;externalLinks=0;loadAC2=$loadA;loadAC10=$loadB}|ConvertTo-Json -Compress|Set-Content -LiteralPath (Join-Path $run 'isolation274.json') -Encoding utf8
 Get-Content -LiteralPath (Join-Path $run 'isolation274.json')
}finally{
 if($source){$source.Close($false)}
 if($book){$book.Close($false)}
 if($excel){$excel.Quit();[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($excel)}
}
