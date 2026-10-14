param([Parameter(Mandatory=$true)][string]$RunDir)
$ErrorActionPreference='Stop'
$run=(Resolve-Path -LiteralPath $RunDir).Path
$result=Get-Content -Raw -LiteralPath (Join-Path $run 'result.json') | ConvertFrom-Json
$job=Get-Content -Raw -LiteralPath (Join-Path $run 'job.json') | ConvertFrom-Json
if(-not $result.ok -or $result.differences.Count -or $job.section -ne 'B'){throw 'Use a verified Section B output'}
$test=Join-Path $run 'slab-isolation275.xlsm'
Copy-Item -LiteralPath (Join-Path $run $result.workbook) -Destination $test
$excel=$null;$book=$null
try{
 $excel=New-Object -ComObject Excel.Application
 $excel.Visible=$false;$excel.DisplayAlerts=$false;$excel.EnableEvents=$false;$excel.AutomationSecurity=1
 $book=$excel.Workbooks.Open($test,0,$false);$excel.Calculation=-4135
 $records=@();$checks275=0
 foreach($member in @($job.members | Where-Object {$_.kind -in @('SLAB','CS')})){
  $name=$member.designName265 -replace '[\\/:?*\[\]]',''
  $sheet=$book.Worksheets.Item($name);$original=$book.Worksheets.Item($member.sheet)
  if($sheet.Index -le $original.Index){throw 'Independent slab is not grouped after native design'}
  if($sheet.ProtectContents -or $book.ProtectStructure){throw 'Workbook not editable'}
  foreach($property in $member.expected.PSObject.Properties){
   $value=$sheet.Range($property.Name).Value2;$expect=$property.Value
   if($expect -is [string]){if($value -ne $expect){throw "Mismatch $name!$($property.Name)"}}
   elseif([Math]::Abs([double]$value-[double]$expect) -gt [Math]::Max(0.000001,[Math]::Abs([double]$expect)*0.00000001)){throw "Mismatch $name!$($property.Name)"}
   $checks275++
  }
  if(-not $sheet.Range('D22').HasFormula -or -not $sheet.Range('I35').HasFormula){throw 'Slab calculation formulas absent'}
  $moment=$sheet.Range('D22').Value2;$area=$sheet.Range('I35').Value2;$dia=$sheet.Range('F35').Value2
  $sheet.Range('F35').Value2=[double]$dia+2;$sheet.Calculate()
  if($sheet.Range('I35').Value2 -eq $area){throw 'Direct input did not recalculate'}
  $sheet.Range('F35').Value2=$dia;$sheet.Calculate()
  if($sheet.Range('I35').Value2 -ne $area){throw 'Restore changed reinforcement area'}
  $input=$book.Worksheets.Item('Input');$cell='D'+$member.row;$prior=$input.Range($cell).Value2
  $input.Range($cell).Value2=[double]$prior+3;$excel.CalculateFull()
  if($sheet.Range('D22').Value2 -ne $moment -or $sheet.Range('I35').Value2 -ne $area){throw 'Shared inputs overwrote independent slab'}
  $input.Range($cell).Value2=$prior;$excel.CalculateFull()
  foreach($shape in $sheet.Shapes){if($shape.OnAction){throw 'Copied button still invokes shared macro'}}
  $sheet.ExportAsFixedFormat(0,(Join-Path $run ($name+'-design.pdf')))
  $records+=@{sheet=$name;moment=$moment;area=$area;editable=$true;isolated=$true}
 }
 if($book.LinkSources(1)){throw 'External workbook links'}
 $book.Save();$book.Close($false);$book=$null
 $book=$excel.Workbooks.Open($test,0,$true)
 foreach($record in $records){$sheet=$book.Worksheets.Item($record.sheet);$sheet.Calculate();if($sheet.Range('D22').Value2 -ne $record.moment -or $sheet.Range('I35').Value2 -ne $record.area){throw 'Save/reopen mismatch'}}
 @{checks=$checks275;slabs=$records;savedAndReopened=$true;externalLinks=0}|ConvertTo-Json -Depth 6|Set-Content -LiteralPath (Join-Path $run 'slab-verification275.json') -Encoding utf8
 Get-Content -LiteralPath (Join-Path $run 'slab-verification275.json')
}finally{
 if($book){$book.Close($false)}
 if($excel){$excel.Quit();[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($excel)}
}
