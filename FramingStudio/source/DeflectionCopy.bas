Option Explicit
Private Busy As Boolean
Private Const ReportName As String = "Deflection 抄"

Private Function CopySheet() As Worksheet
    On Error Resume Next
    Set CopySheet = ThisWorkbook.Worksheets(ReportName)
    On Error GoTo 0
    If CopySheet Is Nothing Then
        Set CopySheet = ThisWorkbook.Worksheets.Add(After:=BCore)
        CopySheet.Name = ReportName
    End If
End Function

Private Function Num(ByVal v As Variant, Optional ByVal fmt As String = "0.000") As String
    If IsNumeric(v) And CStr(v) <> "" Then Num = Format(CDbl(v), fmt) Else Num = "pending"
End Function

Private Sub LineText(ByVal s As Worksheet, ByVal r As Long, ByVal text As String, Optional ByVal bold As Boolean = False, Optional ByVal lastCol As String = "L", Optional ByVal rows As Long = 1)
    With s.Range("A" & r & ":" & lastCol & CStr(r + rows - 1))
        .Merge
        .Value2 = text
        .Font.Bold = bold
        .VerticalAlignment = xlCenter
        .WrapText = True
    End With
End Sub

Private Sub LabelShape(ByVal s As Worksheet, ByVal x As Double, ByVal y As Double, ByVal w As Double, ByVal h As Double, ByVal text As String)
    Dim sh As Shape
    Set sh = s.Shapes.AddTextbox(1, x, y, w, h)
    sh.Line.Visible = 0: sh.Fill.Visible = 0
    sh.TextFrame2.MarginLeft = 0: sh.TextFrame2.MarginRight = 0
    sh.TextFrame2.MarginTop = 0: sh.TextFrame2.MarginBottom = 0
    sh.TextFrame2.TextRange.Text = text
    sh.TextFrame2.TextRange.Font.Size = 8
    sh.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = RGB(43, 82, 113)
End Sub

Private Sub DrawCore(ByVal s As Worksheet, ByVal topRow As Long, ByVal face As String)
    Dim dx As Object, dy As Object, r As Long, a As Variant, z As Variant, t As Double
    Dim boxes(1 To 20, 1 To 4) As Double, n As Long, i As Long
    Dim x1 As Double, x2 As Double, y1 As Double, y2 As Double, minX As Double, maxX As Double, minY As Double, maxY As Double
    Dim x As Double, y As Double, w As Double, h As Double, diagramScale As Double, sh As Shape
    Set dx = CreateObject("Scripting.Dictionary"): Set dy = CreateObject("Scripting.Dictionary")
    For r = 36 To 45
        If CStr(BCore.Cells(r, 1).Value2) <> "" Then dx(CStr(BCore.Cells(r, 1).Value2)) = BCore.Cells(r, 2).Value2
        If CStr(BCore.Cells(r, 5).Value2) <> "" Then dy(CStr(BCore.Cells(r, 5).Value2)) = BCore.Cells(r, 6).Value2
    Next r
    minX = 1E+20: minY = 1E+20: maxX = -1E+20: maxY = -1E+20
    For r = 12 To 31
        If CStr(BCore.Cells(r, 2).Value2) <> "" And CStr(BCore.Cells(r, 5).Value2) <> "0" Then
            a = Split(CStr(BCore.Cells(r, 2).Value2), "/"): z = Split(CStr(BCore.Cells(r, 3).Value2), "/")
            x1 = CDbl(dx(a(0))): x2 = CDbl(dx(z(0))): y1 = CDbl(dy(a(1))): y2 = CDbl(dy(z(1)))
            t = CDbl(BCore.Range("B6").Value2) / 1000
            If IsNumeric(BCore.Cells(r, 4).Value2) And CStr(BCore.Cells(r, 4).Value2) <> "" Then t = CDbl(BCore.Cells(r, 4).Value2) / 1000
            n = n + 1
            boxes(n, 1) = WorksheetFunction.Min(x1, x2): boxes(n, 2) = WorksheetFunction.Max(x1, x2)
            boxes(n, 3) = WorksheetFunction.Min(y1, y2): boxes(n, 4) = WorksheetFunction.Max(y1, y2)
            If Abs(x1 - x2) < 0.000000001 Then
                boxes(n, 1) = boxes(n, 1) - t / 2: boxes(n, 2) = boxes(n, 2) + t / 2
            Else
                boxes(n, 3) = boxes(n, 3) - t / 2: boxes(n, 4) = boxes(n, 4) + t / 2
            End If
            minX = WorksheetFunction.Min(minX, boxes(n, 1)): maxX = WorksheetFunction.Max(maxX, boxes(n, 2))
            minY = WorksheetFunction.Min(minY, boxes(n, 3)): maxY = WorksheetFunction.Max(maxY, boxes(n, 4))
        End If
    Next r
    If n = 0 Then Exit Sub
    x = s.Range("H" & topRow).Left + 10: y = s.Range("H" & topRow).Top + 24
    w = s.Range("H1:L1").Width - 24: h = s.Range("H" & topRow & ":L" & (topRow + 12)).Height - 44
    diagramScale = WorksheetFunction.Min(w / (maxX - minX), h / (maxY - minY))
    For i = 1 To n
        Set sh = s.Shapes.AddShape(1, x + (boxes(i, 1) - minX) * diagramScale, y + (boxes(i, 3) - minY) * diagramScale, (boxes(i, 2) - boxes(i, 1)) * diagramScale, (boxes(i, 4) - boxes(i, 3)) * diagramScale)
        sh.Line.Visible = 0: sh.Fill.ForeColor.RGB = RGB(52, 105, 132)
    Next i
    LabelShape s, x, y - 19, w + 10, 16, "CORE PLAN - " & BCore.Range("J46").Value2 & " wind"
    LabelShape s, x, y + (maxY - minY) * diagramScale + 5, w + 10, 26, "X " & Num(maxX - minX) & " m / Y " & Num(maxY - minY) & " m"
End Sub

Public Sub InvalidateDeflectionCopy()
    Dim s As Worksheet
    On Error Resume Next
    Set s = ThisWorkbook.Worksheets(ReportName)
    If Not s Is Nothing Then
        s.Range("P1").Value2 = "DIRTY"
        s.Range("A6").Value2 = "INPUT CHANGED - click Calculate B + D before using this copy"
        s.Range("A66").Value2 = "INPUT CHANGED - click Calculate B + D before using this copy"
        s.Range("A6").Font.Color = RGB(178, 45, 39): s.Range("A66").Font.Color = RGB(178, 45, 39)
    End If
End Sub

Public Sub GenerateDeflectionCopy()
    Dim s As Worksheet, m As Worksheet, f As Variant, offset As Long, r As Long, ev As Boolean, view As String, result As String, governing As String
    Dim q As Double, breadth As Double, height As Double, E As Double, inertia As Double, delta As Double, limit As Double, utilisation As Double, denom As Variant
    Dim layered As Boolean, loadCol As Long, tableStart As Long
    Dim area As Double, cx As Double, cy As Double, Ixx As Double, Iyy As Double, Ixy As Double, direction As String, base As Variant, roof As Variant, c As Long
    If Busy Then Exit Sub
    Busy = True: ev = Application.EnableEvents: Application.EnableEvents = False
    On Error GoTo Failed
    Set s = CopySheet(): Set m = ThisWorkbook.Worksheets("_Deflection Meta")
    s.Cells.UnMerge: s.Cells.Clear
    For r = s.Shapes.Count To 1 Step -1: s.Shapes(r).Delete: Next r
    With s.Range("A1:L120")
        .Font.Name = "Calibri": .Font.Size = 10.5: .Font.Color = RGB(41, 79, 108)
        .RowHeight = 12: .VerticalAlignment = xlCenter
    End With
    s.Columns("A:L").ColumnWidth = 6.3
    s.ResetAllPageBreaks: s.HPageBreaks.Add Before:=s.Range("A61")
    With s.PageSetup
        .PaperSize = xlPaperA4: .Orientation = xlPortrait
        .LeftMargin = 28: .RightMargin = 28: .TopMargin = 28: .BottomMargin = 28
        .HeaderMargin = 10: .FooterMargin = 10
        .PrintArea = "$A$1:$L$120": .Zoom = False: .FitToPagesWide = 1: .FitToPagesTall = False
        .CenterHorizontally = True: .CenterFooter = "Section A - Scheme 1 | &P / &N"
    End With
    view = SelectedFace()
    If Not IsNumeric(BDeflection.Range("H29").Value2) Or Not IsNumeric(BDeflection.Range("J29").Value2) Then Err.Raise 5, , "Complete both faces, then click Calculate B + D"
    If BDeflection.Range("H30").Value2 <> "OK" And BDeflection.Range("H30").Value2 <> "NOT OK" Then Err.Raise 5, , "B face not assessed"
    If BDeflection.Range("J30").Value2 <> "OK" And BDeflection.Range("J30").Value2 <> "NOT OK" Then Err.Raise 5, , "D face not assessed"
    If Abs(CDbl(BDeflection.Range("H29").Value2) - CDbl(BDeflection.Range("J29").Value2)) < 0.0000001 Then
        governing = "B / D (equal utilisation)"
    ElseIf CDbl(BDeflection.Range("H29").Value2) > CDbl(BDeflection.Range("J29").Value2) Then
        governing = "B"
    Else
        governing = "D"
    End If
    For Each f In Array("B", "D")
        offset = 0: c = 2: If CStr(f) = "D" Then offset = 60: c = 3
        ViewFace CStr(f)
        If CStr(BDeflection.Range("B23").Value2) <> "Inputs complete" Then Err.Raise 5, , CStr(f) & " inputs incomplete"
        loadCol = 8: If CStr(f) = "D" Then loadCol = 10
        layered = CStr(BDeflection.Cells(20, loadCol).Value2) = "LAYERED"
        q = 0: breadth = 0
        If IsNumeric(BDeflection.Range("B17").Value2) Then q = Val(BDeflection.Range("B17").Value2)
        If IsNumeric(BDeflection.Range("B18").Value2) Then breadth = Val(BDeflection.Range("B18").Value2)
        height = BDeflection.Range("B19").Value2
        E = BDeflection.Range("B37").Value2: inertia = BDeflection.Range("B38").Value2: delta = BDeflection.Range("B39").Value2
        limit = BDeflection.Range("B21").Value2: utilisation = BDeflection.Range("B42").Value2: denom = BDeflection.Range("B43").Value2
        area = BCore.Range("J37").Value2: cx = BCore.Range("J38").Value2: cy = BCore.Range("J39").Value2
        Ixx = BCore.Range("J40").Value2: Iyy = BCore.Range("J41").Value2: Ixy = BCore.Range("J42").Value2
        direction = CStr(BCore.Range("J46").Value2): result = CStr(BDeflection.Range("B44").Value2)
        base = m.Cells(3, c).Value2: roof = m.Cells(4, c).Value2
        LineText s, offset + 2, "Deflection Checking of Building - " & CStr(f) & " Face", True, "L", 2
        s.Range("A" & offset + 2).Font.Size = 15: s.Range("A" & offset + 2).Font.Underline = xlUnderlineStyleSingle
        LineText s, offset + 5, CStr(m.Range("B1").Value2) & " | Scheme 1 - RC"
        LineText s, offset + 6, "Governing face: " & governing & " | B: " & Num(BDeflection.Range("H29").Value2) & "   D: " & Num(BDeflection.Range("J29").Value2) & " (utilisation)", True
        LineText s, offset + 9, "Wind along " & direction & " is assessed for this face.", False, "G", 2
        LineText s, offset + 11, "Assume the selected connected concrete core alone resists wind. Constant section and E over H.", False, "G", 3
        If layered Then
            LineText s, offset + 14, "Use service wind from Wind Load Check. Integrate each loaded interval; unloaded heights contribute no wind.", False, "G", 3
        Else
            LineText s, offset + 14, "Use uniform service wind from Wind Load Check over the full cantilever height.", False, "G", 3
        End If
        If layered Then
            LineText s, offset + 18, "q, B and loaded heights: see interval schedule", False, "G"
        Else
            LineText s, offset + 18, "q = " & Num(q) & " kPa;  B = " & Num(breadth) & " m", False, "G"
        End If
        LineText s, offset + 19, "H = " & Num(height) & " m (full cantilever height)", False, "G"
        If IsNumeric(base) And IsNumeric(roof) And Abs(CDbl(roof) - CDbl(base) - height) < 0.000001 Then
            LineText s, offset + 20, "Roof " & Num(roof) & " - Base " & Num(base) & " mPD", False, "G"
        Else
            LineText s, offset + 20, "H as entered in Deflection Check input", False, "G"
        End If
        LineText s, offset + 21, CStr(BDeflection.Range("B24").Value2) & "; E = " & Num(E / 1000000) & " GPa", False, "G"
        LineText s, offset + 22, "Allowable top deflection = H / " & Num(limit, "0.###"), False, "G"
        DrawCore s, offset + 9, CStr(f)
        LineText s, offset + 25, "Moment of inertia of the core wall (centroidal axes)", True
        LineText s, offset + 27, "A = " & Num(area, "0.0000") & " m" & ChrW(178) & "; local C.G. = (" & Num(cx) & ", " & Num(cy) & ") m"
        LineText s, offset + 29, "Ixx = " & Num(Ixx, "0.0000") & " m" & ChrW(8308) & "    Iyy = " & Num(Iyy, "0.0000") & " m" & ChrW(8308)
        LineText s, offset + 30, "Ixy = " & Num(Ixy, "0.0000") & " m" & ChrW(8308) & "  (wall intersections counted once; plan voids excluded)"
        LineText s, offset + 32, "Centroidal I = sum of (local I + A x offset" & ChrW(178) & ") over the union section."
        If direction = "X" Then
            LineText s, offset + 34, "Ieff = Iyy - Ixy" & ChrW(178) & " / Ixx = " & Num(Iyy, "0.0000") & " - (" & Num(Ixy, "0.0000") & ")" & ChrW(178) & " / " & Num(Ixx, "0.0000"), False, "L", 2
        Else
            LineText s, offset + 34, "Ieff = Ixx - Ixy" & ChrW(178) & " / Iyy = " & Num(Ixx, "0.0000") & " - (" & Num(Ixy, "0.0000") & ")" & ChrW(178) & " / " & Num(Iyy, "0.0000"), False, "L", 2
        End If
        LineText s, offset + 36, "       = " & Num(inertia, "0.0000") & " m" & ChrW(8308), True
        If layered Then
            LineText s, offset + 39, "Deflection checking - piecewise uniform wind", True
            LineText s, offset + 41, "wi = qi x Bi; a, b measured above fixed base. " & ChrW(916) & " = sum of " & ChrW(916) & "i."
            LineText s, offset + 43, ChrW(916) & "i = wi [4H(b" & ChrW(179) & " - a" & ChrW(179) & ") - (b" & ChrW(8308) & " - a" & ChrW(8308) & ")] / (24EI)", False, "L", 2
        Else
            LineText s, offset + 39, "Deflection checking - uniform-load elastic cantilever", True
            LineText s, offset + 41, "w = q x B = " & Num(q) & " x " & Num(breadth) & " = " & Num(q * breadth) & " kN/m"
            LineText s, offset + 43, ChrW(916) & " = wH" & ChrW(8308) & " / (8EI) = " & Num(q * breadth) & " x " & Num(height) & ChrW(8308) & " / (8 x " & Num(E, "0") & " x " & Num(inertia, "0.0000") & ")", False, "L", 2
        End If
        LineText s, offset + 45, "   = " & Num(delta, "0.00000") & " m = " & Num(delta * 1000, "0.00") & " mm", True
        If delta = 0 Then
            LineText s, offset + 47, "Zero applied wind: deflection = 0. " & result, True
        Else
            LineText s, offset + 47, ChrW(916) & " / H = 1 / " & Num(denom, "0.0") & "  " & IIf(utilisation <= 1, ChrW(8804), ">") & "  1 / " & Num(limit, "0.###") & "   therefore " & result, True
        End If
        LineText s, offset + 49, "Allowable = " & Num(height / limit * 1000, "0.00") & " mm; utilisation = " & Num(utilisation, "0.0000")
        If result <> "OK" Then s.Range("A" & offset + 47).Font.Color = RGB(178, 45, 39)
        LineText s, offset + 52, "First-order flexure only. Cracking, shear, dynamics, torsion, soil interaction and redistribution are not included.", False, "L", 2
        LineText s, offset + 55, "Calculation: original Deflection Check / Core Wall workbook. Layout reference: ERIC.pdf.", False, "L", 2
        For r = offset + 5 To offset + 58
            With s.Range("A" & r & ":L" & r).Borders(xlEdgeBottom)
                .LineStyle = xlContinuous: .Weight = xlHairline: .Color = RGB(222, 230, 235)
            End With
        Next r
    Next f
    tableStart = 121
    If CStr(BDeflection.Range("H20").Value2) = "LAYERED" Then AppendWindSchedule s, "B", tableStart
    If CStr(BDeflection.Range("J20").Value2) = "LAYERED" Then AppendWindSchedule s, "D", tableStart
    s.PageSetup.PrintArea = "$A$1:$L$" & CStr(tableStart - 1)
    ViewFace view
    s.Range("P1").Value2 = "CURRENT": s.Range("P2").Value2 = governing
    s.Columns("P:Z").Hidden = True
    GoTo Done
Failed:
    If Not s Is Nothing Then
        LineText s, 2, "Deflection Checking of Building", True, "L", 2
        LineText s, 6, "NOT ASSESSED - " & Err.Description, True, "L", 3
        s.Range("P1").Value2 = "NOT ASSESSED"
        s.PageSetup.PrintArea = "$A$1:$L$60"
    End If
Done:
    Application.EnableEvents = ev: Busy = False
End Sub

Private Sub AppendWindSchedule(ByVal s As Worksheet, ByVal face As String, ByRef pageStart As Long)
    Dim w As Worksheet, off As Long, r As Long, index As Long, row As Long, c As Long, start As Long, stopRow As Long, lastRow As Long
    Dim headers As Variant, cols As Variant, ends As Variant, src As Variant
    Set w = ThisWorkbook.Worksheets("Layered Wind")
    off = 0: If face = "D" Then off = 12
    lastRow = 12
    For r = 13 To 512
        If CStr(w.Cells(r, off + 10).Value2) = "OK" Then lastRow = r
    Next r
    headers = Array("Layer", "a (m)", "b (m)", "q (kPa)", "B (m)", "F (kN)", "M (kNm)", "Delta (mm)")
    cols = Array(1, 3, 4, 5, 6, 7, 9, 11): ends = Array(2, 3, 4, 5, 6, 8, 10, 12)
    src = Array(1, 2, 3, 4, 5, 7, 8, 9)
    For start = 13 To lastRow Step 24
        stopRow = WorksheetFunction.Min(lastRow, start + 23)
        s.HPageBreaks.Add Before:=s.Cells(pageStart, 1)
        With s.Range(s.Cells(pageStart, 1), s.Cells(pageStart + 59, 12))
            .RowHeight = 12: .Font.Name = "Calibri": .Font.Size = 9: .Font.Color = RGB(41, 79, 108)
        End With
        LineText s, pageStart + 1, "Deflection - " & face & " Wind Interval Schedule", True, "L", 2
        s.Cells(pageStart + 1, 1).Font.Size = 15
        LineText s, pageStart + 4, "Wind Load Check data; heights a, b above fixed base. Per-layer contributions are summed.", False, "L", 2
        For c = 0 To 7
            With s.Range(s.Cells(pageStart + 8, cols(c)), s.Cells(pageStart + 9, ends(c)))
                .Merge: .Value2 = headers(c): .Interior.Color = RGB(228, 238, 244): .Font.Bold = True: .WrapText = True
            End With
        Next c
        For r = start To stopRow
            row = pageStart + 10 + (r - start) * 1.5
            For c = 0 To 7
                With s.Range(s.Cells(row, cols(c)), s.Cells(row, ends(c)))
                    .Merge: .Formula = "='Layered Wind'!" & w.Cells(r, off + src(c)).Address
                    If c > 0 Then .NumberFormat = "0.000"
                    .Borders(xlEdgeBottom).Color = RGB(221, 231, 236)
                End With
            Next c
        Next r
        LineText s, pageStart + 50, "Total force = " & Num(w.Cells(6, off + 2).Value2) & " kN; base moment = " & Num(w.Cells(7, off + 2).Value2) & " kNm", True
        LineText s, pageStart + 52, "Total top deflection = " & Num(w.Cells(8, off + 2).Value2) & " mm (all intervals)", True
        LineText s, pageStart + 55, "wi = qi Bi; Fi = wi(bi-ai); Mi = Fi(ai+bi)/2. Exact interval integration; no point-load approximation.", False, "L", 2
        pageStart = pageStart + 60
    Next start
End Sub
