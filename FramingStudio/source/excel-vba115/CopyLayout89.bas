Option Explicit
Private breaks109 As Collection
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
 If cr89 > 2 Then breaks109.Add cr89
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
 If loadTable74 Or Len(T89(v(1, 4))) = 0 Then
  cp89.Range(cp89.cells(cr89, 3), cp89.cells(cr89, 4)).Merge
  cp89.Range(cp89.cells(cr89, 7), cp89.cells(cr89, 8)).Merge
 End If
 a.Font.name = "Arial": a.Font.size = 10: a.Font.color = RGB(32, 94, 115)
 a.Font.bold = header: a.WrapText = True: a.VerticalAlignment = xlCenter
 a.NumberFormat = "#,##0.0": a.HorizontalAlignment = xlCenter
 For j = 1 To 8
  If VarType(v(1, j)) = vbString Then
   cp89.cells(cr89, j).Value2 = Replace(Replace(v(1, j), "mm2", "mm" & ChrW(178)), "m2", "m" & ChrW(178))
  ElseIf IsNumeric(v(1, j)) And Not IsEmpty(v(1, j)) Then
   If Not loadTable74 And CDbl(v(1, j)) = Fix(CDbl(v(1, j))) Then cp89.cells(cr89, j).NumberFormat = "#,##0"
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
 Line89 "B.1 Assumptions", 1
 Line89 "Assume critical load combination: 1.4DL + 1.6LL."
 Line89 "Assume a factor of 1.25 for wind effect."
 Space89
 Line89 "B.2 Design Codes", 1
 For Each x In Array("a) Wind Effects in Hong Kong 2019.", "b) Foundations 2017 (2024 Edition).", "c) Structural Use of Concrete 2013 (2020 Edition).", "d) Dead and Imposed Loads 2011 (2021 Edition).", "e) Fire Safety in Buildings 2011.", "f) Structural Use of Steel 2011 (2023 Edition).")
  Line89 "Code of Practice - " & CStr(x)
 Next x
 Space89
 Line89 "B.3 Design Data", 1
 Line89 "a) Concrete"
 Dim cv As Worksheet, inp As Worksheet
 Set cv = ThisWorkbook.Worksheets("Section B Concrete Cover"): Set inp = ThisWorkbook.Worksheets("Input")
 Table89 Row89(Array("Member", Empty, "fcu (N/mm2)", Empty, "FRR (h)", "Cover (mm)", "", "")), True
 Table89 Row89(Array("Slab", Empty, inp.Range("C3").Value2, Empty, inp.Range("F3").Value2, cv.Range("E7").Value2, "", ""))
 Table89 Row89(Array("Main / secondary beam", Empty, inp.Range("C3").Value2, Empty, inp.Range("F3").Value2, cv.Range("E9").Value2, "", ""))
 Table89 Row89(Array("Column", Empty, inp.Range("C4").Value2, Empty, inp.Range("F4").Value2, cv.Range("E19").Value2, "", ""))
 Table89 Row89(Array("Transfer beam", Empty, inp.Range("C5").Value2, Empty, inp.Range("F5").Value2, cv.Range("E18").Value2, "", ""))
 Line89 "FRR default covers shown; adopted cover is stated in each member check."
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
 For k = cp89.Shapes.count To 1 Step -1
  cp89.Shapes(k).Delete
 Next k
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
 cp89.Activate: cp89.DisplayPageBreaks = True
 cp89.ResetAllPageBreaks
 With cp89.PageSetup
  .PaperSize = xlPaperA4: .Orientation = xlPortrait
  .LeftMargin = 28: .RightMargin = 28: .TopMargin = 28: .BottomMargin = 28
  .Zoom = 88: .FitToPagesWide = False: .FitToPagesTall = False
  .PrintTitleRows = "": .PrintTitleColumns = "": .CenterFooter = "&P"
 End With
 cap89 = (841.9 - 80) / 0.88
 For k = 0 To 2: Set paintRows89(k) = New Collection: Next k
 Set breaks109 = New Collection
 cr89 = 1: used89 = 0
 Intro89
 Dim chapter As Long, memberNo As Long, block As Collection, num As String
 chapter = 3
 For group = 1 To 5
  If sections(group).count > 0 Then
   memberNo = 0: Set block = New Collection
   For Each item In sections(group)
    row = item: t = T89(row(1, 1))
    If Section89(t) > 0 And block.count > 0 Then
     chapter = chapter + 1: Member109 block, "B." & CStr(chapter)
     Set block = New Collection
    End If
    block.Add row
   Next item
   If block.count Then chapter = chapter + 1: Member109 block, "B." & CStr(chapter)
  End If
 Next group
 PaintLines101
 cp89.PageSetup.PrintArea = "$A$1:$H$" & (cr89 - 1)
 Repage109
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

Private Sub Repage109()
 Dim r As Long, t As String, parts As Variant, taken As Double, h As Double
 cp89.Activate: cp89.DisplayPageBreaks = True: cp89.ResetAllPageBreaks
 cp89.PageSetup.FitToPagesWide = False: cp89.PageSetup.FitToPagesTall = False: cp89.PageSetup.Zoom = 88
 For r = 1 To cr89 - 1
  t = T89(cp89.cells(r, 1).Value2): parts = Split(Split(t & " ", " ")(0), ".")
  If UBound(parts) = 1 Then
   If parts(0) = "B" And Val(parts(1)) >= 4 Then
    cp89.HPageBreaks.Add Before:=cp89.cells(r, 1): taken = 0
   End If
  End If
  h = cp89.rows(r).RowHeight
  If taken + h + IIf(Left$(t, 2) = "B.", 65, 0) > cap89 Then
   cp89.HPageBreaks.Add Before:=cp89.cells(r, 1): taken = 0
  End If
  taken = taken + h
 Next r
End Sub

Private Function CompactText109(ByVal t As String) As String
 Dim bits As Variant, i As Long, a As Long, z As Long, part As String, result As String
 Dim re As Object, matches As Object, mt As Object
 Set re = CreateObject("VBScript.RegExp"): re.Global = True
 re.pattern = "\b(SW|DL|SDL|LL|wULS|M|V) = ([0-9]+(\.[0-9]+)?)"
 Set matches = re.Execute(t)
 For i = matches.count - 1 To 0 Step -1
  Set mt = matches(i)
  t = Left$(t, mt.FirstIndex) & mt.SubMatches(0) & " = " & Format$(CDbl(mt.SubMatches(1)), "0.0") & mid$(t, mt.FirstIndex + mt.Length + 1)
 Next i
 t = Replace(t, " (adopted design actions)", "")
 t = Replace(t, " (REFERENCE AREA CHECK)", " (area check)")
 t = Replace(t, "to outside of links", "to links")
 t = Replace(t, " (Table 6.3)", "")
 t = Replace(t, " (Simply-supported; linked source Limit)", "")
 bits = Split(t, ";")
 For i = 0 To UBound(bits)
  part = Trim$(bits(i)): a = InStr(part, "="): z = InStrRev(part, "=")
  If z > a And a > 0 Then part = Trim$(Left$(part, a)) & " " & Trim$(mid$(part, z + 1))
  If Len(result) Then result = result & "; "
  result = result & part
 Next i
 CompactText109 = result
End Function

Private Function Drop109(ByVal t As String) As Boolean
 Dim a As Variant
 If Len(Trim$(t)) = 0 Then Drop109 = True: Exit Function
 If InStr(t, "NOT OK") Or InStr(t, "REQUIRED") Or InStr(t, "ERROR") Or InStr(t, "FAIL") Or InStr(t, "NG") Then Exit Function
 For Each a In Array("Simply supported:", "Maximum M checked", "M(x)", "ULS = 1.4 G", "fs =", "M/bd", "M / bd", "MF tension", "Basic L/d", "Span / depth", "100 As", "Layer ", "Clear spacing", "Main steel area", "Bottom clear", "Top clear")
  If Left$(t, Len(a)) = a Then Drop109 = True: Exit Function
 Next a
 If Drop89(t) Then Drop109 = True
End Function

Private Sub Flush109(ByRef pending As String)
 If Len(pending) Then Line89 pending: pending = ""
End Sub

Private Function BeamId109(ByVal heading As String) As String
 Dim s As Worksheet, r As Long, id As String
 Set s = ThisWorkbook.Worksheets("RC Load Results")
 For r = 5 To s.cells(s.rows.count, 1).End(xlUp).row
  id = CStr(s.cells(r, 1).Value2)
  If Len(id) > Len(BeamId109) And InStr(heading, " " & id & " (") > 0 Then BeamId109 = id
 Next r
End Function

Private Sub Label109(ByVal text As String, ByVal x As Double, ByVal y As Double, ByVal width As Double)
 Dim sh As Shape
 Set sh = cp89.Shapes.AddTextbox(1, x, y, width, 18)
 sh.name = "Compact109_" & cp89.Shapes.count
 sh.TextFrame.Characters.text = text
 sh.TextFrame.Characters.Font.name = "Arial": sh.TextFrame.Characters.Font.size = 9
 sh.TextFrame.Characters.Font.color = RGB(32, 65, 85)
 sh.TextFrame.MarginLeft = 0: sh.TextFrame.MarginRight = 0: sh.TextFrame.MarginTop = 0: sh.TextFrame.MarginBottom = 0
 sh.line.visible = False: sh.fill.visible = False: sh.Placement = xlMove
End Sub

Private Sub Stroke109(ByVal x As Double, ByVal y As Double, ByVal z As Double, ByVal v As Double, Optional ByVal arrow As Boolean = False)
 Dim sh As Shape
 Set sh = cp89.Shapes.AddLine(x, y, z, v): sh.name = "Compact109_" & cp89.Shapes.count
 sh.line.ForeColor.RGB = RGB(32, 94, 115): sh.line.Weight = 1.2
 If arrow Then sh.line.EndArrowheadStyle = 3
 sh.Placement = xlMove
End Sub

Private Sub Sketch109(ByVal id As String, ByVal slabTitle As String, Optional ByVal slabLoad As String = "")
 Dim a As Variant, result As Worksheet, span As Double, r As Long, i As Long, j As Long, n As Long, lane As Long
 Dim x As Double, y As Double, w As Double, x0 As Double, x1 As Double, top As Double, h As Double
 Dim points As New Collection, lines As New Collection, title As String, part As Variant
 Set result = ThisWorkbook.Worksheets("RC Load Results")
 If Len(id) Then
  r = WorksheetFunction.Match(id, result.Range("A:A"), 0): span = CDbl(result.cells(r, 2).Value2)
  a = ThisWorkbook.Worksheets("RC Loads").ListObjects("RCLoads73").DataBodyRange.Value2
  For i = 1 To UBound(a, 1)
   If CStr(a(i, 1)) = id Then
    If CDbl(a(i, 5)) <> 0 Or CDbl(a(i, 6)) <> 0 Then
     If CStr(a(i, 2)) = "POINT" Then points.Add i Else lines.Add i
    End If
   End If
  Next i
 Else
  ' Slab dimensions and loads below remain the native source values.
  span = Val(mid$(slabTitle, InStr(slabTitle, "Span ") + 5))
 End If
 h = 145
 If used89 + h > cap89 Then Break89
 cp89.rows(cr89).RowHeight = h: top = cp89.cells(cr89, 1).top
 x0 = cp89.Range("A1").Left + 22: x1 = cp89.Range("H1").Left + cp89.Range("H1").width - 22: w = x1 - x0: y = top + 108
 Stroke109 x0, y, x1, y
 Stroke109 x0, y, x0 - 8, y + 13: Stroke109 x0, y, x0 + 8, y + 13: Stroke109 x0 - 8, y + 13, x0 + 8, y + 13
 Stroke109 x1, y, x1 - 8, y + 13: Stroke109 x1, y, x1 + 8, y + 13: Stroke109 x1 - 8, y + 13, x1 + 8, y + 13
 Stroke109 x0, y + 28, x1, y + 28
 Label109 "L = " & Format(span, "0.0") & " m", x0 + w / 2 - 65, y + 29, 190
 If Len(id) Then
  lane = 0
  For Each part In lines
   i = CLng(part): lane = lane + 1
   x = x0 + w * CDbl(a(i, 3)) / span
   If lane <= 3 Then
    top = cp89.cells(cr89, 1).top + 36 + (lane - 1) * 22
    Stroke109 x, top, x0 + w * CDbl(a(i, 4)) / span, top
    For j = 0 To 6
     x = x0 + w * (CDbl(a(i, 3)) + (CDbl(a(i, 4)) - CDbl(a(i, 3))) * j / 6) / span
     Stroke109 x, top, x, top + 15, True
    Next j
    Label109 "w" & lane, x0 + w * CDbl(a(i, 3)) / span, top - 16, 38
   End If
  Next part
  n = 0
  For Each part In points
   i = CLng(part): n = n + 1: x = x0 + w * CDbl(a(i, 3)) / span
   Stroke109 x, y - 35, x, y - 2, True
   If points.count <= 8 Then Label109 "P" & n, WorksheetFunction.Max(x0, WorksheetFunction.Min(x - 9, x1 - 28)), y - 55 - (n Mod 2) * 14, 30
  Next part
  If points.count > 8 Or lines.count > 3 Then Label109 "All loads and positions: schedule below", x0, cp89.cells(cr89, 1).top + 2, w
 Else
  For j = 0 To 10
   x = x0 + w * j / 10: Stroke109 x, y - 45, x, y - 2, True
  Next j
  Label109 "Uniform load on calculation strip", x0, cp89.cells(cr89, 1).top + 32, w
 End If
 cr89 = cr89 + 1: used89 = used89 + h
End Sub

Private Sub LoadSchedule109(ByVal id As String)
 Dim a As Variant, r As Long, n As Long, p As Long, kind As Variant, prefix As String
 a = ThisWorkbook.Worksheets("RC Loads").ListObjects("RCLoads73").DataBodyRange.Value2
 For Each kind In Array("LINE", "POINT")
  n = 0
  For r = 1 To UBound(a, 1)
   If CStr(a(r, 1)) = id And CStr(a(r, 2)) = kind Then
    If CDbl(a(r, 5)) <> 0 Or CDbl(a(r, 6)) <> 0 Then
     If n = 0 Then Table89 Row89(Array(IIf(kind = "LINE", "Line load", "Point load"), Empty, "x (m)", Empty, "DL", "LL", "ULS", Empty)), True
     n = n + 1: prefix = IIf(kind = "LINE", "w", "P") & n
     Table89 Row89(Array(prefix & ": " & CStr(a(r, 7)), Empty, Format(a(r, 3), "0.0") & IIf(kind = "LINE", " - " & Format(a(r, 4), "0.0"), ""), Empty, a(r, 5), a(r, 6), 1.4 * CDbl(a(r, 5)) + 1.6 * CDbl(a(r, 6)), Empty))
    End If
   End If
  Next r
 Next kind
 Line89 "Line loads: kN/m; point loads: kN. ULS = 1.4 DL + 1.6 LL."
End Sub

Private Sub Member109(ByVal rows As Collection, ByVal number As String)
 Dim row As Variant, j As Long, t As String, first As String, id As String, pending As String, stage As Long, count As Long
 row = rows(1): first = T89(row(1, 1)): id = BeamId109(first)
Break89:  Line89 number & " " & first, 2
 For j = 2 To rows.count
  row = rows(j): t = T89(row(1, 1))
  If LCase$(Left$(t, 7)) = "loading" Then
   Flush109 pending: stage = 1: Line89 number & ".1 Loading", 1
   If InStr(first, "Cantilever") = 0 And Left$(first, 6) <> "Column" Then Sketch109 id, first
   If Len(id) Then LoadSchedule109 id
  ElseIf LCase$(t) = "detail design" Then
   Flush109 pending: stage = 2: Line89 number & ".2 Detail design", 1
   If Left$(first, 13) = "Transfer Beam" Then Line89 "FRR = " & N89(ThisWorkbook.Worksheets("Input").Range("F5").Value2) & " h"
  ElseIf LCase$(t) = "check moment" Then
   Flush109 pending: stage = 3: Line89 number & ".3 Bending", 1
  ElseIf LCase$(t) = "check shear" Then
   Flush109 pending: stage = 4: Line89 number & ".4 Shear", 1
  ElseIf LCase$(t) = "check deflection" Then
   Flush109 pending: stage = 5: Line89 number & ".5 Deflection", 1
  ElseIf Not Drop109(t) Then
   count = 0
   Dim c As Long
   For c = 1 To 8: If Len(T89(row(1, c))) Then count = count + 1
   Next c
   If count > 1 Then
    If Not (stage = 1 And Len(id) > 0) Then Flush109 pending: Table89 row, (t = "Floor" Or t = "Usage")
   ElseIf Not (stage = 1 And Len(id) > 0 And Not (Left$(t, 4) = "RA =" Or Left$(t, 3) = "M =" Or Left$(t, 3) = "V =")) And t <> "ULS" Then
    t = CompactText109(t)
    If Left$(t, 8) = "Provide " Then Flush109 pending
    If Len(pending) And Len(pending) + Len(t) < 103 Then
     pending = pending & "; " & t
    Else
     Flush109 pending: pending = t
    End If
   End If
  End If
 Next j
 Flush109 pending
End Sub
