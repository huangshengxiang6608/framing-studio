Attribute VB_Name = "Review85"
Option Explicit
Public Function Text85(v As Variant) As String
 If IsError(v) Then Text85 = "CALC ERROR" Else Text85 = CStr(v)
End Function
Public Function Number85(s As Worksheet, a As String) As Double
 If IsError(s.Range(a).Value2) Then Exit Function
 If IsNumeric(s.Range(a).Value2) Then Number85 = CDbl(s.Range(a).Value2)
End Function
Private Sub AddIssue85(ByRef t As String, ByVal v As String)
 If Len(v) = 0 Then Exit Sub
 If Len(t) Then t = t & vbLf
 t = t & v
End Sub
Public Function BeamDetail85(s As Worksheet, kind As String) As String
 Dim h As Worksheet, a As Variant, labels As Variant, j As Long, t As String, v As String
 Set h = ThisWorkbook.Worksheets("_" & kind & " Analysis")
 If Text85(h.Range("I25").Value2) <> "OK" Then
  BeamDetail85 = "INPUT REQUIRED - " & Text85(h.Range("I25").Value2): Exit Function
 End If
 For Each a In Array("G12", "G14", "G15", "G16", "G17", "G18", "G19", "G23", "G24")
  If IsError(s.Range(a).Value2) Then AddIssue85 t, "CALC ERROR - " & a
  If Not IsNumeric(s.Range(a).Value2) Then AddIssue85 t, "INPUT REQUIRED - " & a
 Next a
 If Len(t) Then BeamDetail85 = t: Exit Function
 If Not LayerRule86(s) Then AddIssue85 t, "NOT OK - per-layer count exceeds floor(beam width / 100 mm)"
 If Number85(s, "G29") <= 0 Then AddIssue85 t, "NOT OK - effective depth / layer arrangement"
 a = Array("N40", "N44", "N52", "N59", "N69", "N77", "N78", "N87")
 labels = Array(IIf(kind = "CB", "Bottom compression steel: area / ratio / fit", "Top steel: area / ratio / fit"), IIf(kind = "CB", "Top tension steel: area / ratio / fit", "Bottom steel: area / ratio / fit"), "Maximum shear stress", "Shear links: area / spacing", "Combined shear and torsion", "Torsion links: area / spacing", "Torsion longitudinal steel", "Deflection")
 For j = 0 To UBound(a)
  v = Text85(s.Range(a(j)).Value2)
  If v <> "OKAY" Then
   AddIssue85 t, IIf(v = "CALC ERROR", "CALC ERROR - ", "NOT OK - ") & labels(j)
  End If
 Next j
 If Not BarSizeRule84(s.Range("C40:D47"), s.Range("C110:D117")) Then AddIssue85 t, "NOT OK - one size per face; tension steel maximum two sizes above compression steel"
 If Left$(Text85(s.Range("R24").Value2), 12) = "AUTO STOPPED" Then AddIssue85 t, "REVIEW REQUIRED - " & Text85(s.Range("R24").Value2)
 If Len(t) = 0 Then t = "OK"
 BeamDetail85 = t
End Function
Public Function State85(ByVal detail As String) As String
 If detail = "OK" Then State85 = "OK": Exit Function
 If InStr(detail, "CALC ERROR") Then State85 = "CALC ERROR": Exit Function
 If InStr(detail, "INPUT REQUIRED") Then State85 = "INPUT REQUIRED": Exit Function
 If InStr(detail, "NOT OK") Then State85 = "NOT OK": Exit Function
 State85 = "REVIEW REQUIRED"
End Function
Public Function ColumnDetail85() As String
 Dim s As Worksheet, t As String, v As String
 Dim caller265 As Object, marker265 As Name
 On Error GoTo CallerDone265
 Set caller265 = Application.Caller
 For Each marker265 In caller265.Parent.Names
  If Right(marker265.Name, 13) = "!_RCDesign265" And marker265.RefersTo = "=TRUE" Then Set s = caller265.Parent
 Next marker265
CallerDone265:
 Err.Clear
 On Error GoTo 0
 If s Is Nothing Then Set s = ThisWorkbook.Worksheets("Section B Column Check")
 If IsError(s.Range("C39").Value2) Or IsError(s.Range("C40").Value2) Or IsError(s.Range("C41").Value2) Then ColumnDetail85 = "CALC ERROR - column source / area / axial check": Exit Function
 If Text85(s.Range("C39").Value2) <> "OK" Then AddIssue85 t, "INPUT REQUIRED - " & Text85(s.Range("C39").Value2)
 If Text85(s.Range("C42").Value2) <> "OK" Then AddIssue85 t, "INPUT REQUIRED - floor height: " & Text85(s.Range("C42").Value2)
 If Number85(s, "C14") <= 0 Or Number85(s, "C15") <= 0 Then AddIssue85 t, "INPUT REQUIRED - column width / depth"
 ' Do not report derived failures before the source inputs are complete.
 If InStr(t, "INPUT REQUIRED") > 0 Then ColumnDetail85 = t: Exit Function
 If Text85(s.Range("C40").Value2) <> "OKAY (AREA ONLY)" Then AddIssue85 t, "NOT OK - steel area: " & Text85(s.Range("C40").Value2)
 If Text85(s.Range("C38").Value2) <> "SHORT / BRACED" Then AddIssue85 t, "REVIEW REQUIRED - " & Text85(s.Range("C38").Value2)
 If Text85(s.Range("C41").Value2) <> "OKAY (AXIAL ONLY)" Then AddIssue85 t, "NOT OK - axial capacity / method: " & Text85(s.Range("C41").Value2)
 ' Photo scope only: additional applicability and detailing checks are intentionally not called.
 If Len(t) = 0 Then t = "OK"
 ColumnDetail85 = t
End Function
Public Function ColumnStatus85(dependencies As Range) As String
 ColumnStatus85 = State85(ColumnDetail85())
 If ColumnStatus85 = "OK" Then ColumnStatus85 = "OK (AXIAL ONLY)"
End Function
Public Function ColumnReasons85(dependencies As Range) As String
 ColumnReasons85 = ColumnDetail85()
 If ColumnReasons85 = "OK" Then ColumnReasons85 = "Photo axial / main steel check passed. Method applicability and detailing are not checked."
End Function
Public Function SlabCrackLimit85(s As Worksheet) As Double
 Dim req As Double, pct As Double, fy As Double
 fy = Number85(s, "C5")
 If Number85(s, "C10") <= 0 Or fy <= 0 Then Exit Function
 req = Number85(s, "F34"): pct = 100 * req / (1000 * Number85(s, "C10"))
 ' HK CoP 9.3.1.1(b), 9.2.1.4 eq 9.1. Simply supported span, beta_b=1.
 If Number85(s, "C6") <= 200 Or pct < 0.3 Then
  SlabCrackLimit85 = 1E+20
 Else
  SlabCrackLimit85 = WorksheetFunction.Min(70000 / fy, 300)
  If pct < 1 Then SlabCrackLimit85 = SlabCrackLimit85 / pct
 End If
End Function
Public Function SlabCrackOK85(s As Worksheet) As Boolean
 SlabCrackOK85 = (Number85(s, "H35") - Number85(s, "F35") <= SlabCrackLimit85(s))
End Function
Public Function SlabDetail85(s As Worksheet) As String
 Dim t As String, detail As String
 If Text85(s.Range("L11").Value2) <> "OK" Then SlabDetail85 = "INPUT REQUIRED - " & Text85(s.Range("L11").Value2): Exit Function
 If Text85(s.Range("F74").Value2) <> "OK" Then SlabDetail85 = "INPUT REQUIRED - " & Text85(s.Range("F74").Value2): Exit Function
 If Number85(s, "E24") >= Number85(s, "G24") Then AddIssue85 t, "NOT OK - bending limit"
 If Number85(s, "I35") < Number85(s, "F34") Then AddIssue85 t, "NOT OK - main steel area"
 If Text85(s.Range("I46").Value2) <> "OK" Then AddIssue85 t, "NOT OK - deflection"
 If InStr(Text85(s.Range("A73").Value2), "OKAY - no links required") = 0 Then AddIssue85 t, "NOT OK - shear: " & Text85(s.Range("A73").Value2)
 If Not SlabAutoCheck81(s, detail) Then AddIssue85 t, "NOT OK - " & detail
 If Number85(s, "C9") <> 1 Then AddIssue85 t, "REVIEW REQUIRED - multilayer slab effective-depth detailing"
 If Len(t) = 0 Then t = "OK"
 SlabDetail85 = t
End Function
Public Sub UpdateAllTransfer85()
 Dim s As Worksheet, h As Worksheet, src As Worksheet, chosen As Variant, r As Long
 Set s = ThisWorkbook.Worksheets("Section B Transfer Beam Check"): Set h = ThisWorkbook.Worksheets("_TB Analysis")
 Set src = ThisWorkbook.Worksheets("Section A Transfer Beam")
 chosen = s.Range("L9").Value2
 PersistTransfer79
 For r = 6 To 25
  If CopyHasInput(src.Range("B" & r & ":C" & r)) Then
   s.Range("L9").Value2 = r
   UpdateTransfer79
  End If
 Next r
 s.Range("L9").Value2 = chosen
 If IsNumeric(chosen) Then
  If chosen >= 6 And chosen <= 25 Then
   If CopyHasInput(src.Range("B" & chosen & ":C" & chosen)) Then UpdateTransfer79
  End If
 End If
End Sub
Public Sub LayoutView85()
 Dim s As Worksheet, current As Worksheet
 Set current = ActiveSheet
 For Each s In ThisWorkbook.Worksheets
  If s.name = "Section B Transfer Beam Check" Or s.name = "Section B Main Beam Design" Or s.name = "Section B Secondary Beam Design" Then
   s.Activate
   ActiveWindow.FreezePanes = False: ActiveWindow.SplitRow = 0: ActiveWindow.SplitColumn = 0
   s.rows("2:103").Hidden = False
   Application.GoTo s.Range("B2"), True
  End If
 Next s
 current.Activate
End Sub
Public Sub UpdateDesignDetails85()
 Dim s As Worksheet, kind As Variant, detail As String
 For Each kind In Array("TB", "MB", "SB")
  Set s = ThisWorkbook.Worksheets(IIf(kind = "TB", "Section B Transfer Beam Check", "Section B " & IIf(kind = "MB", "Main", "Secondary") & " Beam Design"))
  detail = BeamDetail85(s, CStr(kind))
  s.Range("BR36").Value2 = State85(detail) & IIf(detail = "OK", "", vbLf & detail)
 Next kind
 ThisWorkbook.Worksheets("Section B Column Check").Calculate
End Sub


