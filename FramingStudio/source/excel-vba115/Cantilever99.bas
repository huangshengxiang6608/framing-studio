Option Explicit
Public CBBusy99 As Boolean
Public Function CBKey99(ByVal r As Long) As String
 Dim c As Range, s As Worksheet, t As String
 Set s = ThisWorkbook.Worksheets("Input")
 For Each c In s.Range("A" & r & ":M" & r & ",C3,F3")
  t = t & "|" & Text85(c.Value2)
 Next c
 With ThisWorkbook.Worksheets("Section B Cantilever Beam Check")
  CBKey99 = t & FullLoadKey115(CStr(s.Cells(r, 1).Value2)) & "|" & Text85(.Range("G18").Value2) & "|" & Text85(.Range("G19").Value2)
 End With
End Function
Public Function CBPending99() As Boolean
 Dim r As Long, h As Worksheet
 Set h = ThisWorkbook.Worksheets("_CB Analysis")
 For r = 124 To 143
  If CBUsed99(r) Then
   If h.cells(r - 118, 94).Value2 <> CBKey99(r) Or h.cells(r - 118, 90).Value2 = "CHECK REQUIRED" Then CBPending99 = True: Exit Function
  End If
 Next r
End Function
Public Function CBUsed99(ByVal r As Long) As Boolean
 Dim s As Worksheet, c As Range
 Set s = ThisWorkbook.Worksheets("Input")
 If s.cells(r, 2).Value2 <> "Cantilever Beam" Then Exit Function
 For Each c In s.Range("C" & r & ":D" & r & ",F" & r & ":M" & r)
  If IsError(c.Value2) Then CBUsed99 = True: Exit Function
  If Len(CStr(c.Value2)) > 0 Then CBUsed99 = True: Exit Function
 Next c
End Function
Public Function CBStatus99(ByVal data As Range, ByVal fcu As Variant, ByVal fire As Variant) As String
 Dim a As Variant, k As Variant, v As Variant, u As Worksheet, n As Long
 On Error GoTo Bad
 a = data.Value2: Set u = data.Worksheet
 CBStatus99 = "ENTER MEMBER ID": If Len(Trim$(CStr(a(1, 1)))) = 0 Then Exit Function
 n = Application.CountIf(u.Range("A124:A143"), a(1, 1)) + Application.CountIf(u.Range("A34:A43"), a(1, 1)) + Application.CountIf(u.Range("A49:A68"), a(1, 1)) + Application.CountIf(u.Range("A74:A93"), a(1, 1))
 CBStatus99 = "DUPLICATE ID": If n <> 1 Then Exit Function
 CBStatus99 = "SELECT CANTILEVER BEAM": If a(1, 2) <> "Cantilever Beam" Or a(1, 5) <> "Cantilever" Then Exit Function
 CBStatus99 = "ENTER SPAN, WIDTH AND DEPTH"
 For Each k In Array(3, 4, 6)
  If Not IsNumeric(a(1, k)) Or Len(CStr(a(1, k))) = 0 Then Exit Function
  If CDbl(a(1, k)) <= 0 Then Exit Function
 Next k
 CBStatus99 = "DEFLECTION CALC REQUIRED: SPAN > 10 m": If CDbl(a(1, 3)) > 10 Then Exit Function
 CBStatus99 = "ENTER CONCRETE GRADE": If Not IsNumeric(fcu) Or Len(CStr(fcu)) = 0 Then Exit Function
 If fcu < 25 Or fcu > 80 Then Exit Function
 CBStatus99 = "SELECT FIRE HOURS": If Application.CountIf(ThisWorkbook.Worksheets("Section B Concrete Cover").Range("B6:D6"), fire) <> 1 Or Len(CStr(fire)) = 0 Then Exit Function
 If HasFullLoads73(CStr(a(1, 1))) Then
  v = FullAction73(CStr(a(1, 1)), CDbl(a(1, 3)), ThisWorkbook.Worksheets("RC Loads").ListObjects("RCLoads73").DataBodyRange, "VALID", True)
  If IsError(v) Then GoTo Bad
  CBStatus99 = CStr(v): Exit Function
 End If
 CBStatus99 = "ENTER DL, SDL AND LL (ZERO ALLOWED)"
 For Each k In Array(7, 8, 9)
  If Not IsNumeric(a(1, k)) Or Len(CStr(a(1, k))) = 0 Then Exit Function
 Next k
 CBStatus99 = "LOADS / ECCENTRICITY MUST BE NUMERIC AND NONNEGATIVE"
 For Each k In Array(7, 8, 9, 10, 11, 12, 13)
  If Len(CStr(a(1, k))) Then
   If Not IsNumeric(a(1, k)) Then Exit Function
   If CDbl(a(1, k)) < 0 Then Exit Function
  End If
 Next k
 CBStatus99 = "ENTER POINT LOAD DISTANCE FROM FIXED END"
 If Val(CStr(a(1, 10))) + Val(CStr(a(1, 11))) > 0 And Len(CStr(a(1, 12))) = 0 Then Exit Function
 CBStatus99 = "POINT LOAD DISTANCE OUTSIDE SPAN": If Val(CStr(a(1, 12))) > CDbl(a(1, 3)) Then Exit Function
 CBStatus99 = "OK": Exit Function
Bad:
 CBStatus99 = "CHECK INPUTS"
End Function
Public Function CBCover99() As String
 CBCover99 = "=IFERROR(INDEX('Section B Concrete Cover'!$B$9:$D$10,1,MATCH(Input!$F$3,'Section B Concrete Cover'!$B$6:$D$6,0)),"""")"
End Function
Public Sub CBSelect99(ByVal r As Long)
 With ThisWorkbook.Worksheets("Section B Cantilever Beam Check")
  .Range("T37").Value2 = r
  .Calculate
 End With
 ThisWorkbook.Worksheets("_CB Analysis").Calculate
 Application.CalculateFull
End Sub
Public Sub CheckOneCB99(ByVal r As Long, Optional ByVal force As Boolean = False)
 Dim s As Worksheet, h As Worksheet, q As Long, issue As String
 Set s = ThisWorkbook.Worksheets("Section B Cantilever Beam Check"): Set h = ThisWorkbook.Worksheets("_CB Analysis")
 q = r - 118
 If h.cells(q, 1).Value2 <> ThisWorkbook.Worksheets("Input").cells(r, 1).Value2 Then h.cells(q, 53).Resize(1, 140).ClearContents
 h.cells(q, 1).Value2 = ThisWorkbook.Worksheets("Input").cells(r, 1).Value2
 CBSelect99 r: CBLoadAuto81 q
 s.Range("T37").Value2 = r: s.Range("G13").formula = "=N(INDEX(Input!M124:M143,T37-123))"
 s.Range("G16").formula = CBCover99()
 Application.CalculateFull
 issue = Text85(h.Range("I25").Value2)
 If issue = "OK" Then
  If force Or h.cells(q, 58).Value2 <> "MANUAL" Then
   s.Range("T16").Value2 = "Auto": s.Range("R24").Value2 = "AUTO: selecting cantilever steel"
   CantileverSheet99.RunReferenceDesign True
   If Not ApplyBarSize84(s, "CB") Then s.Range("R24").Value2 = "AUTO STOPPED: revise section / reinforcement"
  Else
   s.Range("T16").Value2 = "Manual": s.Range("R24").Value2 = "MANUAL: saved reinforcement checked"
  End If
  Application.CalculateFull
  issue = BeamDetail85(s, "CB")
  If issue = "OK" Then s.Range("R24").Value2 = "Checked: cantilever beam section"
 Else
  s.Range("R24").Value2 = "AUTO STOPPED: INPUT REQUIRED - " & issue
  issue = "INPUT REQUIRED - " & issue
 End If
 CBSaveAuto81 q
 h.cells(q, 90).Value2 = State85(issue): h.cells(q, 91).Value2 = issue
 h.cells(q, 92).Value2 = CBBeamBarDescription(44): h.cells(q, 93).Value2 = CBBeamBarDescription(40)
 h.cells(q, 94).Value2 = CBKey99(r)
 s.Range("B5").Value2 = State85(issue): s.Range("BR36").Value2 = issue
 CBDrawBeamV24
End Sub
Public Sub CheckAllCB99()
 Dim r As Long, prev As Long, s As Worksheet, h As Worksheet
 If CBBusy99 Then Exit Sub
 CBBusy99 = True
 On Error GoTo Done
 Set s = ThisWorkbook.Worksheets("Section B Cantilever Beam Check"): Set h = ThisWorkbook.Worksheets("_CB Analysis")
 prev = Val(s.Range("T37").Value2)
 For r = 124 To 143
  If CBUsed99(r) Then CheckOneCB99 r
 Next r
 If prev >= 124 And prev <= 143 Then
  CBSelect99 prev: CBLoadAuto81 prev - 118: s.Range("T37").Value2 = prev
  s.Range("G13").formula = "=N(INDEX(Input!M124:M143,T37-123))"
  s.Range("B5").Value2 = h.cells(prev - 118, 90).Value2: s.Range("BR36").Value2 = h.cells(prev - 118, 91).Value2
  s.Calculate: CBDrawBeamV24
 End If
Done:
 CBBusy99 = False
 If Err.number Then Err.Raise Err.number, "CheckAllCB99", Err.Description
End Sub
Public Sub OpenCB99(ByVal id As String)
 Dim p As Variant, ev As Boolean
 p = Application.Match(id, ThisWorkbook.Worksheets("Input").Range("A124:A143"), 0)
 If IsError(p) Then Exit Sub
 ev = Application.EnableEvents: Application.EnableEvents = False: CBBusy99 = True
 On Error GoTo Done
 CheckOneCB99 CLng(p) + 123
 Application.GoTo ThisWorkbook.Worksheets("Section B Cantilever Beam Check").Range("A1"), True
Done:
 CBBusy99 = False: Application.EnableEvents = ev
 If Err.number Then Err.Raise Err.number, "OpenCB99", Err.Description
End Sub
Public Sub UpdateCB99()
 OpenCB99 CStr(ThisWorkbook.Worksheets("Section B Cantilever Beam Check").Range("C9").Value2)
 DrawLiveSummary98
End Sub
Public Sub AutoCB99()
 Dim ev As Boolean
 ev = Application.EnableEvents: Application.EnableEvents = False: CBBusy99 = True
 On Error GoTo Done
 CheckOneCB99 CLng(ThisWorkbook.Worksheets("Section B Cantilever Beam Check").Range("T37").Value2), True
 DrawLiveSummary98
Done:
 CBBusy99 = False: Application.EnableEvents = ev
 If Err.number Then Err.Raise Err.number, "AutoCB99", Err.Description
End Sub
Public Function CBChanged99(ByVal sh As Object, ByVal target As Range) As Boolean
 Dim r As Long, ev As Boolean
 If sh.name <> "Section B Cantilever Beam Check" Then Exit Function
 CBChanged99 = True: If CBBusy99 Then Exit Function
 If Intersect(target, sh.Range("G18:G19,C40:D47,C110:D117,E58,G58:H58,E76,G76:H76,T8:T11,BU44:BU45,CB44:CB45")) Is Nothing Then Exit Function
 ev = Application.EnableEvents: Application.EnableEvents = False
 On Error GoTo Done
 If Not Intersect(target, sh.Range("G18:G19")) Is Nothing Then
  For r = 124 To 143
   If CBUsed99(r) Then ThisWorkbook.Worksheets("_CB Analysis").cells(r - 118, 90).Value2 = "CHECK REQUIRED"
  Next r
  DrawLiveSummary98
  GoTo Done
 End If
 BeamSettings84 sh, target, "CB"
 r = Val(sh.Range("T37").Value2)
 If r >= 124 And r <= 143 Then
  sh.Range("T16").Value2 = "Manual": sh.Range("R24").Value2 = "MANUAL: press UPDATE to check"
  CBSaveAuto81 r - 118
  ThisWorkbook.Worksheets("_CB Analysis").cells(r - 118, 90).Value2 = "CHECK REQUIRED"
  DrawLiveSummary98
 End If
Done:
 Application.EnableEvents = ev
End Function
Public Sub AppendAllCB99()
 Dim r As Long, ev As Boolean
 ev = Application.EnableEvents: Application.EnableEvents = False
 On Error GoTo Done
 For r = 124 To 143
  If CBUsed99(r) Then
   CBSelect99 r: CBLoadAuto81 r - 118
   ThisWorkbook.Worksheets("Section B Cantilever Beam Check").Range("T37").Value2 = r
   ThisWorkbook.Worksheets("Section B Cantilever Beam Check").Range("G13").formula = "=N(INDEX(Input!M124:M143,T37-123))"
   Application.CalculateFull
   AppendCantileverCopy99
  End If
 Next r
Done:
 Application.EnableEvents = ev
 If Err.number Then Err.Raise Err.number, "AppendAllCB99", Err.Description
End Sub
