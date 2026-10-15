using System;
using System.IO;
using System.Linq;
using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;
class PrintGuard286Test {
 [STAThread] static int Main(string[] args){
  var assembly=Assembly.LoadFrom(Path.GetFullPath(args[0]));var bridge=assembly.GetType("ExcelBridge");
  var factory=bridge.GetMethod("CreateReportExcel286",BindingFlags.Static|BindingFlags.NonPublic);
  var guardType=bridge.GetNestedType("PrintGuard286",BindingFlags.NonPublic);
  var original=Process.GetProcessesByName("EXCEL").Select(p=>p.Id).ToArray();
  dynamic excel=factory.Invoke(null,null);excel.Visible=false;excel.DisplayAlerts=false;
  var watch=Stopwatch.StartNew();
  // Inject only the service-status reader. Do not stop Windows Spooler or
  // change printers. Exercise a real, blocked COM call in the owned Excel.
  Func<bool> status=()=>watch.ElapsedMilliseconds<1500;
  IDisposable guard=(IDisposable)Activator.CreateInstance(guardType,new object[]{(object)excel,status});
  bool interrupted=false;
  try{excel.InputBox("Isolated print-service failure regression test",Type.Missing,Type.Missing,Type.Missing,Type.Missing,Type.Missing,Type.Missing,2);}
  catch(COMException){interrupted=true;}
  finally{guard.Dispose();}
  var error=Convert.ToString(guardType.GetField("Error").GetValue(guard));
  if(!interrupted||watch.Elapsed.TotalSeconds>10||!error.Contains("Print Spooler"))throw new Exception("Blocked COM did not exit promptly: "+error);
  foreach(int id in original)using(var p=Process.GetProcessById(id))if(p.HasExited)throw new Exception("Pre-existing Excel was affected");
  Console.WriteLine("PASS blocked Excel COM interrupted in "+watch.Elapsed.TotalSeconds.ToString("F3")+" s; pre-existing Excel untouched; Windows service unchanged.");
  return 0;
 }
}
