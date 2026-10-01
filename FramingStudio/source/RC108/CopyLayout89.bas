Option Explicit
Private paintRows89(0 To 2) As Collection
Private cp89 As Worksheet, cr89 As Long, used89 As Double, cap89 As Double
Private Function T89(v As Variant) As String
 If IsError(v) Then T89 = "CALC ERROR" Else T89 = CStr(v)
End Function
Public Function N89(v As Variant) As String
 N89 = "____"
 If IsError(v) Then Exit Function
 If IsNumeric(v) And Len(CStr(v)) Then
  N89 = Format$(CDbl(v), "#,##0.###")
  If Right$(N89, 1) = "." Then N89 = Left$(N89, Len(N89) - 1)
 End If
End Function
Public Function BeamSW89(s As Worksheet) As String
 BeamSW89 = "____"
 If Application.count(s.Range("AD54,AD62,AD64")) = 3 Then BeamSW89 = N89(s.Range("AD54").Value2 + s.Range("AD62").Value2 - s.Range("AD64").Value2)
End Function
Private Sub Break89()
 If cr89 > 2 Then cp89.HPageBreaks.Add cp89.cells(cr89, 1)
 used89 = 0
End Sub
Private Sub Space89()
 cp89.rows(cr89).RowHeight = 9: used89 = used89 + 9: cr89 = cr89 + 1
End Sub
Private Sub Line89(ByVal t As String, Optional ByVal level As Long = 0)
 Dim h As Double, band As Range, part As Variant, lines As Long
 t = Replace(Replace(t, "mm2", "mm" & ChrW(178)), "m2", "m" & ChrW(178))
 t = Replace(t, " + L", vbLf & "       L")
 For Each part In Split(t, vbLf): lines = lines + WorksheetFunction.Max(1, WorksheetFunction.RoundUp(Len(part) / 100, 0)): Next part
 h = WorksheetFunction.Max(20, 15 * lines + 5)
 If level = 2 Then h = WorksheetFunction.Max(h, 28)
 If used89 + h + IIf(level > 0, 65, 0) > cap89 Then Break89
 cp89.cells(cr89, 1).Value2 = "'" & t
 paintRows89(level).Add cr89
 cp89.rows(cr89).RowHeight = h: used89 = used89 + h: cr89 = cr89 + 1
End Sub
Private Sub Table89(v As Variant, Optional ByVal header As Boolean = False)
 Dim j As Long, a As Range, h As Double, loadTable74 As Boolean, parts74 As Long, part74 As Variant, lines74 As Long
 h = IIf(header, 36, 25)
 loadTable74 = Len(T89(v(1, 2))) = 0 And Len(T89(v(1, 4))) = 0 And Len(T89(v(1, 8))) = 0 And Len(T89(v(1, 3))) > 0 And Len(T89(v(1, 5))) > 0 And Len(T89(v(1, 6))) > 0 And Len(T89(v(1, 7))) > 0
 If loadTable74 Then
  For j = 1 To 3 Step 2
   lines74 = 0
   For Each part74 In Split(T89(v(1, j)), vbLf)
    lines74 = lines74 + WorksheetFunction.Max(1, WorksheetFunction.RoundUp(Len(part74) / 23, 0))
   Next part74
   parts74 = WorksheetFunction.Max(parts74, lines74)
  Next j
  h = WorksheetFunction.Max(h, 8 + 16 * parts74)
 End If
 If used89 + h + IIf(header, 35, 0) > cap89 Then Break89
 Set a = cp89.Range(cp89.cells(cr89, 1), cp89.cells(cr89, 8))
 a.Value2 = v: cp89.Range(cp89.cells(cr89, 1), cp89.cells(cr89, 2)).Merge
 If loadTable74 Then
  cp89.Range(cp89.Cells(cr89, 3), cp89.Cells(cr89, 4)).Merge
  cp89.Range(cp89.Cells(cr89, 7), cp89.Cells(cr89, 8)).Merge
 End If
 a.Font.name = "Arial": a.Font.size = 10: a.Font.color = RGB(32, 94, 115)
 a.Font.bold = header: a.WrapText = True: a.VerticalAlignment = xlCenter
 a.NumberFormat = "#,##0.###": a.HorizontalAlignment = xlCenter
 For j = 1 To 8
  If VarType(v(1, j)) = vbString Then
   cp89.cells(cr89, j).Value2 = Replace(Replace(v(1, j), "mm2", "mm" & ChrW(178)), "m2", "m" & ChrW(178))
  ElseIf IsNumeric(v(1, j)) And Not IsEmpty(v(1, j)) Then
   If CDbl(v(1, j)) = Fix(CDbl(v(1, j))) Then cp89.cells(cr89, j).NumberFormat = "#,##0"
  End If
 Next j
 cp89.cells(cr89, 1).HorizontalAlignment = xlLeft
 a.Borders(xlEdgeBottom).LineStyle = xlContinuous: a.Borders(xlEdgeBottom).Weight = xlThin: a.Borders(xlEdgeBottom).color = RGB(219, 233, 240)
 If header Then a.Interior.color = RGB(228, 237, 242)
 cp89.rows(cr89).RowHeight = h: used89 = used89 + h: cr89 = cr89 + 1
End Sub
Private Function Row89(a As Variant) As Variant
 Dim v(1 To 1, 1 To 8) As Variant, j As Long
 For j = 0 To UBound(a): v(1, j + 1) = a(j): Next j
 Row89 = v
End Function
Private Function Section89(t As String) As Long
 If t Like "Slab * (Span *" Or t Like "Cantilever Slab *" Then Section89 = 1
 If t Like "Secondary Beam *" Then Section89 = 2
 If t Like "Main Beam *" Or t Like "Cantilever Beam *" Then Section89 = 3
 If t Like "Transfer Beam *" Then Section89 = 4
 If t Like "Column (for *" Then Section89 = 5
End Function
Private Function Drop89(t As String) As Boolean
 Dim prefix As Variant
 For Each prefix In Array("This section is mainly", "No direct slab loading.", "End reaction:", "Simply supported: RA", "M(x) =", "Self-weight: include once", "Layer gaps", "Layer centroid:", "d' =", "Method applicability and detailing", "Main clear spacing", "Check bar spacing", "100 As',prov/bd", "After long-span factor", "Compression reinforcement: not required")
  If Left$(t, Len(prefix)) = prefix Then Drop89 = True: Exit Function
 Next prefix
 For Each prefix In Array("Load input check: OK", "Load status: OK", "Maximum shear stress check: OKAY", "Overall check: OKAY", "Photo axial / main steel check: OK")
  If Left$(t, Len(prefix)) = prefix Then Drop89 = True: Exit Function
 Next prefix
End Function
Private Sub Intro89()
 Dim v As Worksheet, c As Worksheet, s As Worksheet, r As Long, x As Variant, rows As Long
 Set v = ThisWorkbook.Worksheets("_Input Engine")
 Set c = ThisWorkbook.Worksheets("Section A Column Loading")
 Line89 "SECTION B - DESIGN CALCULATION", 2
 Space89
 Line89 "This section is mainly for quantity take-off."
 Space89
 Line89 "I. Assumptions", 1
 Line89 "Assume critical load combination: 1.4DL + 1.6LL."
 Line89 "Assume a factor of 1.25 for wind effect."
 Space89
 Line89 "II. Design Codes", 1
 For Each x In Array("a) Wind Effects in Hong Kong 2019.", "b) Foundations 2017 (2024 Edition).", "c) Structural Use of Concrete 2013 (2020 Edition).", "d) Dead and Imposed Loads 2011 (2021 Edition).", "e) Fire Safety in Buildings 2011.", "f) Structural Use of Steel 2011 (2023 Edition).")
  Line89 "Code of Practice - " & CStr(x)
 Next x
 Space89
 Line89 "III. Design Data", 1
 Line89 "a) Concrete"
 Table89 Row89(Array("Member", Empty, "", "fcu", "N/mm2", "", "", "")), True
 Table89 Row89(Array("Slab / beams", Empty, "", v.Range("C4").Value2, "", "", "", ""))
 Table89 Row89(Array("Column", Empty, "", c.Range("B7").Value2, "", "", "", ""))
 Set s = ThisWorkbook.Worksheets("Section B Transfer Beam Check")
 Table89 Row89(Array("Transfer beam", Empty, "", s.Range("G17").Value2, "", "", "", ""))
 Line89 "Concrete density = 24.5 kN/m3."
 Line89 "b) Steel reinforcement"
 Line89 "Slab / beam fy = " & N89(ThisWorkbook.Worksheets("Section B Main Beam Design").Range("G18").Value2) & " N/mm2; column fy = " & N89(c.Range("B8").Value2) & " N/mm2."
End Sub
Public Sub FormatCopy89()
 Dim allRows As Variant
 Dim sections(1 To 5) As Collection, k As Long, r As Long, last As Long, group As Long, t As String, row As Variant, item As Variant, j As Long, n As Long, heading As Long, isTable As Boolean
 Set cp89 = ThisWorkbook.Worksheets("Section B " & ChrW(&H6284))
 For k = 1 To 5: Set sections(k) = New Collection: Next k
 last = cp89.Range(cp89.PageSetup.PrintArea).rows.count
 allRows = cp89.Range("A1:H" & last).Value2
 For r = 1 To last
  ReDim row(1 To 1, 1 To 8)
  For j = 1 To 8: row(1, j) = allRows(r, j): Next j
  t = T89(row(1, 1))
  k = Section89(t): If k > 0 Then group = k
  If group > 0 Then
   If Not Drop89(t) Then sections(group).Add row
  End If
 Next r
 cp89.Range("A1:J" & WorksheetFunction.Max(last + 200, 300)).UnMerge
 cp89.Range("A1:J" & WorksheetFunction.Max(last + 200, 300)).clear
 cp89.Range("A1:J" & WorksheetFunction.Max(last + 200, 300)).Hyperlinks.Delete
 cp89.rows("1:" & WorksheetFunction.Max(last + 200, 300)).Hidden = False
 cp89.Columns("A:H").ColumnWidth = 10.5
 cp89.ResetAllPageBreaks
 With cp89.PageSetup
  .PaperSize = xlPaperA4: .Orientation = xlPortrait
  .LeftMargin = 28: .RightMargin = 28: .TopMargin = 28: .BottomMargin = 28
  .Zoom = False: .FitToPagesWide = 1: .FitToPagesTall = False
  .PrintTitleRows = "": .PrintTitleColumns = "": .CenterFooter = "&P"
 End With
 cap89 = (841.9 - 72) / WorksheetFunction.Min(1, (595.3 - 56) / cp89.Range("A:H").width)
 For k = 0 To 2: Set paintRows89(k) = New Collection: Next k
 cr89 = 1: used89 = 0
 Intro89
 For group = 1 To 5
  For Each item In sections(group)
   row = item: t = T89(row(1, 1)): isTable = False: n = 0
   For j = 1 To 8: If Len(T89(row(1, j))) Then n = n + 1
   Next j
   If n = 0 Then
    If used89 > 0 Then Space89
   ElseIf n > 1 Then
    Table89 row, (t = "Floor" Or t = "Usage" Or t = "Point load" Or t = "Line load")
   Else
    heading = 0
    If Section89(t) > 0 Then Break89: heading = 2
    If LCase$(t) = "loading" Or Left$(LCase$(t), 8) = "loading " Or t = "ULS" Or LCase$(t) = "detail design" Or Left$(LCase$(t), 6) = "check " Or Left$(t, 15) = "Point load from" Then heading = 1
    If Left$(t, 8) = "Provide " And InStr(t, "L1:") Then t = "Bottom " & mid$(t, 9)
    If group = 4 And InStr(t, "provide L1:") Then
     If Left$(t, 6) = "As,req" Then t = Replace(t, "provide L1:", "Bottom L1:")
     If Left$(t, 7) = "As',req" Then t = Replace(t, "provide L1:", "Top L1:")
    End If
    If group = 5 Then
     t = Replace(t, " (target from Column Loading).", ".")
     t = Replace(t, " (target, axial demand and 0.8% minimum)", "")
    End If
    Line89 t, heading
   End If
  Next item
 Next group
 PaintLines101
 cp89.PageSetup.PrintArea = "$A$1:$H$" & (cr89 - 1)
 cp89.Range("J2").Value2 = "Generated " & Format$(Now, "yyyy-mm-dd hh:nn")
 cp89.Range("J3").Value2 = "Update Copy refreshes the report from saved design results."
 cp89.Range("J2:J3").Font.size = 9
 ApplySectionBCopyColors95 cp89, cr89 - 1
 cp89.Activate: ActiveWindow.DisplayGridlines = False: ActiveWindow.Zoom = 90
 ActiveWindow.ScrollRow = 1: ActiveWindow.ScrollColumn = 1
End Sub

Private Sub PaintLines101()
 Dim level As Long, r As Variant, part As String, batch As String
 For level = 0 To 2
  batch = ""
  For Each r In paintRows89(level)
   part = "A" & r & ":H" & r
   If Len(batch) + Len(part) > 220 Then PaintBatch101 batch, level: batch = ""
   If Len(batch) Then batch = batch & ","
   batch = batch & part
  Next r
  If Len(batch) Then PaintBatch101 batch, level
 Next level
End Sub
Private Sub PaintBatch101(ByVal address As String, ByVal level As Long)
 Dim band As Range, edge As Variant
 Set band = cp89.Range(address)
 band.Merge True
 band.WrapText = True: band.VerticalAlignment = xlCenter
 band.Font.name = "Arial": band.Font.size = 11: band.Font.color = RGB(32, 94, 115)
 band.Font.bold = (level > 0): band.Interior.color = vbWhite
 For Each edge In Array(xlEdgeBottom, xlInsideHorizontal)
  band.Borders(edge).LineStyle = xlContinuous
  band.Borders(edge).Weight = xlThin: band.Borders(edge).color = RGB(219, 233, 240)
 Next edge
 If level = 2 Then
  band.Interior.color = RGB(31, 55, 87): band.Font.color = vbWhite: band.Font.size = 12
 ElseIf level = 1 Then
  band.Interior.color = RGB(228, 237, 242): band.Font.color = RGB(32, 65, 85)
 End If
End Sub
