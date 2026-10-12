using System;using System.IO;using System.Runtime.InteropServices;using System.Web.Script.Serialization;
class VerifyLinks252 {
 [STAThread]static int Main(string[] args){dynamic x=null,b=null;int tested=0;
  try{x=Activator.CreateInstance(Type.GetTypeFromProgID("Excel.Application",true));x.Visible=false;x.DisplayAlerts=false;x.EnableEvents=false;x.AutomationSecurity=1;
   b=x.Workbooks.Open(Path.GetFullPath(args[0]),0,true);x.Calculation=-4135;
   foreach(dynamic sh in b.Worksheets)sh.EnableCalculation=true;
   b.Worksheets["RC Load Results"].EnableCalculation=false;b.Worksheets["Section B Column Check"].EnableCalculation=false;
   foreach(string name in new[]{"Section B Main Beam Design","Section B Secondary Beam Design","Section B Cantilever Beam Check","Section B Transfer Beam Check"}){
    dynamic s=b.Worksheets[name];
    foreach(int f in new[]{58,76})foreach(int d in new[]{8,10,12,16}){
     s.Cells[f,7].Value2=d;x.CalculateFull();
     foreach(int spacing in new[]{250,225,200,175,150,125,100,75,50}){
      s.Cells[f,8].Value2=spacing;s.Range["K"+f].Calculate();s.Range["N"+(f+1)].Calculate();
      object provided=s.Range["K"+f].Value2,check=s.Range["N"+(f+1)].Value2;
      x.CalculateFull();
      if(!object.Equals(provided,(object)s.Range["K"+f].Value2)||!object.Equals(check,(object)s.Range["N"+(f+1)].Value2))throw new Exception("Mismatch "+name+" "+f+" "+d+" "+spacing);
      tested++;
     }
    }
   }
   Console.WriteLine("PASS "+tested+" link candidates: provided area and pass/fail exactly match CalculateFull");
   if(args.Length>1){
    var asm=System.Reflection.Assembly.LoadFrom(Path.Combine(Path.GetFullPath(args[1]),"Excel","ExcelBridge.exe"));var type=asm.GetType("ExcelBridge");
    var flags=System.Reflection.BindingFlags.Static|System.Reflection.BindingFlags.NonPublic;
    var hold=type.GetMethod("HoldFixedLoads252",flags);var restore=type.GetMethod("RestoreFixedLoads252",flags);
    dynamic loads=b.Worksheets["RC Load Results"];loads.EnableCalculation=true;x.CalculateFull();
    int count=Convert.ToInt32(loads.ListObjects["RCLoadResults73"].DataBodyRange.Rows.Count);
    var job=new System.Collections.Generic.Dictionary<string,object>{{"fullLoads",new object[count]}};
    hold.Invoke(null,new object[]{b,job});if(Convert.ToBoolean(loads.EnableCalculation))throw new Exception("Load hold missing");
    restore.Invoke(null,new object[0]);if(!Convert.ToBoolean(loads.EnableCalculation))throw new Exception("Calculation not restored");
    hold.Invoke(null,new object[]{b,job});dynamic input=b.Worksheets["Input"];double span=Convert.ToDouble(input.Range["B74"].Value2);input.Range["B74"].Value2=span+1;
    bool rejected=false;try{restore.Invoke(null,new object[0]);}catch(System.Reflection.TargetInvocationException e){rejected=e.InnerException.Message.Contains("RC Load Results!");}
    if(!rejected||!Convert.ToBoolean(loads.EnableCalculation))throw new Exception("Changed geometry was not rejected/restored");
    Console.WriteLine("PASS fixed-load hold/restore; changed source span rejected; formula calculation restored after rejection");
    var studio=System.Reflection.Assembly.LoadFrom(Path.Combine(Path.GetFullPath(args[1]),"FramingStudio.exe")).GetType("Studio");
    var budget=studio.GetMethod("ExcelBudget252",flags);
    foreach(int n in new[]{0,1,10,26,1000}){var data=new System.Collections.Generic.Dictionary<string,object>{{"type","RC"},{"members",new object[n]}};int got=(int)budget.Invoke(null,new object[]{data});int expected=Math.Min(1800000,300000+Math.Max(0,n-1)*60000);if(got!=expected)throw new Exception("Budget mismatch");}
    Console.WriteLine("PASS bounded batch budgets, including empty, single-member, ten-member and oversized jobs");
   }
   return 0;
  }catch(Exception e){Console.WriteLine(e.ToString());return 1;}
  finally{if(b!=null)try{b.Close(false);}catch{}if(x!=null)try{x.Quit();Marshal.FinalReleaseComObject(x);}catch{}}
 }
}
