Option Explicit

Public Sub UpdateLayeredFace(ByVal face As String)
    Dim s As Worksheet, col As Long
    On Error Resume Next
    Set s = ThisWorkbook.Worksheets("Layered Wind")
    If s Is Nothing Then Exit Sub
    col = 2: If face = "D" Then col = 14
    If CStr(BCore.Range("J45").Value2) = "VALID" And IsNumeric(BDeflection.Range("Z44").Value2) Then
        s.Cells(5, col).Value2 = BDeflection.Range("Z44").Value2
    Else
        s.Cells(5, col).ClearContents
    End If
End Sub

Public Sub LayeredChanged(ByVal sh As Object, ByVal changed As Range)
    Dim ev As Boolean, f As Variant, col As Long, inputCol As Long
    If RunningCore Then Exit Sub
    ev = Application.EnableEvents: Application.EnableEvents = False
    On Error GoTo Done
    BDeflection.Unprotect
    For Each f In Array("B", "D")
        col = 8: inputCol = 1
        If CStr(f) = "D" Then col = 10: inputCol = 13
        If Not Intersect(changed, sh.Range(sh.Cells(13, inputCol), sh.Cells(512, inputCol + 4))) Is Nothing Then
            BDeflection.Cells(28, col).MergeArea.ClearContents
            BDeflection.Cells(29, col).MergeArea.ClearContents
            BDeflection.Cells(30, col).Value2 = "DIRTY - calculate"
        End If
    Next f
    InvalidateDeflectionCopy
Done:
    BDeflection.Protect UserInterfaceOnly:=True, DrawingObjects:=False
    Application.EnableEvents = ev
End Sub

Public Sub InstallLayeredDeflection()
    Dim s As Worksheet, f As Variant, off As Long, r As Long, c As Long, p As Long
    Dim loadCol As String, E As String, H As String, I As String, a As String, z As String, q As String, width As String, w As String, state As String, priorA As String, priorB As String
    Dim head As Variant, x As String, lo As String, hi As String, term As String, old As String, chosen As String, totalCol As String, profileCol As Long
    On Error Resume Next
    Set s = ThisWorkbook.Worksheets("Layered Wind")
    On Error GoTo 0
    If s Is Nothing Then Set s = ThisWorkbook.Worksheets.Add(After:=BCore): s.Name = "Layered Wind"
    s.Cells.Clear: s.Cells.Font.Name = "Calibri": s.Cells.Font.Size = 11
    s.Range("A1:W1").Merge: s.Range("A1").Value2 = "LAYERED WIND - constant-EI cantilever; heights measured above fixed base"
    s.Range("A1").Font.Bold = True: s.Range("A1").Font.Size = 14
    s.Range("A2:W2").Merge: s.Range("A2").Value2 = "Enter per-layer service q and breadth. Gaps may be unloaded; overlaps and out-of-height layers are invalid. Calculate B + D updates both faces and copy."
    s.Columns("A:W").ColumnWidth = 14: s.Rows("12:12").RowHeight = 35
    For Each f In Array("B", "D")
        off = 0: loadCol = "H": totalCol = "B": profileCol = 27
        If CStr(f) = "D" Then off = 12: loadCol = "J": totalCol = "N": profileCol = 39
        s.Cells(3, off + 1).Value2 = CStr(f) & " - E GPa": s.Cells(3, off + 2).Formula = "=IFERROR(VLOOKUP('Deflection Check'!" & loadCol & "19,'Deflection Check'!$G$68:$H$83,2,FALSE),"""")"
        s.Cells(4, off + 1).Value2 = "H m": s.Cells(4, off + 2).Formula = "=IF(ISNUMBER('Deflection Check'!" & loadCol & "18),'Deflection Check'!" & loadCol & "18,"""")"
        s.Cells(5, off + 1).Value2 = "Ieff m4"
        s.Cells(6, off + 1).Value2 = "Total F kN": s.Cells(6, off + 2).Formula = "=SUM(" & s.Range(s.Cells(13, off + 7), s.Cells(512, off + 7)).Address & ")"
        s.Cells(7, off + 1).Value2 = "Base M kNm": s.Cells(7, off + 2).Formula = "=SUM(" & s.Range(s.Cells(13, off + 8), s.Cells(512, off + 8)).Address & ")"
        s.Cells(8, off + 1).Value2 = "Top delta mm": s.Cells(8, off + 2).Formula = "=IF(" & totalCol & "10=""Inputs complete"",SUM(" & s.Range(s.Cells(13, off + 9), s.Cells(512, off + 9)).Address & "),""n.a."")"
        s.Cells(9, off + 1).Value2 = "Valid layers": s.Cells(9, off + 2).Formula = "=COUNTIF(" & s.Range(s.Cells(13, off + 10), s.Cells(512, off + 10)).Address & ",""OK"")"
        state = s.Range(s.Cells(13, off + 10), s.Cells(512, off + 10)).Address
        s.Cells(10, off + 1).Value2 = "Input status"
        s.Cells(10, off + 2).Formula = "=IF(AND(ISNUMBER(" & totalCol & "4)," & totalCol & "4>0,COUNTIF(" & state & ",""OK"")>0,COUNTIF(" & state & ",""CHECK INPUTS"")+COUNTIF(" & state & ",""OVERLAP"")=0),""Inputs complete"",""CHECK LAYER INPUTS"")"
        head = Array(CStr(f) & " layer", "Bottom a m", "Top b m", "q kPa", "Breadth m", "w kN/m", "F kN", "Mbase kNm", "delta mm", "Status")
        For c = 0 To 9: s.Cells(12, off + c + 1).Value2 = head(c): Next c
        s.Range(s.Cells(12, off + 1), s.Cells(12, off + 10)).Interior.Color = RGB(224, 237, 244)
        s.Range(s.Cells(12, off + 1), s.Cells(12, off + 10)).WrapText = True
        s.Range(s.Cells(13, off + 1), s.Cells(512, off + 5)).Interior.Color = RGB(255, 243, 193)
        s.Range(s.Cells(13, off + 1), s.Cells(512, off + 5)).Locked = False
        s.Range(s.Cells(13, off + 2), s.Cells(512, off + 9)).NumberFormat = "0.0000"
        E = "$" & totalCol & "$3": H = "$" & totalCol & "$4": I = "$" & totalCol & "$5"
        For r = 13 To 512
            a = s.Cells(r, off + 2).Address(False, False): z = s.Cells(r, off + 3).Address(False, False)
            q = s.Cells(r, off + 4).Address(False, False): width = s.Cells(r, off + 5).Address(False, False)
            w = s.Cells(r, off + 6).Address(False, False): state = s.Cells(r, off + 10).Address(False, False)
            term = """OK"""
            If r > 13 Then
                priorA = s.Range(s.Cells(13, off + 2), s.Cells(r - 1, off + 2)).Address
                priorB = s.Range(s.Cells(13, off + 3), s.Cells(r - 1, off + 3)).Address
                term = "IF(COUNTIFS(" & priorA & ",""<""&" & z & "," & priorB & ","">""&" & a & ")>0,""OVERLAP"",""OK"")"
            End If
            s.Cells(r, off + 10).Formula = "=IF(COUNTA(" & s.Range(s.Cells(r, off + 1), s.Cells(r, off + 5)).Address(False, False) & ")=0,"""",IF(AND(COUNT(" & a & ":" & width & ")=4," & a & ">=0," & z & ">" & a & "," & z & "<=" & H & "," & q & ">=0," & width & ">0)," & term & ",""CHECK INPUTS""))"
            s.Cells(r, off + 6).Formula = "=IF(" & state & "=""OK""," & q & "*" & width & ","""")"
            s.Cells(r, off + 7).Formula = "=IF(" & state & "=""OK""," & w & "*(" & z & "-" & a & "),"""")"
            s.Cells(r, off + 8).Formula = "=IF(" & state & "=""OK""," & s.Cells(r, off + 7).Address(False, False) & "*(" & z & "+" & a & ")/2,"""")"
            s.Cells(r, off + 9).Formula = "=IF(AND(" & state & "=""OK"",ISNUMBER(" & I & ")," & I & ">0,ISNUMBER(" & E & ")," & E & ">0)," & w & "*(4*" & H & "*(" & z & "^3-" & a & "^3)-(" & z & "^4-" & a & "^4))/(24*" & E & "*1000000*" & I & ")*1000,"""")"
            For p = 0 To 10
                x = "(" & H & "*" & CStr(p) & "/10)": lo = "MIN(" & z & "," & x & ")": hi = "MAX(" & a & "," & x & ")"
                term = "IF(" & a & "<" & x & "," & x & "*(" & lo & "^3-" & a & "^3)-(" & lo & "^4-" & a & "^4)/4,0)+IF(" & z & ">" & x & "," & x & "^2*(1.5*(" & z & "^2-" & hi & "^2)-" & x & "*(" & z & "-" & hi & ")),0)"
                s.Cells(r, profileCol + p).Formula = "=IF(AND(" & state & "=""OK"",ISNUMBER(" & I & ")," & I & ">0,ISNUMBER(" & E & ")," & E & ">0)," & w & "/(6*" & E & "*1000000*" & I & ")*(" & term & ")*1000,0)"
            Next p
        Next r
        For p = 0 To 10
            s.Cells(8, profileCol + p).Formula = "=SUM(" & s.Range(s.Cells(13, profileCol + p), s.Cells(512, profileCol + p)).Address & ")"
        Next p
    Next f
    s.Columns("AA:AW").Hidden = True
    s.PageSetup.Orientation = xlLandscape: s.PageSetup.PaperSize = xlPaperA3
    s.PageSetup.PrintArea = "$A$1:$W$35": s.PageSetup.Zoom = False: s.PageSetup.FitToPagesWide = 1: s.PageSetup.FitToPagesTall = False
    BDeflection.Unprotect
    chosen = "IF($H$23=""B"",H20,J20)"
    old = Mid(BDeflection.Range("B23").Formula, 2)
    BDeflection.Range("B23").Formula = "=IF(" & chosen & "=""LAYERED"",IF(AND(COUNT(B19:B21)=3,MIN(B19:B21)>0,'Core Wall'!J45=""VALID"",ISNUMBER(H31),H31>0,IF($H$23=""B"",'Layered Wind'!B10,'Layered Wind'!N10)=""Inputs complete""),""Inputs complete"",""CHECK INPUTS"")," & old & ")"
    old = Mid(BDeflection.Range("B36").Formula, 2)
    BDeflection.Range("B36").Formula = "=IF(" & chosen & "=""LAYERED"",""See Layered Wind""," & old & ")"
    old = Mid(BDeflection.Range("B39").Formula, 2)
    BDeflection.Range("B39").Formula = "=IF(" & chosen & "=""LAYERED"",IF($B$23=""Inputs complete"",IF($H$23=""B"",'Layered Wind'!B8,'Layered Wind'!N8)/1000,""n.a."")," & old & ")"
    old = Mid(BDeflection.Range("B43").Formula, 2)
    BDeflection.Range("B43").Formula = "=IF(AND(" & chosen & "=""LAYERED"",$B$23=""Inputs complete"",B39=0),""NO DRIFT""," & old & ")"
    old = Mid(BDeflection.Range("B44").Formula, 2)
    BDeflection.Range("B44").Formula = "=IF(" & chosen & "=""LAYERED"",IF(ISNUMBER(B42),IF(B42<=1,""OK"",""NOT OK""),""CHECK INPUTS"")," & old & ")"
    For p = 0 To 10
        old = Mid(BDeflection.Cells(49 + p, 3).Formula, 2)
        BDeflection.Cells(49 + p, 3).Formula = "=IF(" & chosen & "=""LAYERED"",IF($B$23=""Inputs complete"",IF($H$23=""B"",'Layered Wind'!" & s.Cells(8, 27 + p).Address & ",'Layered Wind'!" & s.Cells(8, 39 + p).Address & "),""n.a."")," & old & ")"
        BDeflection.Cells(49 + p, 4).Value2 = "Uniform: original formula. Layered: exact superposition of each loaded interval."
    Next p
    BDeflection.Range("A3").Value2 = "B / D independent inputs. UNIFORM uses original formula; LAYERED uses Layered Wind inputs. Click Calculate B + D."
    BDeflection.Range("F10").Value2 = "Constant-EI, first-order elastic flexure. UNIFORM over full H or piecewise uniform LAYERED loading. No cracking, shear, dynamics, torsion, soil interaction or redistribution."
End Sub
