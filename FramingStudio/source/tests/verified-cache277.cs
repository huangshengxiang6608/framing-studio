using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Reflection;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Security.Cryptography;

// Compile with ExcelBridge.cs and /main:VerifiedCache277. No Excel automation.
static class VerifiedCache277 {
 static JavaScriptSerializer J=new JavaScriptSerializer();
 static object Call(string name,params object[] args){return typeof(ExcelBridge).GetMethod(name,BindingFlags.NonPublic|BindingFlags.Static).Invoke(null,args);}
 static string Hash(string f){using(var h=SHA256.Create())return BitConverter.ToString(h.ComputeHash(File.ReadAllBytes(f))).Replace("-","").ToLowerInvariant();}
 static void Assert(bool value,string label){if(!value)throw new Exception(label);}
 static void Write(string f,object v){File.WriteAllText(f,J.Serialize(v));}
 static Dictionary<string,object> Read(string f){return J.Deserialize<Dictionary<string,object>>(File.ReadAllText(f));}
 static string Root;static int count;
 static string Fresh(){string dir=Path.Combine(Root,"run-"+(++count));Directory.CreateDirectory(dir);return dir;}
 static string Reference(Dictionary<string,object> job){return Path.Combine(Root,"cache","entry277-"+Call("JobKey79",job)+".json");}
 static string Entry(Dictionary<string,object> job){return Path.Combine(Root,"cache",Convert.ToString(Read(Reference(job))["directory"]));}
 static bool Restore(Dictionary<string,object> job){return (bool)Call("RestoreJob79",job,Fresh());}
 static void Main(string[] args){
  Root=Path.GetFullPath(args[0]);Directory.CreateDirectory(Root);
  Environment.SetEnvironmentVariable("FRAMING_CACHE_DIR",Path.Combine(Root,"cache"));
  string app=Path.Combine(Root,"app"),excel=Path.Combine(app,"Excel");Directory.CreateDirectory(excel);Directory.CreateDirectory(Path.Combine(app,"assets"));
  string template=Path.Combine(excel,"template.xlsm");File.WriteAllText(template,"unchanged template");File.WriteAllText(Path.Combine(excel,"templates.json"),"{}");File.WriteAllText(Path.Combine(app,"assets/index.html"),"version1");
  string source=Fresh();Call("Start79",source,template);
  var job=new Dictionary<string,object>{{"type","RC"},{"section","B"},{"fingerprint","model-1"},{"cells",new Dictionary<string,object>{{"D34",5.1}}},{"members",new object[]{"SL-21","AC2","AC10"}},{"columnParts274",new object[]{"part1","part2"}}};
  File.WriteAllText(Path.Combine(source,"RC-filled.xlsm"),"verified workbook bytes");File.WriteAllText(Path.Combine(source,"page.pdf"),"verified PDF bytes");
  var result=new Dictionary<string,object>{{"ok",true},{"compared",24},{"differences",new object[0]},{"workbook","RC-filled.xlsm"},{"workbookHash",Hash(Path.Combine(source,"RC-filled.xlsm"))},{"sourceHash",Hash(template)},{"fingerprint","model-1"},{"at","2026-10-15T01:00:00"},{"files",new object[]{new Dictionary<string,object>{{"file","page.pdf"}}}}};
  Write(Path.Combine(source,"result.json"),result);Call("StoreJob79",job,source);Assert(File.Exists(Reference(job)),"successful combined output cached");
  string target=Fresh();Assert((bool)Call("RestoreJob79",job,target),"identical input hits");Assert(Hash(Path.Combine(source,"RC-filled.xlsm"))==Hash(Path.Combine(target,"RC-filled.xlsm")),"byte identical workbook");Assert((bool)Read(Path.Combine(target,"result.json"))["cached"],"cache status");
  File.AppendAllText(Path.Combine(target,"RC-filled.xlsm"),"user manual edits");Assert(Restore(job),"delivered edits cannot change private cache");
  var changed=Read(Path.Combine(source,"result.json"));
  foreach(string key in new[]{"fingerprint","section","cells","members","columnParts274"}){var j=new Dictionary<string,object>(job);j[key]="changed";Assert(!Restore(j),"invalidate "+key);}
  File.WriteAllText(Path.Combine(app,"assets/index.html"),"version2");Call("Start79",Fresh(),template);Assert(!Restore(job),"app version invalidates");File.WriteAllText(Path.Combine(app,"assets/index.html"),"version1");Call("Start79",Fresh(),template);
  File.AppendAllText(template,"changed formula");Call("Start79",Fresh(),template);Assert(!Restore(job),"template invalidates");File.WriteAllText(template,"unchanged template");Call("Start79",Fresh(),template);
  string entry=Entry(job);File.AppendAllText(Path.Combine(entry,"page.pdf"),"corrupt");Assert(!Restore(job),"PDF corruption rejects");Call("StoreJob79",job,source);Assert(Restore(job),"replace corrupted cache atomically");
  entry=Entry(job);File.AppendAllText(Path.Combine(entry,"RC-filled.xlsm"),"corrupt");Assert(!Restore(job),"workbook corruption rejects");Call("StoreJob79",job,source);
  entry=Entry(job);File.Delete(Path.Combine(entry,"page.pdf"));Assert(!Restore(job),"missing output rejects");Call("StoreJob79",job,source);
  entry=Entry(job);var manifest=Read(Path.Combine(entry,"manifest.json"));manifest.Remove("RC-filled.xlsm");Write(Path.Combine(entry,"manifest.json"),manifest);Assert(!Restore(job),"incomplete manifest rejects");Call("StoreJob79",job,source);
  var failed=new Dictionary<string,object>(job);failed["fingerprint"]="failure";result["fingerprint"]="failure";result["ok"]=false;Write(Path.Combine(source,"result.json"),result);Call("StoreJob79",failed,source);Assert(!File.Exists(Reference(failed)),"failed verification never cached");
  result["ok"]=true;result["differences"]=new object[]{"mismatch"};Write(Path.Combine(source,"result.json"),result);Call("StoreJob79",failed,source);Assert(!File.Exists(Reference(failed)),"differences never cached");
  result["differences"]=new object[0];result["compared"]=0;Write(Path.Combine(source,"result.json"),result);Call("StoreJob79",failed,source);Assert(!File.Exists(Reference(failed)),"unchecked output never cached");
  Write(Reference(job),new{directory="../outside"});Assert(!Restore(job),"traversal rejected");
  Console.WriteLine("PASS: combined cache, exact copies, isolated manual edits, model/selection/section/inputs/version/template invalidation, corruption/missing files/incomplete manifests, failures, zero checks and path traversal");
 }
}
