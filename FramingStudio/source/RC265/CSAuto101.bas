Attribute VB_Name = "CSAuto101"
Option Explicit
Private Function Number81(ByVal s As Worksheet, ByVal address As String) As Double
 Dim a As Variant: a = s.Range(address).Value2
 If Not IsError(a) Then
  If IsNumeric(a) Then Number81 = CDbl(a)
 End If
End Function
Private Function Text81(ByVal value As Variant) As String
 If IsError(value) Then Text81 = "CELL ERROR" Else Text81 = CStr(value)
End Function
Private Function SlabMin81(ByVal s As Worksheet) As Double
 ' HK Concrete CoP 2013 (2020), 9.3.1.1(a); automation supports grade 500 only.
 SlabMin81 = 0.0013 * 1000 * Number81(s, "C6") * WorksheetFunction.Max(1, 40 * Number81(s, "C4") ^ (2 / 3) / 500)
End Function
Public Sub AutoCS101(ByVal inputRow As Long, Optional ByVal force As Boolean = False)
 Dim v As Worksheet, s As Worksheet, dia As Variant, spacing As Variant, td As Variant, ts As Variant
 Dim mainFound As Boolean, transverseFound As Boolean, requirement As Double, detail As String, a As Variant, j As Long
 Set v = ThisWorkbook.Worksheets("_CS Analysis"): Set s = ThisWorkbook.Worksheets("Section B Cantilever Slab Check")
 On Error GoTo Failed
 LoadCS101 inputRow
 If v.cells(inputRow, 57).Value2 = "MANUAL" And Not force Then
  v.cells(inputRow, 54).Value2 = "": v.cells(inputRow, 55).Value2 = "MANUAL: saved slab bars retained; checks refreshed."
  Exit Sub
 End If
 v.cells(inputRow, 57).Value2 = "AUTO"
 s.Range("F35").Value2 = 12: s.Range("H35").Value2 = 100: s.Range("C9").Value2 = 1
 Application.CalculateFull
 If Text81(s.Range("F74").Value2) <> "OK" Then detail = "INPUT REQUIRED: " & Text81(s.Range("F74").Value2): GoTo FailedSelection
 If Number81(s, "C5") <> 500 Then detail = "REVIEW: fy = 500 required by auto slab detailing": GoTo FailedSelection
 ' Finite candidates, one layer. Existing flexure/shear/deflection formulae are retained.
 For Each dia In Array(10, 12, 16, 20, 25, 32)
  s.Range("F35").Value2 = dia
  For Each spacing In Array(250, 200, 150, 100)
   If spacing <= WorksheetFunction.Min(2 * Number81(s, "C6"), 250) And spacing - dia >= WorksheetFunction.Max(25, dia) Then
    s.Range("H35").Value2 = spacing: Application.CalculateFull
    requirement = WorksheetFunction.Max(Number81(s, "F34"), SlabMin81(s))
    If Number81(s, "F34") > 0 And Number81(s, "I35") >= requirement And Number81(s, "E24") < Number81(s, "G24") And Text81(s.Range("I46").Value2) = "OK" Then
     If InStr(1, Text81(s.Range("A73").Value2), "OKAY - no links required") > 0 And SlabCrackOK85(s) Then mainFound = True: Exit For
    End If
   End If
  Next spacing
  If mainFound Then Exit For
 Next dia
 If Not mainFound Then detail = "REVIEW: no passing slab selection in the candidate range": GoTo FailedSelection
 requirement = WorksheetFunction.Max(SlabMin81(s), 0.2 * Number81(s, "I35"))
 For Each td In Array(10, 12, 16, 20, 25)
  For Each ts In Array(250, 200, 150, 100)
   If ts <= WorksheetFunction.Min(3 * Number81(s, "C6"), 400) And ts - td >= WorksheetFunction.Max(25, td) Then
    If td ^ 2 * Atn(1) * 1000 / ts >= requirement Then
     s.Range("C57").Value2 = td: s.Range("D57").Value2 = ts: transverseFound = True: Exit For
    End If
   End If
  Next ts
  If transverseFound Then Exit For
 Next td
 If Not transverseFound Then detail = "REVIEW: no transverse steel selection": GoTo FailedSelection
 Application.CalculateFull
 If Not SlabAutoCheck81(s, detail) Then GoTo FailedSelection
 detail = "AUTO: main and transverse bars reselected"
 v.cells(inputRow, 54).Value2 = "OK"
 GoTo SaveSlab
FailedSelection:
 v.cells(inputRow, 54).Value2 = "REVIEW REQUIRED"
SaveSlab:
 a = Array("F35", "H35", "C9", "C57", "D57")
 For j = 0 To 4: v.cells(inputRow, 39 + j).Value2 = s.Range(a(j)).Value2: Next j
 v.cells(inputRow, 55).Value2 = detail
 Exit Sub
Failed:
 detail = "AUTO STOPPED: " & Err.Description
 On Error Resume Next
 v.cells(inputRow, 54).Value2 = "REVIEW REQUIRED": v.cells(inputRow, 55).Value2 = detail
End Sub
