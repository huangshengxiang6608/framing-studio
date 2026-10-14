Attribute VB_Name = "BeamTopUp"
Option Explicit
Private fastArea(0 To 1) As Double
Private fastDepth(0 To 1, 0 To 7) As Variant
Private fastMean(0 To 1) As Variant
Private fastFit(0 To 1) As Boolean
Private fastGroups As Boolean
Private Sub LoadFastGeometry()
 Dim s As Worksheet, a As Variant, x As Variant, dimen As Variant, link As Double
 Dim nn(0 To 1, 0 To 7) As Double, dd(0 To 1, 0 To 7) As Double
 Dim k As Long, i As Long, row As Long, Gap As Double, y As Double, previous As Double
 Dim count As Double, occupied As Long, total As Double, width As Double, c As Double, h As Double
 Dim dia As Double, n As Double, clear As Double, Capacity As Long, topEdge As Double, bottomEdge As Double
 Set s = BS
 a = s.Range("C40:D47").Value2: x = s.Range("C110:D117").Value2
 dimen = s.Range("G14:G16").Value2: link = Val(s.Range("G58").Value2)
 c = Val(dimen(3, 1)): h = Val(dimen(2, 1)): width = Val(dimen(1, 1)) - 2 * (c + link)
 topEdge = 0: bottomEdge = h: clear = 25
 For k = 0 To 1
  fastArea(k) = 0: fastFit(k) = True
  If k = 0 Then Gap = 10000000000# Else Gap = 25
  For i = 0 To 7
   If i < 4 Then
    row = i + 1 + 4 * k: nn(k, i) = Val(a(row, 1)): dd(k, i) = Val(a(row, 2))
   Else
    row = i - 3 + 4 * k: nn(k, i) = Val(x(row, 1)): dd(k, i) = Val(x(row, 2))
   End If
   n = nn(k, i): dia = dd(k, i)
   fastArea(k) = fastArea(k) + n * dia ^ 2 * Atn(1)
   If n > 0 And dia > 0 Then
    If k = 0 Then
     If dia < Gap Then Gap = dia
    Else
     If dia > Gap Then Gap = dia
    End If
   End If
   Capacity = 0
   If dia > 0 Then
    If dia > 25 Then Capacity = Int((width + dia) / (dia + dia)) Else Capacity = Int((width + 25) / (dia + 25))
    Capacity = WorksheetFunction.Max(0, WorksheetFunction.Min(Capacity, LayerCap86(Val(dimen(1, 1)))))
   End If
   If n < 0 Or n <> Int(n) Or n > Capacity Then fastFit(k) = False
   If n > 0 And (dia <= 0 Or dia > 40) Then fastFit(k) = False
  Next i
  If Gap = 10000000000# Then Gap = 0
  y = c + link: previous = 0: occupied = 0: total = 0: count = 0
  For i = 0 To 7
   n = nn(k, i): dia = dd(k, i)
   If n > 0 And dia > 0 Then
    If occupied = 0 Then y = y + dia / 2 Else y = y + previous / 2 + Gap + dia / 2
    occupied = occupied + 1: previous = dia
   End If
   fastDepth(k, i) = ""
   If n > 0 Then
    If k = 0 Then fastDepth(k, i) = y Else fastDepth(k, i) = h - y
    total = total + n * dia ^ 2 * CDbl(fastDepth(k, i)): count = count + n * dia ^ 2
    If dia > clear Then clear = dia
    If k = 0 Then
     If CDbl(fastDepth(k, i)) + dia / 2 > topEdge Then topEdge = CDbl(fastDepth(k, i)) + dia / 2
    Else
     If CDbl(fastDepth(k, i)) - dia / 2 < bottomEdge Then bottomEdge = CDbl(fastDepth(k, i)) - dia / 2
    End If
   End If
  Next i
  fastMean(k) = "": If count > 0 Then fastMean(k) = total / count
 Next k
 fastGroups = (bottomEdge - topEdge >= clear)
End Sub

Private Function BS() As Worksheet
 Dim sheet265 As Worksheet
 Dim caller265 As Object, marker265 As Name
 On Error GoTo CallerDone265
 Set caller265 = Application.Caller
 For Each marker265 In caller265.Parent.Names
  If Right(marker265.Name, 13) = "!_RCDesign265" And marker265.RefersTo = "=TRUE" Then Set sheet265 = caller265.Parent
 Next marker265
CallerDone265:
 Err.Clear
 On Error GoTo 0
 If sheet265 Is Nothing Then Set sheet265 = ThisWorkbook.Worksheets("Section B Transfer Beam Check")
 Set BS = sheet265
End Function
Public Function BeamLayerRow(ByVal firstRow As Long, ByVal i As Long) As Long
 If i < 4 Then BeamLayerRow = firstRow + i Else BeamLayerRow = firstRow + 66 + i
End Function
Public Function BeamSteelArea(ByVal firstRow As Long, Optional ByVal dependency1 As Variant, Optional ByVal dependency2 As Variant, Optional ByVal dependency3 As Variant, Optional ByVal dependency4 As Variant) As Double
Call LoadFastGeometry:  BeamSteelArea = fastArea(IIf(firstRow = 40, 0, 1))
End Function
Private Function Gap(ByVal firstRow As Long) As Double
 Dim i As Long, r As Long, d As Double, s As Worksheet
 Set s = BS
 If firstRow = 40 Then Gap = 10000000000# Else Gap = 25
 For i = 0 To 7
  r = BeamLayerRow(firstRow, i): d = Val(s.cells(r, 4).Value2)
  If Val(s.cells(r, 3).Value2) > 0 And d > 0 Then
   If firstRow = 40 Then Gap = WorksheetFunction.Min(Gap, d) Else Gap = WorksheetFunction.Max(Gap, d)
  End If
 Next i
 If Gap = 10000000000# Then Gap = 0
End Function
Public Function BeamLayerDepth(ByVal firstRow As Long, ByVal index As Long, Optional ByVal dependency1 As Variant, Optional ByVal dependency2 As Variant, Optional ByVal dependency3 As Variant, Optional ByVal dependency4 As Variant) As Variant
Call LoadFastGeometry:  BeamLayerDepth = fastDepth(IIf(firstRow = 40, 0, 1), index)
End Function
Public Function BeamDepth(ByVal firstRow As Long, Optional ByVal dependency1 As Variant, Optional ByVal dependency2 As Variant, Optional ByVal dependency3 As Variant, Optional ByVal dependency4 As Variant) As Variant
Call LoadFastGeometry:  BeamDepth = fastMean(IIf(firstRow = 40, 0, 1))
End Function
Private Function Capacity(ByVal r As Long) As Long
 Dim d As Double, g As Double, width As Double, s As Worksheet
 Set s = BS: d = Val(s.cells(r, 4).Value2): If d <= 0 Then Exit Function
 g = WorksheetFunction.Max(25, d)
 width = Val(s.Range("G14").Value2) - 2 * (Val(s.Range("G16").Value2) + Val(s.Range("G58").Value2))
 Capacity = WorksheetFunction.Max(0, WorksheetFunction.Min(LayerCap86(Val(s.Range("G14").Value2)), Int((width + g) / (d + g))))
End Function
Public Function BeamGroupsFit(Optional ByVal dependency1 As Variant, Optional ByVal dependency2 As Variant, Optional ByVal dependency3 As Variant, Optional ByVal dependency4 As Variant) As Boolean
Call LoadFastGeometry:  BeamGroupsFit = fastGroups
End Function
Public Function BeamBarsFit(ByVal firstRow As Long, Optional ByVal dependency1 As Variant, Optional ByVal dependency2 As Variant, Optional ByVal dependency3 As Variant, Optional ByVal dependency4 As Variant) As Boolean
Call LoadFastGeometry:  BeamBarsFit = fastFit(IIf(firstRow = 40, 0, 1)) And fastGroups
End Function
Private Function AddOne(ByVal firstRow As Long, ByVal limit As Double) As Boolean
 Dim i As Long, r As Long, pick As Long, least As Double, n As Double, s As Worksheet
 Set s = BS: least = 10000000000#
 For i = 0 To 7
  r = BeamLayerRow(firstRow, i): n = Val(s.cells(r, 3).Value2)
  If n > 0 And n < Capacity(r) Then
   If BeamSteelArea(firstRow) + Val(s.cells(r, 4).Value2) ^ 2 * Atn(1) <= limit Then
    If n < least Then least = n: pick = r
   End If
  End If
 Next i
 If pick = 0 And BeamSteelArea(firstRow) + 40 ^ 2 * Atn(1) <= limit Then
  For i = 0 To 7
   r = BeamLayerRow(firstRow, i)
   If Val(s.cells(r, 3).Value2) = 0 Then
    s.cells(r, 4).Value2 = 40
    If Capacity(r) > 0 Then pick = r
    Exit For
   End If
  Next i
 End If
 If pick = 0 Then Exit Function
 s.cells(pick, 3).Value2 = Val(s.cells(pick, 3).Value2) + 1
 If Not BeamGroupsFit() Then
  s.cells(pick, 3).Value2 = s.cells(pick, 3).Value2 - 1
  If s.cells(pick, 3).Value2 = 0 Then s.cells(pick, 4).ClearContents
 Else
  AddOne = True
 End If
End Function
Public Sub TopUpBeamToFourPercent()
 Dim s As Worksheet, limit As Double, firstRow As Variant, i As Long, r As Long, pass As Long, changed As Boolean
 Set s = BS
 limit = Val(s.Range("G14").Value2) * Val(s.Range("G15").Value2) * WorksheetFunction.Min(4, Val(s.Range("T11").Value2)) / 100
 If limit <= 0 Then Exit Sub
 For Each firstRow In Array(40, 44)
  For i = 7 To 0 Step -1
   r = BeamLayerRow(CLng(firstRow), i)
   If Val(s.cells(r, 3).Value2) > Capacity(r) Then s.cells(r, 3).Value2 = Capacity(r)
   Do While BeamSteelArea(CLng(firstRow)) > limit And Val(s.cells(r, 3).Value2) > 0
    s.cells(r, 3).Value2 = s.cells(r, 3).Value2 - 1
   Loop
   If Val(s.cells(r, 3).Value2) = 0 Then s.cells(r, 4).ClearContents
  Next i
 Next firstRow
 For pass = 1 To 2000
  Application.CalculateFull: changed = False
  If IsError(s.Range("K36").Value2) Or IsError(s.Range("K38").Value2) Then Exit For
  If BeamSteelArea(40) < Val(s.Range("K36").Value2) Then changed = AddOne(40, limit)
  If BeamSteelArea(44) < Val(s.Range("K38").Value2) Then
   If AddOne(44, limit) Then changed = True
  End If
  If Not changed And s.Range("N87").Value2 <> "OKAY" Then
   changed = AddOne(44, limit): If Not changed Then changed = AddOne(40, limit)
  End If
  If Not changed Then Exit For
 Next pass
 Application.CalculateFull
End Sub
Public Function BeamBarDescription(ByVal firstRow As Long) As String
 Dim i As Long, r As Long, s As Worksheet, t As String
 Set s = BS
 For i = 0 To 7
  r = BeamLayerRow(firstRow, i)
  If Val(s.cells(r, 3).Value2) > 0 Then
   If t <> "" Then t = t & " + "
   t = t & "L" & (i + 1) & ": " & s.cells(r, 3).Value2 & "T" & s.cells(r, 4).Value2
  End If
 Next i
 BeamBarDescription = t
End Function



