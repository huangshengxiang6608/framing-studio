Option Explicit

' Exact simply-supported actions for independent G/Q point and piecewise UDL inputs.
' The input range is an Excel table and expands when a row is added.
Public Function FullAction73(ByVal id As String, ByVal span As Double, ByVal loads As Range, ByVal code As String, Optional ByVal cantilever As Boolean = False) As Variant
 Dim a As Variant, i As Long, j As Long, n As Long, k As Long, cut() As Double
 Dim total As Double, firstMoment As Double, ra As Double, rb As Double, x As Double, y As Double, u As Double, v As Double
 Dim g As Double, q As Double, fg As Double, fq As Double, w As Double, area As Double, best As Double, atX As Double, found As Boolean
 On Error GoTo Invalid
 If Len(id) = 0 Or span <= 0 Then GoTo Invalid
 fg = 1.4: fq = 1.6
 If code = "G" Then fg = 1: fq = 0
 If code = "Q" Then fg = 0: fq = 1
 a = loads.Value2: ReDim cut(1 To 2 * UBound(a, 1) + 2)
 n = 2: cut(1) = 0: cut(2) = span
 For i = 1 To UBound(a, 1)
  If CStr(a(i, 1)) = id Then
   found = True
   For j = 3 To 6
    If IsError(a(i, j)) Then GoTo Invalid
    If Len(CStr(a(i, j))) = 0 Or Not IsNumeric(a(i, j)) Then GoTo Invalid
   Next j
   x = CDbl(a(i, 3)): y = CDbl(a(i, 4)): g = CDbl(a(i, 5)): q = CDbl(a(i, 6))
   If x < 0 Or y > span + 0.000001 Or y < x Or g < 0 Or q < 0 Then GoTo Invalid
   w = fg * g + fq * q
   Select Case CStr(a(i, 2))
    Case "POINT"
     If Abs(x - y) > 0.000001 Then GoTo Invalid
     area = w: n = n + 1: cut(n) = x
    Case "LINE"
     If y <= x Then GoTo Invalid
     area = w * (y - x): n = n + 1: cut(n) = x: n = n + 1: cut(n) = y
    Case Else: GoTo Invalid
   End Select
   total = total + area: firstMoment = firstMoment + area * (x + y) / 2
  End If
 Next i
 If Not found Then GoTo Invalid
 If code = "G" Or code = "Q" Then FullAction73 = total: Exit Function
 If cantilever Then
  Select Case code
   Case "M": FullAction73 = firstMoment
   Case "V", "RA": FullAction73 = total
   Case "RB", "X": FullAction73 = 0
   Case "VALID": FullAction73 = "OK"
   Case Else: GoTo Invalid
  End Select
  Exit Function
 End If
 rb = firstMoment / span: ra = total - rb
 Select Case code
  Case "RA": FullAction73 = ra: Exit Function
  Case "RB": FullAction73 = rb: Exit Function
  Case "V": FullAction73 = WorksheetFunction.Max(Abs(ra), Abs(rb)): Exit Function
  Case "VALID": FullAction73 = "OK": Exit Function
 End Select
 ' Sort boundaries, then solve V(x)=0 exactly within each constant-intensity interval.
 For i = 2 To n
  x = cut(i): j = i - 1
  Do While j >= 1
   If cut(j) <= x Then Exit Do
   cut(j + 1) = cut(j): j = j - 1
  Loop
  cut(j + 1) = x
 Next i
 For k = 1 To n
  x = cut(k): u = Moment73(a, id, x, ra)
  If u > best Then best = u: atX = x
  If k < n Then
   y = cut(k + 1)
   If y - x > 0.0000001 Then
    v = ra: w = 0
    For i = 1 To UBound(a, 1)
     If CStr(a(i, 1)) = id Then
      u = 1.4 * CDbl(a(i, 5)) + 1.6 * CDbl(a(i, 6))
      If CStr(a(i, 2)) = "POINT" Then
       If CDbl(a(i, 3)) <= x + 0.0000001 Then v = v - u
      Else
       v = v - u * WorksheetFunction.Max(0, WorksheetFunction.Min(x, CDbl(a(i, 4))) - CDbl(a(i, 3)))
       If CDbl(a(i, 3)) < (x + y) / 2 And CDbl(a(i, 4)) > (x + y) / 2 Then w = w + u
      End If
     End If
    Next i
    If w > 0 Then
     u = x + v / w
     If u > x And u < y Then
      v = Moment73(a, id, u, ra)
      If v > best Then best = v: atX = u
     End If
    End If
   End If
  End If
 Next k
 If code = "X" Then FullAction73 = atX Else FullAction73 = best
 Exit Function
Invalid:
 FullAction73 = CVErr(xlErrValue)
End Function

Private Function Moment73(ByRef a As Variant, ByVal id As String, ByVal x As Double, ByVal ra As Double) As Double
 Dim i As Long, t As Double, w As Double, m As Double
 m = ra * x
 For i = 1 To UBound(a, 1)
  If CStr(a(i, 1)) = id Then
   w = 1.4 * CDbl(a(i, 5)) + 1.6 * CDbl(a(i, 6))
   If CStr(a(i, 2)) = "POINT" Then
    m = m - w * WorksheetFunction.Max(0, x - CDbl(a(i, 3)))
   Else
    t = WorksheetFunction.Max(0, WorksheetFunction.Min(x, CDbl(a(i, 4))) - CDbl(a(i, 3)))
    m = m - w * t * (x - CDbl(a(i, 3)) - t / 2)
   End If
  End If
 Next i
 Moment73 = m
End Function

Public Function HasFullLoads73(ByVal id As String) As Boolean
 On Error GoTo Done
 HasFullLoads73 = Len(id) > 0 And WorksheetFunction.CountIf(ThisWorkbook.Worksheets("RC Loads").ListObjects("RCLoads73").ListColumns(1).DataBodyRange, id) > 0
Done:
End Function

Private Sub Line73(ByVal dest As Worksheet, ByRef rr As Long, ByVal text As String, Optional ByVal heading As Boolean = False)
 With dest.Range("A" & rr & ":H" & rr)
  .Merge: .Value2 = "'" & text: .Font.name = "Arial": .Font.size = 11: .Font.color = RGB(32, 94, 115)
  .Font.bold = heading: .WrapText = True: .VerticalAlignment = xlCenter
  .Borders(xlEdgeBottom).LineStyle = xlContinuous: .Borders(xlEdgeBottom).Weight = xlHairline
  .Borders(xlEdgeBottom).color = RGB(190, 221, 237)
  .RowHeight = 22 + 15 * (Len(text) \ 100)
 End With
 rr = rr + 1
End Sub

Private Sub LoadTableRow74(ByVal dest As Worksheet, ByRef rr As Long, ByVal label As String, ByVal position As String, ByVal g As Variant, ByVal q As Variant, ByVal u As Variant, Optional ByVal heading As Boolean = False)
 Dim v As Variant, j As Long, spans As Variant, parts As Long
 spans = Array("A", "C", "E", "F", "G")
 v = Array(label, position, g, q, u)
 With dest.Range("A" & rr & ":H" & rr)
  .UnMerge: .ClearContents: .Interior.color = vbWhite
  .Font.name = "Arial": .Font.size = 10: .Font.color = RGB(32, 94, 115)
  .Font.bold = heading: .WrapText = True: .VerticalAlignment = xlCenter
  .Borders(xlEdgeBottom).LineStyle = xlContinuous: .Borders(xlEdgeBottom).Weight = xlHairline
  .Borders(xlEdgeBottom).color = RGB(190, 210, 221)
  If heading Then .Interior.color = RGB(228, 237, 242)
 End With
 dest.Range("A" & rr & ":B" & rr).Merge
 dest.Range("C" & rr & ":D" & rr).Merge
 dest.Range("G" & rr & ":H" & rr).Merge
 For j = 0 To 4
  With dest.Range(spans(j) & rr)
   .Value2 = v(j): .NumberFormat = "0.0"
   .HorizontalAlignment = IIf(j < 2, xlLeft, xlRight)
  End With
 Next j
 parts = WorksheetFunction.Max(UBound(Split(label, vbLf)) + 1, UBound(Split(position, vbLf)) + 1, 1 + Len(label) \ 28, 1 + Len(position) \ 24)
 dest.rows(rr).RowHeight = 8 + 16 * parts
 If heading Then dest.rows(rr).RowHeight = 28
 rr = rr + 1
End Sub

Public Sub CopyFullLoads73(ByVal id As String, ByVal dest As Worksheet, ByRef rr As Long)
 Dim s As Worksheet, a As Variant, i As Long, j As Long, row As Long, n As Long
 Dim kind As Variant, count As Long, label As String, position As String, g As Double, q As Double, used() As Boolean
 Set s = ThisWorkbook.Worksheets("RC Loads"): a = s.ListObjects("RCLoads73").DataBodyRange.Value2
 ReDim used(1 To UBound(a, 1))
 Line73 dest, rr, "Loading", True
 Line73 dest, rr, "ULS = 1.4 DL + 1.6 LL. DL includes assigned self-weight. Point values are per point."
 For Each kind In Array("LINE", "POINT")
  count = 0
  For i = 1 To UBound(a, 1)
   If CStr(a(i, 1)) = id And CStr(a(i, 2)) = kind Then
    If CDbl(a(i, 5)) <> 0 Or CDbl(a(i, 6)) <> 0 Then count = count + 1
   End If
  Next i
  If count > 0 Then
   LoadTableRow74 dest, rr, IIf(kind = "POINT", "Point load", "Line load"), "Position x (m)", IIf(kind = "POINT", "DL (kN)", "DL (kN/m)"), IIf(kind = "POINT", "LL (kN)", "LL (kN/m)"), IIf(kind = "POINT", "ULS (kN)", "ULS (kN/m)"), True
   For i = 1 To UBound(a, 1)
    If CStr(a(i, 1)) = id And CStr(a(i, 2)) = kind And Not used(i) Then
     g = CDbl(a(i, 5)): q = CDbl(a(i, 6))
     If g <> 0 Or q <> 0 Then
      used(i) = True: label = CStr(a(i, 7)): position = Format(a(i, 3), "0.###"): n = 1
      If kind = "LINE" Then
       position = position & " - " & Format(a(i, 4), "0.###")
      Else
       ' Group exact-equal values only. Each source keeps its own aligned position.
       For j = i + 1 To UBound(a, 1)
        If CStr(a(j, 1)) = id And CStr(a(j, 2)) = "POINT" And Not used(j) Then
         If CDbl(a(j, 5)) = g And CDbl(a(j, 6)) = q And n < 4 Then
          label = label & vbLf & CStr(a(j, 7)): position = position & vbLf & Format(a(j, 3), "0.###")
          used(j) = True: n = n + 1
         End If
        End If
       Next j
      End If
      LoadTableRow74 dest, rr, label, position, g, q, 1.4 * g + 1.6 * q
     End If
    End If
   Next i
  End If
 Next kind
 Set s = ThisWorkbook.Worksheets("RC Load Results")
 row = WorksheetFunction.Match(id, s.Range("A:A"), 0)
 Line73 dest, rr, "RB = (sum(P a) + sum(w l c)) / L; RA = sum(loads) - RB."
 Line73 dest, rr, "Maximum M: load boundaries and V = 0. a/c: point/line-centroid position; l: loaded length."
 Line73 dest, rr, "RA = " & Format(s.cells(row, 5).Value2, "0.0") & "; RB = " & Format(s.cells(row, 6).Value2, "0.0") & " kN"
 Line73 dest, rr, "M = " & Format(s.cells(row, 3).Value2, "0.0") & " kNm; V = " & Format(s.cells(row, 4).Value2, "0.0") & " kN"
End Sub

Public Sub ProjectFloorSnapshot73()
 Dim s As Worksheet, f As Worksheet, n As Long, oldN As Long, i As Long
 Set s = ThisWorkbook.Worksheets("Section A " & ChrW(&H6284)): Set f = ThisWorkbook.Worksheets("Project Floors")
 n = f.cells(f.rows.count, 1).End(xlUp).row - 4
 If n < 1 Then Exit Sub
 oldN = 10 + CopyOffset98()
 If n > oldN Then
  s.rows(CStr(21 + oldN) & ":" & CStr(20 + n)).Insert
 ElseIf n < oldN Then
  s.rows(CStr(21 + n) & ":" & CStr(20 + oldN)).Delete
 End If
 For i = 1 To n
  s.Range("A" & (i + 20) & ":H" & (i + 20)).Value2 = f.Range("A" & (i + 4) & ":H" & (i + 4)).Value2
 Next i
End Sub

Public Sub DrawFullLoads73(ByVal dest As Worksheet, ByVal box As Range, ByVal id As String)
 Dim a As Variant, span As Double, x0 As Double, x1 As Double, y As Double, h As Double, i As Long, j As Long
 Dim p As Shape, q As Shape, height As Double, maximum As Double, value As Double, xx As Double, yy As Double, key As String
 Dim data As Worksheet, row As Long
 Set data = ThisWorkbook.Worksheets("RC Load Results")
 row = WorksheetFunction.Match(id, data.Range("A:A"), 0): span = data.cells(row, 2).Value2
 a = ThisWorkbook.Worksheets("RC Loads").ListObjects("RCLoads73").DataBodyRange.Value2
 key = "full73_" & box.row & "_"
 For i = dest.Shapes.count To 1 Step -1
  If Left$(dest.Shapes(i).name, Len(key)) = key Then dest.Shapes(i).Delete
 Next i
 x0 = box.Left + 35: x1 = box.Left + box.width - 35: y = box.top + box.height * 0.7: h = box.height * 0.42
 Set p = dest.Shapes.AddShape(1, box.Left, box.top, box.width, box.height): p.name = key & "background"
 p.fill.ForeColor.RGB = vbWhite: p.line.visible = msoFalse
 Set p = dest.Shapes.AddLine(x0, y, x1, y): p.name = key & "beam": p.line.Weight = 3: p.line.ForeColor.RGB = RGB(32, 94, 115)
 For i = 0 To 1
  Set p = dest.Shapes.AddShape(7, IIf(i = 0, x0, x1) - 7, y, 14, 13): p.name = key & "support" & i
  p.fill.ForeColor.RGB = RGB(32, 94, 115)
 Next i
 For i = 1 To UBound(a, 1)
  If CStr(a(i, 1)) = id Then maximum = WorksheetFunction.Max(maximum, 1.4 * a(i, 5) + 1.6 * a(i, 6))
 Next i
 If maximum = 0 Then maximum = 1
 For i = 1 To UBound(a, 1)
  If CStr(a(i, 1)) = id Then
   value = 1.4 * a(i, 5) + 1.6 * a(i, 6): height = h * value / maximum
   If value > 0 Then
    For j = 0 To IIf(CStr(a(i, 2)) = "POINT", 0, 4)
     xx = x0 + (x1 - x0) * (CDbl(a(i, 3)) + (CDbl(a(i, 4)) - CDbl(a(i, 3))) * j / 4) / span
     Set p = dest.Shapes.AddLine(xx, y - 8 - height, xx, y - 3): p.name = key & "load" & i & "_" & j
     p.line.EndArrowheadStyle = 3: p.line.ForeColor.RGB = IIf(CStr(a(i, 2)) = "POINT", RGB(186, 67, 57), RGB(75, 130, 95))
    Next j
    If CStr(a(i, 2)) = "LINE" Then
     Set p = dest.Shapes.AddLine(x0 + (x1 - x0) * a(i, 3) / span, y - 8 - height, x0 + (x1 - x0) * a(i, 4) / span, y - 8 - height)
     p.name = key & "line" & i: p.line.ForeColor.RGB = RGB(75, 130, 95)
    End If
   End If
  End If
 Next i
 Set p = dest.Shapes.AddTextbox(1, box.Left + 5, box.top + 5, box.width - 10, 30): p.name = key & "title"
 p.TextFrame.Characters.text = id & " - ULS loads (all positions shown; values in schedule)": p.TextFrame.Characters.Font.size = 11
 p.line.visible = msoFalse: p.fill.visible = msoFalse
 Set p = dest.Shapes.AddTextbox(1, x0, y + 18, x1 - x0, 24): p.name = key & "span"
 p.TextFrame.Characters.text = "L = " & Format(span, "0.###") & " m": p.TextFrame.Characters.Font.size = 11
 p.line.visible = msoFalse: p.fill.visible = msoFalse
End Sub

Public Sub CopyTransferA73(ByVal dest As Worksheet, ByRef rr As Long, ByVal tb As Worksheet, ByVal i As Long)
 Dim id As String, v As Double, limit As Double
 id = CStr(tb.cells(i, 1).Value2)
 dest.Range("A" & rr & ":H" & (rr + 11)).RowHeight = 23
 DrawFullLoads73 dest, dest.Range("A" & rr & ":H" & (rr + 11)), id: rr = rr + 12
 Line73 dest, rr, "Span / Depth = " & Format(tb.cells(i, 2).Value2 * 1000, "0.###") & " / " & Format(tb.cells(i, 3).Value2, "0.###") & IIf(tb.cells(i, 2).Value2 > 10.001 And tb.cells(i, 21).Value2 <> "Cantilever", " x " & Format(tb.cells(i, 2).Value2, "0.###") & " / 10", "") & " = " & Format(tb.cells(i, 22).Value2, "0.00") & "; limit = " & Format(tb.cells(i, 23).Value2, "0.00") & ". " & tb.cells(i, 24).text
 CopyFullLoads73 id, dest, rr
 v = tb.cells(i + 21, 35).Value2: limit = tb.cells(i + 21, 36).Value2
 Line73 dest, rr, "Vult = MAX(V_L, V_R) = " & Format(tb.cells(i + 21, 34).Value2, "0.00") & " kN"
 Line73 dest, rr, "v = Vult x 1000 / (bw x 0.9 x Depth in mm)"
 Line73 dest, rr, "= " & Format(tb.cells(i + 21, 34).Value2, "0.00") & " x 1000 / (" & Format(tb.cells(i, 20).Value2 * 1000, "0.###") & " x 0.9 x " & Format(tb.cells(i, 3).Value2, "0.###") & ")"
 Line73 dest, rr, "= " & Format(v, "0.00") & " N/mm2 " & IIf(v <= limit, "<=", ">") & " 0.8 sqrt(fcu) = " & Format(limit, "0.00") & " N/mm2. " & tb.cells(i, 25).text
End Sub

Public Function FullLoadKey115(ByVal id As String) As String
 Dim a As Variant, i As Long, j As Long
 a = ThisWorkbook.Worksheets("RC Loads").ListObjects("RCLoads73").DataBodyRange.Value2
 For i = 1 To UBound(a, 1)
  If CStr(a(i, 1)) = id Then
   For j = 1 To 7
    FullLoadKey115 = FullLoadKey115 & "|" & Text85(a(i, j))
   Next j
  End If
 Next i
End Function
