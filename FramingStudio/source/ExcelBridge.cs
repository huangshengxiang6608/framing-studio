using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Web.Script.Serialization;
using System.Runtime.InteropServices;

// This process owns its Excel instance. It never changes the source templates.
static class ExcelBridge {
 static JavaScriptSerializer J=new JavaScriptSerializer { MaxJsonLength=52428800, RecursionLimit=200 };
 static Dictionary<string,object> Obj(object o){return (Dictionary<string,object>)o;}
 static IEnumerable<object> Arr(object o){return ((IEnumerable)o).Cast<object>();}
 static string RunDirectory79,CacheDirectory79,CacheVersion79;
 static readonly System.Diagnostics.Stopwatch Timer79=System.Diagnostics.Stopwatch.StartNew();
 static void Stage79(string message){if(RunDirectory79==null)return;try{Write(Path.Combine(RunDirectory79,"progress.json"),new {message=message,seconds=Timer79.Elapsed.TotalSeconds});File.AppendAllText(Path.Combine(RunDirectory79,"timing.jsonl"),J.Serialize(new {message=message,seconds=Timer79.Elapsed.TotalSeconds})+"\n");}catch{}}
 static string TextHash79(string text){using(var h=SHA256.Create())return BitConverter.ToString(h.ComputeHash(Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant();}
 static string Canon79(object value){var map=value as Dictionary<string,object>;if(map!=null)return "{"+string.Join(",",map.OrderBy(v=>v.Key,StringComparer.Ordinal).Select(v=>J.Serialize(v.Key)+":"+Canon79(v.Value)))+"}";if(value is IEnumerable&&!(value is string))return "["+string.Join(",",((IEnumerable)value).Cast<object>().Select(Canon79))+"]";return J.Serialize(value);}
 static string CacheKey79(object value){return TextHash79(CacheVersion79+"|"+Canon79(value));}
 static void Start79(string dir,string source){RunDirectory79=dir;CacheDirectory79=Environment.GetEnvironmentVariable("FRAMING_CACHE_DIR");if(string.IsNullOrEmpty(CacheDirectory79))CacheDirectory79=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"FramingStudio","ReportCache79");CacheDirectory79=Path.GetFullPath(CacheDirectory79);Directory.CreateDirectory(CacheDirectory79);CacheVersion79=Hash(typeof(ExcelBridge).Assembly.Location)+"|"+Hash(source)+"|"+System.Globalization.CultureInfo.CurrentCulture.Name;string images=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"ReportImages");if(Directory.Exists(images))foreach(string f in Directory.GetFiles(images,"*.png").OrderBy(v=>v))CacheVersion79+="|"+Hash(f);Stage79("准备生成");}
 static bool ValidCache79(string dir){try{var files=Obj(J.DeserializeObject(File.ReadAllText(Path.Combine(dir,"manifest.json"))));if(files.Count==0)return false;foreach(var f in files){if(f.Key!=Path.GetFileName(f.Key)||!File.Exists(Path.Combine(dir,f.Key))||Hash(Path.Combine(dir,f.Key))!=Convert.ToString(f.Value))return false;}return true;}catch{return false;}}
 static void Manifest79(string dir){var files=new Dictionary<string,object>();foreach(string f in Directory.GetFiles(dir))if(Path.GetFileName(f)!="manifest.json")files[Path.GetFileName(f)]=Hash(f);Write(Path.Combine(dir,"manifest.json"),files);}
 static string JobKey79(Dictionary<string,object> job){var input=new Dictionary<string,object>(job);input.Remove("fingerprint");return CacheKey79(input);}
 static bool RestoreJob79(Dictionary<string,object> job,string dir){string cache=Path.Combine(CacheDirectory79,"job-"+JobKey79(job));if(!ValidCache79(cache))return false;try{var r=Obj(J.DeserializeObject(File.ReadAllText(Path.Combine(cache,"result.json"))));if(!Convert.ToBoolean(r["ok"])||Arr(r["differences"]).Any())return false;Stage79("复用输入完全一致的已核对结果");foreach(string f in Directory.GetFiles(cache))if(Path.GetFileName(f)!="manifest.json"&&Path.GetFileName(f)!="result.json")File.Copy(f,Path.Combine(dir,Path.GetFileName(f)));r["fingerprint"]=job["fingerprint"];r["cached"]=true;r["verifiedAt"]=r["at"];r["at"]=DateTime.Now.ToString("s");Write(Path.Combine(dir,"result.json"),r);return true;}catch{return false;}}
 static void StoreJob79(Dictionary<string,object> job,string dir){try{var result=Obj(J.DeserializeObject(File.ReadAllText(Path.Combine(dir,"result.json"))));if(!Convert.ToBoolean(result["ok"])||Arr(result["differences"]).Any())return;string cache=Path.Combine(CacheDirectory79,"job-"+JobKey79(job));Directory.CreateDirectory(cache);foreach(string f in Directory.GetFiles(dir))if(Path.GetExtension(f)==".pdf"||Path.GetExtension(f)==".xlsm"||Path.GetExtension(f)==".xlsx"||Path.GetFileName(f)=="result.json")File.Copy(f,Path.Combine(cache,Path.GetFileName(f)),true);Manifest79(cache);}catch{}}
 static string PageCache79(Dictionary<string,object> page,Dictionary<string,object> job){return Path.Combine(CacheDirectory79,"page-"+CacheKey79(new {page=page,number=job.ContainsKey("reportNumber")?job["reportNumber"]:null}));}
 static void CacheNote79(string operation,Exception error){try{File.AppendAllText(Path.Combine(RunDirectory79,"cache-notes.txt"),operation+": "+error.ToString()+"\n");}catch{}}
 static readonly Dictionary<string,object> PageBooks82=new Dictionary<string,object>(StringComparer.OrdinalIgnoreCase);
 static readonly List<Dictionary<string,string>> PendingPages82=new List<Dictionary<string,string>>();
 static bool RestorePage79(dynamic book,Dictionary<string,object> page,Dictionary<string,object> job,string name,string pdf){
  string cache=PageCache79(page,job);if(!ValidCache79(cache))return false;dynamic copied=null;
  try{
   var reference=Obj(J.DeserializeObject(File.ReadAllText(Path.Combine(cache,"page-reference.json"))));
   string file=Convert.ToString(reference["book"]),hash=Convert.ToString(reference["sha256"]);
   if(file!=Path.GetFileName(file)||file!="pages-"+hash+".xlsm")throw new Exception("Invalid report cache reference");
   string path=Path.Combine(CacheDirectory79,file);object cached;
   if(!PageBooks82.TryGetValue(path,out cached)){
    if(!File.Exists(path)||Hash(path)!=hash)throw new Exception("Report cache workbook hash mismatch");
    dynamic app=book.Application;int security=Convert.ToInt32(app.AutomationSecurity);bool events=Convert.ToBoolean(app.EnableEvents);
    try{app.AutomationSecurity=3;app.EnableEvents=false;cached=app.Workbooks.Open(path,0,true);}
    finally{app.AutomationSecurity=security;app.EnableEvents=events;}
    PageBooks82.Add(path,cached);
   }
   Stage79("复用未变化章节："+Convert.ToString(page["title"]));dynamic saved=cached;
   var names=new HashSet<string>(StringComparer.OrdinalIgnoreCase);for(int i=1;i<=Convert.ToInt32(book.Worksheets.Count);i++)names.Add(Convert.ToString(book.Worksheets[i].Name));
   if(names.Contains(name))throw new Exception("Report sheet already exists: "+name);
   saved.Worksheets[Convert.ToString(reference["sheet"])].Copy(Type.Missing,book.Worksheets[book.Worksheets.Count]);
   for(int i=1;i<=Convert.ToInt32(book.Worksheets.Count);i++){dynamic candidate=book.Worksheets[i];if(!names.Contains(Convert.ToString(candidate.Name))){copied=candidate;break;}}
   if(copied==null)throw new Exception("Copied report sheet was not found");copied.Name=name;File.Copy(Path.Combine(cache,"page.pdf"),pdf);return true;
  }catch(Exception e){CacheNote79("restore page",e);if((object)copied!=null)try{copied.Delete();}catch{}return false;}
 }
 static void ClosePageBooks82(){foreach(dynamic b in PageBooks82.Values)try{b.Close(false);}catch{}PageBooks82.Clear();}
 static void StorePage79(dynamic sheet,Dictionary<string,object> page,Dictionary<string,object> job,string pdf){
  PendingPages82.Add(new Dictionary<string,string>{{"cache",PageCache79(page,job)},{"sheet",Convert.ToString(sheet.Name)},{"pdf",pdf}});
 }
 static void CommitPageCaches82(string workbook){
  if(PendingPages82.Count==0)return;
  try{
   // One already-saved workbook contains every editable chapter. Avoid saving eight separate workbooks.
   string hash=Hash(workbook),file="pages-"+hash+".xlsm",target=Path.Combine(CacheDirectory79,file);
   if(!File.Exists(target)||Hash(target)!=hash){string temp=target+"."+Guid.NewGuid().ToString("N")+".tmp";File.Copy(workbook,temp);if(File.Exists(target))File.Replace(temp,target,null);else File.Move(temp,target);}
   foreach(var page in PendingPages82){Directory.CreateDirectory(page["cache"]);File.Copy(page["pdf"],Path.Combine(page["cache"],"page.pdf"),true);Write(Path.Combine(page["cache"],"page-reference.json"),new {book=file,sha256=hash,sheet=page["sheet"]});Manifest79(page["cache"]);}
  }catch(Exception e){CacheNote79("store pages",e);}finally{PendingPages82.Clear();}
 }

 static void ReportNumbers79(dynamic sheet){
  int rows=Math.Min(10000,Convert.ToInt32(sheet.UsedRange.Row)+Convert.ToInt32(sheet.UsedRange.Rows.Count)-1);object[,] values=(object[,])sheet.Range["A1:L"+rows].Value2;var ranges=new List<string>();
  for(int r=1;r<=rows;r++)for(int c=1;c<=12;c++){
   string label=Convert.ToString(values[r,c]).Replace("\n"," ").Trim();bool relevant=label=="Area (m2)"||label=="Area (m²)"||label=="Factored Load (kN)"||label=="DL (kN)"||label=="LL (kN)"||label=="DL (kN/m)"||label=="LL (kN/m)"||label=="D.L. (kPa)"||label=="S.D.L. (kPa)"||label=="L.L. (kPa)";
   if(!relevant)continue;int end=r;while(end<rows&&Number(values[end+1,c]))end++;if(end>r){string col=((char)('A'+c-1)).ToString();ranges.Add(col+(r+1)+":"+col+end);}
  }
  foreach(string area in ranges)sheet.Range[area].NumberFormat="#,##0.0";
  for(int r=1;r<=rows;r++){bool sum=false;for(int c=1;c<=12;c++)if(Convert.ToString(values[r,c]).Trim()=="Σ")sum=true;if(!sum)continue;for(int c=1;c<=12;c++){string text=values[r,c] as string;if(text==null)continue;var match=System.Text.RegularExpressions.Regex.Match(text,@"^\s*(-?[\d,]+(?:\.\d+)?)\s+(kN|kPa|m2|m²)\s*$");double number;if(match.Success&&double.TryParse(match.Groups[1].Value,System.Globalization.NumberStyles.Number,System.Globalization.CultureInfo.InvariantCulture,out number))sheet.Cells[r,c].Value2=number.ToString("#,##0.0",System.Globalization.CultureInfo.InvariantCulture)+" "+match.Groups[2].Value;}}
 }

 static string Hash(string p){using(var f=File.Open(p,FileMode.Open,FileAccess.Read,FileShare.ReadWrite))using(var h=SHA256.Create())return BitConverter.ToString(h.ComputeHash(f)).Replace("-","").ToLowerInvariant();}
 static object Val(dynamic c){object v=c.Value2;return v;}
 static bool Number(object v){return v is double||v is int||v is decimal||v is long;}
 static bool Same(object a,object b){if(Number(a)&&Number(b)){double x=Convert.ToDouble(a),y=Convert.ToDouble(b);return Math.Abs(x-y)<=1e-7*Math.Max(1,Math.Max(Math.Abs(x),Math.Abs(y)));}return Convert.ToString(a)==Convert.ToString(b);}
 static void Write(string p,object v){File.WriteAllText(p,J.Serialize(v),new UTF8Encoding(false));}
 static object Run(dynamic x,dynamic b,string macro){Stage79(macro.StartsWith("Generate")?"生成原 Excel 抄":"计算与核对："+macro);return x.Run("'"+b.Name+"'!"+macro);}
 static void Set(dynamic sheet,string cell,object v){try{dynamic c=sheet.Range[cell];if(v==null)c.MergeArea.ClearContents();else if(v is string)c.Value2="'"+(string)v;else c.Value2=v;}catch(Exception e){throw new Exception(Convert.ToString(sheet.Name)+"!"+cell+": "+e.Message);}}
 static Dictionary<string,object> ActiveJob75;
 static List<object> differences=new List<object>();static int compared;
 static void Compare(string scope,dynamic b,Dictionary<string,object> expected){foreach(var s in expected){
 var cells=Obj(s.Value);if(cells.Count==0)continue;int rows=2,cols=1;var positions=new Dictionary<string,int[]>();
 foreach(string address in cells.Keys){var m=System.Text.RegularExpressions.Regex.Match(address,@"^\$?([A-Za-z]{1,3})\$?([1-9][0-9]*)$");if(!m.Success)continue;int col=0;foreach(char c in m.Groups[1].Value.ToUpperInvariant())col=col*26+c-'A'+1;int row=int.Parse(m.Groups[2].Value);if(row>10000||col>256)continue;positions[address]=new[]{row,col};rows=Math.Max(rows,row);cols=Math.Max(cols,col);}
 dynamic sheet=b.Worksheets[s.Key];object[,] values=(object[,])sheet.Range[sheet.Cells[1,1],sheet.Cells[rows,cols]].Value2;
 foreach(var cell in cells){int[] position;object actual=positions.TryGetValue(cell.Key,out position)?values[position[0],position[1]]:Val(sheet.Range[cell.Key]);
 // The original beam eccentricity input is optional; its blank value is used as zero by the native formulas.
 if(cell.Key=="G13"&&s.Key.Contains("Beam")&&actual==null&&Number(cell.Value)&&Convert.ToDouble(cell.Value)==0)actual=0;
 compared++;if(!Same(cell.Value,actual))differences.Add(new { scope=scope,sheet=s.Key,cell=cell.Key,app=cell.Value,excel=actual });}}}
 // Let the original Workbook_Open run, then complete its original update workflow.
 // The RC template deliberately marks cached checks pending whenever it opens.
 static int OpenWorkbook(string templateRoot,string path,bool visible) {
  dynamic x=null,b=null;string directory=Path.GetDirectoryName(Path.GetFullPath(path));
  try {
   var result=Obj(J.DeserializeObject(File.ReadAllText(Path.Combine(directory,"result.json"))));
   var job=Obj(J.DeserializeObject(File.ReadAllText(Path.Combine(directory,"job.json"))));ActiveJob75=job;
   if(Path.GetFileName(path)!=Convert.ToString(result["workbook"])||(Path.GetExtension(path)!=".xlsm"&&!(Path.GetExtension(path)==".xlsx"&&job.ContainsKey("method")&&Convert.ToString(job["method"])=="BUILDING_AXIS")))throw new Exception("不是本次生成的 Excel 文件");
   // After manual edits, use the normal Excel trust/opening flow rather than forcing macros.
   if(!result.ContainsKey("workbookHash")||Hash(path)!=Convert.ToString(result["workbookHash"])) {
    if(!visible)throw new Exception("工作簿已改变，需按普通 Excel 流程打开");
    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(path){UseShellExecute=true});return 0;
   }
   var config=Obj(J.DeserializeObject(File.ReadAllText(Path.Combine(templateRoot,"templates.json"))));
   string kind=Convert.ToString(job["type"]);var template=Obj(config[kind]);
   string source=Path.Combine(templateRoot,Path.GetFileName(Convert.ToString(template["file"])));
   if(Hash(source)!=Convert.ToString(result["sourceHash"]))throw new Exception("原 Excel 版本已改变");
   if(!result.ContainsKey("ok")||!Convert.ToBoolean(result["ok"])||Arr(result["differences"]).Any()){
    if(!visible)throw new Exception("本次工作簿尚未通过核对，不能按已核对文件快速打开");
    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(path){UseShellExecute=true});return 0;
   }
   if(Hash(source)!=Convert.ToString(template["sha256"]))throw new Exception("打包模板校验失败");
   var timer=System.Diagnostics.Stopwatch.StartNew();
   x=Activator.CreateInstance(Type.GetTypeFromProgID("Excel.Application",true));
   // The saved output is already checked. Suppress Workbook_Open so it cannot
   // clear CURRENT flags or regenerate copies; re-enable normal events below.
   x.Visible=false;x.DisplayAlerts=false;x.AutomationSecurity=1;x.EnableEvents=false;
   b=x.Workbooks.Open(Path.GetFullPath(path),0,!visible);
   string state="Verified saved workbook";
   if(kind=="RC"){
    state=Convert.ToString(Val(b.Worksheets["_Input Engine"].Range["AS1"]));
    if(state!="CURRENT")throw new Exception("保存的 RC 核对状态不是 CURRENT，请重新生成");
    b.Worksheets["Input"].Activate();
   }
   // Restore Excel's normal recalculation and event behavior for subsequent edits.
   x.Calculation=-4105;x.ScreenUpdating=true;
   Write(Path.Combine(directory,visible?"open-result.json":"reopen-check.json"),new {ok=true,state=state,fast=true,macrosRun=0,verifiedWorkbookHash=Hash(path),seconds=timer.Elapsed.TotalSeconds,compared=compared,differences=differences});
   x.EnableEvents=true;x.DisplayAlerts=true;
   if(visible){x.Visible=true;b=null;Marshal.FinalReleaseComObject(x);x=null;}
   return 0;
  }catch(Exception e){Write(Path.Combine(directory,visible?"open-result.json":"reopen-check.json"),new {ok=false,error=e.Message});if(visible&&x!=null&&b!=null){x.EnableEvents=true;x.DisplayAlerts=true;x.Visible=true;b=null;x=null;}return 1;}
  finally{if(b!=null)try{b.Close(false);}catch{}if(x!=null)try{x.Quit();}catch{}}
 }

 [STAThread] static int Main(string[] args){
  if(args.Length==3&&(args[0]=="--open"||args[0]=="--verify-open"))return OpenWorkbook(args[1],args[2],args[0]=="--open");
  if(args.Length!=2)return 2;string root=Path.GetFullPath(args[0]),jobPath=Path.GetFullPath(args[1]),dir=Path.GetDirectoryName(jobPath);dynamic x=null,b=null;
  try{
   var job=Obj(J.DeserializeObject(File.ReadAllText(jobPath)));ActiveJob75=job;var config=Obj(J.DeserializeObject(File.ReadAllText(Path.Combine(root,"templates.json"))));string kind=Convert.ToString(job["type"]);
   if(kind!="Overall"&&kind!="RC"&&kind!="Steel"&&kind!="Deflection"&&kind!="Foundation")throw new Exception("未知 Excel 类型");var template=Obj(config[kind]);string source=Path.Combine(root,Path.GetFileName(Convert.ToString(template["file"])));
   if(Hash(source)!=Convert.ToString(template["sha256"]))throw new Exception("Excel 模板已改变，请先更新 App；没有使用旧公式继续核对。");
   Start79(dir,source);if(RestoreJob79(job,dir))return 0;Stage79("打开原 Excel 模板");
   bool axis92=kind=="Deflection"&&job.ContainsKey("method")&&Convert.ToString(job["method"])=="BUILDING_AXIS";
   string copy=Path.Combine(dir,kind+(axis92?"-filled.xlsx":"-filled.xlsm"));if(File.Exists(copy))throw new Exception("输出已经存在，请重新生成一个核对任务。");if(!axis92)File.Copy(source,copy);
   x=Activator.CreateInstance(Type.GetTypeFromProgID("Excel.Application",true));x.Visible=false;x.DisplayAlerts=false;x.ScreenUpdating=false;x.EnableEvents=false;
   // Only the packaged, hash-verified user templates run macros, in this isolated instance.
   x.AutomationSecurity=1;if(axis92){b=x.Workbooks.Add();b.SaveAs(copy,51);}else b=x.Workbooks.Open(copy,0,false);x.EnableEvents=false;Stage79("模板已打开");
   var files=new List<object>();
   if(kind=="Overall"){
    dynamic input=b.Worksheets["图形输入"];input.Unprotect();var faces=Obj(job["faces"]);
    foreach(string face in new[]{"B","D"}){var data=Obj(Obj(faces[face])["input"]);foreach(var item in Arr(template["inputs"])){var m=Obj(item);string key=Convert.ToString(m["key"]);if(!data.ContainsKey(key))throw new Exception("缺少输入："+face+" "+key);Set(input,Convert.ToString(m[face=="B"?"input":"sourceD"]),data[key]);}}
    Run(x,b,"CalculateFaces");dynamic compare=b.Worksheets["B-D 比较"];
    foreach(string face in new[]{"B","D"}){
     int col=face=="B"?3:5;string state=Convert.ToString(Val(compare.Cells[6,col]));if(state!="CALCULATED")throw new Exception(face+"："+state);
     Run(x,b,"View"+face);Compare(face,b,Obj(Obj(faces[face])["expected"]));
    }
    string governing=Convert.ToString(Val(compare.Range["G23"]));
    if(job.ContainsKey("comparison"))Compare("B / D",b,new Dictionary<string,object>{{"B-D 比较",job["comparison"]}});
    bool equalFaces=governing=="Equal"&&DeepSame(Obj(Obj(job["faces"])["B"])["input"],Obj(Obj(job["faces"])["D"])["input"]);
    var picked=governing=="B"||equalFaces?new[]{"B"}:governing=="D"?new[]{"D"}:governing=="Equal"||governing=="Both: no resistance"?new[]{"B","D"}:new string[0];
    if(picked.Length==0)throw new Exception("原 Excel 尚未确定控制面："+governing);
    // Generate the native copy for every governing face; preserve the editable workbook.
    foreach(string face in picked){Run(x,b,"View"+face);Run(x,b,"GenerateEricCopy");OverallCopy98(b,job,face);string label=Convert.ToString(Val(b.Worksheets["抄"].Range["D3"]));if(label.Contains("--")||!label.StartsWith(face))throw new Exception("原 Excel 抄未生成");if(job.ContainsKey("preview")&&Convert.ToBoolean(job["preview"]))files.Add(ExportCopy(b.Worksheets["抄"],dir,"Overall-"+face+".pdf"));}
    compare.Activate();
    ReportPages75(b,job,files,dir);ReportInks84(b);b.Save();Write(Path.Combine(dir,"result.json"),new {ok=true,type=kind,workbook=Path.GetFileName(copy),files=files,governing=governing,compared=compared,differences=differences,sourceHash=Hash(source),fingerprint=job["fingerprint"],workbookHash=Hash(copy),at=DateTime.Now.ToString("s")});
   }else if(kind=="Foundation"){
    FoundationJob76(x,b,job,files,dir);ReportPages75(b,job,files,dir);ReportInks84(b);b.Save();Write(Path.Combine(dir,"result.json"),new {ok=true,type=kind,workbook=Path.GetFileName(copy),files=files,compared=compared,differences=differences,sourceHash=Hash(source),fingerprint=job["fingerprint"],workbookHash=Hash(copy),at=DateTime.Now.ToString("s")});
   }else if(kind=="Deflection"){
    DeflectionJob(x,b,job,files,dir);ReportPages75(b,job,files,dir);ReportInks84(b);b.Save();Write(Path.Combine(dir,"result.json"),new {ok=true,type=kind,workbook=Path.GetFileName(copy),files=files,compared=compared,differences=differences,sourceHash=Hash(source),fingerprint=job["fingerprint"],workbookHash=Hash(copy),at=DateTime.Now.ToString("s")});
   }else if(kind=="Steel"){
    SteelJob(x,b,job,files,dir);ReportPages75(b,job,files,dir);ReportInks84(b);b.Save();Write(Path.Combine(dir,"result.json"),new {ok=true,type=kind,workbook=Path.GetFileName(copy),files=files,compared=compared,differences=differences,sourceHash=Hash(source),fingerprint=job["fingerprint"],workbookHash=Hash(copy),at=DateTime.Now.ToString("s")});
   }else{
    dynamic input=b.Worksheets["Input"],engine=b.Worksheets["_Input Engine"];Stage79("准备输入");int inputCalculation80=Convert.ToInt32(x.Calculation);
    string reset="A9:H28,J9:K28,M9:M28,A34:H43,A49:G68,A74:E93,A99:D118,A124:M143";
    x.Calculation=-4135;try{input.Unprotect();
    foreach(string range in reset.Split(','))input.Range[range].ClearContents();
    dynamic transfer=b.Worksheets["Section A Transfer Beam"],tc=b.Worksheets["Section A Transfer Column"];transfer.Unprotect();tc.Unprotect();
    transfer.Range["A6:D25,F6:G25,I6:J25,L6:M25,O6:P25,R6:R25,T6:U25,C29:G48"].ClearContents();tc.Range["S5:S104"].ClearContents();
    var writes=Obj(job["cells"]);
    foreach(var cell in writes){if(!RCInput(cell.Key))throw new Exception("不允许覆盖原表公式："+cell.Key);Set(input,cell.Key,cell.Value);}
    if(job.ContainsKey("sheetCells"))foreach(var ss in Obj(job["sheetCells"]))foreach(var cell in Obj(ss.Value)){if(!(ss.Key=="Section A Column Loading"&&new[]{"B4","B9","B10"}.Contains(cell.Key))&&!(ss.Key=="Section B Column Check"&&new[]{"C3","C4","C6"}.Contains(cell.Key))&&!(ss.Key=="RC Column Inputs"&&new[]{"B4","B5"}.Contains(cell.Key))&&!TransferInput(ss.Key,cell.Key))throw new Exception("非原表输入："+ss.Key+"!"+cell.Key);Set(b.Worksheets[ss.Key],cell.Key,cell.Value);}
    if(job.ContainsKey("copyNotes"))foreach(var cell in Obj(job["copyNotes"])){if(!new[]{"A5","A6","A34","A36"}.Contains(cell.Key)&&!System.Text.RegularExpressions.Regex.IsMatch(cell.Key,"^[AE]1[0-7]$"))throw new Exception("非原表说明输入："+cell.Key);Set(b.Worksheets["Section A 抄"],cell.Key,cell.Value);}
    FullLoadsJob(b,job);
    Stage79("输入写入完成");
    // The original update macro explicitly calculates its dependent ranges and
    // finishes with CalculateFull. Avoid recalculating on each intermediate write.
    x.Run("'"+b.Name+"'!InputChanged99",input,input.Range["C3,F3,C4,F4,C5,F5,"+reset]);
    }finally{x.Calculation=inputCalculation80;}Run(x,b,"Check99");
    if(Convert.ToString(Val(engine.Range["AS1"]))!="CURRENT")throw new Exception("原 Excel Check 未完成："+Convert.ToString(Val(engine.Range["AS3"])));
    CompareFullLoads(b,job);
    foreach(var item in Arr(job["members"])){
     var member=Obj(item);string mk=Convert.ToString(member["kind"]),id=Convert.ToString(member["id"]),sheet=Convert.ToString(member["sheet"]);
     if(member.ContainsKey("sectionA")&&Convert.ToBoolean(member["sectionA"])){
      Compare(id+" · Section A",b,new Dictionary<string,object>{{sheet,member["expected"]}});
      if(mk=="TB"){Set(b.Worksheets["Section B Transfer Beam Check"],"L9",member["row"]);Run(x,b,"UpdateTransfer79");Compare(id+" · transfer actions",b,new Dictionary<string,object>{{"Section B Transfer Beam Check",member["actions"]}});}continue;
     }
     if(mk=="TB"){Set(b.Worksheets[sheet],"L9",member["row"]);Run(x,b,"AutoTransfer79");}
     else if(mk=="CB"||mk=="CS")x.Run("'"+b.Name+"'!CheckOne"+mk+(mk=="CB"?"99":"101"),Convert.ToInt32(member["row"]),true);
     else if(mk=="COL"){x.CalculateFull();}
     else {Set(engine,mk=="SLAB"?"C3":mk=="SB"?"I3":"F3",id);Run(x,b,mk=="SLAB"?"SlabAuto84":mk=="SB"?"SecondaryAuto78":"MainAuto78");}
     var changed=new List<string>();dynamic design=b.Worksheets[sheet];
     if(member.ContainsKey("steel")&&member["steel"]!=null)foreach(var cell in Obj(member["steel"])) {if(!SteelInput(mk,cell.Key))throw new Exception("非原表配筋输入："+cell.Key);Set(design,cell.Key,cell.Value);changed.Add(cell.Key);}
     if(member.ContainsKey("cover")&&member["cover"]!=null){if(mk=="CB")throw new Exception("原 Excel 悬臂梁采用 FRR 保护层，手动保护层尚未核对");Set(design,"G16",member["cover"]);changed.Add("G16");}
     if(changed.Count>0&&mk=="COL"){x.CalculateFull();}
     else if(changed.Count>0){string macro=mk=="TB"?"TransferChanged79":mk=="CB"?"CBChanged99":mk=="CS"?"CSChanged101":"SectionBChanged78";x.Run("'"+b.Name+"'!"+macro,design,design.Range[string.Join(",",changed)]);if(mk=="TB")Run(x,b,"UpdateTransfer79");else if(mk=="CB"||mk=="CS")x.Run("'"+b.Name+"'!CheckOne"+mk+(mk=="CB"?"99":"101"),Convert.ToInt32(member["row"]),false);else Run(x,b,"Check99");}
     if(member.ContainsKey("selected")&&!Convert.ToBoolean(member["selected"]))continue;
     // Same source inputs and same source result cells; no derived replacement formulas.
     Compare(id+" · input",b,new Dictionary<string,object>{{sheet,member["inputs"]}});
     Compare(id+" · check",b,new Dictionary<string,object>{{sheet,member["expected"]}});
    }
    string section=Convert.ToString(job["section"]);
    if(section=="A"||section=="Check"){Run(x,b,"GenerateCopy");}
    if(section=="B"||section=="Check"){
     // Native transfer design can mark the shared RC engine pending. Complete the
     // workbook's own update before asking its copy-readiness gate again.
     if(Convert.ToString(Val(engine.Range["AS1"]))!="CURRENT")Run(x,b,"Check99");
     bool ready=Convert.ToBoolean(Run(x,b,"SectionBCopyReady78"))&&Convert.ToBoolean(Run(x,b,"TransferCopyReady79"));if(!ready)throw new Exception("原 Excel 抄仍有未完成的检查；RC="+Convert.ToString(Val(engine.Range["AS1"]))+"；TB="+Convert.ToString(Val(b.Worksheets["_TB Analysis"].Range["DG1"]))+"；"+Convert.ToString(Val(b.Worksheets["Section B Transfer Beam Check"].Range["B5"])));
     Run(x,b,"GenerateSectionBCopy");
    }
    CompareFullLoads(b,job);
    Stage79("原抄生成完成，整理版式");int formatCalc82=Convert.ToInt32(x.Calculation);bool formatScreen82=Convert.ToBoolean(x.ScreenUpdating),formatEvents82=Convert.ToBoolean(x.EnableEvents);
    try{x.Calculation=-4135;x.ScreenUpdating=false;x.EnableEvents=false;
    ReportNumbers79(b.Worksheets["Section A 抄"]);ReportNumbers79(b.Worksheets["Section B 抄"]);ReportHeader75(b.Worksheets["Section A 抄"],job);ReportHeader75(b.Worksheets["Section B 抄"],job);
    if(job.ContainsKey("preview")&&Convert.ToBoolean(job["preview"])) { if(section=="A"||section=="Check")ExportRC76(b.Worksheets["Section A 抄"],job,files,dir,"A");if(section=="B"||section=="Check")ExportRC76(b.Worksheets["Section B 抄"],job,files,dir,"B"); }
    }finally{x.Calculation=formatCalc82;x.ScreenUpdating=formatScreen82;x.EnableEvents=formatEvents82;}
    Run(x,b,"PersistManualSteel78");Run(x,b,"PersistTransfer79");input.Activate();ReportPages75(b,job,files,dir);ReportInks84(b);
    // Transfer actions and report macros can leave RC marked pending. Complete
    // the native check once at export time, so opening need not regenerate it.
    if(Convert.ToString(Val(engine.Range["AS1"]))!="CURRENT")Run(x,b,"Check99");
    if(Convert.ToString(Val(engine.Range["AS1"]))!="CURRENT")throw new Exception("导出前 RC Check 未完成");
    x.EnableEvents=false;b.Save();Write(Path.Combine(dir,"result.json"),new {ok=true,type=kind,workbook=Path.GetFileName(copy),files=files,compared=compared,differences=differences,sourceHash=Hash(source),fingerprint=job["fingerprint"],workbookHash=Hash(copy),at=DateTime.Now.ToString("s")});
   }
   Stage79("保存已核对结果");CommitPageCaches82(copy);StoreJob79(job,dir);b.Close(false);b=null;x.Quit();Marshal.FinalReleaseComObject(x);x=null;GC.Collect();return 0;
  }catch(Exception e){File.WriteAllText(Path.Combine(dir,"error-details.txt"),e.ToString());string partial=null;if(b!=null)try{b.Save();partial=Path.GetFileName(Convert.ToString(b.FullName));}catch{}Write(Path.Combine(dir,"result.json"),new {ok=false,error=e.Message,workbook=partial,compared=compared,differences=differences});return 1;}
  finally{if(b!=null)try{b.Close(false);}catch{}if(x!=null)try{x.Quit();}catch{}}
 }
  static double D(Dictionary<string,object> a,string k,double fallback=0){return a.ContainsKey(k)&&a[k]!=null?Convert.ToDouble(a[k]):fallback;}
 static void FoundationJob76(dynamic x,dynamic b,Dictionary<string,object> job,List<object> files,string dir){
  var allowed=new Dictionary<string,string>{
   {"A Bored Pile Checking","C9,C10,C13,C14,C23,C30,C33,C38,C39"},{"A Socket H Checking","C13,C14,C15,C24"},{"A Driven H Checking","C13,C14,C15,C24"},{"A Mini Pile Checking","C13,C14,C15,C25"},{"B Bored Pile Checking","C9,C10,C21,C22,C23"},{"B Socket H Checking","C17,C18,C19,C26,C27,C28,C29,C30"}};
  int inputMode82=Convert.ToInt32(x.Calculation);x.Calculation=-4135;
  try{
  foreach(var ss in Obj(job["cells"]))foreach(var c in Obj(ss.Value)){if(!allowed.ContainsKey(ss.Key)||!allowed[ss.Key].Split(',').Contains(c.Key))throw new Exception("非 Foundation 输入："+ss.Key+"!"+c.Key);Set(b.Worksheets[ss.Key],c.Key,c.Value);}
  // User-entered h is authoritative across all A/B pile-cap checks.
  foreach(var pair in new Dictionary<string,string>{{"A Socket H Checking","C33"},{"A Driven H Checking","C33"},{"A Mini Pile Checking","C35"},{"B Bored Pile Checking","C42"},{"B Socket H Checking","C47"}})b.Worksheets[pair.Key].Range[pair.Value].Formula="=IF('A Bored Pile Checking'!C39=\"\",\"\",'A Bored Pile Checking'!C39)";
  dynamic a=b.Worksheets["A Bored Pile Checking"],bb=b.Worksheets["B Bored Pile Checking"];
  a.Range["C39"].Interior.Color=Color75("#fff2cc");a.Range["C39"].Locked=false;
  bb.Range["C17"].Formula="='A Bored Pile Checking'!C23";bb.Range["C18"].Formula="='A Bored Pile Checking'!C13";bb.Range["C20"].Formula="='A Bored Pile Checking'!C15";
  a.Range["C10"].Formula="='B Bored Pile Checking'!C13";a.Range["C10"].Interior.Color=Color75("#e8f2f7");
  // Keep native report wording except the explicitly superseded floor-count thickness rule.
  foreach(string name in new[]{"Section A 抄","Section B 抄"}){
   dynamic sheet=b.Worksheets[name],used=sheet.UsedRange;object[,] formulas=(object[,])used.Formula;int firstRow=Convert.ToInt32(used.Row),firstCol=Convert.ToInt32(used.Column);
   for(int r=1;r<=formulas.GetLength(0);r++)for(int c=1;c<=formulas.GetLength(1);c++){
    string f=formulas[r,c] as string;if(f!=null&&f.StartsWith("=")&&(f.Contains("/10")||f.Contains("/ 10"))&&(f.Contains("thickness")||f.Contains("h =")||f.Contains("floors")))
     sheet.Cells[firstRow+r-1,firstCol+c-1].Formula="=\"Adopt pile-cap thickness h = \"&TEXT('A Bored Pile Checking'!C39,\"0.0\")&\" mm; cover = \"&TEXT('A Bored Pile Checking'!C38,\"0.0\")&\" mm\"";
   }
  }
  }finally{x.Calculation=inputMode82;}
  x.CalculateFullRebuild();Compare("Foundation inputs",b,Obj(job["cells"]));Compare("Foundation original formula",b,Obj(job["expected"]));
  string suffix=new Dictionary<string,string>{{"bored","Bored"},{"socket","Socket"},{"driven","Driven"},{"mini","Mini"}}[Convert.ToString(job["pile"])];
  foreach(var raw in Arr(job["sections"])){string section=Convert.ToString(raw);if(section=="B"&&(suffix=="Driven"||suffix=="Mini"))throw new Exception("原 Excel 没有此桩型的 Section B");Run(x,b,section+"_"+suffix);dynamic report=b.Worksheets["Section "+section+" 抄"];
   Numbered75.Add(Convert.ToString(b.FullName)+"|"+Convert.ToString(report.Name));
   string chapter=section=="A"&&job.ContainsKey("reportNumber")?"A."+Obj(job["reportNumber"])["chapter"]:section=="B"&&job.ContainsKey("foundationNumberB")?"B."+job["foundationNumberB"]:"Section "+section;
   report.PageSetup.CenterHeader=chapter+" Foundation - "+Convert.ToString(job["column"]);
   if(job.ContainsKey("preview")&&Convert.ToBoolean(job["preview"])){string file="Section-"+section+"-Foundation.pdf";ExportCopy(report,dir,file);files.Add(new{file=file,reportOrder=90});}
  }
 }
 // Export native row blocks with their original cell formatting and drawings.
 // The report composer places framing before member checks and sorts members across batches.
 static void ExportRC76(dynamic sheet,Dictionary<string,object> job,List<object> files,string dir,string section){
  // Changing PrintArea can remove the template's printer-dependent horizontal boundary.
  // Keep every native column on the same A4 page; allow any necessary vertical pages.
  dynamic setup80=sheet.PageSetup;if(Convert.ToInt32(setup80.PaperSize)!=9)setup80.PaperSize=9;if(!object.Equals((object)setup80.Zoom,false))setup80.Zoom=false;if(Convert.ToInt32(setup80.FitToPagesWide)!=1)setup80.FitToPagesWide=1;if(!object.Equals((object)setup80.FitToPagesTall,false))setup80.FitToPagesTall=false;
  string area=Convert.ToString(sheet.PageSetup.PrintArea);dynamic printed=sheet.Range[area];int last=Convert.ToInt32(printed.Row)+Convert.ToInt32(printed.Rows.Count)-1;
  var members=Arr(job["members"]).Select(Obj).Where(m=>!m.ContainsKey("selected")||Convert.ToBoolean(m["selected"])).ToList();
  object[,] labels82=(object[,])sheet.Range["A1:A"+Math.Max(2,last)].Value2;
  var starts=new List<Tuple<int,Dictionary<string,object>>>();
  for(int r=1;r<=last;r++){
   string t=Convert.ToString(labels82[r,1]);if(string.IsNullOrEmpty(t))continue;
   bool header=section=="A"?System.Text.RegularExpressions.Regex.IsMatch(t,@"^(\d+\)|Slab |Secondary Beam |Main Beam |Transfer Beam |Column |Cantilever Beam |Cantilever Slab )"):System.Text.RegularExpressions.Regex.IsMatch(t,@"^B\.\d+ (Slab |Secondary Beam |Main Beam |Transfer Beam |Column \(for |Cantilever Beam |Cantilever Slab )");
   if(!header)continue;var m=members.FirstOrDefault(v=>System.Text.RegularExpressions.Regex.IsMatch(t,@"(?<!\w)"+System.Text.RegularExpressions.Regex.Escape(Convert.ToString(v["id"]))+@"(?!\w)"));
   if(m!=null&&!starts.Any(v=>Object.ReferenceEquals(v.Item2,m)))starts.Add(Tuple.Create(r,m));
  }
  if(starts.Count!=members.Count)throw new Exception("原 Excel 抄的构件标题未完整对应，停止重排："+starts.Count+" / "+members.Count);
  var breaks=new List<int>();foreach(dynamic br in sheet.HPageBreaks)if(Convert.ToInt32(br.Type)==-4135)breaks.Add(Convert.ToInt32(br.Location.Row));
  bool first=section=="A"?!job.ContainsKey("reportNumber")||Convert.ToBoolean(Obj(job["reportNumber"])["first"]):!job.ContainsKey("reportNumberB")||Convert.ToBoolean(Obj(job["reportNumberB"])["first"]);
  string oldHeader=Convert.ToString(sheet.PageSetup.CenterHeader);string[] footers80=Footers80(sheet);
  try{SetFooters80(sheet,new[]{"","",""});
   if(starts.Count>0&&first){int end=starts[0].Item1-1;
    if(section=="A")for(int r=end;r>=1;r--)if((Convert.ToString(labels82[r,1])??"").Contains("RC Member Checks")){end=r-1;break;}
    if(Convert.ToString(sheet.PageSetup.CenterHeader)!="Section "+section)sheet.PageSetup.CenterHeader="Section "+section;sheet.PageSetup.PrintArea="$A$1:$H$"+end;
    string intro="Section-"+section+"-Intro.pdf";ExportCopy(sheet,dir,intro);files.Add(new{file=intro,reportOrder=0});
   }
   for(int i=0;i<starts.Count;i++){
    int begin=starts[i].Item1,end=i+1<starts.Count?starts[i+1].Item1-1:last;var m=starts[i].Item2;string kind=Convert.ToString(m["kind"]);
    var ranks=new Dictionary<string,int>{{"SLAB",1},{"CS",1},{"SB",2},{"MB",3},{"CB",3},{"TB",4},{"COL",5}};int rank=ranks[kind];double serial=m.ContainsKey("reportOrdinal")?Convert.ToDouble(m["reportOrdinal"]):i+1;
    string t=Convert.ToString(labels82[begin,1]);var oldNumber=System.Text.RegularExpressions.Regex.Match(t,@"^B\.(\d+) ");t=System.Text.RegularExpressions.Regex.Replace(t,@"^(?:A\.[\d.]+ |B\.\d+ |\d+\) )","");
    string prefix=section=="A"?"A."+(job.ContainsKey("reportNumber")?Obj(job["reportNumber"])["chapter"]:3)+".2."+serial:"B."+(serial+3);
    sheet.Cells[begin,1].Value2=prefix+" "+t;string header80=section=="A"?"Scheme 1 - RC":"Section B";if(Convert.ToString(sheet.PageSetup.CenterHeader)!=header80)sheet.PageSetup.CenterHeader=header80;
    if(section=="B"&&oldNumber.Success)for(int rr=begin+1;rr<=end;rr++){string sub=Convert.ToString(labels82[rr,1]);if(sub!=null&&sub.StartsWith("B."+oldNumber.Groups[1].Value+"."))sheet.Cells[rr,1].Value2=prefix+sub.Substring(2+oldNumber.Groups[1].Value.Length);}
    sheet.ResetAllPageBreaks();sheet.PageSetup.PrintArea="$A$"+begin+":$H$"+end;
    string file="Section-"+section+"-RC-"+i+".pdf";ExportCopy(sheet,dir,file);files.Add(new{file=file,reportOrder=(section=="A"?11:1)+rank+serial/10000});
   }
  }finally{SetFooters80(sheet,footers80);sheet.PageSetup.PrintArea=area;if(Convert.ToString(sheet.PageSetup.CenterHeader)!=oldHeader)sheet.PageSetup.CenterHeader=oldHeader;sheet.ResetAllPageBreaks();foreach(int row in breaks)sheet.HPageBreaks.Add(sheet.Cells[row,1]);}
 }

 static int Color75(string hex){hex=hex.TrimStart('#');int r=Convert.ToInt32(hex.Substring(0,2),16),g=Convert.ToInt32(hex.Substring(2,2),16),b=Convert.ToInt32(hex.Substring(4,2),16);return r+256*g+65536*b;}
 static HashSet<string> Numbered75=new HashSet<string>();
 static void ReportHeader75(dynamic sheet,Dictionary<string,object> job){
  string key=Convert.ToString(sheet.Parent.FullName)+"|"+Convert.ToString(sheet.Name);if(!Numbered75.Add(key))return;
  if(Convert.ToString(sheet.Name)=="Section B 抄"){
   var bn=job.ContainsKey("reportNumberB")?Obj(job["reportNumberB"]):new Dictionary<string,object>{{"offset",0},{"first",true}};dynamic printed=sheet.Range[sheet.PageSetup.PrintArea];int offset=(int)D(bn,"offset"),last=Convert.ToInt32(printed.Row)+Convert.ToInt32(printed.Rows.Count)-1;bool first=Convert.ToBoolean(bn["first"]);int begin=0;object[,] headerLabels82=(object[,])sheet.Range["A1:A"+Math.Max(2,last)].Value2;
   for(int r=1;r<=last;r++){string t=Convert.ToString(headerLabels82[r,1]);var m=System.Text.RegularExpressions.Regex.Match(t??"",@"^(?:B\.)?(\d+)(\.\d+)? (.+)$");if(!m.Success)continue;int c=int.Parse(m.Groups[1].Value);if(c>=4){if(begin==0)begin=r;c+=offset;}sheet.Cells[r,1].Value2="B."+c+m.Groups[2].Value+" "+m.Groups[3].Value;}
   if(!first&&begin>1){sheet.Rows["1:"+(begin-1)].Hidden=true;sheet.PageSetup.PrintArea="$A$"+begin+":$H$"+last;}return;
  }
  if(!job.ContainsKey("reportNumber")||Convert.ToString(sheet.Name).StartsWith("A "))return;var n=Obj(job["reportNumber"]);string prefix="A."+n["chapter"];
  sheet.PageSetup.CenterHeader=prefix+" "+n["title"];sheet.PageSetup.CenterFooter="Section A - &P";
  if(Convert.ToString(sheet.Name)=="Section A 抄"){
   dynamic printed=sheet.Range[sheet.PageSetup.PrintArea];int last=Convert.ToInt32(printed.Row)+Convert.ToInt32(printed.Rows.Count)-1;bool first=Convert.ToBoolean(n["first"]);object[,] labels82=(object[,])sheet.Range["A1:A"+Math.Max(2,last)].Value2;
   for(int r=1;r<=last;r++){
    string t=Convert.ToString(labels82[r,1]);if(string.IsNullOrEmpty(t))continue;
    var headings=new Dictionary<string,string>{{"1 Introduction","A.1 Introduction"},{"2.3 Site Constraints and Client Requirements","A.1.1 Site Constraints and Client Requirements"},{"2 Design Appraisal","A.2 Design Appraisal"},{"2.1 Floor Summary","A.2.1 Floor Summary"},{"2.2 Design Assumptions","A.2.2 Design Assumptions"},{"Feasibility Checking",prefix+".2 RC Member Checks"}};
    if(headings.ContainsKey(t))sheet.Cells[r,1].Value2=headings[t];
    if(t=="Feasibility Checking"&&!first){sheet.Rows["1:"+(r-1)].Hidden=true;sheet.PageSetup.PrintArea="$A$"+r+":$H$"+last;}

   }

  }
 }
 static void ReportPages75(dynamic b,Dictionary<string,object> job,List<object> files,string dir){
  if(!job.ContainsKey("reportPages"))return;
  dynamic app=b.Application;int calculation=Convert.ToInt32(app.Calculation);bool screen=Convert.ToBoolean(app.ScreenUpdating),events=Convert.ToBoolean(app.EnableEvents);
  try{app.ScreenUpdating=false;app.EnableEvents=false;app.Calculation=-4135;ReportPages82(b,job,files,dir);}
  finally{ClosePageBooks82();app.Calculation=calculation;app.EnableEvents=events;app.ScreenUpdating=screen;}
 }
 static IEnumerable<object> ReportPageList84(Dictionary<string,object> job){
  foreach(var raw in Arr(job["reportPages"])){
   var page=Obj(raw);if(!page.ContainsKey("referenceImageAfter")){yield return raw;continue;}
   var section=new Dictionary<string,object>(page);section.Remove("image");section.Remove("after");yield return section;
   var photo=new Dictionary<string,object>(page);photo.Remove("shapes");photo["lines"]=new object[0];photo["title"]=Convert.ToString(page["title"])+" - Reference photograph";photo["name"]=Convert.ToString(page["name"])+" Photo";photo["order"]=D(page,"order")+0.001;yield return photo;
  }
 }
 static void ReportInks84(dynamic b){foreach(dynamic sheet in b.Worksheets){string n=Convert.ToString(sheet.Name);if(n.Contains("抄")||System.Text.RegularExpressions.Regex.IsMatch(n,@"^A \d+ "))Palette84(sheet);}}
 static void ReportPages82(dynamic b,Dictionary<string,object> job,List<object> files,string dir){
  if(!job.ContainsKey("reportPages"))return;int index=0;
  foreach(var raw in ReportPageList84(job)){
   var page=Obj(raw);index++;string name="A "+index+" "+Convert.ToString(page["name"]);if(name.Length>31)name=name.Substring(0,31);
   string pageFile="Section-A-Extra-"+index+".pdf";if(RestorePage79(b,page,job,name,Path.Combine(dir,pageFile))){files.Add(new {file=pageFile,reportOrder=D(page,"order"),chapter=D(page,"chapter")});continue;}Stage79("排版章节 "+index+"："+Convert.ToString(page["title"]));
   dynamic s=b.Worksheets.Add(Type.Missing,b.Worksheets[b.Worksheets.Count]);s.Name=name;s.DisplayPageBreaks=false;s.Columns["A:L"].ColumnWidth=6.5;
   s.Range["A1:L150"].Font.Name="Arial";s.Range["A1:L150"].Font.Size=11;s.Range["A1:L150"].Font.Color=Color75("#245b70");s.Rows["1:150"].RowHeight=21;
   int row=1;ReportLine75(s,ref row,Convert.ToString(page["title"]),2,false);
   bool reference=page.ContainsKey("reference")&&Convert.ToBoolean(page["reference"]);
   foreach(var l in Arr(page["lines"])){var a=Obj(l);ReportLine75(s,ref row,Convert.ToString(a["text"]),(int)D(a,"level"),reference);}
   if(page.ContainsKey("image")){
    string imageName=Path.GetFileName(Convert.ToString(page["image"]));if(imageName!="vertical-load-path.png"&&imageName!="horizontal-load-path.png")throw new Exception("Unknown report photo");
    string imagePath=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"ReportImages",imageName);double w=Convert.ToDouble(s.Range["A:L"].Width);
    dynamic photo=s.Shapes.AddPicture(imagePath,0,-1,0,Convert.ToDouble(s.Cells[row,1].Top)+8,-1,-1);
    bool vertical=imageName.StartsWith("vertical");double iw=vertical?660:687,ih=vertical?622:607,left=vertical?65:66,top=vertical?101:130,cw=vertical?549:535,ch=vertical?363:312,scale=w/cw,pt=Convert.ToDouble(s.Cells[row,1].Top)+8;
    photo.LockAspectRatio=0;dynamic crop=photo.PictureFormat.Crop;crop.ShapeWidth=w;crop.ShapeHeight=ch*scale;crop.PictureWidth=iw*scale;crop.PictureHeight=ih*scale;crop.PictureOffsetX=(iw/2-left-cw/2)*scale;crop.PictureOffsetY=(ih/2-top-ch/2)*scale;photo.Left=0;photo.Top=pt;photo.Placement=2;
    while(Convert.ToDouble(s.Cells[row,1].Top)<pt+ch*scale+12)row++;
   }
   if(page.ContainsKey("table")){
    s.Columns["A:C"].ColumnWidth=5.72;s.Columns["D:G"].ColumnWidth=7.605;s.Columns["H:L"].ColumnWidth=6.084;int tr=0;foreach(var rawRow in Arr(page["table"])){
     var cells=Arr(rawRow).Select(Convert.ToString).ToArray();string[] starts={"A","D","H"},ends={"C","G","L"};int lines=1;
     for(int i=0;i<cells.Length&&i<3;i++){
      dynamic range=s.Range[starts[i]+row+":"+ends[i]+row];range.Merge();range.Value2="'"+cells[i];range.WrapText=true;range.VerticalAlignment=-4160;range.Font.Bold=tr==0;range.Borders.LineStyle=1;range.Borders.Color=Color75("#c9cdd1");range.Font.Color=Color75(tr==0?"#ffffff":"#142e47");
      range.Interior.Color=Color75(tr==0?"#21567f":tr%2==1?"#ffffff":"#f1f6f8");int count=0;foreach(string part in cells[i].Split('\n'))count+=Math.Max(1,(int)Math.Ceiling(part.Length/(i==0?18.0:33.0)));lines=Math.Max(lines,count);
     }
     s.Rows[row].RowHeight=lines*16+12;row++;tr++;
    }
   }
   if(page.ContainsKey("shapes")){
    double scale=Convert.ToDouble(s.Range["A:L"].Width)/540.0;
    double top=Math.Max(D(page,"shapeTop"),Convert.ToDouble(s.Cells[row,1].Top)+8);
    foreach(var v in Arr(page["shapes"])){
     var a=Obj(v);string type=Convert.ToString(a["type"]);double x=D(a,"x")*scale,y=top+D(a,"y")*scale;dynamic shape;
     if(type=="line")shape=s.Shapes.AddLine(x,y,D(a,"x2")*scale,top+D(a,"y2")*scale);
     else if(type=="text")shape=s.Shapes.AddTextbox(1,x,y,D(a,"w",120)*scale,D(a,"h",30)*scale);
     else shape=s.Shapes.AddShape(type=="ellipse"?9:1,x,y,D(a,"w")*scale,D(a,"h")*scale);
     shape.Placement=2;
     if(type=="text"){
      shape.TextFrame.Characters().Text=Convert.ToString(a["text"]);shape.TextFrame.Characters().Font.Name="Arial";shape.TextFrame.Characters().Font.Size=D(a,"size",10)*scale;
      shape.TextFrame.Characters().Font.Color=Color75(a.ContainsKey("color")?Convert.ToString(a["color"]):"#000000");shape.TextFrame.MarginLeft=0;shape.TextFrame.MarginRight=0;shape.TextFrame.MarginTop=0;shape.TextFrame.MarginBottom=0;shape.Fill.Visible=0;shape.Line.Visible=0;if(a.ContainsKey("center")&&Convert.ToBoolean(a["center"])){shape.TextFrame.HorizontalAlignment=-4108;shape.TextFrame.VerticalAlignment=-4108;}
     }else{
      shape.Line.ForeColor.RGB=Color75(a.ContainsKey("color")?Convert.ToString(a["color"]):"#245b79");shape.Line.Weight=D(a,"width",1)*scale;
      if(type!="line"){if(a.ContainsKey("fill")){shape.Fill.Visible=-1;shape.Fill.ForeColor.RGB=Color75(Convert.ToString(a["fill"]));}else shape.Fill.Visible=0;}if(a.ContainsKey("mono98"))shape.Name="Monochrome98-"+shape.ID;
      if(a.ContainsKey("dash")&&Convert.ToBoolean(a["dash"]))shape.Line.DashStyle=a.ContainsKey("mono98")?4:5;
      if(a.ContainsKey("arrow")&&Convert.ToBoolean(a["arrow"]))shape.Line.EndArrowheadStyle=3;
      if(a.ContainsKey("both")&&Convert.ToBoolean(a["both"]))shape.Line.BeginArrowheadStyle=3;
     }
    }
    if(Convert.ToString(page["key"])=="framing"){while(Convert.ToDouble(s.Cells[row,1].Top)<top+D(page,"shapeHeight")*scale+8)row++;}
    else row=Math.Max(row,(int)Math.Ceiling((top+D(page,"shapeHeight")*scale)/21)+2);
   }
   if(Convert.ToString(page["key"])=="framing"&&page.ContainsKey("after"))FramingLegend98(s,ref row,Arr(page["after"]).Select(Obj).ToArray());
   else if(page.ContainsKey("after"))foreach(var l in Arr(page["after"])){var a=Obj(l);ReportLine75(s,ref row,Convert.ToString(a["text"]),(int)D(a,"level"),reference);}
   s.Application.PrintCommunication=false;try{s.PageSetup.PaperSize=9;s.PageSetup.Orientation=1;s.PageSetup.LeftMargin=28;s.PageSetup.RightMargin=28;s.PageSetup.TopMargin=28;s.PageSetup.BottomMargin=28;
   if(Convert.ToString(page["key"])=="framing"){s.PageSetup.Zoom=false;s.PageSetup.FitToPagesWide=1;s.PageSetup.FitToPagesTall=1;}else{s.PageSetup.Zoom=100;s.PageSetup.FitToPagesWide=false;s.PageSetup.FitToPagesTall=false;}s.PageSetup.PrintArea="$A$1:$L$"+(row-1);s.PageSetup.CenterFooter="Section A - &P";}finally{s.Application.PrintCommunication=true;}
   if(job.ContainsKey("preview")&&Convert.ToBoolean(job["preview"])){
    string file="Section-A-Extra-"+index+".pdf";ExportCopy(s,dir,file);files.Add(new {file=file,reportOrder=D(page,"order"),chapter=D(page,"chapter")});StorePage79(s,page,job,Path.Combine(dir,file));
   }
  }
 }
 static void ReportLine75(dynamic s,ref int row,string text,int level,bool editable){
  dynamic band=s.Range["A"+row+":L"+row];band.Merge();band.Value2="'"+text;band.WrapText=true;band.VerticalAlignment=-4160;
  band.Font.Bold=level>0;band.Font.Size=level==2?14:11;
  if(level>0){band.Interior.Color=Color75(level==2?"#203958":"#e4edf2");band.Font.Color=Color75(level==2?"#ffffff":"#245b70");}
  else if(editable)band.Interior.Color=Color75("#fff9e8");
  band.Borders[9].LineStyle=1;band.Borders[9].Color=Color75("#d9e8ee");
  int lines=0;foreach(string part in text.Split('\n'))lines+=Math.Max(1,(int)Math.Ceiling(part.Length/88.0));
  s.Rows[row].RowHeight=Math.Max(level==2?32:22,lines*16+8);row++;
 }

 // Excel does not reliably commit blank headers/footers while PrintCommunication
 // is disabled. Change them directly, only when needed; RC exports share one scope.
 static string[] Footers80(dynamic sheet){return new string[]{Convert.ToString(sheet.PageSetup.LeftFooter),Convert.ToString(sheet.PageSetup.CenterFooter),Convert.ToString(sheet.PageSetup.RightFooter)};}
 static void SetFooters80(dynamic sheet,string[] values){dynamic setup=sheet.PageSetup;if(Convert.ToString(setup.LeftFooter)!=values[0])setup.LeftFooter=values[0];if(Convert.ToString(setup.CenterFooter)!=values[1])setup.CenterFooter=values[1];if(Convert.ToString(setup.RightFooter)!=values[2])setup.RightFooter=values[2];}
 static object ExportCopy(dynamic sheet,string directory,string file) {
  if(ActiveJob75!=null)ReportHeader75(sheet,ActiveJob75);
  Palette84(sheet);
  Stage79("导出 PDF："+file);if(Math.Abs(Convert.ToDouble(sheet.PageSetup.HeaderMargin)-9)>.01)sheet.PageSetup.HeaderMargin=9;
  string path=Path.Combine(directory,file);bool paperMap75=Convert.ToBoolean(sheet.Application.MapPaperSize);string[] footers=Footers80(sheet);
  try{sheet.Application.MapPaperSize=false;SetFooters80(sheet,new[]{"","",""});sheet.ExportAsFixedFormat(0,path,0,true,false,Type.Missing,Type.Missing,false);}
  finally{sheet.Application.MapPaperSize=paperMap75;SetFooters80(sheet,footers);}
  if(!File.Exists(path)||new FileInfo(path).Length<100)throw new Exception("原 Excel 抄未导出");
  return new {file=file};
 }
 // Color only generated report-copy sheets. Template inputs and formulas are untouched.
 static int Ink84(object raw){int v=Convert.ToInt32(raw),r=v&255,g=(v>>8)&255,b=(v>>16)&255;if(Math.Max(r,Math.Max(g,b))-Math.Min(r,Math.Min(g,b))<35)return Color75("#000000");if(r>g*1.25&&r>b*1.15)return Color75("#c00000");if(g>r*1.2&&g>b*1.05)return Color75("#008000");return Color75("#0057b8");}
 static void ShapeInk84(dynamic shape){
  if(Convert.ToString(shape.Name).StartsWith("Monochrome98-"))return;
  int type=Convert.ToInt32(shape.Type);if(type==11||type==13)return; // Original photographs retain their pixels.
  if(type==6){for(int i=1;i<=Convert.ToInt32(shape.GroupItems.Count);i++)ShapeInk84(shape.GroupItems.Item(i));return;}
  try{if(Convert.ToInt32(shape.Line.Visible)!=0)shape.Line.ForeColor.RGB=Ink84(shape.Line.ForeColor.RGB);}catch{}
  try{if(Convert.ToInt32(shape.Fill.Visible)!=0){int c=Convert.ToInt32(shape.Fill.ForeColor.RGB);shape.Fill.ForeColor.RGB=(c==16777215)?c:Ink84(c);}}catch{}
  try{if(Convert.ToInt32(shape.TextFrame2.HasText)!=0)shape.TextFrame2.TextRange.Font.Fill.ForeColor.RGB=Ink84(shape.TextFrame2.TextRange.Font.Fill.ForeColor.RGB);}catch{}
 }
 static void Palette84(dynamic sheet){
  dynamic range=sheet.UsedRange;range.Font.Color=Color75("#0057b8");range.Interior.Color=Color75("#ffffff");CleanBorders85(sheet,range);
  object raw=range.Value2;var values=raw as object[,];if(values!=null){int r0=Convert.ToInt32(range.Row),c0=Convert.ToInt32(range.Column);var red=new List<string>();var green=new List<string>();var black=new List<string>();
   for(int r=1;r<=values.GetLength(0);r++)for(int c=1;c<=values.GetLength(1);c++){string t=Convert.ToString(values[r,c]);if(String.IsNullOrWhiteSpace(t))continue;string address=Column84(c0+c-1)+(r0+r-1);if(System.Text.RegularExpressions.Regex.IsMatch(t,@"\b(NOT\s*OK(?:AY)?|FAIL(?:ED)?|INPUT REQUIRED|NOT ASSESSED|NO RESISTANCE)\b",System.Text.RegularExpressions.RegexOptions.IgnoreCase))red.Add(address);else if(System.Text.RegularExpressions.Regex.IsMatch(t,@"\b(OK(?:AY)?|PASS(?:ED)?|SATISFIED)\b",System.Text.RegularExpressions.RegexOptions.IgnoreCase))green.Add(address);else if(System.Text.RegularExpressions.Regex.IsMatch(t,@"^(?:[AB]\.\d|[IVX]+[).]|Section [AB]|Scheme |.*(?:Load Path|Design Data|Design Codes|Foundation Recommendation))",System.Text.RegularExpressions.RegexOptions.IgnoreCase))black.Add(address);}
   foreach(var pair in new[]{Tuple.Create(red,"#c00000"),Tuple.Create(green,"#008000"),Tuple.Create(black,"#000000")})for(int i=0;i<pair.Item1.Count;i+=20)sheet.Range[String.Join(",",pair.Item1.Skip(i).Take(20))].Font.Color=Color75(pair.Item2);
  }
  foreach(dynamic shape in sheet.Shapes){ShapeInk84(shape);if(Convert.ToString(sheet.Name).Contains("抄"))ArrowInk84(shape);}
  if(System.Text.RegularExpressions.Regex.IsMatch(Convert.ToString(sheet.Name),@"^A \d+ Framing "))range.Font.Color=Color75("#000000");
 }
 // Remove spreadsheet scaffolding from generated report copies, not source templates.
 static void CleanBorders85(dynamic sheet,dynamic used){
  // The Overall macro also creates ruled-paper guides as named line shapes.
  for(int i=Convert.ToInt32(sheet.Shapes.Count);i>=1;i--){dynamic shape=sheet.Shapes.Item(i);if(Convert.ToInt32(shape.Type)==9&&System.Text.RegularExpressions.Regex.IsMatch(Convert.ToString(shape.Name),@"^copy_rule_\d+$"))shape.Delete();}
  object raw=used.Value2;var values=raw as object[,];if(values==null)return;
  int firstRow=Convert.ToInt32(used.Row),firstCol=Convert.ToInt32(used.Column),left=firstCol,right=firstCol+values.GetLength(1)-1;
  try{dynamic print=sheet.Range[Convert.ToString(sheet.PageSetup.PrintArea)];left=Convert.ToInt32(print.Column);right=left+Convert.ToInt32(print.Columns.Count)-1;}catch{}
  // Borders on drawings and blank spacer rows are cell scaffolding. Shapes are untouched.
  used.Borders.LineStyle=-4142;
  int groupStart=0,groupLeft=right,groupRight=left;
  for(int r=1;r<=values.GetLength(0)+1;r++){
   if(r>values.GetLength(0)){if(groupStart>0){dynamic lastTable=sheet.Range[sheet.Cells[firstRow+groupStart-1,groupLeft],sheet.Cells[firstRow+r-2,groupRight]];lastTable.Borders.LineStyle=1;lastTable.Borders.Weight=2;lastTable.Borders.Color=Color75("#000000");}break;}
   int count=0,rowLeft=right,rowRight=left;for(int c=1;c<=values.GetLength(1);c++){int col=firstCol+c-1;if(col<left||col>right)continue;if(!String.IsNullOrWhiteSpace(Convert.ToString(values[r,c]))){count++;rowLeft=Math.Min(rowLeft,col);rowRight=Math.Max(rowRight,col);}}
   if(count<2){if(groupStart>0){dynamic table=sheet.Range[sheet.Cells[firstRow+groupStart-1,groupLeft],sheet.Cells[firstRow+r-2,groupRight]];table.Borders.LineStyle=1;table.Borders.Weight=2;table.Borders.Color=Color75("#000000");groupStart=0;groupLeft=right;groupRight=left;}continue;}
   dynamic lastCell=sheet.Cells[firstRow+r-1,rowRight];if(Convert.ToBoolean(lastCell.MergeCells))rowRight=Math.Min(right,Convert.ToInt32(lastCell.MergeArea.Column)+Convert.ToInt32(lastCell.MergeArea.Columns.Count)-1);
   if(groupStart==0)groupStart=r;groupLeft=Math.Min(groupLeft,rowLeft);groupRight=Math.Max(groupRight,rowRight);
  }
 }
 static void ArrowInk84(dynamic shape){
  int type=Convert.ToInt32(shape.Type);if(type==11||type==13)return;if(type==6){for(int i=1;i<=Convert.ToInt32(shape.GroupItems.Count);i++)ArrowInk84(shape.GroupItems.Item(i));return;}
  try{int begin=Convert.ToInt32(shape.Line.BeginArrowheadStyle),end=Convert.ToInt32(shape.Line.EndArrowheadStyle);if(begin>1||end>1)shape.Line.ForeColor.RGB=Color75(begin>1&&end>1?"#000000":"#c00000");}catch{}
 }
 static string Column84(int n){string s="";for(;n>0;n=(n-1)/26)s=(char)('A'+(n-1)%26)+s;return s;}
 static void SteelJob(dynamic x,dynamic b,Dictionary<string,object> job,List<object> files,string dir) {
  dynamic beam=b.Worksheets["Steel Beam Design"],col=b.Worksheets["column design"],copy=b.Worksheets["抄"];
  beam.Unprotect();col.Unprotect();copy.Unprotect();
  int extra=0;bool isColumn=Convert.ToString(job["reportScope"])=="column";
  col.Range["A16:D23,F16:G23,R16:R23"].ClearContents();foreach(string cell in new[]{"B8","D8","B9"})Set(col,cell,null);
  copy.Rows["1:172"].Hidden=false;
  foreach(dynamic shape in copy.Shapes)shape.Visible=true;
  if(!isColumn) {
   var v=Obj(job["beam"]);
   var map=new Dictionary<string,string>{{"x1","B4"},{"x2","B5"},{"y","E4"},{"angle","H4"},{"n","B6"},{"nc","H6"},{"dl","B7"},{"ll","B8"},{"E","D12"},{"limit1","D10"},{"limit2","H10"},{"limit3","L10"},{"grade","D7006"}};
   Set(beam,"B3",Convert.ToString(v["type"])=="cantilever"?"Cantilever Supported":"Simply Supported");
   foreach(var pair in map)Set(beam,pair.Value,v.ContainsKey(pair.Key)?v[pair.Key]:null);
   Run(x,b,"AutoSelectBeams");Run(x,b,"UpdateUnlimitedSketch");
   if(Convert.ToString(Val(beam.Range["A18"]))!="")throw new Exception(Convert.ToString(Val(beam.Range["A18"])));
   copy.Rows["130:172"].Hidden=true;
   if(Convert.ToString(v["type"])!="cantilever")copy.Rows["87:129"].Hidden=true;
   int last=Convert.ToString(v["type"])=="cantilever"?129:86;
   foreach(dynamic shape in copy.Shapes)if(Convert.ToInt32(shape.TopLeftCell.Row)>last)shape.Visible=false;
   copy.PageSetup.PrintArea="A1:L"+last;
  } else {
   foreach(string cell in new[]{"B4","B5","E4","H4","B6","H6","B7","B8"})Set(beam,cell,null);
   Run(x,b,"AutoSelectBeams");
   var v=Obj(job["column"]);var rows=Arr(v["rows"]).Select(Obj).ToArray();if(rows.Length==0)throw new Exception("组合柱没有楼层输入");
   extra=Math.Max(0,rows.Length-8);
   if(extra>0){col.Rows["23:"+(22+extra)].Insert();copy.Rows["143:"+(142+extra)].Insert();}
   int end=23+extra;
   col.Range["A16:R16"].Copy(col.Range["A16:R"+end]);copy.Range["A136:L136"].Copy(copy.Range["A136:L"+(143+extra)]);
   for(int r=136;r<=143+extra;r++)copy.Range["K"+r].Formula="=IF(OR('column design'!J"+(r-120)+"=\"\",'column design'!$B$13<=0),\"\",'column design'!J"+(r-120)+"/'column design'!$B$13)";
   col.Range["A16:D"+end+",F16:G"+end+",R16:R"+end].ClearContents();
   for(int i=0;i<rows.Length;i++){int r=16+i;var row=rows[i];var map=new Dictionary<string,string>{{"floor","A"},{"usage","B"},{"dl","C"},{"sdl","D"},{"b","F"},{"d","G"},{"ll","R"}};foreach(var pair in map)Set(col,pair.Value+r,row[pair.Key]);}
   Set(col,"B8",v["b"]);Set(col,"D8",v["d"]);Set(col,"B9",v["section"]);Set(col,"F8",v["fcu"]);Set(col,"H8",v["py"]);Set(col,"B13",v["wind"]);
   x.CalculateFull();
   if(Convert.ToString(Val(col.Range["B"+(32+extra)]))=="Column design pending")throw new Exception("组合柱资料未完整");
   foreach(dynamic shape in copy.Shapes)if(Convert.ToInt32(shape.TopLeftCell.Row)<130)shape.Visible=false;
   copy.Rows["1:129"].Hidden=true;copy.PageSetup.PrintArea="A130:L"+(172+extra);
   copy.PageSetup.PrintTitleRows="$130:$135";
  }
  x.CalculateFull();
  var expected=Obj(job["expected"]);
  if(extra>0){var cells=Obj(expected["column design"]);var shifted=new Dictionary<string,object>();foreach(var c in cells){var match=System.Text.RegularExpressions.Regex.Match(c.Key,"^([A-Z]+)([0-9]+)$");int row=int.Parse(match.Groups[2].Value);shifted[match.Groups[1].Value+(row>=24?row+extra:row)]=c.Value;}expected["column design"]=shifted;}
  Compare("Scheme 2",b,expected);
  copy.PageSetup.CenterHeader="Scheme 2 - Steel";
  copy.PageSetup.PaperSize=9;
  if(job.ContainsKey("preview")&&Convert.ToBoolean(job["preview"]))files.Add(ExportCopy(copy,dir,"Section-A-Steel.pdf"));
  if(isColumn)col.Activate();else beam.Activate();
 }

 // E2.98 changes report presentation only; all original calculation sheets remain intact.
 static string N98(double n,string fmt="0.###"){return n.ToString(fmt,System.Globalization.CultureInfo.InvariantCulture);}
 static void Band98(dynamic s,int row,string text,double height=22,bool formula=false,string cols="A:L",double size=11,bool bold=false){
  var c=cols.Split(':');dynamic r=s.Range[c[0]+row+":"+c[1]+row];r.Merge();if(formula)r.Formula=text;else r.Value2="'"+text;r.WrapText=true;r.VerticalAlignment=-4160;r.Font.Name="Arial";r.Font.Size=size;r.Font.Bold=bold;s.Rows[row].RowHeight=height;
 }
 static void OverallCopy98(dynamic b,Dictionary<string,object> job,string face){
  dynamic s=b.Worksheets["抄"],w=b.Worksheets["Wind Load Check"];var v=Obj(Obj(Obj(job["faces"])[face])["input"]);
  double hp=Convert.ToDouble(Val(w.Range["B10"])),nx=Convert.ToDouble(Val(w.Range["B24"]));
  if(Convert.ToString(v["mode"])!="LAYERED"){
   s.Range["A12"].Value2="Exposed wind height Hp = "+N98(hp)+" m. Frequency follows the current wind input;"+"\n"+Convert.ToString(Val(w.Range["AZ132"]));s.Range["A12"].WrapText=true;return;
  }
  double area=0;for(int i=0;i<100;i++)area+=D(v,"layerH"+i)*D(v,"layerB"+i);
  if(area<=0||hp<=0)throw new Exception("Layered wind copy requires positive exposed area and height");
  double force=Convert.ToDouble(Val(w.Range["K5"])),moment=Convert.ToDouble(Val(w.Range["K6"])),lever=Convert.ToDouble(Val(w.Range["K7"]));
  s.Range["A12:F34"].UnMerge();s.Range["A12:F34"].ClearContents();s.Rows["12:34"].RowHeight=16;
  string[] lines={
   "Layered along-wind load - face "+face+"; exposed height Hp = "+N98(hp)+" m",
   "Frequency Nx = "+N98(nx,"0.0000")+" Hz. "+Convert.ToString(Val(w.Range["AZ132"])),
   "Each storey: p_i = Cf_i Qz_i Sq_i; F_i = p_i B_i h_i",
   "Moment about O: M_i = F_i z_i; z_i is measured above O",
   "Total wind force: Fw = SUM(F_i) = "+N98(force,"0.000")+" kN",
   "Total wind moment: Mw,O = SUM(M_i) = "+N98(moment,"0.000")+" kNm",
   "Resultant height above O = Mw,O / Fw = "+N98(lever,"0.000")+" m",
   "Exposed area Aw = SUM(B_i h_i) = "+N98(area,"0.000")+" m2",
   "Area-weighted p_avg = SUM(p_i B_i h_i) / Aw = "+N98(force/area,"0.000")+" kPa",
   "Equivalent breadth B_eq = Aw / Hp = "+N98(area/hp,"0.000")+" m",
   "For Deflection: p_avg B_eq Hp = Fw. Equal force does not imply equal deflection.",
   "Overall retains the storey forces and moments; see Wind Load Check for every band."
  };
  for(int i=0;i<lines.Length;i++){int row=12+i*2;dynamic r=s.Range["A"+row+":F"+Math.Min(row+1,35)];r.Merge();r.Value2="'"+lines[i];r.WrapText=true;r.Font.Size=11;r.VerticalAlignment=-4160;}
 }
 static void FramingLegend98(dynamic s,ref int row,Dictionary<string,object>[] lines){
  if(lines.Length==0)return;Band98(s,row++,Convert.ToString(lines[0]["text"]),22,false,"A:L",11,true);
  for(int i=1;i<lines.Length;i+=2){Band98(s,row,Convert.ToString(lines[i]["text"]),22,false,"A:F",10);if(i+1<lines.Length)Band98(s,row,Convert.ToString(lines[i+1]["text"]),22,false,"G:L",10);row++;}
 }
 static dynamic Text98(dynamic s,string text,double x,double y,double width,double height,double size=9){
  dynamic q=s.Shapes.AddTextbox(1,x,y,width,height);q.Placement=2;q.TextFrame.Characters().Text=text;q.TextFrame.Characters().Font.Name="Arial";q.TextFrame.Characters().Font.Size=size;q.TextFrame.MarginLeft=0;q.TextFrame.MarginRight=0;q.TextFrame.MarginTop=0;q.TextFrame.MarginBottom=0;q.Fill.Visible=0;q.Line.Visible=0;return q;
 }
 static dynamic Line98(dynamic s,double x,double y,double x2,double y2,bool dash=false,bool arrow=false){
  dynamic q=s.Shapes.AddLine(x,y,x2,y2);q.Placement=2;q.Line.ForeColor.RGB=Color75("#0057b8");q.Line.Weight=.9;if(dash)q.Line.DashStyle=4;if(arrow)q.Line.EndArrowheadStyle=3;return q;
 }
 static void Plan98(dynamic s,Dictionary<string,object> v,Dictionary<string,object> g){
  var a=Obj(v["axis"]);double x0=D(a,"x0"),y0=D(a,"y0"),width=D(a,"x1")-x0,height=D(a,"y1")-y0,total=Convert.ToDouble(s.Range["A:L"].Width),left=total*.68,top=67,scale=Math.Min((total-left-24)/Math.Max(width,.001),164/Math.Max(height,.001)),ww=width*scale,hh=height*scale;
  dynamic box=s.Shapes.AddShape(1,left,top,ww,hh);box.Fill.Visible=0;box.Line.Weight=.7;box.Line.ForeColor.RGB=Color75("#000000");box.Placement=2;
  foreach(var raw in Arr(g["parts"])){var r=Obj(raw);double px=left+(D(r,"x")-D(r,"w")/2-x0)*scale,py=top+(D(r,"y")-D(r,"h")/2-y0)*scale;
   dynamic q=s.Shapes.AddShape(1,px,py,Math.Max(.9,D(r,"w")*scale),Math.Max(.9,D(r,"h")*scale));q.Placement=2;q.Fill.ForeColor.RGB=Color75("#0057b8");q.Line.Visible=0;
   Text98(s,Convert.ToString(r["id"]),Math.Max(left,px-17),py+(D(r,"h")>D(r,"w")?D(r,"h")*scale*.5:2),30,11,7);
  }
  bool alongX=Convert.ToString(v["direction"])=="X";double ax=left+(D(a,"x")-x0)*scale,ay=top+(D(a,"y")-y0)*scale;
  if(alongX){Line98(s,ax,top-6,ax,top+hh+8,true);Text98(s,"y-y",ax+3,top+hh+8,36,14,8);Line98(s,left-32,top+hh*.45,left-4,top+hh*.45,false,true);Text98(s,"Wind X",left-43,top+hh*.45-16,42,14,8);}
  else {Line98(s,left-6,ay,left+ww+8,ay,true);Text98(s,"x-x",left+4,ay-14,36,14,8);Line98(s,left-17,top+25,left-17,top+55,false,true);Text98(s,"Wind Y",left-43,top+8,42,14,8);}
  Line98(s,left,top-12,left+ww,top-12);Line98(s,ax,top-15,ax,top-9);
  Text98(s,N98(D(a,"x")-x0)+" m",left+ww*.15,top-27,60,13,8);Text98(s,N98(D(a,"x1")-D(a,"x"))+" m",left+ww*.63,top-27,60,13,8);
  Text98(s,N98(height)+" m",left+ww+2,top+hh*.72,22,13,7);
  Text98(s,"Selected walls / columns;\ndashed = bending axis",left-5,top+hh+27,total-left+4,30,8);
 }
 static void DeflectionCopy98(dynamic x,dynamic b,Dictionary<string,object> job,List<object> files,string dir,dynamic summary){
  var faces=Obj(job["faces"]);double rb=Convert.ToDouble(Val(b.Worksheets["B Axis"].Range["B12"])),rd=Convert.ToDouble(Val(b.Worksheets["D Axis"].Range["B12"]));bool equal=Math.Abs(rb-rd)<1e-7;string governing=equal?"B / D":rb>rd?"B":"D";
  summary.Name="_Deflection Summary";var order=rd>rb?new[]{"D","B"}:new[]{"B","D"};int index=0;
  foreach(string face in order){var data=Obj(faces[face]);var v=Obj(data["input"]);var g=Obj(data["geometry"]);var axis=Obj(v["axis"]);bool alongX=Convert.ToString(v["direction"])=="X";string bend=alongX?"y-y":"x-x",refSheet="'"+face+" Axis'!";
   dynamic s=b.Worksheets.Add(After:b.Worksheets[b.Worksheets.Count]);s.Name=index==0?"Deflection 抄":"Deflection "+face+" 抄";s.DisplayPageBreaks=false;s.Columns["A:L"].ColumnWidth=6.5;s.Rows["1:55"].RowHeight=20;s.Range["A1:L55"].Font.Name="Arial";s.Range["A1:L55"].Font.Size=11;
   Band98(s,1,"Deflection Checking of Building",30,false,"A:L",17,true);
   Band98(s,3,"Wind along "+v["direction"]+" - face "+face+(equal?" (B / D equal utilisation)":face==governing?" CONTROLS":" (other direction checked)"),29,false,"A:G",11,true);
   var parts=Arr(g["parts"]).Select(Obj).ToArray();int walls=parts.Count(p=>Convert.ToString(p["kind"])=="Wall"),columns=parts.Length-walls;
   Band98(s,4,"Resisting section: "+walls+" walls, "+columns+" columns.\nFloor "+Convert.ToString(v["readFloorName"])+" / "+Convert.ToString(v["readFraming"]),34,false,"A:G",10);
   Band98(s,5,"Constant section and common bending action assumed above the wind-face base.",33,false,"A:G",10);
   Band98(s,6,"=\"Average wind pressure = \"&TEXT("+refSheet+"B6,\"0.000\")&\" kPa\"",22,true,"A:G",10);
   Band98(s,7,"=\"H = \"&TEXT("+refSheet+"B16,\"0.###\")&\" - \"&TEXT("+refSheet+"B15,\"0.###\")&\" = \"&TEXT("+refSheet+"B5,\"0.###\")&\" m\"",22,true,"A:G",10);
   double eref=D(g,"referenceE"),erefKN=eref*1000000;bool mixed=parts.Any(p=>Math.Abs(D(p,"E")-eref)>1e-8);
   Band98(s,8,(mixed?"Reference E = ":"E = ")+N98(eref)+" GPa = "+N98(erefKN,"#,##0")+" kN/m²",22,false,"A:G",10);
   Band98(s,9,"Specified building centre axis "+bend+".\nSee functional Framing for the selected section.",32,false,"A:G",10);
   Plan98(s,v,g);
   int row=12;Band98(s,row++,"Moment of inertia about "+bend,25,false,"A:L",12,true);
   Band98(s,row++,mixed?"I_eq = Σ (E_i / E_ref) [I_local,i + A_i d_i²]":"I_"+bend+" = Σ [I_local,i + A_i d_i²] = Σ [b_i t_i³ / 12 + (b_i t_i) d_i²]",23,false,"A:L",11);
   var cells=Arr(g["cells"]).Select(Obj).Select((c,i)=>new{cell=c,row=21+i}).ToArray();
   var groups=cells.GroupBy(c=>N98(D(c.cell,"w"),"0.#########")+"|"+N98(D(c.cell,"h"),"0.#########")+"|"+N98(Math.Abs(D(c.cell,alongX?"x":"y")-D(axis,alongX?"x":"y")),"0.#########")+"|"+N98(D(c.cell,"E"),"0.#########")).ToArray();
   foreach(var group in groups.Take(8)){var c=group.First();int r=c.row;string t=refSheet+(alongX?"D":"E")+r,bb=refSheet+(alongX?"E":"D")+r,dist=refSheet+"J"+r;
    string prefix=(row==14?"= ":"+ ")+(group.Count()>1?group.Count()+" × ":"");
    string formula="=\""+prefix+(mixed?"("+N98(D(c.cell,"E"))+"/"+N98(eref)+") × ":"")+"[\"&TEXT("+bb+",\"0.####\")&\" × \"&TEXT("+t+",\"0.####\")&\"³ / 12 + (\"&TEXT("+bb+",\"0.####\")&\" × \"&TEXT("+t+",\"0.####\")&\") × \"&TEXT(ABS("+dist+"),\"0.####\")&\"²]\"";
    Band98(s,row++,formula,23,true,"A:L",10);
   }
   if(groups.Length>8)Band98(s,row++,"+ "+(groups.Length-8)+" further terms (all included; see "+face+" Axis worksheet).",20,false,"A:L",10);
   Band98(s,row++,"=\""+(mixed?"I_eq":"I_"+bend)+" = \"&TEXT("+refSheet+"B9/"+N98(erefKN)+",\"#,##0.000\")&\" m⁴\"",26,true,"A:L",12,true);
   Band98(s,row++,"Dimensions in m; intersecting wall / column areas are counted once (union cells).",20,false,"A:L",9);
   Band98(s,row++,"Deflection of building",26,false,"A:L",12,true);
   Band98(s,row++,"δ = p_avg B_eq H⁴ / (8 E_ref I_eq)",24,false,"A:L",12);
   Band98(s,row++,"=\"= (\"&TEXT("+refSheet+"B6,\"0.000\")&\" × \"&TEXT("+refSheet+"B7,\"0.000\")&\" × \"&TEXT("+refSheet+"B5,\"0.###\")&\"⁴) / (8 × "+N98(erefKN,"#,##0")+" × \"&TEXT("+refSheet+"B9/"+N98(erefKN)+",\"0.000\")&\")\"",29,true,"A:L",11);
   Band98(s,row++,"=\"= \"&TEXT("+refSheet+"B10/1000,\"0.000000\")&\" m = \"&TEXT("+refSheet+"B10,\"0.000\")&\" mm\"",26,true,"A:L",12,true);
   Band98(s,row++,"=\"δ / H = \"&TEXT("+refSheet+"B10/1000,\"0.000000\")&\" / \"&TEXT("+refSheet+"B5,\"0.###\")&\" = \"&TEXT("+refSheet+"B10/1000/"+refSheet+"B5,\"0.000000\")&IF("+refSheet+"B10>0,\" = 1 / \"&TEXT("+refSheet+"B5*1000/"+refSheet+"B10,\"0.0\"),\"\")",26,true,"A:L",11);
   Band98(s,row++,"=IF("+refSheet+"B12<=1,\"≤\",\">\")&\" 1 / \"&TEXT("+refSheet+"B8,\"0\")&\"   ∴ \"&IF("+refSheet+"B12<=1,\"OKAY\",\"NOT OKAY\")&\"     (Governing face: "+governing+")\"",27,true,"A:L",13,true);
   Band98(s,row++,"p_avg = Σ(p_i B_i h_i) / Σ(B_i h_i); B_eq = Σ(B_i h_i) / H.\nEquivalent uniform load preserves force; it is not necessarily conservative for deflection.",30,false,"A:L",9);
   Band98(s,row++,"Specified-axis, constant-EI estimate. Coupling, cracked stiffness, shear, torsion, dynamics and foundation rotation are outside this check.",28,false,"A:L",9);
   s.Range["P1"].Value2="CURRENT";s.PageSetup.PaperSize=9;s.PageSetup.Orientation=1;s.PageSetup.LeftMargin=30;s.PageSetup.RightMargin=30;s.PageSetup.TopMargin=27;s.PageSetup.BottomMargin=27;s.PageSetup.Zoom=false;s.PageSetup.FitToPagesWide=1;s.PageSetup.FitToPagesTall=1;s.PageSetup.PrintArea="A1:L"+(row-1);
   x.CalculateFullRebuild();if(job.ContainsKey("preview")&&Convert.ToBoolean(job["preview"]))files.Add(ExportCopy(s,dir,index==0?"Section-A-Deflection.pdf":"Section-A-Deflection-"+face+".pdf"));index++;
  }
  b.Worksheets["Deflection 抄"].Activate();summary.Visible=2;
 }

 static void DeflectionAxis92(dynamic x,dynamic b,Dictionary<string,object> job,List<object> files,string dir) {
  var faces=Obj(job["faces"]);
  dynamic report=b.Worksheets[1];report.Name="Deflection 抄";
  report.Cells.Font.Name="Arial";report.Cells.Font.Size=11;report.Columns["A"].ColumnWidth=4;report.Columns["B"].ColumnWidth=32;report.Columns["C:L"].ColumnWidth=10;
  report.Range["B2:L2"].Merge();report.Range["B2"].Value2="Deflection Check - specified building centre axes";report.Range["B2"].Font.Size=16;report.Range["B2"].Font.Bold=true;
  string[] notes={"Simplified estimate; not a neutral-axis or full frame analysis.","Walls and selected columns: constant section and common bending action assumed.","No verification of coupling, cracked stiffness, shear, torsion, dynamics or foundation rotation.","Building axis = midpoint of the reference floor building envelope (not selected members).", "EI = sum E_i (I_local,i + A_i d_i^2). Overlapping areas counted once.","Uniform equivalent wind: qbar = sum(q_i B_i h_i)/sum(B_i h_i); Bbar = sum(B_i h_i)/H.","wbar = total wind force / H; delta = wbar H^4 / (8 sum EI). Limit = H/500.","Equivalent uniform loading preserves total force, not exact layered displacement; not necessarily conservative."};
  for(int i=0;i<notes.Length;i++){report.Range["B"+(4+i)+":L"+(4+i)].Merge();report.Cells[4+i,2].Value2=notes[i];report.Rows[4+i].RowHeight=29;report.Cells[4+i,2].WrapText=true;}
  string[] labels={"Face / direction","Axis X (m)","Axis Y (m)","Height H (m)","Average q (kPa)","Equivalent B (m)","Limit denominator","Sum EI (kN m2)","Top displacement (mm)","Allowable (mm)","Utilisation","Estimate result","Union area (m2)","Wind face base (mPD)","Roof (mPD)"};
  for(int i=0;i<labels.Length;i++){int r=14+i;report.Range["B"+r+":F"+r].Merge();report.Range["G"+r+":I"+r].Merge();report.Range["J"+r+":L"+r].Merge();report.Cells[r,2].Value2=labels[i];report.Rows[r].RowHeight=22;}
  int detailRow=40;
  foreach(string face in new[]{"B","D"}) {
   var data=Obj(faces[face]);var v=Obj(data["input"]);var g=Obj(data["geometry"]);var axis=Obj(v["axis"]);var cells=Arr(g["cells"]).Select(Obj).ToArray();bool alongX=Convert.ToString(v["direction"])=="X";
   dynamic sheet=b.Worksheets.Add(After:b.Worksheets[b.Worksheets.Count]);sheet.Name=face+" Axis";sheet.Cells.Font.Name="Arial";sheet.Cells.Font.Size=10;sheet.Columns["A:L"].ColumnWidth=13;
   sheet.Range["A1:L1"].Merge();sheet.Range["A1"].Value2=face+" - specified building centre axis, "+(alongX?"X wind / bending about Y":"Y wind / bending about X");sheet.Range["A1"].Font.Bold=true;if(v.ContainsKey("readFloorName")){sheet.Range["A2:L2"].Merge();sheet.Range["A2"].Value2="Reference floor: "+Convert.ToString(v["readFloorName"])+" / "+Convert.ToString(v["readFraming"]); }
   string[] names={"Axis X m","Axis Y m","H m","qbar kPa","Bbar m","n","Sum EI kN m2","Delta mm","Allowable mm","Utilisation","Result","Area m2","Base mPD","Roof mPD"};for(int i=0;i<names.Length;i++)sheet.Cells[i+3,1].Value2=names[i];
   foreach(var a in new[]{Tuple.Create("B3","x"),Tuple.Create("B4","y")})Set(sheet,a.Item1,axis[a.Item2]);
   foreach(var a in new[]{Tuple.Create("B5","height"),Tuple.Create("B6","q"),Tuple.Create("B7","breadth"),Tuple.Create("B8","limit"),Tuple.Create("B15","base"),Tuple.Create("B16","roof")})Set(sheet,a.Item1,v[a.Item2]);
   int end=20+cells.Length;
   sheet.Range["B9"].Formula="=SUM(L21:L"+end+")";sheet.Range["B10"].Formula="=B6*B7*B5^4/(8*B9)*1000";sheet.Range["B11"].Formula="=B5/B8*1000";sheet.Range["B12"].Formula="=B10/B11";sheet.Range["B13"].Formula="=IF(B12<=1,\"OK\",\"NOT OK\")";sheet.Range["B14"].Formula="=SUM(H21:H"+end+")";
   string[] heads={"Cell","X m","Y m","Width m","Depth m","E GPa","Axis","Area m2","I local m4","d m","A d^2 m4","EI kN m2"};for(int i=0;i<heads.Length;i++)sheet.Cells[20,i+1].Value2=heads[i];
   var parts=Arr(g["parts"]).Select(Obj).ToArray();var values=new object[cells.Length,7];for(int i=0;i<cells.Length;i++){var c=cells[i];var owner=parts[Convert.ToInt32(c["owner"])];values[i,0]=Convert.ToString(owner["kind"])+" "+Convert.ToString(owner["id"]);values[i,1]=c["x"];values[i,2]=c["y"];values[i,3]=c["w"];values[i,4]=c["h"];values[i,5]=c["E"];values[i,6]=alongX?"Y":"X";}
   sheet.Range["A21:G"+end].Value2=values;
   var formulas=new object[cells.Length,5];for(int i=0;i<cells.Length;i++){int r=21+i;formulas[i,0]="=D"+r+"*E"+r;formulas[i,1]="=H"+r+"*"+(alongX?"D":"E")+r+"^2/12";formulas[i,2]="="+(alongX?"B":"C")+r+"-$B$"+(alongX?"3":"4");formulas[i,3]="=H"+r+"*J"+r+"^2";formulas[i,4]="=F"+r+"*1000000*(I"+r+"+K"+r+")";}
   sheet.Range["H21:L"+end].Formula=formulas;sheet.Range["B3:B16"].NumberFormat="0.0000";sheet.Range["B21:L"+end].NumberFormat="0.000000";
   sheet.Range["D3:L8"].Merge();sheet.Range["D3"].Value2="Rectangular union cells, with E from shared Wall / Column grades. Axis is the building envelope centre. This is a specified-axis estimate; centroid coupling is not solved. See Deflection copy for assumptions.";sheet.Range["D3"].WrapText=true;
   var members=Arr(g["parts"]).Select(Obj).ToArray();int mr=end+3;sheet.Cells[mr,1].Value2="Selected members";foreach(var m in members){mr++;sheet.Cells[mr,1].Value2=Convert.ToString(m["kind"])+" "+Convert.ToString(m["id"]);sheet.Cells[mr,2].Value2=m["E"];sheet.Cells[mr,3].Value2=m["x"];sheet.Cells[mr,4].Value2=m["y"];sheet.Cells[mr,5].Value2=m["w"];sheet.Cells[mr,6].Value2=m["h"];}
   sheet.Cells[++mr,1].Value2="Source wind bands: a, b, q, B, F, area";int firstWind=mr+1;foreach(var raw in Arr(v["sourceLayers"])){var l=Obj(raw);mr++;sheet.Cells[mr,1].Value2="'"+Convert.ToString(l["id"]);string[] keys={"a","b","q","breadth"};for(int k=0;k<4;k++)sheet.Cells[mr,k+2].Value2=l[keys[k]];sheet.Cells[mr,6].Formula="=(C"+mr+"-B"+mr+")*D"+mr+"*E"+mr;sheet.Cells[mr,7].Formula="=(C"+mr+"-B"+mr+")*E"+mr;}
   if(mr>=firstWind){sheet.Range["B6"].Formula="=SUM(F"+firstWind+":F"+mr+")/SUM(G"+firstWind+":G"+mr+")";sheet.Range["B7"].Formula="=SUM(G"+firstWind+":G"+mr+")/B5";}
   int rc=face=="B"?7:10;report.Cells[14,rc].Value2=face+" / "+v["direction"];for(int i=3;i<=16;i++)report.Cells[i+12,rc].Formula="='"+face+" Axis'!B"+i;
   report.HPageBreaks.Add(report.Cells[detailRow,2]);report.Range["B"+detailRow+":L"+detailRow].Merge();report.Cells[detailRow++,2].Value2=face+" - selected members about specified building centre axis";
   report.Range["B"+detailRow+":L"+detailRow].Merge();report.Cells[detailRow++,2].Value2="Overlap assigned once; local and A d^2 terms summed from non-overlapping rectangle cells.";
   string[] ph={"Member","E GPa","X m","Y m","B m","D m","A m2","I local m4","Ad^2 m4","EI kN m2"};for(int k=0;k<ph.Length;k++)report.Cells[detailRow,k+2].Value2=ph[k];report.Rows[detailRow++].RowHeight=30;
   foreach(var m in parts){int rr=detailRow++;report.Cells[rr,2].Value2=Convert.ToString(m["kind"])+" "+Convert.ToString(m["id"]);string[] keys={"E","x","y","w","h"};for(int k=0;k<keys.Length;k++)report.Cells[rr,k+3].Value2=m[keys[k]];string[] sumCols={"H","I","K","L"};for(int k=0;k<sumCols.Length;k++)report.Cells[rr,k+8].Formula="=SUMIF('"+face+" Axis'!$A$21:$A$"+end+",B"+rr+",'"+face+" Axis'!$"+sumCols[k]+"$21:$"+sumCols[k]+"$"+end+")";report.Range["C"+rr+":J"+rr].NumberFormat="0.000";report.Cells[rr,11].NumberFormat="0.000E+00";report.Rows[rr].RowHeight=22;}
   report.Range["B"+detailRow+":L"+detailRow].Merge();report.Cells[detailRow++,2].Value2="Delta = qbar Bbar H^4 / (8 sum EI); allowable = H/500. Results are simplified estimates.";
   detailRow+=4;
   sheet.PageSetup.PrintArea="A1:L"+mr;sheet.PageSetup.PaperSize=9;sheet.PageSetup.Orientation=2;sheet.PageSetup.Zoom=false;sheet.PageSetup.FitToPagesWide=1;sheet.PageSetup.FitToPagesTall=false;sheet.PageSetup.PrintTitleRows="$20:$20";
  }
  report.Range["B31:L31"].Merge();report.Range["B31"].Value2="See B Axis / D Axis worksheets for selected geometry, E, d^2 terms and editable Excel formulas.";report.Range["B31"].WrapText=true;report.Rows[31].RowHeight=32;
  report.Range["B33:F33"].Merge();report.Range["B33"].Value2="Governing face";report.Range["G33"].Formula="=IF(ABS(G24-J24)<0.0000001,\"B / D\",IF(G24>J24,\"B\",\"D\"))";
  report.Range["G15:L28"].NumberFormat="0.000";report.Range["P1"].Value2="CURRENT";report.PageSetup.PrintArea="A1:L"+(detailRow-4);report.PageSetup.PaperSize=9;report.PageSetup.Orientation=1;report.PageSetup.Zoom=false;report.PageSetup.FitToPagesWide=1;report.PageSetup.FitToPagesTall=false;
  x.CalculateFullRebuild();foreach(string face in new[]{"B","D"})Compare(face,b,Obj(Obj(faces[face])["expected"]));ReportHeader75(report,job);Palette84(report);
  DeflectionCopy98(x,b,job,files,dir,report);
 }

 static void DeflectionJob(dynamic x,dynamic b,Dictionary<string,object> job,List<object> files,string dir) {
  if(job.ContainsKey("method")&&Convert.ToString(job["method"])=="BUILDING_AXIS"){DeflectionAxis92(x,b,job,files,dir);return;}
  int previousCalculation=Convert.ToInt32(x.Calculation);
  try {
  x.Calculation=-4135;
  dynamic input=b.Worksheets["Deflection Check"],core=b.Worksheets["Core Wall"],layers=b.Worksheets["Layered Wind"],meta=b.Worksheets["_Deflection Meta"];
  input.Unprotect();core.Unprotect();layers.Unprotect();
  core.Range["A60:E79,I60:M79,A83:B92,D83:E92,I83:J92,L83:M92"].ClearContents();
  layers.Range["A13:E512,M13:Q512"].ClearContents();
  Set(meta,"B1",job.ContainsKey("project")?job["project"]:"");
  var faces=Obj(job["faces"]);
  foreach(string face in new[]{"B","D"}) {
   var data=Obj(faces[face]);var v=Obj(data["input"]);var g=Obj(data["geometry"]);int c=face=="B"?1:9;string load=face=="B"?"H":"J";
   string mode=Convert.ToString(v["mode"]);if(mode!="UNIFORM"&&mode!="LAYERED")throw new Exception("Unknown deflection wind model");
   foreach(var pair in new[]{Tuple.Create("16","q"),Tuple.Create("17","breadth"),Tuple.Create("18","height"),Tuple.Create("19","grade"),Tuple.Create("20","mode")})Set(input,load+pair.Item1,v[pair.Item2]);
   var ws=Arr(g["walls"]).Select(Obj).ToArray();var axes=Obj(g["axes"]);var ax=Arr(axes["x"]).Select(Convert.ToDouble).ToArray();var ay=Arr(axes["y"]).Select(Convert.ToDouble).ToArray();
   if(ws.Length<1||ws.Length>20||ax.Length>10||ay.Length>10)throw new Exception("Core geometry exceeds original workbook input range");
   core.Cells[56,c+1].Value2=Convert.ToDouble(ws[0]["t"]);core.Cells[56,c+4].Value2=Convert.ToString(v["direction"]);core.Cells[57,c+1].Value2=Convert.ToDouble(v["limit"]);
   for(int i=0;i<ax.Length;i++){core.Cells[83+i,c].Value2="X"+(i+1);core.Cells[83+i,c+1].Value2=ax[i];}
   for(int i=0;i<ay.Length;i++){core.Cells[83+i,c+3].Value2="Y"+(i+1);core.Cells[83+i,c+4].Value2=ay[i];}
   Func<double[],object,int> index=(a,n)=>Array.FindIndex(a,t=>Math.Abs(t-Convert.ToDouble(n))<1e-8)+1;
   for(int i=0;i<ws.Length;i++) {
    var w=ws[i];int x1=index(ax,w["x1"]),x2=index(ax,w["x2"]),y1=index(ay,w["y1"]),y2=index(ay,w["y2"]);
    if(Math.Min(Math.Min(x1,x2),Math.Min(y1,y2))<1)throw new Exception("Core axis mapping failed");
    core.Cells[60+i,c].Value2="'"+Convert.ToString(w["id"]);core.Cells[60+i,c+1].Value2="X"+x1+"/Y"+y1;core.Cells[60+i,c+2].Value2="X"+x2+"/Y"+y2;
    core.Cells[60+i,c+3].Value2=Convert.ToDouble(w["t"]);core.Cells[60+i,c+4].Value2=1.0;
   }
   var bands=Arr(v["layers"]).Select(Obj).ToArray();if(bands.Length>500)throw new Exception("More than 500 wind intervals");
   int lc=face=="B"?1:13;
   if(bands.Length>0){var values=new object[bands.Length,5];for(int i=0;i<bands.Length;i++){var l=bands[i];values[i,0]="'"+Convert.ToString(l["id"]);int j=1;foreach(string key in new[]{"a","b","q","breadth"})values[i,j++]=Convert.ToDouble(l[key]);}layers.Range[layers.Cells[13,lc],layers.Cells[12+bands.Length,lc+4]].Value2=values;}
   string mc=face=="B"?"B":"C";Set(meta,mc+"3",v["base"]);Set(meta,mc+"4",v["roof"]);
   var origin=Obj(g["origin"]);Set(meta,mc+"5",origin["x"]);Set(meta,mc+"6",origin["y"]);
   x.Run("'"+b.Name+"'!UpdateCoreLists",face);
  }
  Run(x,b,"CalculateCoreFaces");
  foreach(string face in new[]{"B","D"}) {
   Run(x,b,"View"+face);string state=Convert.ToString(Val(input.Range["B23"]));if(state!="Inputs complete")throw new Exception(face+" deflection incomplete: "+state+" / "+Convert.ToString(Val(core.Range["A8"])));
   Compare(face,b,Obj(Obj(faces[face])["expected"]));
  }
  dynamic report=b.Worksheets["Deflection 抄"];
  if(Convert.ToString(Val(report.Range["P1"]))!="CURRENT")throw new Exception("Deflection copy not ready: "+Convert.ToString(Val(report.Range["A6"])));
  if(job.ContainsKey("preview")&&Convert.ToBoolean(job["preview"])){
   bool previousPaperMapping=Convert.ToBoolean(x.MapPaperSize);
   try{x.MapPaperSize=false;files.Add(ExportCopy(report,dir,"Section-A-Deflection.pdf"));}finally{x.MapPaperSize=previousPaperMapping;}
  }
  report.Activate();
  } finally { x.Calculation=previousCalculation; }
 }

 static void FullLoadsJob(dynamic b, Dictionary<string,object> job) {
  if(!job.ContainsKey("fullLoads"))return;
  bool autoFill=Convert.ToBoolean(b.Application.AutoCorrect.AutoFillFormulasInLists);
  b.Application.AutoCorrect.AutoFillFormulasInLists=false;
  try {
  var beams=Arr(job["fullLoads"]).Select(Obj).ToArray();
  dynamic loads=b.Worksheets["RC Loads"],results=b.Worksheets["RC Load Results"],floors=b.Worksheets["Project Floors"];
  var detail=new List<object[]>();
  foreach(var beam in beams)foreach(var raw in Arr(beam["loads"])){
   var l=Obj(raw);detail.Add(new object[]{"'"+Convert.ToString(beam["id"]),"'"+Convert.ToString(l["type"]),l["start"],l["end"],l["g"],l["q"],"'"+Convert.ToString(l.ContainsKey("label")?l["label"]:"")});
  }
  dynamic table=loads.ListObjects["RCLoads73"];
  table.Resize(loads.Range["A4:G"+(4+Math.Max(1,detail.Count))]);loads.Range["A5:G"+(4+Math.Max(1,detail.Count))].ClearContents();
  if(detail.Count>0){object[,] v=new object[detail.Count,7];for(int i=0;i<detail.Count;i++)for(int j=0;j<7;j++)v[i,j]=detail[i][j];loads.Range["A5:G"+(4+detail.Count)].Value2=v;}
  loads.Range["A5:G"+(4+Math.Max(1,detail.Count))].Interior.Color=12579839;
  Set(results,"K4","Source sheet");Set(results,"L4","Source row");
  table=results.ListObjects["RCLoadResults73"];table.Resize(results.Range["A4:L"+(4+Math.Max(1,beams.Length))]);results.Range["A5:L"+(4+Math.Max(1,beams.Length))].ClearContents();
  object[,] resultFormulas=new object[beams.Length,12];
  for(int i=0;i<beams.Length;i++){
   int row=5+i;
   var member=Arr(job["members"]).Select(Obj).First(m=>Convert.ToString(m["id"])==Convert.ToString(beams[i]["id"]));
   string source=Convert.ToString(beams[i]["kind"])=="TB"?"Section A Transfer Beam":"Input";
   string sourceRow=Convert.ToString(member["row"]);
   resultFormulas[i,0]="=INDIRECT(\"'\"&K"+row+"&\"'!A\"&L"+row+")";
   resultFormulas[i,1]="=INDIRECT(\"'\"&K"+row+"&\"'!B\"&L"+row+")";
   resultFormulas[i,10]=source;resultFormulas[i,11]=Convert.ToInt32(sourceRow);
   string[] codes={"M","V","RA","RB","G","Q","X","VALID"};
   for(int j=0;j<codes.Length;j++)resultFormulas[i,j+2]="=FullAction73(A"+row+",B"+row+",RCLoads73[#Data],\""+codes[j]+"\")";
  }
  if(beams.Length>0)results.Range["A5:L"+(4+beams.Length)].Formula=resultFormulas;
  if(job.ContainsKey("projectFloors")){
   var rows=Arr(job["projectFloors"]).Select(r=>Arr(r).ToArray()).ToArray();
   if(rows.Length>0){object[,] v=new object[rows.Length,8];for(int i=0;i<rows.Length;i++)for(int j=0;j<8;j++)v[i,j]=rows[i][j] is string?"'"+Convert.ToString(rows[i][j]):rows[i][j];floors.Range["A5:H"+(4+rows.Length)].Value2=v;}
  }
  } finally { b.Application.AutoCorrect.AutoFillFormulasInLists=autoFill; }
 }
 static void CompareFullLoads(dynamic b,Dictionary<string,object> job) {
  if(!job.ContainsKey("fullLoads"))return;int row=5;
  foreach(var raw in Arr(job["fullLoads"])){
   var beam=Obj(raw);var expected=Obj(beam["expected"]);
   var cells=new Dictionary<string,object>{{"C"+row,expected["M"]},{"D"+row,expected["V"]},{"E"+row,expected["RA"]},{"F"+row,expected["RB"]},{"G"+row,expected["dead"]},{"H"+row,expected["live"]},{"J"+row,"OK"}};
   Compare(Convert.ToString(beam["id"])+" · full loads",b,new Dictionary<string,object>{{"RC Load Results",cells}});row++;
  }
 }
 static bool DeepSame(object a,object b){
  var da=a as Dictionary<string,object>;var db=b as Dictionary<string,object>;
  if(da!=null&&db!=null)return da.Count==db.Count&&da.All(k=>db.ContainsKey(k.Key)&&DeepSame(k.Value,db[k.Key]));
  if(a is object[]&&b is object[]){var aa=(object[])a;var bb=(object[])b;return aa.Length==bb.Length&&aa.Zip(bb,(x,y)=>DeepSame(x,y)).All(x=>x);}
  return Same(a,b);
 }

 static bool RCInput(string a){if(new[]{"C3","F3","C4","F4","C5","F5"}.Contains(a))return true;var m=System.Text.RegularExpressions.Regex.Match(a,"^([A-M])([0-9]+)$");if(!m.Success)return false;int r=int.Parse(m.Groups[2].Value),c=m.Groups[1].Value[0]-'A'+1;return (r>=9&&r<=28&&(c<=8||c==10||c==11||c==13))||(r>=34&&r<=43&&c<=8)||(r>=49&&r<=68&&c<=7)||(r>=74&&r<=93&&c<=5)||(r>=99&&r<=118&&c<=4)||(r>=124&&r<=143);}
 static bool SteelInput(string kind,string a){if(kind=="COL")return new[]{"C5","C32"}.Contains(a);if(kind=="SLAB"||kind=="CS")return new[]{"F35","H35","C9","C57","D57"}.Contains(a);return System.Text.RegularExpressions.Regex.IsMatch(a,"^[CD](4[0-7]|11[0-7])$")||new[]{"E58","G58","H58","E76","G76","H76"}.Contains(a);}
 static bool TransferInput(string sheet,string a){var m=System.Text.RegularExpressions.Regex.Match(a,"^([A-Z]+)([0-9]+)$");if(!m.Success)return false;int r=int.Parse(m.Groups[2].Value);string c=m.Groups[1].Value;if(sheet=="Section A Transfer Column")return c=="S"&&r>=5&&r<=104;if(sheet!="Section A Transfer Beam")return false;return r>=6&&r<=25&&new[]{"A","B","C","D","F","G","I","J","L","M","O","P","R","T","U"}.Contains(c)||r>=29&&r<=48&&new[]{"C","D","E","F","G"}.Contains(c);}
}
