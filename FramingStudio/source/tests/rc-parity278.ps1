param([Parameter(Mandatory=$true)][string]$DataDir,[string]$Cases='cases.json',[string]$Output='native-results.json')
$ErrorActionPreference='Stop'
$data=Get-Content -LiteralPath (Join-Path $DataDir $Cases) -Raw -Encoding utf8 | ConvertFrom-Json
$defs=Get-Content -LiteralPath (Join-Path $DataDir 'formulas.json') -Raw -Encoding utf8 | ConvertFrom-Json
$template=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../Excel/Section A RC - Section B v109 Compact Copy.xlsm')).Path
$x=$null;$book=$null;$records=@();$differences=@();$tested=0
try{
 $x=New-Object -ComObject Excel.Application
 $x.Visible=$false;$x.DisplayAlerts=$false;$x.EnableEvents=$false;$x.ScreenUpdating=$false;$x.AutomationSecurity=1
 $book=$x.Workbooks.Open($template,0,$true);$x.Calculation=-4135
 foreach($sh in $book.Worksheets){$sh.EnableCalculation=$false}
 foreach($c in $data.cases){
  $sheet=$book.Worksheets.Item($c.sheet);$sheet.Unprotect();$sheet.EnableCalculation=$true
  foreach($p in $c.inputs.PSObject.Properties){if($p.Value -is [string]){$sheet.Range($p.Name).Value2=[string]$p.Value}else{$sheet.Range($p.Name).Value2=[double]$p.Value}}
  foreach($p in $defs.($c.kind).extern.PSObject.Properties){$parts=$p.Name.Split('!');$book.Worksheets.Item($parts[0].Trim("'")).Range($parts[1]).Value2=$p.Value}
  if($c.kind -in @('MB','SB','TB','CB') -and $null -eq $c.inputs.E58){$sheet.Range('E58').Formula='=MAX(2,C40:C47,C110:C117)'}
  foreach($helper in @('_SB Helpers','_CB Helpers')){$book.Worksheets.Item($helper).EnableCalculation=$true;$book.Worksheets.Item($helper).Calculate()}
  $x.CalculateFull()
  $values=@{};$local=@()
  foreach($p in $c.expected.PSObject.Properties){
   $s=$sheet;$cell=$p.Name
   if($cell.Contains('!')){$parts=$cell.Split('!');$s=$book.Worksheets.Item($parts[0].Trim("'"));$cell=$parts[1]}
   $v=$s.Range($cell).Value2;$values[$p.Name]=$v;$e=$p.Value;$tested++
   $same=$false
   if($null -ne $e.error){$same=($v -is [int] -and $v -lt -2000000000)}
   elseif($e -is [bool]){$same=($v -eq $e)}
   elseif($e -is [string]){$same=([string]$v -eq $e)}
   else{$same=($null -ne $v -and [Math]::Abs([double]$v-[double]$e) -le [Math]::Max(0.000001,[Math]::Abs([double]$e)*0.00000001))}
   if(-not $same){$d=@{case=$c.id;cell=$p.Name;app=$e;excel=$v};$local+=$d;$differences+=$d}
  }
  $records+=@{id=$c.id;kind=$c.kind;values=$values;differences=$local}
  $sheet.EnableCalculation=$false
  @{tested=$tested;cases=$records.Count;differences=$differences;records=$records}|ConvertTo-Json -Depth 12|Set-Content -LiteralPath (Join-Path $DataDir $Output) -Encoding utf8
  Write-Output "$($c.id): $($local.Count) differences"
 }
}finally{
 if($book){$book.Close($false)}
 if($x){$x.Quit();[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($x)}
}
if($differences.Count){throw "Native formula parity failed: $($differences.Count) differences"}
"PASS $($records.Count) cases, $tested formula results"
