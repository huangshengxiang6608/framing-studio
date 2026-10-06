using System;
using System.IO;
using System.Text;
using System.Linq;
using System.Drawing;
using System.Diagnostics;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Web.Script.Serialization;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: System.Runtime.Versioning.TargetFramework(".NETFramework,Version=v4.8",FrameworkDisplayName=".NET Framework 4.8")]

[assembly: System.Reflection.AssemblyTitle("Framing Studio")]
[assembly: System.Reflection.AssemblyVersion("2.139.0.0")]
[assembly: System.Reflection.AssemblyFileVersion("2.139.0.0")]

static class Program {
    [STAThread] static int Main(string[] args) {
        Application.EnableVisualStyles(); Application.SetCompatibleTextRenderingDefault(false);
        System.Threading.Mutex single = null;
        try {
            if (args.Length == 0) {
                bool created; single = new System.Threading.Mutex(true, "Local\\FramingStudioDesktopE264", out created);
                if (!created) { MessageBox.Show("Framing Studio 已经打开，请切换到现有窗口。", "Framing Studio"); return 0; }
            }
            Application.Run(new Studio(args)); return Studio.ExitCode;
        }
        catch (Exception ex) { MessageBox.Show(ex.Message, "Framing Studio 启动失败"); return 1; }
        finally { if (single != null) single.Dispose(); }
    }
}

sealed class Studio : Form {
    public static int ExitCode;
    const string Origin = "https://framing-studio.invalid";
    const string StorageKey = "framing-studio-explorer-e2";
    readonly string Root = AppDomain.CurrentDomain.BaseDirectory;
    readonly JavaScriptSerializer Json = new JavaScriptSerializer { MaxJsonLength = 52428800 };
    readonly WebView2 View = new WebView2 { Dock = DockStyle.Fill };
    WebView2 ReportView82;
    readonly System.Threading.SemaphoreSlim ReportLock82 = new System.Threading.SemaphoreSlim(1,1);
    readonly List<string> Errors = new List<string>();
    readonly List<string> Passed = new List<string>();
    readonly ToolStripStatusLabel Status = new ToolStripStatusLabel("正在启动…");
    readonly string TestDir, Profile, Data;
    bool Ready, ClosingConfirmed;
    string SavedDownload;
    int TestNavigation;
    public Studio(string[] args) {
        SuspendLayout();
        AutoScaleDimensions=new SizeF(96f,96f); AutoScaleMode=AutoScaleMode.Dpi;
        TestDir = args.Length == 2 && args[0] == "--self-test" ? Path.GetFullPath(args[1]) : null;
        Data = TestDir == null ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FramingStudio") : Path.Combine(TestDir, "isolated-user-data");
        Profile = Path.Combine(Data, "WebView2"); Directory.CreateDirectory(Data);
        if (TestDir != null) { Directory.CreateDirectory(TestDir); Opacity = .01; ShowInTaskbar = false; }
        Text = "Framing Studio · E2.139 Desktop"; Width = 1500; Height = 950;
        MinimumSize = new Size(900, 650); StartPosition = FormStartPosition.CenterScreen;
        if (File.Exists(Path.Combine(Root,"FramingStudio.ico"))) Icon = new Icon(Path.Combine(Root,"FramingStudio.ico"));
        var menu = new MenuStrip(); var file = new ToolStripMenuItem("项目");
        Add(file, "打开项目…", Keys.Control | Keys.O, delegate { OpenProjectDialog(); });
        Add(file, "保存项目…", Keys.Control | Keys.S, async delegate { await JS("document.getElementById('save').click()"); });
        file.DropDownItems.Add(new ToolStripSeparator());
        Add(file, "打开自动备份目录", Keys.None, delegate { Process.Start("explorer.exe", "\"" + Path.Combine(Data,"Backups") + "\""); });
        var display = new ToolStripMenuItem("视图");
        Add(display, "放大", Keys.Control | Keys.Add, delegate { View.ZoomFactor = Math.Min(2, View.ZoomFactor + .1); });
        Add(display, "缩小", Keys.Control | Keys.Subtract, delegate { View.ZoomFactor = Math.Max(.6, View.ZoomFactor - .1); });
        Add(display, "恢复 100%", Keys.Control | Keys.D0, delegate { View.ZoomFactor = 1; });
        var tools = new ToolStripMenuItem("工具");
        Add(tools, "Excel 同步与原表抄…", Keys.None, async delegate { await JS("window.ExcelSync.open()"); });
        Add(tools, "使用说明", Keys.None, delegate { Process.Start(new ProcessStartInfo(Path.Combine(Root,"使用说明.txt")) { UseShellExecute = true }); });
        menu.Items.AddRange(new ToolStripItem[] { file, display, tools }); MainMenuStrip = menu;
        var bar = new StatusStrip(); bar.Items.Add(Status); Controls.Add(View); Controls.Add(bar); Controls.Add(menu);
        Directory.CreateDirectory(Path.Combine(Data,"Backups"));
        ResumeLayout(true);
        Shown += async delegate {
            // Keep the scaled window inside the available monitor work area.
            var area=Screen.FromControl(this).WorkingArea;
            MinimumSize=new Size(Math.Min(MinimumSize.Width,area.Width),Math.Min(MinimumSize.Height,area.Height));
            Size=new Size(Math.Min(Width,area.Width),Math.Min(Height,area.Height));
            Location=new Point(Math.Max(area.Left,Math.Min(Left,area.Right-Width)),Math.Max(area.Top,Math.Min(Top,area.Bottom-Height)));
            await Start();
        };
        FormClosing += delegate(object s, FormClosingEventArgs e) {
            if (TestDir != null || ClosingConfirmed || !Ready) return;
            if (MessageBox.Show(this,"是否关闭？自动备份保留在本机；需要交付或长期保留的项目，请先点「保存项目」。", "Framing Studio", MessageBoxButtons.OKCancel, MessageBoxIcon.Information) != DialogResult.OK) e.Cancel = true;
            else ClosingConfirmed = true;
        };
    }
    void Add(ToolStripMenuItem menu, string label, Keys key, EventHandler handler) {
        var item = new ToolStripMenuItem(label); item.ShortcutKeys = key; item.Click += handler; menu.DropDownItems.Add(item);
    }
    void Log(string value) { File.AppendAllText(Path.Combine(Data,"desktop.log"), DateTime.Now.ToString("s") + " " + value + Environment.NewLine); }
    async Task Start() {
        try {
            if (!File.Exists(Path.Combine(Root,"assets","index.html"))) throw new Exception("程序文件不完整。请先解压整个 ZIP，再运行 FramingStudio.exe。");
            var env = await CoreWebView2Environment.CreateAsync(null, Profile);
            await View.EnsureCoreWebView2Async(env);
            var web = View.CoreWebView2;
            web.Settings.AreHostObjectsAllowed = false;
            web.Settings.IsStatusBarEnabled = false;
            web.Settings.AreBrowserAcceleratorKeysEnabled = false;
            if (TestDir != null) web.Settings.AreDefaultScriptDialogsEnabled = false;
            web.SetVirtualHostNameToFolderMapping("framing-studio.invalid", Path.Combine(Root,"assets"), CoreWebView2HostResourceAccessKind.DenyCors);
            web.NavigationStarting += delegate(object s, CoreWebView2NavigationStartingEventArgs e) {
                if (!e.Uri.StartsWith(Origin + "/", StringComparison.OrdinalIgnoreCase)) { e.Cancel = true; Log("Navigation blocked"); }
            };
            web.NewWindowRequested += delegate(object s, CoreWebView2NewWindowRequestedEventArgs e) { e.Handled = true; };
            web.PermissionRequested += delegate(object s, CoreWebView2PermissionRequestedEventArgs e) {
                if (e.Uri.StartsWith(Origin + "/") && e.PermissionKind == CoreWebView2PermissionKind.ClipboardRead && e.IsUserInitiated) e.State = CoreWebView2PermissionState.Allow;
                else e.State = CoreWebView2PermissionState.Deny;
            };
            web.WebMessageReceived += Message;
            web.DownloadStarting += Download;
            web.ProcessFailed += delegate(object s, CoreWebView2ProcessFailedEventArgs e) { Log("Renderer: " + e.ProcessFailedKind); Status.Text = "绘图进程中断，请关闭并重新打开应用；可恢复自动备份。"; };
            await web.AddScriptToExecuteOnDocumentCreatedAsync(File.ReadAllText(Path.Combine(Root,"desktop-bridge.js")));
            web.NavigationCompleted += async delegate(object s, CoreWebView2NavigationCompletedEventArgs e) {
                if (!e.IsSuccess) { Log("Navigation: " + e.WebErrorStatus); Status.Text = "页面加载失败：" + e.WebErrorStatus; return; }
                Ready = true; Status.Text = "离线模式 · E2.139 · 项目请保存为 .framing.json";
                if (TestDir != null && TestNavigation++ == 0) await SelfTest();
            };
            if (TestDir != null) web.ScriptDialogOpening += delegate(object s, CoreWebView2ScriptDialogOpeningEventArgs e) { e.Accept(); };
            web.Navigate(Origin + "/index.html");
            Log("Started WebView2 " + env.BrowserVersionString);
        } catch (Exception ex) {
            Log(ex.ToString()); ExitCode = 1;
            if (TestDir != null) { File.WriteAllText(Path.Combine(TestDir,"failure.txt"), ex.ToString()); Close(); }
            else MessageBox.Show(this,"无法启动：" + ex.Message + "\n\n本程序需要 Microsoft Edge WebView2 Runtime。若未安装，请运行包内 Install_WebView2.exe，再打开应用。", "Framing Studio", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
    bool ExcelBusy;
    readonly Dictionary<string,string> ExcelRuns = new Dictionary<string,string>();
    async Task ExcelNotify(object message) { await JS("window.ExcelSync&&ExcelSync.receive("+Json.Serialize(message)+")"); }
    async void ExcelMessage(Dictionary<string,object> message) {
        string excelError=null;
        try {
            string kind=Convert.ToString(message["kind"]);
            if(kind=="excel-run") {
                if(ExcelBusy) { await ExcelNotify(new {progress="已有 Excel 计算正在进行。"}); return; }
                ExcelBusy=true;
                var jobs=((System.Collections.IEnumerable)message["jobs"]).Cast<object>().ToArray();
                if(jobs.Length==0||jobs.Length>1000)throw new Exception("Excel 批次数量无效");
                bool openWhenReady=message.ContainsKey("openWhenReady")&&Convert.ToBoolean(message["openWhenReady"]);
                bool parallel=message.ContainsKey("parallelReports")&&Convert.ToBoolean(message["parallelReports"]);
                if(parallel){
                    if(jobs.Any(v=>!((Dictionary<string,object>)v).ContainsKey("_reportSection")||!new[]{"A","B"}.Contains(Convert.ToString(((Dictionary<string,object>)v)["_reportSection"]))))throw new Exception("联合生成的报告范围无效");
                    var lanes=new List<Task>();
                    foreach(string sec in new[]{"A","B"}){
                        var lane=jobs.Where(v=>((Dictionary<string,object>)v).ContainsKey("_reportSection")&&Convert.ToString(((Dictionary<string,object>)v)["_reportSection"])==sec).ToArray();
                        lanes.Add(RunExcelLane81(lane,sec,false));
                    }
                    await Task.WhenAll(lanes);
                }else{
                    string sec=((Dictionary<string,object>)jobs[0]).ContainsKey("_reportSection")?Convert.ToString(((Dictionary<string,object>)jobs[0])["_reportSection"]):null;
                    await RunExcelLane81(jobs,sec,openWhenReady);
                }
                ExcelBusy=false;await ExcelNotify(new {done=true,progress="原 Excel 任务已结束。请查看每份核对结果；有差异或未完成的任务不表示一致。"});return;
            }
            string id=Convert.ToString(message["id"]),file=Convert.ToString(message["file"]),folder;
            if(!ExcelRuns.TryGetValue(id,out folder)||file!=Path.GetFileName(file))throw new Exception("无效输出路径");
            string target=Path.GetFullPath(Path.Combine(folder,file));
            if(!File.Exists(target)||!target.StartsWith(folder+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase))throw new Exception("输出文件不存在");
            // Only results registered by this host can be opened from the renderer.
            var registered=Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(Path.Combine(folder,"result.json")));
            if(kind=="excel-open"&&file==Convert.ToString(registered["workbook"])) { OpenExcelWorkbook(target);return; }
            throw new Exception("不允许打开这个文件");
        } catch(Exception ex) {ExcelBusy=false;Log("Excel: "+ex);excelError=ex.Message;}
        if(excelError!=null)await ExcelNotify(new {done=true,error=excelError,progress="未完成："+excelError});
    }

    async Task RunExcelLane81(object[] jobs,string section,bool openWhenReady) {
        for(int i=0;i<jobs.Length;i++){
            var job=(Dictionary<string,object>)jobs[i];
            string error=null;
            try{await RunExcelJob81(job,section,i+1,jobs.Length,openWhenReady);}
            catch(Exception ex){Log("Excel job: "+ex);error=ex.Message;}
            if(error!=null)await ExcelNotify(new {record=new {ok=false,type=job["type"],label=job["label"],reportSection=section,error=error}});
        }
        if(section!=null)await ExcelNotify(new {sectionDone=section});
    }
    async Task RunExcelJob81(Dictionary<string,object> source,string section,int index,int total,bool openWhenReady) {
                      var job=new Dictionary<string,object>(source);job.Remove("_reportSection");string runId=DateTime.Now.ToString("yyyyMMdd-HHmmss")+"-"+Guid.NewGuid().ToString("N").Substring(0,8);
                      string directory=Path.Combine(Data,"ExcelRuns",runId);Directory.CreateDirectory(directory);ExcelRuns.Add(runId,directory);
                      object extraPages=null;
                      if(section!=null&&job.TryGetValue("reportPages",out extraPages)){job.Remove("reportPages");File.WriteAllText(Path.Combine(directory,"report-pages.json"),Json.Serialize(extraPages),new UTF8Encoding(false));}
                      string path=Path.Combine(directory,"job.json");File.WriteAllText(path,Json.Serialize(job),new UTF8Encoding(false));
                    await ExcelNotify(new {progress=(section==null?"":"Section "+section+" · ")+"Excel 正在计算 "+index+" / "+total+" · "+Convert.ToString(job["label"])});
                    var start=new ProcessStartInfo(Path.Combine(Root,"Excel","ExcelBridge.exe"),"\""+Path.Combine(Root,"Excel")+"\" \""+path+"\"") { UseShellExecute=false,CreateNoWindow=true,WindowStyle=ProcessWindowStyle.Hidden };
                    Task<List<object>> extraTask=null;
                    bool completed;using(var process=Process.Start(start)){if(extraPages!=null)extraTask=PrintReportPages82(extraPages,directory,section);var elapsed=System.Diagnostics.Stopwatch.StartNew();string previous="";while(!process.HasExited&&elapsed.ElapsedMilliseconds<300000){await Task.Delay(400);try{string progressPath=Path.Combine(directory,"progress.json");if(File.Exists(progressPath)){var stage=Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(progressPath));string detail=Convert.ToString(stage["message"]);if(detail!=previous){previous=detail;await ExcelNotify(new {progress=(section==null?"":"Section "+section+" · ")+"Excel "+index+" / "+total+" · "+detail});}}}catch{}}completed=process.HasExited;if(!completed)try{process.Kill();}catch{}}
                    List<object> extras=extraTask==null?new List<object>():await extraTask;
                    if(!completed) {
                        await ExcelNotify(new {record=new {ok=false,type=job["type"],label=job["label"],runId=runId,reportSection=section,error="Excel 生成超过 5 分钟，已停止本次生成进程。请检查 Excel 是否有等待处理的窗口，然后重新生成。"}});
                        return;
                    }
                    string resultFile=Path.Combine(directory,"result.json");
                      var result=File.Exists(resultFile)?Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(resultFile)):new Dictionary<string,object>{{"ok",false},{"error","Excel 计算进程中断，未核对。"}};
                      if(extras.Count>0&&result.ContainsKey("ok")&&Convert.ToBoolean(result["ok"])){
                          var combined=result.ContainsKey("files")?((System.Collections.IEnumerable)result["files"]).Cast<object>().ToList():new List<object>();combined.AddRange(extras);result["files"]=combined;
                          File.WriteAllText(resultFile,Json.Serialize(result),new UTF8Encoding(false));
                      }
                    if(result.ContainsKey("files"))foreach(var raw in ((System.Collections.IEnumerable)result["files"])) {
                        var pdf=(Dictionary<string,object>)raw;string filename=Convert.ToString(pdf["file"]);
                        if(filename!=Path.GetFileName(filename)||Path.GetExtension(filename)!=".pdf")throw new Exception("无效预览文件");
                        string pdfPath=Path.Combine(directory,filename);if(new FileInfo(pdfPath).Length>40000000)throw new Exception("预览文件过大，请分批生成");
                        pdf["base64"]=Convert.ToBase64String(File.ReadAllBytes(pdfPath));
      }

                    result["reportSection"]=section;result["runId"]=runId;result["label"]=job["label"];result["type"]=job["type"];await ExcelNotify(new {record=result});
                    if(total==1&&Convert.ToBoolean(result["ok"])&&openWhenReady) {
                        string workbook=Convert.ToString(result["workbook"]);
                        if(workbook!=Path.GetFileName(workbook)||(Path.GetExtension(workbook)!=".xlsm"&&Path.GetExtension(workbook)!=".xlsx"))throw new Exception("无效 Excel 输出文件");
                        OpenExcelWorkbook(Path.Combine(directory,workbook));
                    }
    }

    // Only App-authored reference chapters use this renderer. Excel export keeps editable sheets.
    async Task<List<object>> PrintReportPages82(object pages,string directory,string section) {
        var files=new List<object>();await ReportLock82.WaitAsync();
        try {
            if(ReportView82==null){
                ReportView82=new WebView2{Size=new Size(800,1100),Location=new Point(-2000,-2000),Visible=false};
                Controls.Add(ReportView82);ReportView82.CreateControl();
                await ReportView82.EnsureCoreWebView2Async(View.CoreWebView2.Environment);
                ReportView82.CoreWebView2.Settings.AreHostObjectsAllowed=false;
                ReportView82.CoreWebView2.Settings.IsScriptEnabled=false;
            }
            var images=new Dictionary<string,string>();
            foreach(string name in new[]{"vertical-load-path.png","horizontal-load-path.png"})images[name]=Convert.ToBase64String(File.ReadAllBytes(Path.Combine(Root,"Excel","ReportImages",name)));
            int serial=0;
            foreach(var raw in (System.Collections.IEnumerable)pages){
                var page=(Dictionary<string,object>)raw;serial++;
                string html=Json.Deserialize<string>(await JS("ReportExtras82.html("+Json.Serialize(page)+","+Json.Serialize(images)+")"));
                if(String.IsNullOrEmpty(html))throw new Exception("说明章节排版失败，请重新生成。");
                var loaded=new TaskCompletionSource<bool>();
                EventHandler<CoreWebView2NavigationCompletedEventArgs> handler=(s,e)=>loaded.TrySetResult(e.IsSuccess);
                ReportView82.CoreWebView2.NavigationCompleted+=handler;
                try{
                    ReportView82.CoreWebView2.NavigateToString(html);
                    if(await Task.WhenAny(loaded.Task,Task.Delay(30000))!=loaded.Task||!await loaded.Task)throw new Exception("说明章节加载未完成，请重新生成。");
                }finally{ReportView82.CoreWebView2.NavigationCompleted-=handler;}
                var settings=View.CoreWebView2.Environment.CreatePrintSettings();
                settings.ShouldPrintBackgrounds=true;settings.ShouldPrintHeaderAndFooter=false;
                settings.MarginTop=0;settings.MarginBottom=0;settings.MarginLeft=0;settings.MarginRight=0;
                settings.PageWidth=210.0/25.4;settings.PageHeight=297.0/25.4;settings.ScaleFactor=1;
                string filename="Section-"+section+"-Extra-"+serial+".pdf";
                if(!await ReportView82.CoreWebView2.PrintToPdfAsync(Path.Combine(directory,filename),settings))throw new Exception("说明章节 PDF 生成失败，请重新生成。");
                files.Add(new Dictionary<string,object>{{"file",filename},{"reportOrder",page.ContainsKey("order")?page["order"]:0},{"chapter",page.ContainsKey("chapter")?page["chapter"]:0}});
            }
            return files;
        }finally{ReportLock82.Release();}
    }

    async Task<string> JS(string code) { return Ready ? await View.CoreWebView2.ExecuteScriptAsync(code) : "null"; }
    void Message(object sender, CoreWebView2WebMessageReceivedEventArgs e) {
        if (!e.Source.StartsWith(Origin + "/")) return;
        try {
            var m = Json.Deserialize<Dictionary<string, object>>(e.WebMessageAsJson);
            string kind = Convert.ToString(m["kind"]);
            if(kind=="export-file"){SaveExport(m);return;}
            if(kind.StartsWith("excel-")){ExcelMessage(m);return;}
            if (kind == "error") { string error = Convert.ToString(m["value"]); Errors.Add(error); Log("JS: " + error); }
            if (kind == "backup") {
                string content = Convert.ToString(m["value"]);
                var obj = Json.Deserialize<Dictionary<string,object>>(content);
                if (obj == null || !obj.ContainsKey("types") || !obj.ContainsKey("axes")) return;
                string target = Path.Combine(Data,"Backups","latest.framing.json"), tmp = target + ".tmp";
                File.WriteAllText(tmp, content, new UTF8Encoding(false));
                if (File.Exists(target)) File.Replace(tmp, target, Path.Combine(Data,"Backups","previous.framing.json"));
                else File.Move(tmp, target);
            }
        } catch (Exception ex) { Log("Backup/message: " + ex.Message); Status.Text = "自动备份未完成，请立即保存项目文件。"; }
    }
    async void SaveExport(Dictionary<string,object> message) {
        await Task.Yield();
        try {
            string name=Convert.ToString(message["name"]),extension=Path.GetExtension(name).ToLowerInvariant();
            if(name!=Path.GetFileName(name)||name.IndexOfAny(Path.GetInvalidFileNameChars())>=0||!new[]{".json",".pdf",".svg",".html"}.Contains(extension))throw new Exception("无效导出文件名");
            byte[] bytes=message.ContainsKey("encoding")&&Convert.ToString(message["encoding"])=="base64"?Convert.FromBase64String(Convert.ToString(message["value"])):new UTF8Encoding(false).GetBytes(Convert.ToString(message["value"]));
            if(bytes.Length>50000000)throw new Exception("导出文件过大，请分批生成");
            string target;
            if(TestDir!=null)target=Path.Combine(TestDir,name);
            else using(var dialog=new SaveFileDialog{Title="保存 Framing Studio 文件",FileName=name,Filter="导出文件 (*"+extension+")|*"+extension,OverwritePrompt=true,AddExtension=true}) {
                if(dialog.ShowDialog(this)!=DialogResult.OK){SetSaveStatus("已取消文件保存");return;}target=dialog.FileName;
            }
            File.WriteAllBytes(target,bytes);SavedDownload=target;Status.Text="已保存："+target;SetSaveStatus("文件已保存 · "+Path.GetFileName(target));
        }catch(Exception e){Log("Export: "+e.Message);SetSaveStatus("保存未完成："+e.Message);}
    }

    async void Download(object sender, CoreWebView2DownloadStartingEventArgs e) {
        var deferral = e.GetDeferral();
        try {
        // Return from the WebView2 callback before showing a Windows modal dialog.
        await Task.Yield();
        e.Handled = true;
        string name = Path.GetFileName(e.ResultFilePath);
        if (String.IsNullOrEmpty(name)) name = "Framing-export.json";
        if (TestDir == null) {
            using (var dialog = new SaveFileDialog { Title = "保存 Framing Studio 文件", FileName = name, Filter = "导出文件 (*"+Path.GetExtension(name)+")|*"+Path.GetExtension(name), OverwritePrompt = true, AddExtension = true }) {
                if (dialog.ShowDialog(this) != DialogResult.OK) { e.Cancel = true; Status.Text = "已取消保存；项目仍保留在当前窗口。"; SetSaveStatus("已取消文件保存 · 请重新保存项目"); return; }
                e.ResultFilePath = dialog.FileName;
            }
        } else e.ResultFilePath = Path.Combine(TestDir, name);
        var operation = e.DownloadOperation; string destination = e.ResultFilePath;
        operation.StateChanged += delegate {
            if (operation.State == CoreWebView2DownloadState.Completed) { SavedDownload = destination; Status.Text = "已保存：" + destination; SetSaveStatus("文件已保存 · " + Path.GetFileName(destination)); }
            if (operation.State == CoreWebView2DownloadState.Interrupted) { Status.Text = "保存未完成：" + operation.InterruptReason; SetSaveStatus("文件保存失败 · 请重试"); Log(Status.Text); }
        };
        } catch (Exception ex) { e.Cancel = true; Log("Download: " + ex.Message); Status.Text = "保存未完成：" + ex.Message; }
        finally { deferral.Complete(); }
    }
    async void SetSaveStatus(string text) { await JS("document.getElementById('savestatus').textContent=" + Json.Serialize(text)); }
    async void OpenProjectDialog() {
        if (!Ready) return;
        using (var dialog = new OpenFileDialog { Title = "打开 Framing 项目", Filter = "Framing 项目 (*.json)|*.json" }) {
            if (dialog.ShowDialog(this) == DialogResult.OK) try { await ImportProject(dialog.FileName); } catch (Exception ex) { MessageBox.Show(this,ex.Message,"无法打开项目"); }
        }
    }
    async Task ImportProject(string path) {
        if (new FileInfo(path).Length > 10485760) throw new Exception("项目文件超过 10 MB。");
        string content = File.ReadAllText(path); Json.DeserializeObject(content);
        await JS("(()=>{const f=document.getElementById('file'),d=new DataTransfer();d.items.add(new File([" + Json.Serialize(content) + "]," + Json.Serialize(Path.GetFileName(path)) + ",{type:'application/json'}));f.files=d.files;f.dispatchEvent(new Event('change',{bubbles:true}));})()");
    }
    async Task Check(string label, string expression) {
        string value = await JS("Boolean(" + expression + ")");
        if (value != "true") throw new Exception(label + ": " + value);
        Passed.Add(label);
        Log("PASS " + label);
    }
    void OpenExcelWorkbook(string path) {
        if(TestDir!=null) { File.WriteAllText(Path.Combine(TestDir,"excel-open-request.txt"),path);return; }
        Process.Start(new ProcessStartInfo(Path.Combine(Root,"Excel","ExcelBridge.exe"),"--open \""+Path.Combine(Root,"Excel")+"\" \""+path+"\""){UseShellExecute=false,CreateNoWindow=true,WindowStyle=ProcessWindowStyle.Hidden});
    }
    async Task ExcelSmokeTest() {
        try {
            await Task.Delay(600);
            await ImportProject(Path.Combine(TestDir,"fixture.framing.json"));await Task.Delay(500);
            await JS("ExcelSync.open('Overall')");
            await Check("Workbook-first button","document.querySelector('#excel-sync [data-xs=run]').textContent==='填写并打开 Excel'");
            await JS("document.querySelector('#excel-sync [data-xs=run]').click()");
            for(int i=0;i<240&&(!ExcelBusy&&ExcelRuns.Count==0||ExcelBusy);i++)await Task.Delay(1000);
            if(ExcelBusy)throw new Exception("Excel test timed out");
            await Check("Native workbook calculation returned","document.getElementById('excel-sync').textContent.includes('已核对')");
            await Check("Native input and result comparison matches","!document.getElementById('excel-sync').textContent.includes('发现 ')");
            await Check("No PDF actions","!document.querySelector('#excel-sync [data-xs=pdf]')&&!document.getElementById('excel-sync').textContent.includes('PDF')");
            string opened=File.ReadAllText(Path.Combine(TestDir,"excel-open-request.txt"));
            if(!opened.EndsWith(".xlsm")||!File.Exists(opened))throw new Exception("Excel output was not selected for opening");
            Passed.Add("Single workbook is dispatched to native Excel opening");
            foreach(string directory in ExcelRuns.Values)if(Directory.GetFiles(directory,"*.pdf").Length>0)throw new Exception("Unexpected PDF output");
            Passed.Add("No PDF files generated");
            await JS("document.querySelector('#excel-sync [data-xs=workbook]').click()");await Task.Delay(200);
            if(File.ReadAllText(Path.Combine(TestDir,"excel-open-request.txt"))!=opened)throw new Exception("Reopen selected the wrong workbook");
            Passed.Add("Reopen uses the registered filled workbook");
            using(var stream=File.Create(Path.Combine(TestDir,"excel-window.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            if(Errors.Count>0)throw new Exception("Browser errors");
            File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new{ok=true,passed=Passed,errors=Errors}));
        }catch(Exception ex){ExitCode=1;File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new{ok=false,failure=ex.ToString(),passed=Passed,errors=Errors}));}
        finally{ClosingConfirmed=true;Close();}
    }

    async Task SchemeSmokeTest() {
        try {
            await Task.Delay(800);
            await ImportProject(Path.Combine(TestDir,"fixture.framing.json"));await Task.Delay(300);
            await Check("Scheme 2 survives native project import","ExcelProject().project.scheme2.bays[0].n===12");
            await JS("StudioHost.navigate('steel')");
            await Check("Independent steel calculation visible","document.getElementById('workspace-pages').textContent.includes('Ireq')");
            using(var stream=File.Create(Path.Combine(TestDir,"scheme-2.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("StudioHost.navigate('excel')");
            await Check("Three Excel buttons","document.querySelectorAll('[data-wp=generate]').length===3&&!!document.querySelector('[data-type=Steel]')");
            using(var stream=File.Create(Path.Combine(TestDir,"excel-page.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("StudioHost.navigate('reportA')");await Task.Delay(300);
            for(int i=0;i<1800;i++){if(await JS("ExcelSync.state().busy")=="false")break;await Task.Delay(100);}
            await Check("Native Excel returned","!ExcelSync.state().busy&&ExcelSync.state().records.length===2");
            await Check("Native comparisons match","ExcelSync.state().records.every(r=>r.ok&&r.compared>0&&!r.differences.length)");
            for(int i=0;i<100;i++){if(await JS("!!document.querySelector('#workspace-pages canvas[data-rendered=true]')")=="true")break;await Task.Delay(100);}
            await Check("Native copy PDF rendered","!!document.querySelector('#workspace-pages canvas[data-rendered=true]')&&!document.querySelector('[data-wp=print]').disabled");
            await Check("Report page has no input form or generation buttons","!document.querySelector('#workspace-pages input')&&!document.querySelector('#workspace-pages [data-wp=generate]')");
            await Task.Delay(800);
            using(var stream=File.Create(Path.Combine(TestDir,"section-a.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            SavedDownload=null;await JS("document.querySelector('[data-wp=print]').click()");
            for(int i=0;i<200&&SavedDownload==null;i++)await Task.Delay(100);
            if(SavedDownload==null||Path.GetExtension(SavedDownload)!=".pdf"||new FileInfo(SavedDownload).Length<1000)throw new Exception("Print PDF download failed");
            Passed.Add("Native copy merged into downloadable Print PDF");
            await JS("StudioHost.navigate('excel');document.querySelector('[data-wp=open-workbook]').click()");await Task.Delay(200);
            if(!File.Exists(Path.Combine(TestDir,"excel-open-request.txt")))throw new Exception("Open editable workbook failed");
            Passed.Add("Open editable Excel uses registered native workbook");
            SavedDownload=null;await JS("document.getElementById('save').click()");for(int i=0;i<200&&SavedDownload==null;i++)await Task.Delay(100);
            var saved=Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(SavedDownload));if(!saved.ContainsKey("scheme2"))throw new Exception("Saved project lost Scheme 2");
            Passed.Add("Actual project file retains both schemes");
            if(Errors.Count>0)throw new Exception("JavaScript error: "+String.Join(" | ",Errors));
            File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new {ok=true,passed=Passed,errors=Errors}));
        }catch(Exception e){ExitCode=1;File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new {ok=false,error=e.ToString(),passed=Passed,errors=Errors}));}
        finally{ClosingConfirmed=true;Close();}
    }

    [System.Runtime.InteropServices.DllImport("user32.dll")] static extern IntPtr GetWindowDpiAwarenessContext(IntPtr hwnd);
    [System.Runtime.InteropServices.DllImport("user32.dll")] static extern bool AreDpiAwarenessContextsEqual(IntPtr a, IntPtr b);
    [System.Runtime.InteropServices.DllImport("user32.dll")] static extern uint GetDpiForWindow(IntPtr hwnd);
    string DpiContext() { var c=GetWindowDpiAwarenessContext(Handle); for(int i=1;i<=5;i++)if(AreDpiAwarenessContextsEqual(c,new IntPtr(-i)))return new[]{"Unaware","SystemAware","PerMonitorV1","PerMonitorV2","UnawareGdiScaled"}[i-1];return c.ToString(); }
    async Task DisplaySmokeTest() {
        try {
            await Task.Delay(700);
            var frames=new List<object>();
            foreach(double zoom in new[]{1.0,1.5,2.0,1.0}) {
                View.ZoomFactor=zoom;
                await Task.Delay(350);
                var frame=Json.DeserializeObject(await JS("(()=>{const c=document.querySelector('#canvas'),r=c.getBoundingClientRect();return {dpr:devicePixelRatio,innerWidth,innerHeight,canvas:{width:c.width,height:c.height,cssWidth:r.width,cssHeight:r.height},bodyWidth:document.body.scrollWidth,bodyClientWidth:document.body.clientWidth}})()"));
                frames.Add(new { zoom=zoom,metrics=frame });
            }
            using(var stream=File.Create(Path.Combine(TestDir,"plan.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("StudioHost.navigate('excel')");await Task.Delay(200);
            using(var stream=File.Create(Path.Combine(TestDir,"excel-page.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await Check("Excel actions remain available","!!document.querySelector('[data-wp=generate-report][data-section=A]:not(:disabled)') && !!document.querySelector('[data-wp=generate-both]:not(:disabled)') && !!document.querySelector('[data-wp=print][data-section=A]')");
            var pdfFrames=new List<object>();
            if(File.Exists(Path.Combine(TestDir,"sample.pdf"))) {
                string pdf=Convert.ToBase64String(File.ReadAllBytes(Path.Combine(TestDir,"sample.pdf")));
                await JS("ExcelSync.ensureReport=()=>{};StudioHost.navigate('reportA');WorkspacePages.setPDF('A',Uint8Array.from(atob('"+pdf+"'),x=>x.charCodeAt(0)))");
                foreach(double zoom in new[]{1.0,1.5,1.0}) {
                    View.ZoomFactor=zoom;
                    for(int i=0;i<100;i++){await Task.Delay(100);if(await JS("!!document.querySelector('#workspace-pages canvas[data-rendered=true]')")=="true")break;}
                    await Task.Delay(350);
                    pdfFrames.Add(new {zoom=zoom,metrics=Json.DeserializeObject(await JS("(()=>{const c=document.querySelector('#workspace-pages canvas'),r=c.getBoundingClientRect();return {dpr:devicePixelRatio,width:c.width,height:c.height,cssWidth:r.width,cssHeight:r.height,rendered:c.dataset.rendered}})()"))});
                }
                using(var stream=File.Create(Path.Combine(TestDir,"report.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
                if(File.Exists(Path.Combine(TestDir,"validate-display.flag"))) {
                    await Check("Report pixels track screen density","(()=>{const c=document.querySelector('#workspace-pages canvas'),w=c.getBoundingClientRect().width;return Math.abs(c.width-w*devicePixelRatio)<2})()");
                    await JS("document.querySelector('#workspace-pages').scrollTop=document.querySelector('#workspace-pages').scrollHeight");
                    for(int i=0;i<100;i++){await Task.Delay(100);if(await JS("document.querySelector('#workspace-pages canvas:last-child').dataset.rendered==='true'")=="true")break;}
                    await Check("Last report page renders on demand","document.querySelector('#workspace-pages canvas:last-child').dataset.rendered==='true'");
                    await Check("Offscreen report bitmap released","document.querySelector('#workspace-pages canvas').width===1");
                    await JS("document.querySelector('#workspace-pages').scrollTop=0");
                    for(int i=0;i<100;i++){await Task.Delay(100);if(await JS("document.querySelector('#workspace-pages canvas').dataset.rendered==='true'")=="true")break;}
                    await Check("Returning to first page restores sharp bitmap","document.querySelector('#workspace-pages canvas').width>2000");
                    await JS("StudioHost.navigate('axes');StudioHost.navigate('reportA')");
                    for(int i=0;i<100;i++){await Task.Delay(100);if(await JS("!!document.querySelector('#workspace-pages canvas[data-rendered=true]')")=="true")break;}
                    await Check("Report survives navigation away and back","!!document.querySelector('#workspace-pages canvas[data-rendered=true]')");
                }
            }
            File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new {ok=Errors.Count==0,context=DpiContext(),windowDpi=GetDpiForWindow(Handle),deviceDpi=DeviceDpi,targetFramework=AppDomain.CurrentDomain.SetupInformation.TargetFrameworkName,os=Environment.OSVersion.VersionString,frames=frames,pdfFrames=pdfFrames,passed=Passed,errors=Errors}));
        }catch(Exception e){ExitCode=1;File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new {ok=false,error=e.ToString(),passed=Passed,errors=Errors}));}
        finally{ClosingConfirmed=true;Close();}
    }

    async Task DeflectionSmokeTest() {
        try {
            await Task.Delay(700);
            await ImportProject(Path.Combine(TestDir,"fixture.framing.json"));await Task.Delay(300);
            await JS("StudioHost.navigate('deflection')");
            await Check("Deflection follows Overall in navigation","document.querySelector('[data-tab=elevation]').nextElementSibling.dataset.tab==='deflection'");
            await Check("Wind inputs shared and not duplicated","document.getElementById('workspace-pages').textContent.includes('Wind Load Check')&&!document.querySelector('[data-df=q]')&&!document.querySelector('[data-df-pressure]')");
            await Check("Layered check calculates","Deflection.assess(StudioHost.get().p,StudioHost.get().result,'scheme1','B').ok");
            using(var stream=File.Create(Path.Combine(TestDir,"deflection.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("document.querySelector('[data-df-action=face][data-face=D]').click()");
            await Check("Independent D face follows Y wind","document.querySelector('#workspace-pages').textContent.includes('D 面 · 风与高度')");
            await JS("document.querySelector('[data-df-action=face][data-face=B]').click(); document.querySelector('.df-layer-table').closest('section').scrollIntoView({block:'start'})");await Task.Delay(200);
            using(var stream=File.Create(Path.Combine(TestDir,"layer-table.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("StudioHost.navigate('excel')");
            await Check("Deflection export is centralized with prior Excel types","document.querySelectorAll('[data-wp=generate]').length===4&&!!document.querySelector('[data-type=Deflection]')");
            using(var stream=File.Create(Path.Combine(TestDir,"excel-page.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("StudioHost.navigate('reportA')");await Task.Delay(200);
            for(int i=0;i<1800;i++){if(await JS("ExcelSync.state().busy")=="false")break;await Task.Delay(100);}
            await Check("Deflection workbook and native comparison succeed","ExcelSync.state().records.some(r=>r.type==='Deflection'&&r.ok&&r.compared>100&&!r.differences.length)");
            for(int i=0;i<100;i++){await Task.Delay(100);if(await JS("!!document.querySelector('#workspace-pages canvas[data-rendered=true]')")=="true")break;}
            await Check("Section A includes actual Excel deflection copy","!!document.querySelector('#workspace-pages canvas[data-rendered=true]')&&!document.querySelector('[data-wp=print]').disabled");
            await Check("Preview remains DPI aware","(()=>{const c=document.querySelector('#workspace-pages canvas[data-rendered=true]');return Math.abs(c.width-c.getBoundingClientRect().width*devicePixelRatio)<2})()");
            using(var stream=File.Create(Path.Combine(TestDir,"section-a.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            SavedDownload=null;await JS("document.querySelector('[data-wp=print]').click()");for(int i=0;i<200&&SavedDownload==null;i++)await Task.Delay(100);
            if(SavedDownload==null||Path.GetExtension(SavedDownload)!=".pdf")throw new Exception("Print PDF download failed");Passed.Add("Native Section A PDF saved");
            await JS("StudioHost.navigate('deflection');const input=document.querySelector('[data-df=base]');input.value='1';input.dispatchEvent(new Event('change',{bubbles:true}))");
            await Check("Changed datum updates height and invalidates assumptions","Deflection.input(StudioHost.get().p,StudioHost.get().result,'scheme1','B').v.height===14&&!Deflection.saved(StudioHost.get().p,'scheme1','B').confirmed");
            await Check("Old report is stale after input changes","ExcelSync.reportState('A').stale");
            SavedDownload=null;await JS("document.getElementById('save').click()");for(int i=0;i<200&&SavedDownload==null;i++)await Task.Delay(100);
            var saved=Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(SavedDownload));if(!saved.ContainsKey("deflection"))throw new Exception("Project lost deflection inputs");Passed.Add("Native save retains deflection settings");
            if(Errors.Count>0)throw new Exception(String.Join(" | ",Errors));
            File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new {ok=true,passed=Passed,errors=Errors,dpi=GetDpiForWindow(Handle),context=DpiContext()}));
        }catch(Exception e){ExitCode=1;File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new {ok=false,error=e.ToString(),passed=Passed,errors=Errors}));}
        finally{ClosingConfirmed=true;Close();}
    }

    async Task CompleteSmokeTest() {
        try {
            await Task.Delay(500); await ImportProject(Path.Combine(TestDir,"fixture.framing.json")); await Task.Delay(300);
            await JS("StudioHost.navigate('floors')");
            await Check("Framing selection visible beside floor names","document.querySelector('.floor-group-compact th:nth-child(4)').textContent==='Framing'");
            await Check("Inputs highlighted","getComputedStyle(document.querySelector('.floor-group-compact input:not([disabled])')).backgroundColor==='rgb(255, 243, 191)'");
            using(var stream=File.Create(Path.Combine(TestDir,"floor-settings.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("StudioHost.navigate('checks')");
            await Check("No redundant Loading button","![...document.querySelectorAll('#side button')].some(b=>b.textContent.trim()==='Loading')");
            using(var stream=File.Create(Path.Combine(TestDir,"member-check.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("window.testColumnKey=\"1|\"+document.querySelector(\"[data-ex=choose][data-token^=COL]\").dataset.token");
            await JS("document.querySelector('[data-ex=choose][data-token^=COL]').click()");await Task.Delay(200);
            await Check("Shared column area controls", "document.getElementById('side').textContent.includes('A / B 共用面积法') && !document.getElementById('ex-area-slab-sw') && !document.getElementById('ex-dead')");
            await JS("document.getElementById('ex-factor').value='0.9';document.querySelector('[data-ex=member]').click()");await Task.Delay(150);
            await Check("Column input save", "JSON.parse(localStorage.getItem('framing-studio-explorer-e2')).explorer.members[window.testColumnKey].factor===0.9");
            await JS("document.getElementById('ex-a-column-areas').value='1, 3, A=16';document.querySelector('[data-ex=save-a-column]').click()");await Task.Delay(150);
            await Check("Shared manual area save", "(()=>{const p=JSON.parse(localStorage.getItem('framing-studio-explorer-e2'));const a=RCPlan.build(p,'A',[window.testColumnKey]),b=RCPlan.build(p,'B',[window.testColumnKey]);return !a.issues.length&&!b.issues.length&&Math.abs(a.batches[0].members[0].expected.E38-b.batches[0].members[0].inputs.C28)<1e-7})()");
            await Check("Original column reinforcement controls retained", "document.querySelectorAll('#ex-factor').length===1 && !!document.getElementById('ex-col-dia') && !!document.getElementById('ex-col-count')");
            await JS("document.getElementById('ex-steel-mode').value='MANUAL';document.getElementById('ex-col-dia').value='25';document.getElementById('ex-col-count').value='16';document.querySelector('[data-ex=steel]').click()");await Task.Delay(200);
            await Check("Column manual reinforcement saved", "JSON.parse(localStorage.getItem('framing-studio-explorer-e2')).explorer.members[window.testColumnKey].steel.C32===16");
            await JS("document.getElementById('ex-factor').scrollIntoView({block:'start'})");
            using(var stream=File.Create(Path.Combine(TestDir,"column-area.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);

            await JS("StudioHost.navigate('deflection')");
            await Check("Deflection export centralized","!document.querySelector('[data-df-action=excel]')");
            using(var stream=File.Create(Path.Combine(TestDir,"deflection.png")))await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("StudioHost.navigate('excel')");
            await Check("All four Excel types remain available","document.querySelectorAll('[data-wp=generate]').length===4");
            if(Errors.Count>0)throw new Exception(String.Join(" | ",Errors));
            File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new {ok=true,passed=Passed,errors=Errors}));
        }catch(Exception e){ExitCode=1;File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new {ok=false,error=e.ToString(),passed=Passed,errors=Errors}));}
        finally{ClosingConfirmed=true;Close();}
    }

    async Task LayoutSmokeTest116() {
        try {
            await Task.Delay(700);
            await ImportProject(Path.Combine(TestDir,"fixture.framing.json"));
            await Task.Delay(250);
            await JS("document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.layoutBefore116=JSON.stringify(StudioHost.get().p);StudioHost.navigate('beamLayout')");
            await Check("Layout opens without changing the project", "JSON.stringify(StudioHost.get().p)===layoutBefore116");
            await Check("Three independent panels above Beam menu", "document.querySelectorAll('.beam-layout-fold116').length===3 && document.querySelector('#nav [data-tab=beamLayout]').nextElementSibling.dataset.tab==='loading' && document.querySelector('#nav [data-tab=loading]').nextElementSibling.dataset.tab==='beams'");
            await JS("document.querySelector('[data-bl116=main]').click()");
            await Check("Preview preserves original settings", "JSON.stringify(StudioHost.get().p)===layoutBefore116");
            await JS("document.querySelector('[data-bl116=apply]').click();document.getElementById('bl116-secondary-direction').value='X';document.getElementById('bl116-gap').value='2';document.querySelector('[data-bl116=secondary]').click();document.querySelector('[data-bl116=apply]').click()");
            await Check("Shared Framing layout reaches both floors", "(()=>{const h=StudioHost.get(),a=Engine.floorModel(h.result,1),b=Engine.floorModel(h.result,2),old=JSON.parse(layoutBefore116);return a.beams.filter(b=>b.kind==='MB').length===4 && a.beams.filter(b=>b.kind==='SB').length===1 && JSON.stringify(a.beams.map(x=>[x.kind,x.rawA,x.rawZ,x.b,x.d]))===JSON.stringify(b.beams.map(x=>[x.kind,x.rawA,x.rawZ,x.b,x.d])) && JSON.stringify(h.p.types.F2)===JSON.stringify(old.types.F2) && JSON.stringify(h.p.explorer)===JSON.stringify(old.explorer)})()");
            await JS("(()=>{const h=StudioHost.get(),s=Engine.floorModel(h.result,1).slabs;StudioHost.transact(()=>BeamLayout116.setDirections(h.p,h.key,s,'X'))})()");
            await Check("Manual slab direction reaches live calculations", "Loading.run(StudioHost.get().p,StudioHost.get().result,'B').rows.filter(r=>r.kind==='SLAB'&&r.floor<=2).every(r=>r.loading.direction==='X')");
            await Task.Delay(300);
            using(var stream=File.Create(Path.Combine(TestDir,"beam-layout.png"))) await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("window.savedLayout116=JSON.stringify(StudioHost.get().p);document.getElementById('save').click()");
            for(int i=0;i<50 && SavedDownload==null;i++)await Task.Delay(100);
            if(SavedDownload==null||!File.Exists(SavedDownload))throw new Exception("Native save missing");
            await ImportProject(SavedDownload);
            await Check("Native save and reopen preserve new and old settings", "JSON.stringify(StudioHost.get().p)===savedLayout116");
            if(Errors.Count>0)throw new Exception("JavaScript errors: "+String.Join(" | ",Errors));
            File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new{ok=true,passed=Passed,errors=Errors,runtime=View.CoreWebView2.Environment.BrowserVersionString}));
        }catch(Exception ex){ExitCode=1;File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new{ok=false,passed=Passed,errors=Errors,failure=ex.ToString()}));}
        finally{ClosingConfirmed=true;View.Dispose();Close();}
    }
    async Task SelfTest() {
        if(File.Exists(Path.Combine(TestDir,"layout-smoke.flag"))){await LayoutSmokeTest116();return;}
        if(File.Exists(Path.Combine(TestDir,"complete-smoke.flag"))){await CompleteSmokeTest();return;}
        if(File.Exists(Path.Combine(TestDir,"deflection-smoke.flag"))){await DeflectionSmokeTest();return;}
        if(File.Exists(Path.Combine(TestDir,"display-smoke.flag"))){await DisplaySmokeTest();return;}
        if(File.Exists(Path.Combine(TestDir,"scheme-smoke.flag"))){await SchemeSmokeTest();return;}
        if(File.Exists(Path.Combine(TestDir,"excel-smoke.flag"))){await ExcelSmokeTest();return;}
        try {
            await Task.Delay(1200);
            await Check("All calculation modules loaded", "typeof Engine==='object' && typeof Overall==='object' && typeof Reports==='object'");
            await Check("Geometry and initial UI ready", "document.getElementById('modelstatus').textContent.length>0");
            await JS("document.querySelectorAll('dialog[open]').forEach(d=>d.close())");
            string results = await JS(File.ReadAllText(Path.Combine(TestDir,"checks.js")));
            File.WriteAllText(Path.Combine(TestDir,"calculation-checks.json"), results);
            await Check("Calculation regression", "window.desktopChecks && window.desktopChecks.ok");
            foreach (string tab in new[]{"axes","floors","regions","walls","columns","beams","loading","checks","elevation","reportA","reportB","review"}) {
                await JS("document.querySelector('[data-tab=\"" + tab + "\"]').click()"); await Task.Delay(160);
                await Check("Navigation " + tab, "document.querySelector('.layout').dataset.tab==='" + tab + "'");
            }
            await ImportProject(Path.Combine(TestDir,"fixture.framing.json")); await Task.Delay(800);
            await Check("Native project import", "document.getElementById('project-name').textContent.includes('Desktop QA')");
            string invalid = Path.Combine(TestDir,"invalid.framing.json"); File.WriteAllText(invalid,"{\"format\":\"wrong\"}");
            await ImportProject(invalid); await Task.Delay(200);
            await Check("Invalid project preserves current model", "document.getElementById('project-name').textContent.includes('Desktop QA') && document.getElementById('toast').textContent.includes('无法打开')");
            await Check("localStorage backup", "JSON.parse(localStorage.getItem('" + StorageKey + "')).name==='Desktop QA'");
            await Task.Delay(200);
            if (!File.Exists(Path.Combine(Data,"Backups","latest.framing.json"))) throw new Exception("Native backup missing");
            Passed.Add("Atomic native backup file");
            await JS("document.getElementById('save').click()");
            for(int i=0;i<50 && SavedDownload==null;i++) await Task.Delay(100);
            if (SavedDownload==null || !File.Exists(SavedDownload)) throw new Exception("Project download missing");
            var saved = Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(SavedDownload));
            if (Convert.ToString(saved["name"])!="Desktop QA") throw new Exception("Saved project mismatch");
            Passed.Add("Actual Blob project download and JSON round trip");
            var restored = new TaskCompletionSource<bool>();
            EventHandler<CoreWebView2NavigationCompletedEventArgs> complete = delegate(object s, CoreWebView2NavigationCompletedEventArgs e) { restored.TrySetResult(e.IsSuccess); };
            View.CoreWebView2.NavigationCompleted += complete; View.CoreWebView2.Reload(); await restored.Task;
            View.CoreWebView2.NavigationCompleted -= complete; await Task.Delay(1000);
            await Check("Automatic restore after page restart", "document.getElementById('project-name').textContent.includes('Desktop QA')");
            await JS("document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.querySelector('[data-tab=\"elevation\"]').click()"); await Task.Delay(500);
            using(var stream=File.Create(Path.Combine(TestDir,"overall-check.png"))) await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("document.querySelector('[data-tab=\"reportA\"]').click()"); await Task.Delay(400);
            using(var stream=File.Create(Path.Combine(TestDir,"section-a.png"))) await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("document.querySelector('[data-ex=\"preview-report\"]').click()"); await Task.Delay(1200);
            await Check("Section A actual preview", "document.getElementById('ex-report-dialog').open && document.getElementById('ex-report-content').textContent.includes('CALCULATED')");
            using(var stream=File.Create(Path.Combine(TestDir,"section-a-preview.png"))) await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("window.print=()=>{window.desktopPrintRequested=true};document.querySelector('[data-ex=\"report-print\"]').click()");
            await Check("Actual report print styles applied", "window.desktopPrintRequested && !!document.getElementById('ex-print-style')");
            var printSettings = View.CoreWebView2.Environment.CreatePrintSettings();
            printSettings.PageWidth=210.0/25.4; printSettings.PageHeight=297.0/25.4;
            printSettings.ShouldPrintBackgrounds=true;
            bool printed=await View.CoreWebView2.PrintToPdfAsync(Path.Combine(TestDir,"section-a.pdf"),printSettings);
            if (!printed) throw new Exception("PDF print failed"); Passed.Add("Native Chromium PDF printing");
            await Check("A4 ruled report SVG", "document.querySelectorAll('#printpage .answer-paper-rules').length===1");
            string reportA = await JS("(()=>{const p=JSON.parse(localStorage.getItem('framing-studio-explorer-e2')),r=Engine.generate(p);return Reports.document(p,Loading.run(p,r,'A'),'A',1,p.total)})()");
            File.WriteAllText(Path.Combine(TestDir,"Section_A.html"),Json.Deserialize<string>(reportA));
            await JS(@"(()=>{
              const p=JSON.parse(localStorage.getItem('framing-studio-explorer-e2')),r=Engine.generate(p);
              Loading.init(p);p.explorer.selected={};p.explorer.reportB={};
              for(let f=1;f<=p.total;f++)LoadData.setFloor(p,f,{dl:8,sdl:1,ll:2.5});
              const members=Loading.members(p,r,1);for(const kind of ['SLAB','MB','SB','COL']){const m=members.find(m=>m.kind===kind);if(m){p.explorer.selected['1|'+m.token]=true;p.explorer.reportB['1|'+m.token]=true;}}
              const out=Loading.run(p,r,'B');window.paperBhtml=Reports.document(p,out,'B',1,p.total);
              const content=document.getElementById('ex-report-content');content.innerHTML=Reports.content(p,out,'B',1,p.total);
              document.getElementById('ex-report-dialog').showModal();ReportPaper.prepare(content);
              document.getElementById('printpage').innerHTML=content.innerHTML;
            })()");
            await Check("Section B ruled report", "document.querySelector('#printpage .answer-ruled').textContent.includes('Section B')");
            File.WriteAllText(Path.Combine(TestDir,"Section_B.html"),Json.Deserialize<string>(await JS("window.paperBhtml")));
            using(var stream=File.Create(Path.Combine(TestDir,"section-b-preview.png"))) await View.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png,stream);
            await JS("document.getElementById('ex-report-dialog').close()");
            if(!await View.CoreWebView2.PrintToPdfAsync(Path.Combine(TestDir,"section-b.pdf"),printSettings))throw new Exception("Section B PDF failed");
            await JS("document.querySelector('[data-tab=\"review\"]').click();document.querySelector('[data-action=\"print\"]').click()");
            await Check("A3 graph paper dimensions", "document.querySelector('#printpage>svg').getAttribute('width')==='420mm' && document.querySelector('#printpage>svg').getAttribute('height')==='297mm'");
            await Check("Graph minor major lines", "document.querySelectorAll('#printpage .graph-paper path').length===672");
            File.WriteAllText(Path.Combine(TestDir,"A3-drawing.svg"),Json.Deserialize<string>(await JS("document.getElementById('printpage').innerHTML")));
            var graphSettings=View.CoreWebView2.Environment.CreatePrintSettings();graphSettings.PageWidth=420.0/25.4;graphSettings.PageHeight=297.0/25.4;graphSettings.MarginTop=0;graphSettings.MarginBottom=0;graphSettings.MarginLeft=0;graphSettings.MarginRight=0;graphSettings.ShouldPrintBackgrounds=false;
            if(!await View.CoreWebView2.PrintToPdfAsync(Path.Combine(TestDir,"a3-drawing.pdf"),graphSettings))throw new Exception("A3 PDF failed");
            await JS("document.getElementById('printpaper').value='A3-portrait';document.getElementById('printpaper').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-action=\"print\"]').click()");
            await Check("A3 portrait preserves paper size", "document.querySelector('#printpage>svg').getAttribute('width')==='297mm' && document.querySelector('#printpage>svg').getAttribute('height')==='420mm'");
            await JS("document.getElementById('printgrid').checked=false;document.getElementById('printgrid').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-action=\"print\"]').click()");
            await Check("Grid can be hidden", "document.querySelectorAll('#printpage .graph-paper').length===0");

            if(Errors.Count>0) throw new Exception("JavaScript errors: "+String.Join(" | ",Errors));
            Passed.Add("No uncaught JavaScript errors during test");
            File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new{ok=true,passed=Passed,errors=Errors,runtime=View.CoreWebView2.Environment.BrowserVersionString}));
        } catch(Exception ex) { ExitCode=1; File.WriteAllText(Path.Combine(TestDir,"result.json"),Json.Serialize(new{ok=false,passed=Passed,errors=Errors,failure=ex.ToString()})); }
        finally { View.Dispose(); Close(); }
    }
}

