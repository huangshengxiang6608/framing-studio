Option Explicit
Private s As Worksheet, p As Worksheet, rr As Long
Private Function Good(ByVal address As String) As Boolean
 Dim value As Variant
 value = s.Range(address).Value2
 If IsError(value) Then Exit Function
 Good = Len(CStr(value)) > 0 And IsNumeric(value)
End Function
Private Function f(ByVal value As Double) As String
 f = Format(value, "#,##0.###")
 If Right$(f, 1) = "." Then f = Left$(f, Len(f) - 1)
End Function
Private Function n(ByVal address As String) As String
 n = "____"
 If Good(address) Then n = f(CDbl(s.Range(address).Value2))
End Function
Private Function Status(ByVal address As String) As String
 Status = s.Range(address).text
 If Len(Status) = 0 Then Status = "INPUT REQUIRED"
End Function
Private Sub CopyLine(ByVal text As String, Optional ByVal heading As Boolean = False)
 text = Replace(text, "mm2", "mm" & ChrW(&HB2))
 With p.Range("A" & rr & ":H" & rr)
  .Merge: .cells(1, 1).Value2 = "'" & text
  .Font.name = "Arial": .Font.size = 11: .Font.color = RGB(48, 95, 145)
  .Font.bold = heading: .WrapText = True: .VerticalAlignment = xlCenter
  .Borders(xlEdgeBottom).LineStyle = xlContinuous
  .Borders(xlEdgeBottom).Weight = xlHairline
  .Borders(xlEdgeBottom).color = RGB(190, 221, 237)
 End With
 p.rows(rr).RowHeight = 19
 If Len(text) > 103 Then p.rows(rr).RowHeight = 32
 rr = rr + 1
End Sub
Public Sub AppendCantileverCopy99()
 Dim source As Worksheet, r As Long, first As Long, last As Long
 Dim ratio As String, factor As String
 Set s = ThisWorkbook.Worksheets("Section B Cantilever Beam Check")
 Set p = ThisWorkbook.Worksheets("Section B " & ChrW(&H6284))
 If Not CopyHasInput(s.Range("G12,G14,G15,G23,G24")) Then Exit Sub
 s.Calculate
 last = p.Range(p.PageSetup.PrintArea).row + p.Range(p.PageSetup.PrintArea).rows.count - 1
 rr = last + 2: first = rr
 p.rows(CStr(first) & ":" & CStr(first + 110)).Hidden = False
 CopyLine "Cantilever Beam " & s.Range("C9").text & " (" & n("G14") & " x " & n("G15") & " mm dp.)", True
 CopyLine "Span L = " & n("G12") & " m; " & s.Range("T13").text
 CopyLine "Loading", True
 CopyLine "SW = " & n("AD62") & " - " & n("AD64") & " + " & n("AD54") & " = " & BeamSW89(s) & " kN/m"
 CopyLine "DL = " & n("AD56") & " kN/m"
 CopyLine "SDL = " & n("AD58") & " kN/m"
 CopyLine "LL = " & n("AD60") & " kN/m"
 CopyLine "Point load: DL = " & n("AZ150") & "; LL = " & n("AZ151") & " kN at " & n("AZ152") & " m from fixed end"
 CopyLine "Load status: " & s.Range("R73").text
 CopyLine "ULS", True
 CopyLine "wULS = 1.4 x " & n("AD66") & " + 1.6 x " & n("AD68") & " = " & n("AD70") & " kN/m"
 CopyLine "M = " & n("G23") & " kNm; V = " & n("G24") & " kN (adopted design actions)"
 CopyLine ""
 CopyLine "Detail Design", True
 CopyLine "Cover = " & n("G16") & " mm for " & CStr(SelectedFireHours71("CB")) & " hr; fcu = " & n("G17") & "; fy = fyv = " & n("G18") & " N/mm2"
 CopyLine "d = " & n("G29") & " mm"
 CopyLine "Check Moment", True
 CopyLine "K = M / (fcu b d^2) = " & n("K30") & "; K' = " & n("K31")
 CopyLine "z = " & n("G35") & " mm; limit = 0.95d"
 CopyLine "As,req = " & n("K38") & " mm2"
 ratio = "____"
 If Good("G44") And Good("G14") And Good("G15") Then
  If s.Range("G14").Value2 > 0 And s.Range("G15").Value2 > 0 Then ratio = f(100 * s.Range("G44").Value2 / s.Range("G14").Value2 / s.Range("G15").Value2)
 End If
 CopyLine "Top tension steel: provide " & CBBeamBarDescription(44) & "; As,prov = " & n("G44") & " mm2 (" & ratio & "%); " & Status("N44")
 If Good("K36") Then
  If s.Range("G40").Value2 > 0 Then
   CopyLine "Bottom compression steel: As',req = " & n("K36") & " mm2; provide " & CBBeamBarDescription(40) & "; As',prov = " & n("G40") & " mm2; " & Status("N40")
  End If
 End If
 CopyLine ""
 CopyLine "Check Shear", True
 CopyLine "v = V / bd = " & n("G24") & " x 1000 / (" & n("G14") & " x " & n("G29") & ") = " & n("K51") & " N/mm2"
 CopyLine "vc = " & n("G53") & "; vr = " & n("G54") & " N/mm2; " & Status("G55")
 CopyLine "Asv/sv,req = " & n("K56") & " mm2/mm"
 CopyLine "Provide T" & n("G58") & " - " & n("H58") & " mm c/c, " & n("E58") & " legs; Asv/sv,prov = " & n("K58") & " mm2/mm; " & Status("N59")
 CopyLine "Maximum shear stress check: " & Status("N52")
 CopyLine ""
 CopyLine "Check Deflection", True
 CopyLine "fs = " & n("G82") & " N/mm2"
 If Good("G23") And Good("G14") And Good("G29") Then
  If s.Range("G14").Value2 > 0 And s.Range("G29").Value2 > 0 Then
   CopyLine "M/bd^2 = " & f(s.Range("G23").Value2 * 1000000 / s.Range("G14").Value2 / s.Range("G29").Value2 ^ 2)
  End If
 End If
 CopyLine "MF tension = " & n("G83") & "; MF compression = " & n("G84")
 factor = "____"
 If Good("G12") Then
  If s.Range("G12").Value2 > 0 Then factor = "1"
 End If
 CopyLine "Allowable L/d = " & n("G85") & " x " & factor & " x " & n("G83") & " x " & n("G84") & " = " & n("G86")
 CopyLine "Actual L/d = " & n("G12") & " x 1000 / " & n("G29") & " = " & n("G87") & "; " & Status("N87")
 CopyLine "Overall check: " & Status("R40")
 p.PageSetup.PrintArea = "$A$1:$H$" & (rr - 1)
 p.HPageBreaks.Add p.cells(first, 1)
End Sub
