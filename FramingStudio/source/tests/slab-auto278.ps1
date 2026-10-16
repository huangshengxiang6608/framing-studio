param([Parameter(Mandatory=$true)][string]$DataDir)
$ErrorActionPreference='Stop'
$data=Get-Content -LiteralPath (Join-Path $DataDir 'cases.json') -Raw -Encoding utf8 | ConvertFrom-Json
$template=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../Excel/Section A RC - Section B v109 Compact Copy.xlsm')).Path
$x=$null;$book=$null;$records=@()
try{
 $x=New-Object -ComObject Excel.Application
 $x.Visible=$false;$x.DisplayAlerts=$false;$x.EnableEvents=$false;$x.ScreenUpdating=$false;$x.AutomationSecurity=1
 $book=$x.Workbooks.Open($template,0,$true);$x.Calculation=-4135
 foreach($sh in $book.Worksheets){$sh.EnableCalculation=$false}
 foreach($c in @($data.cases|Where-Object {$_.kind -in @('SLAB','CS')})){
  $sheet=$book.Worksheets.Item($c.sheet);$sheet.Unprotect();$sheet.EnableCalculation=$true
  foreach($p in $c.inputs.PSObject.Properties){if($p.Value -is [string]){$sheet.Range($p.Name).Value2=[string]$p.Value}else{$sheet.Range($p.Name).Value2=[double]$p.Value}}
  $store=$book.Worksheets.Item($(if($c.kind -eq 'CS'){'_CS Analysis'}else{'_Input Engine'}));$r=$(if($c.kind -eq 'CS'){6}else{11})
  $store.Range("A$r").Value2='AUDIT';$store.Range("AM${r}:BE${r}").ClearContents()
  $macro=$(if($c.kind -eq 'CS'){'AutoCS101'}else{'AutoUpdate81.AutoSlab81'})
  $x.Run("'"+$book.Name+"'!"+$macro,$r,$true)
  $sheet.Calculate();$before=@{};foreach($a in @('C4','C6','C10','F34','I35','I46','A73','F74')){$before[$a]=$sheet.Range($a).Value2}
  $x.CalculateFull();$after=@{};foreach($a in @('C4','C6','C10','F34','I35','I46','A73','F74')){$after[$a]=$sheet.Range($a).Value2}
  $native=@{};$differences=@()
  foreach($cell in @('F35','H35','C57','D57')){
   $v=$sheet.Range($cell).Value2;$native[$cell]=$v
   if(-not $c.autoFailed -and $v -ne $c.inputs.$cell){$differences+=@{cell=$cell;app=$c.inputs.$cell;excel=$v}}
  }
  $status=$store.Cells.Item($r,54).Value2;$detail=$store.Cells.Item($r,55).Value2
  if(($status -eq 'OK') -ne (-not $c.autoFailed)){$differences+=@{cell='automatic selection';app=$c.autoFailed;excel=$status}}
  $records+=@{id=$c.id;status=$status;detail=$detail;steel=$native;appAutoFailed=$c.autoFailed;differences=$differences;beforeFull=$before;afterFull=$after}
  $records|ConvertTo-Json -Depth 10|Set-Content -LiteralPath (Join-Path $DataDir 'auto-slab-results.json') -Encoding utf8
  Write-Output "$($c.id): $status, $($differences.Count) differences"
  $sheet.EnableCalculation=$false
 }
}finally{if($book){$book.Close($false)};if($x){$x.Quit();[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($x)}}
if(@($records | Where-Object {$_.differences.Count}).Count){throw 'Native slab automatic selection differs from App'}
"PASS $($records.Count) native slab automatic selection cases"
