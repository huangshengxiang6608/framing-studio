param([string]$Template,[string]$LayoutBaseline)
$ErrorActionPreference='Stop'
if(-not $Template){$Template=Join-Path $PSScriptRoot '../Excel/Section A RC - Section B v109 Compact Copy.xlsm'}
$Template=(Resolve-Path -LiteralPath $Template).Path
$layout115=[IO.Path]::GetTempFileName()
if($LayoutBaseline){Copy-Item -LiteralPath $LayoutBaseline -Destination $layout115 -Force}else{Copy-Item -LiteralPath $Template -Destination $layout115 -Force}
$excel115=New-Object -ComObject Excel.Application
$excel115.Visible=$false
$excel115.DisplayAlerts=$false
$excel115.EnableEvents=$false
$excel115.AutomationSecurity=3
$book115=$null
try {
 $book115=$excel115.Workbooks.Open($Template,0,$false)
 foreach($name115 in @('FullLoads73','Cantilever99','CBCopy99','CopyLayout89')){
  $module115=$book115.VBProject.VBComponents.Item($name115).CodeModule
  $module115.DeleteLines(1,$module115.CountOfLines)
  $module115.AddFromString([IO.File]::ReadAllText((Join-Path $PSScriptRoot ('excel-vba115/'+$name115+'.bas')),[Text.Encoding]::UTF8))
 }
 $sheet115=$book115.Worksheets.Item('Section B Cantilever Beam Check')
 $sheet115.Range('G23').Formula='=IF(''_CB Analysis''!I25<>"OK","",IF(HasFullLoads73(C9),FullAction73(C9,G12,RCLoads73[#Data],"M",TRUE),AD70*G12^2/2+(1.4*AZ150+1.6*AZ151)*AZ152))'
 $sheet115.Range('G24').Formula='=IF(''_CB Analysis''!I25<>"OK","",IF(HasFullLoads73(C9),FullAction73(C9,G12,RCLoads73[#Data],"V",TRUE),AD70*G12+1.4*AZ150+1.6*AZ151))'
 $book115.Save()
}finally{if($book115){$book115.Close($false)};$excel115.Quit();[void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel115)}
# Excel can normalize row heights when saving. Retain every original OOXML part
# except the VBA binary and the two explicitly revised calculation formulas.
Add-Type -AssemblyName System.IO.Compression.FileSystem
$edited115=[IO.Compression.ZipFile]::OpenRead($Template)
$buffer115=[IO.MemoryStream]::new()
$stream115=$edited115.GetEntry('xl/vbaProject.bin').Open()
$stream115.CopyTo($buffer115);$stream115.Dispose();$edited115.Dispose()
$rebuilt115=Join-Path ([IO.Path]::GetTempPath()) ('framing115-'+[guid]::NewGuid().ToString('N')+'.zip')
$baseline115=[IO.Compression.ZipFile]::OpenRead($layout115)
$target115=[IO.Compression.ZipFile]::Open($rebuilt115,[IO.Compression.ZipArchiveMode]::Create)
try {
 foreach($entry115 in $baseline115.Entries){
  $copy115=$target115.CreateEntry($entry115.FullName,[IO.Compression.CompressionLevel]::Optimal)
  $out115=$copy115.Open()
  try {
   if($entry115.FullName -eq 'xl/vbaProject.bin'){$bytes115=$buffer115.ToArray();$out115.Write($bytes115,0,$bytes115.Length)}
   elseif($entry115.FullName -match '^xl/worksheets/sheet\d+\.xml$'){
    $reader115=[IO.StreamReader]::new($entry115.Open(),[Text.Encoding]::UTF8)
    $xml115=$reader115.ReadToEnd();$reader115.Dispose()
    foreach($cell115 in @('G23','G24')){
     $code115=if($cell115 -eq 'G23'){'M'}else{'V'}
     $legacy115=if($cell115 -eq 'G23'){'AD70*G12^2/2+(1.4*AZ150+1.6*AZ151)*AZ152'}else{'AD70*G12+1.4*AZ150+1.6*AZ151'}
     $old115='IF(''_CB Analysis''!I25&lt;&gt;"OK","",'+$legacy115+')'
     $new115='IF(''_CB Analysis''!I25&lt;&gt;"OK","",IF(HasFullLoads73(C9),FullAction73(C9,G12,RCLoads73[#Data],"'+$code115+'",TRUE),'+$legacy115+'))'
     $xml115=$xml115.Replace($old115,$new115)
    }
    $bytes115=[Text.Encoding]::UTF8.GetBytes($xml115);$out115.Write($bytes115,0,$bytes115.Length)
   }else{$input115=$entry115.Open();try{$input115.CopyTo($out115)}finally{$input115.Dispose()}}
  }finally{$out115.Dispose()}
 }
}finally{$target115.Dispose();$baseline115.Dispose();$buffer115.Dispose()}
Copy-Item -LiteralPath $rebuilt115 -Destination $Template -Force
Remove-Item -LiteralPath $rebuilt115,$layout115
$manifest115=Join-Path (Split-Path $Template) 'templates.json'
$json115=[IO.File]::ReadAllText($manifest115)
$hash115=(Get-FileHash -LiteralPath $Template -Algorithm SHA256).Hash.ToLowerInvariant()
$json115=[regex]::Replace($json115,'("RC"\s*:\s*\{\s*"file"\s*:\s*"[^"]+",\s*"sha256"\s*:\s*")[^"]+',('${1}'+$hash115))
[IO.File]::WriteAllText($manifest115,$json115,[Text.UTF8Encoding]::new($false))
Write-Output ('Updated native CB full-load formulas. SHA256 '+$hash115)
