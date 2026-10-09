"""Execute the supplied FullAction73 body in a VB.NET compatibility harness.

No Excel/template modification. This verifies the actual supplied algorithm,
but is NOT native Excel/VBA execution or report-rendering verification.
Run precision208.cjs with PRECISION208_JOBS first, then pass its JSON path here.
"""
from pathlib import Path
import os, subprocess, sys, tempfile

source=(Path(__file__).resolve().parents[1]/'excel-vba115/FullLoads73.bas').read_text(encoding='utf8')
body=source[source.index('Public Function FullAction73'):source.index('Public Function HasFullLoads73')]
for old,new in [('As Variant','As Object'),('loads As Range','loads As LoadRange'),('WorksheetFunction.Max','Math.Max'),('WorksheetFunction.Min','Math.Min'),('Abs(','Math.Abs('),('ReDim cut(1 To ','ReDim cut('),('CVErr(xlErrValue)','Double.NaN')]:
    body=body.replace(old,new)
# VB.NET reserves integer division variables with names matching properties only
# in classes; the unchanged VBA functions live together in a standard Module.
runner='''
Option Strict Off
Imports System
Imports System.IO
Imports System.Collections.Generic
Imports System.Web.Script.Serialization
Public Class LoadRange
 Public Value2 As Object(,)
End Class
Module Verify208
SUBS
 Sub Main(args As String())
  System.Threading.Thread.CurrentThread.CurrentCulture=Globalization.CultureInfo.InvariantCulture
  Dim ser As New JavaScriptSerializer()
  ser.MaxJsonLength=100000000
  Dim jobs=DirectCast(ser.DeserializeObject(File.ReadAllText(args(0))),Object())
  Dim count As Integer=0
  For Each rawJob In jobs
   Dim job=DirectCast(rawJob,Dictionary(Of String,Object))
   For Each rawBeam In DirectCast(job("fullLoads"),Object())
    Dim beam=DirectCast(rawBeam,Dictionary(Of String,Object)), records=DirectCast(beam("loads"),Object())
    Dim data(records.Length,7) As Object, i As Integer=0
    For Each rawRecord In records
     i+=1
     Dim r=DirectCast(rawRecord,Dictionary(Of String,Object))
     data(i,1)=CStr(beam("id")):data(i,2)=CStr(r("type"))
     data(i,3)=CDbl(r("start")):data(i,4)=CDbl(r("end")):data(i,5)=CDbl(r("g")):data(i,6)=CDbl(r("q"))
    Next
    Dim loads As New LoadRange With {.Value2=data}
    Dim expected=DirectCast(beam("expected"),Dictionary(Of String,Object))
    For Each code In New String(){"M","V","RA","RB","G","Q"}
     Dim value As Double=CDbl(FullAction73(CStr(beam("id")),CDbl(beam("L")),loads,code,CStr(beam("kind"))="CB"))
     Dim key As String=If(code="G","dead",If(code="Q","live",code)), target=CDbl(expected(key))
     If Double.IsNaN(value) OrElse Math.Abs(value-target)>1e-9*Math.Max(1,Math.Abs(target)) Then
      Throw New Exception(CStr(beam("id")) & " " & code & ": VBA source " & value.ToString("R") & " != App " & target.ToString("R"))
     End If
     count+=1
    Next
   Next
  Next
  Console.WriteLine("PASS supplied FullAction73 source against exported App inputs: " & count & " values (VB.NET compatibility harness, not native Excel)")
 End Sub
End Module
'''.replace('SUBS',body)
scratch=Path('tmp').resolve();scratch.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='framing-vba208-',dir=scratch) as d:
    p=Path(d);(p/'verify.vb').write_text(runner,encoding='utf8')
    compiler=Path(os.environ.get('WINDIR','C:/Windows'))/'Microsoft.NET/Framework64/v4.0.30319/vbc.exe'
    subprocess.run([str(compiler),'/nologo','/target:exe','/optioninfer+','/reference:System.Web.Extensions.dll','/out:'+str(p/'verify.exe'),str(p/'verify.vb')],check=True)
    subprocess.run([str(p/'verify.exe'),str(Path(sys.argv[1]).resolve())],check=True)
