using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;

// Native Excel equivalence: preserve SpecialCells membership and order,
// including merged cells, discontiguous ranges, literal '=' text and scalars.
static class BulkFormulas281 {
 static object Call(string name, params object[] args) { return typeof(ExcelBridge).GetMethod(name, BindingFlags.NonPublic|BindingFlags.Static).Invoke(null,args); }
 static void Compare(dynamic sheet) {
  var old=new List<string>();
  foreach(dynamic cell in sheet.UsedRange.SpecialCells(-4123).Cells)
   if(Convert.ToBoolean(cell.HasFormula)) old.Add(cell.Row+":"+cell.Column+":"+Convert.ToString(cell.Formula));
  var current=new List<string>();
  foreach(object cell in (IEnumerable)Call("FormulaCells281",(object)sheet)) {
   Type t=cell.GetType(); current.Add(t.GetField("Row").GetValue(cell)+":"+t.GetField("Column").GetValue(cell)+":"+t.GetField("Formula").GetValue(cell));
  }
  if(!old.SequenceEqual(current)) throw new Exception("Formula membership/order differs: "+sheet.Name+" old="+old.Count+" new="+current.Count);
  Console.WriteLine("PASS formula order "+sheet.Name+": "+old.Count);
 }
 static void Guard(dynamic sheet,bool reject) {
  bool failed=false; try{Call("RequireValueReport281",(object)sheet);}catch(TargetInvocationException){failed=true;}
  if(failed!=reject)throw new Exception("Formula guard mismatch: "+sheet.Name);
 }
 static int Main(string[] args) {
  dynamic x=null,b=null,template=null;
  try {
   x=Activator.CreateInstance(Type.GetTypeFromProgID("Excel.Application"));x.Visible=false;x.DisplayAlerts=false;x.EnableEvents=false;x.AutomationSecurity=3;
   b=x.Workbooks.Add();dynamic s=b.Worksheets[1];s.Name="mixed";
   s.Range["B3:D4"].Formula="=1+2";s.Range["F7:G7"].Merge();s.Range["F7"].Formula="=B3";
   s.Range["A10"].Formula="=1/0";s.Range["H6"].Value2="'=not a formula";s.Range["C9"].Value2=42;
   s.Range["K3:L4"].Formula="=4+5";Compare(s);Guard(s,true);
   dynamic scalar=b.Worksheets.Add();scalar.Name="scalar";scalar.Range["D5"].Formula="=2+3";Compare(scalar);Guard(scalar,true);
   dynamic values=b.Worksheets.Add();values.Name="values";values.Range["A1:B3"].Value2=5;values.Range["C4"].Value2="'=literal";Guard(values,false);
   dynamic empty=b.Worksheets.Add();empty.Name="empty";Guard(empty,false);
   template=x.Workbooks.Open(System.IO.Path.GetFullPath(args[0]),0,true);
   int n=0;foreach(dynamic sheet in template.Worksheets) {
    string name=Convert.ToString(sheet.Name);
    if((name.StartsWith("Section B ")&&(name.EndsWith(" Check")||name.EndsWith(" Design")))||name=="Section A Column Loading") {Compare(sheet);n++;}
   }
   if(n<7)throw new Exception("Missing original design sheets");
   Console.WriteLine("PASS bulk formula reads and merge guard on native Excel");return 0;
  } catch(Exception e){Console.Error.WriteLine(e);return 1;}
  finally {if(template!=null)template.Close(false);if(b!=null)b.Close(false);if(x!=null){x.Quit();Marshal.FinalReleaseComObject(x);}}
 }
}
