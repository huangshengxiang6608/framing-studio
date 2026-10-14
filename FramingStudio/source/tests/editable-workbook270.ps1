param([Parameter(Mandatory=$true)][string]$RunDir)
$ErrorActionPreference='Stop'
function Assert270($condition,[string]$message){if(-not $condition){throw $message}}
$run=(Resolve-Path -LiteralPath $RunDir).Path
$result=Get-Content -LiteralPath (Join-Path $run 'result.json') -Raw | ConvertFrom-Json
Assert270 ($result.ok -and $result.differences.Count -eq 0) 'Use only a successfully verified output'
$original=Join-Path $run $result.workbook
Assert270 ((Get-FileHash -LiteralPath $original -Algorithm SHA256).Hash.ToLowerInvariant() -eq $result.workbookHash) 'Verified workbook changed'
$test=Join-Path $run 'editability-test.xlsm'
Copy-Item -LiteralPath $original -Destination $test -Force
$excel=$null;$book=$null
try{
 $excel=New-Object -ComObject Excel.Application
 $excel.Visible=$false;$excel.DisplayAlerts=$false;$excel.EnableEvents=$false;$excel.AutomationSecurity=1
 $book=$excel.Workbooks.Open($test,0,$false)
 Assert270 (-not $book.ProtectStructure -and -not $book.ProtectWindows) 'Workbook must be unprotected'
 $sheets=0;$countCells=0
 foreach($sheet in $book.Worksheets){
  $sheets++
  Assert270 (-not $sheet.ProtectContents -and -not $sheet.ProtectDrawingObjects -and -not $sheet.ProtectScenarios) "Protected sheet: $($sheet.Name)"
  Assert270 ($sheet.Visible -ne 2) "Cannot unhide sheet: $($sheet.Name)"
 }
 $job=Get-Content -LiteralPath (Join-Path $run 'job.json') -Raw | ConvertFrom-Json
 $names=@('Section B Secondary Beam Design','Section B Main Beam Design','Section B Transfer Beam Check','Section B Cantilever Beam Check')
 foreach($member in $job.members){if($member.kind -in @('MB','SB','TB','CB')){$label=if($member.designName265){$member.designName265}else{$member.id};$names+=($label -replace '[\\/:?*\[\]]','').Trim().Trim("'")}}
 foreach($name in $names){
  $sheet=$book.Worksheets.Item($name)
  foreach($row in (40..47)+(110..117)){
   $validation=$sheet.Range("C$row").Validation
   Assert270 ($validation.Type -eq 1 -and $validation.Operator -eq 7 -and $validation.Formula1 -eq '0' -and -not $validation.InCellDropdown) "Count not direct integer input: $name C$row"
   $countCells++
  }
 }
 $member=$job.members | Where-Object kind -eq 'TB' | Select-Object -First 1
 $label=if($member.designName265){$member.designName265}else{$member.id}
 $memberName=$label -replace '[\\/:?*\[\]]',''
 $design=$book.Worksheets.Item($memberName)
 # Match normal user editing and saving, including the existing workbook events.
 $excel.EnableEvents=$true
 $count=$design.Range('C44');$old=$count.Value2
 $before=$design.Range('G44').Value2;$equation=$design.Range('G44').Formula
 foreach($value in @(0,18,19)){$count.Value2=[double]$value;Assert270 $count.Validation.Value 'Non-negative integer must be allowed'}
 $count.Value2=[double]1.5;Assert270 (-not $count.Validation.Value) 'Fractional count must be rejected'
 $count.Value2=[double]-1;Assert270 (-not $count.Validation.Value) 'Negative count must be rejected'
 $count.Value2=[double]($old+1);$design.Calculate()
 Assert270 ($design.Range('G44').Value2 -ne $before) 'Typed count must recalculate the original area formula'
 Assert270 ($design.Range('G44').Formula -eq $equation) 'Area formula changed'
 $count.Value2=[double]$old;$design.Calculate()
 Assert270 ([Math]::Abs($design.Range('G44').Value2-$before) -lt 0.000001) 'Restored count must restore area'
 $depth=$design.Range('G29');$depthFormula=$depth.Formula
 $depth.Formula='=123';$design.Calculate();Assert270 ($depth.Value2 -eq 123) 'Formula cells must also be editable'
 $depth.Formula=$depthFormula;$design.Calculate()
 $design.Range('P:BQ').EntireColumn.Hidden=$false
 Assert270 ($design.Range('P:BQ').EntireColumn.Hidden -eq $false) 'P:BQ columns cannot be unhidden'
 $hidden=@($book.Worksheets | Where-Object Visible -eq 0 | Select-Object -First 1)
 if($hidden.Count){$hidden[0].Visible=-1;Assert270 ($hidden[0].Visible -eq -1) 'Hidden calculation sheet cannot be revealed'}
 $book.Save();$book.Close($false);$book=$null
 $book=$excel.Workbooks.Open($test,0,$false)
 $design=$book.Worksheets.Item($memberName)
 Assert270 (-not $design.ProtectContents -and $design.Range('P:BQ').EntireColumn.Hidden -eq $false) 'Editability/unhidden columns did not survive save and reopen'
 Assert270 ($design.Range('C44').Validation.Type -eq 1 -and -not $design.Range('C44').Validation.InCellDropdown) 'Count entry changed on reopen'
 Assert270 ($design.Range('G44').Formula -eq $equation -and $design.Range('G29').Formula -eq $depthFormula) 'Formula restoration did not survive save and reopen'
 @{worksheets=$sheets;typedCountCells=$countCells;nativeRecalculation=$true;formulasEditable=$true;columnsUnhide=$true;sheetsUnhide=$true;saveReopen=$true} | ConvertTo-Json -Compress
}finally{
 if($null -ne $book){$book.Close($false)}
 if($null -ne $excel){$excel.Quit();[Runtime.InteropServices.Marshal]::FinalReleaseComObject($excel) | Out-Null}
}
