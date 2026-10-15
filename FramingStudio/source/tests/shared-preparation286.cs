using System;
using System.IO;
using System.Linq;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using System.Web.Script.Serialization;
class SharedPreparation286Test {
 static JavaScriptSerializer j=new JavaScriptSerializer{MaxJsonLength=52428800,RecursionLimit=200};
 static Dictionary<string,object> Map(object x){return (Dictionary<string,object>)x;}
 static object[] List(object x){return ((IEnumerable)x).Cast<object>().ToArray();}
 static Dictionary<string,object> Clone(object x){return Map(j.DeserializeObject(j.Serialize(x)));}
 static int Main(string[] args){
  var method=Assembly.LoadFrom(Path.GetFullPath(args[0])).GetType("ExcelBridge").GetMethod("CompatibleShare286",BindingFlags.NonPublic|BindingFlags.Static);
  var request=Map(j.DeserializeObject(File.ReadAllText(args[1])));
  var b=List(request["jobs"]).Select(Map).First(x=>Convert.ToString(x["section"])=="B"&&List(x["members"]).Length>1);
  var a=Clone(b["sharedFrom286"]);a["fingerprint"]=b["fingerprint"];
  Func<Dictionary<string,object>,bool> compatible=x=>(bool)method.Invoke(null,new object[]{a,x});
  if(!compatible(b))throw new Exception("Current A/B pair did not match");
  Action<string,Action<Dictionary<string,object>>> reject=(name,change)=>{var x=Clone(b);change(x);if(compatible(x))throw new Exception("Unsafe reuse: "+name);};
  reject("model",x=>x["fingerprint"]="changed");
  reject("material",x=>Map(x["cells"])["C3"]=99);
  reject("loads",x=>x["fullLoads"]=new object[0]);
  reject("member selection",x=>List(x["members"]).Select(Map).First()["id"]="another member");
  reject("manual steel",x=>{var m=List(x["members"]).Select(Map).First(v=>Convert.ToString(v["kind"])=="TB");Map(Map(m["adopt254"])["steel"])["C40"]=99;});
  reject("expected result",x=>{var m=List(x["members"]).Select(Map).First(v=>Convert.ToString(v["kind"])=="TB");Map(Map(m["adopt254"])["expected"])["G29"]=999;});
  reject("column loading",x=>Map(Map(x["sheetCells"])["Section A Column Loading"])["B10"]=99);
  Console.WriteLine("PASS current pair and model/material/load/member/steel/result/column invalidation; independent slab and column inputs retained.");return 0;
 }
}
