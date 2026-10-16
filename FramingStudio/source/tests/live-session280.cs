using System;
using System.IO;
using System.Text;
using System.Linq;
using System.Reflection;
using System.Diagnostics;
using System.Threading;
using System.Collections.Generic;
using System.Web.Script.Serialization;

// Compile with ExcelBridge.cs /main:LiveSession280. Exercises real cross-process
// IPC and lifetime guards, using fake workbook metadata (no Excel automation).
static class LiveSession280 {
 static JavaScriptSerializer J=new JavaScriptSerializer();
 static object Call(string name,params object[] args){return typeof(ExcelBridge).GetMethod(name,BindingFlags.NonPublic|BindingFlags.Static).Invoke(null,args);}
 static void Write(string file,object value){File.WriteAllText(file,J.Serialize(value));}
 static Dictionary<string,object> Read(string file){return J.Deserialize<Dictionary<string,object>>(File.ReadAllText(file));}
 static void Check(bool yes,string label){if(!yes)throw new Exception(label);}
 static string Root,Template;static int count;
 static string Fresh(){string d=Path.Combine(Root,"run"+(++count));Directory.CreateDirectory(d);return d;}
 static Dictionary<string,object> Job(bool prepare){var j=new Dictionary<string,object>{{"type","RC"},{"section","B"},{"fingerprint","model1"},{"cells",new Dictionary<string,object>{{"D34",5.1}}},{"members",new object[]{"SB19"}}};if(prepare)j["prepareRC279"]=true;return j;}
 static Process Start(string directory,int seconds,bool fail=false){
  Write(Path.Combine(directory,"job.json"),Job(true));
  var s=new ProcessStartInfo(typeof(LiveSession280).Assembly.Location,"--server \""+directory+"\" \""+Template+"\" "+(fail?"fail":"ok")){UseShellExecute=false,CreateNoWindow=true};
  s.EnvironmentVariables["FRAMING_LIVE_SECONDS280"]=seconds.ToString();return Process.Start(s);
 }
 static void Ready(string dir,Process process){var timer=Stopwatch.StartNew();while(timer.ElapsedMilliseconds<10000&&!process.HasExited){if((bool)Call("Ready280",dir,process.Id))return;Thread.Sleep(50);}throw new Exception("worker never published verified ready");}
 static int? Use(Dictionary<string,object> j,out string dir){dir=Fresh();Write(Path.Combine(dir,"job.json"),j);Call("Start79",dir,Template);return (int?)Call("UseLive280",j,dir);}
 static void Main(string[] args){
  if(args[0]=="--server"){
   string dir=args[1],source=args[2];var job=Read(Path.Combine(dir,"job.json"));Call("Start79",dir,source);
   var verified=new Dictionary<string,object>{{"ok",true},{"preparedRC279",true},{"compared",12},{"differences",new object[0]},{"fingerprint","model1"},{"workbook",null},{"files",new object[0]}};
   object[] a={source,dir,job,verified,null};bool next=(bool)Call("WaitLive280",a);
   if(next){string destination=Path.GetDirectoryName((string)a[4]);bool ok=args[3]=="ok";Write(Path.Combine(destination,"result.json"),new{ok=ok,continuedLive280=true,compared=ok?12:0});Call("CompleteLive280",ok?0:1);}
   else File.WriteAllText(Path.Combine(dir,"expired.txt"),"closed");return;
  }
  Root=Path.GetFullPath(args[0]);Directory.CreateDirectory(Root);Environment.SetEnvironmentVariable("FRAMING_CACHE_DIR",Path.Combine(Root,"cache"));
  string excel=Path.Combine(Root,"app","Excel");Directory.CreateDirectory(excel);Directory.CreateDirectory(Path.Combine(Root,"app","assets"));
  Template=Path.Combine(excel,"template.xlsm");File.WriteAllText(Template,"unchanged");File.WriteAllText(Path.Combine(excel,"templates.json"),"{}");File.WriteAllText(Path.Combine(Root,"app","assets","index.html"),"E280");
  string origin=Fresh(),target;using(var worker=Start(origin,20)){
   Ready(origin,worker);Check(!(bool)Call("Ready280",origin,worker.Id+1),"another process cannot complete this Check");
   var changed=Job(false);changed["fingerprint"]="model2";Check(Use(changed,out target)==null,"changed model must miss live session");
   changed=Job(false);changed["cells"]="changed inputs";Check(Use(changed,out target)==null,"changed inputs must miss live session");
   Check(Use(Job(true),out target)==0,"repeat Check reuses live verification");Check((bool)Read(Path.Combine(target,"result.json"))["cached"],"repeat Check explicitly cached");
   Check(!worker.HasExited,"repeat Check retains workbook");
   Check(Use(Job(false),out target)==0,"report continues verified worker");Check((bool)Read(Path.Combine(target,"result.json"))["continuedLive280"],"actual live completion");
   Check(worker.WaitForExit(5000),"worker exits after report");Check(Use(Job(false),out target)==null,"consumed session cannot be reused");
  }
  origin=Fresh();using(var worker=Start(origin,1)){Ready(origin,worker);Check(worker.WaitForExit(5000),"idle timeout releases worker");Check(File.Exists(Path.Combine(origin,"expired.txt")),"expiry path executed");Check(Use(Job(false),out target)==null,"expired session rejected");}
  origin=Fresh();using(var worker=Start(origin,20,true)){Ready(origin,worker);Check(Use(Job(false),out target)==1,"report failure propagated");Check(!(bool)Read(Path.Combine(target,"result.json"))["ok"],"failure never certified");Check(worker.WaitForExit(5000),"failed worker released");}
  origin=Fresh();using(var worker=Start(origin,1)){Ready(origin,worker);File.AppendAllText(Template," changed");Check(Use(Job(false),out target)==null,"template changes reject existing session");Check(worker.WaitForExit(5000),"obsolete session expires");}
  var slots=Enumerable.Range(0,4).Select(i=>new FileStream(Path.Combine(Root,"cache","live280","slot"+i),FileMode.OpenOrCreate,FileAccess.ReadWrite,FileShare.None)).ToArray();
  try{origin=Fresh();using(var worker=Start(origin,20)){Check(worker.WaitForExit(5000),"capacity limit falls back without waiting");Check(File.Exists(Path.Combine(origin,"expired.txt")),"durable fallback selected at capacity");}}
  finally{foreach(var slot in slots)slot.Dispose();}
  Check(Directory.GetFiles(Path.Combine(Root,"cache","live280"),"*.json").Length==0,"no stale live registrations");
  Console.WriteLine("PASS same-worker continuation, repeat Check, model/input/template invalidation, owner PID, single consumption, idle expiry, capacity limit, failure propagation and cleanup");
 }
}
