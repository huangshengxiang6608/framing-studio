Option Explicit

' Exact simply-supported actions for independent G/Q point and piecewise UDL inputs.
' The input range is an Excel table and expands when a row is added.
Public Function FullAction73(ByVal id As String, ByVal span As Double, ByVal loads As Range, ByVal code As String) As Variant
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
  .Merge: .Value2 = "'" & text: .Font.Name = "Arial": .Font.Size = 11: .Font.Color = RGB(32, 94, 115)
  .Font.Bold = heading: .WrapText = True: .VerticalAlignment = xlCenter
  .Borders(xlEdgeBottom).LineStyle = xlContinuous: .Borders(xlEdgeBottom).Weight = xlHairline
  .Borders(xlEdgeBottom).Color = RGB(190, 221, 237)
  .RowHeight = 22 + 15 * (Len(text) \ 100)
 End With
 rr = rr + 1
End Sub

Public Sub CopyFullLoads73(ByVal id As String, ByVal dest As Worksheet, ByRef rr As Long)
 Dim s As Worksheet, a As Variant, i As Long, row As Long, r As Range, n As Long
 Set s = ThisWorkbook.Worksheets("RC Loads"): a = s.ListObjects("RCLoads73").DataBodyRange.Value2
 Line73 dest, rr, "Loading - complete G / Q schedule", True
 Line73 dest, rr, "G includes self-weight already assigned to this beam. ULS = 1.4 G + 1.6 Q."
 For i = 1 To UBound(a, 1)
  If CStr(a(i, 1)) = id Then
   n = n + 1
   If CStr(a(i, 2)) = "POINT" Then
    Line73 dest, rr, CStr(n) & ") " & CStr(a(i, 7)) & ": x = " & Format(a(i, 3), "0.###") & " m; G = " & Format(a(i, 5), "0.###") & "; Q = " & Format(a(i, 6), "0.###") & " kN"
   Else
    Line73 dest, rr, CStr(n) & ") " & CStr(a(i, 7)) & ": x = " & Format(a(i, 3), "0.###") & " to " & Format(a(i, 4), "0.###") & " m; G = " & Format(a(i, 5), "0.###") & "; Q = " & Format(a(i, 6), "0.###") & " kN/m"
   End If
   Line73 dest, rr, "ULS = 1.4 x " & Format(a(i, 5), "0.###") & " + 1.6 x " & Format(a(i, 6), "0.###") & " = " & Format(1.4 * a(i, 5) + 1.6 * a(i, 6), "0.###") & IIf(CStr(a(i, 2)) = "POINT", " kN", " kN/m")
  End If
 Next i
 Set s = ThisWorkbook.Worksheets("RC Load Results")
 row = WorksheetFunction.Match(id, s.Range("A:A"), 0)
 Line73 dest, rr, "Simply supported: RB = sum(P x) / L + sum[w (b-a) (a+b) / 2] / L; RA = sum(loads) - RB."
 Line73 dest, rr, "M(x) = RA x - sum[P max(x-a,0)] - sum[w t (x-a-t/2)], t = max(0,min(x,b)-a)."
 Line73 dest, rr, "Maximum M checked at all load boundaries and each interior V(x)=0 position."
 Line73 dest, rr, "RA = " & Format(s.Cells(row, 5).Value2, "0.###") & "; RB = " & Format(s.Cells(row, 6).Value2, "0.###") & " kN"
 Line73 dest, rr, "M = " & Format(s.Cells(row, 3).Value2, "0.###") & " kNm; V = " & Format(s.Cells(row, 4).Value2, "0.###") & " kN"
End Sub

Public Sub ProjectFloorSnapshot73()
 Dim s As Worksheet, f As Worksheet, n As Long, oldN As Long, i As Long
 Set s = ThisWorkbook.Worksheets("Section A " & ChrW(&H6284)): Set f = ThisWorkbook.Worksheets("Project Floors")
 n = f.Cells(f.Rows.Count, 1).End(xlUp).Row - 4
 If n < 1 Then Exit Sub
 oldN = 10 + CopyOffset98()
 If n > oldN Then
  s.Rows(CStr(21 + oldN) & ":" & CStr(20 + n)).Insert
 ElseIf n < oldN Then
  s.Rows(CStr(21 + n) & ":" & CStr(20 + oldN)).Delete
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
 row = WorksheetFunction.Match(id, data.Range("A:A"), 0): span = data.Cells(row, 2).Value2
 a = ThisWorkbook.Worksheets("RC Loads").ListObjects("RCLoads73").DataBodyRange.Value2
 key = "full73_" & box.Row & "_"
 For i = dest.Shapes.Count To 1 Step -1
  If Left$(dest.Shapes(i).Name, Len(key)) = key Then dest.Shapes(i).Delete
 Next i
 x0 = box.Left + 35: x1 = box.Left + box.Width - 35: y = box.Top + box.Height * 0.7: h = box.Height * 0.42
 Set p = dest.Shapes.AddShape(1, box.Left, box.Top, box.Width, box.Height): p.Name = key & "background"
 p.Fill.ForeColor.RGB = vbWhite: p.Line.Visible = msoFalse
 Set p = dest.Shapes.AddLine(x0, y, x1, y): p.Name = key & "beam": p.Line.Weight = 3: p.Line.ForeColor.RGB = RGB(32, 94, 115)
 For i = 0 To 1
  Set p = dest.Shapes.AddShape(7, IIf(i = 0, x0, x1) - 7, y, 14, 13): p.Name = key & "support" & i
  p.Fill.ForeColor.RGB = RGB(32, 94, 115)
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
     Set p = dest.Shapes.AddLine(xx, y - 8 - height, xx, y - 3): p.Name = key & "load" & i & "_" & j
     p.Line.EndArrowheadStyle = 3: p.Line.ForeColor.RGB = IIf(CStr(a(i, 2)) = "POINT", RGB(186, 67, 57), RGB(75, 130, 95))
    Next j
    If CStr(a(i, 2)) = "LINE" Then
     Set p = dest.Shapes.AddLine(x0 + (x1 - x0) * a(i, 3) / span, y - 8 - height, x0 + (x1 - x0) * a(i, 4) / span, y - 8 - height)
     p.Name = key & "line" & i: p.Line.ForeColor.RGB = RGB(75, 130, 95)
    End If
   End If
  End If
 Next i
 Set p = dest.Shapes.AddTextbox(1, box.Left + 5, box.Top + 5, box.Width - 10, 30): p.Name = key & "title"
 p.TextFrame.Characters.Text = id & " - ULS loads (all positions shown; values in schedule)": p.TextFrame.Characters.Font.Size = 11
 p.Line.Visible = msoFalse: p.Fill.Visible = msoFalse
 Set p = dest.Shapes.AddTextbox(1, x0, y + 18, x1 - x0, 24): p.Name = key & "span"
 p.TextFrame.Characters.Text = "L = " & Format(span, "0.###") & " m": p.TextFrame.Characters.Font.Size = 11
 p.Line.Visible = msoFalse: p.Fill.Visible = msoFalse
End Sub

Public Sub CopyTransferA73(ByVal dest As Worksheet, ByRef rr As Long, ByVal tb As Worksheet, ByVal i As Long)
 Dim id As String, v As Double, limit As Double
 id = CStr(tb.Cells(i, 1).Value2)
 dest.Range("A" & rr & ":H" & (rr + 11)).RowHeight = 23
 DrawFullLoads73 dest, dest.Range("A" & rr & ":H" & (rr + 11)), id: rr = rr + 12
 Line73 dest, rr, "Span / Depth = " & Format(tb.Cells(i, 2).Value2 * 1000, "0.###") & " / " & Format(tb.Cells(i, 3).Value2, "0.###") & IIf(tb.Cells(i, 2).Value2 > 10.001 And tb.Cells(i, 21).Value2 <> "Cantilever", " x " & Format(tb.Cells(i, 2).Value2, "0.###") & " / 10", "") & " = " & Format(tb.Cells(i, 22).Value2, "0.00") & "; limit = " & Format(tb.Cells(i, 23).Value2, "0.00") & ". " & tb.Cells(i, 24).Text
 CopyFullLoads73 id, dest, rr
 v = tb.Cells(i + 21, 35).Value2: limit = tb.Cells(i + 21, 36).Value2
 Line73 dest, rr, "Vult = MAX(V_L, V_R) = " & Format(tb.Cells(i + 21, 34).Value2, "0.00") & " kN"
 Line73 dest, rr, "v = Vult x 1000 / (bw x 0.9 x Depth in mm)"
 Line73 dest, rr, "= " & Format(tb.Cells(i + 21, 34).Value2, "0.00") & " x 1000 / (" & Format(tb.Cells(i, 20).Value2 * 1000, "0.###") & " x 0.9 x " & Format(tb.Cells(i, 3).Value2, "0.###") & ")"
 Line73 dest, rr, "= " & Format(v, "0.00") & " N/mm2 " & IIf(v <= limit, "<=", ">") & " 0.8 sqrt(fcu) = " & Format(limit, "0.00") & " N/mm2. " & tb.Cells(i, 25).Text
End Sub
