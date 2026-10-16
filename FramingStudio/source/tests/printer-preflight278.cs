using System;
using System.Diagnostics;
using System.Reflection;
using System.Threading;

// Compile with ExcelBridge.cs and /main:PrinterPreflight278. The child process
// simulates OS printer responses; no printer settings/services are changed.
static class PrinterPreflight278 {
 static int Main(string[] args){
  if(args.Length==1&&args[0]=="--printer-probe278"){
   string mode=Environment.GetEnvironmentVariable("FRAMING_PRINTER_TEST_MODE278");
   if(mode=="hang")Thread.Sleep(60000);
   return mode=="ok"?0:1;
  }
  string key="FRAMING_PRINTER_TEST_MODE278",previous=Environment.GetEnvironmentVariable(key);
  try{
   foreach(string mode in new[]{"ok","fail","hang"}){
    Environment.SetEnvironmentVariable(key,mode);var clock=Stopwatch.StartNew();Exception error=null;
    try{typeof(ExcelBridge).GetMethod("RequirePrinterResponse278",BindingFlags.NonPublic|BindingFlags.Static).Invoke(null,null);}
    catch(TargetInvocationException e){error=e.InnerException;}
    if((mode=="ok")!=(error==null))throw new Exception("Unexpected printer probe result: "+mode);
    if(mode=="hang"&&(clock.Elapsed.TotalSeconds<14||clock.Elapsed.TotalSeconds>25||!error.Message.Contains("逾時")))throw new Exception("Unbounded printer probe");
    Console.WriteLine("PASS "+mode+" "+clock.Elapsed.TotalSeconds.ToString("F2")+" seconds");
   }
   return 0;
  }finally{Environment.SetEnvironmentVariable(key,previous);}
 }
}
