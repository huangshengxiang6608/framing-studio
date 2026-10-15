// Available only on the local preview server; native desktop messaging stays unchanged.
window.LocalExcel251=(()=>{
 let token='',ready=false,active=false;const workbooks=new Map();
 async function request(url,options={}){const response=await fetch(url,{...options,headers:{'X-Framing-Key':token,...options.headers}});if(!response.ok){let message;try{message=(await response.json()).error}catch{}throw Error(message||'本機報表連線失敗（'+response.status+'）');}return response;}
 async function send(message){
  if(message.kind==='excel-open'){
   try{const job=workbooks.get(message.id+'|'+message.file);if(!job)throw Error('找不到本次 Excel 檔案');const response=await request('/api/excel/workbook/'+job+'/'+encodeURIComponent(message.id)+'/'+encodeURIComponent(message.file)),url=URL.createObjectURL(await response.blob()),a=document.createElement('a');a.href=url;a.download=message.file;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch(error){window.StudioHost?.toast?.(error.message);}return;
  }
  if(message.kind!=='excel-run'||active)return;
  active=true;
  try{
   const response=await request('/api/excel/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(message)}),job=(await response.json()).id;let cursor=0;
   while(true){const value=await (await request('/api/excel/events/'+job+'/'+cursor)).json();cursor=value.cursor;
    if(value.event){const record=value.event.record;if(record?.runId&&record.workbook)workbooks.set(record.runId+'|'+record.workbook,job);await ExcelSync.receive(value.event);if(value.event.done)break;}else await new Promise(resolve=>setTimeout(resolve,400));
   }
  }catch(error){await ExcelSync.receive({done:true,error:error.message,progress:'生成未完成：'+error.message});}
  finally{active=false;}
 }
 async function probe(){if(typeof location==='undefined'||!['127.0.0.1','localhost'].includes(location.hostname)||typeof fetch!=='function')return;try{const r=await fetch('/api/excel/capabilities');if(!r.ok)return;const v=await r.json();ready=v.available===true;token=ready?v.token:'';WorkspacePages.refresh();}catch{ready=false;}}
 setTimeout(probe,0);
 return {available:()=>ready,send,probe};
})();
// Keep native single-column calculations separate, deliver their isolated sheets together.
function combineColumnJobs274(jobs){
 const output=[...jobs];
 for(const section of ['A','B']){
  const candidates=jobs.filter(j=>j.type==='RC'&&j.section===section&&j.members?.some(m=>m.kind==='COL'));
  const first=candidates[0];if(!first)continue;
  const extra=candidates.slice(1).filter(j=>j.members.length===1&&j.members[0].kind==='COL');
  if(!extra.length)continue;
  const parts=[first,...extra].map(({reportPages,...part})=>part),merged={...first,columnParts274:parts,members:parts.flatMap(j=>j.members),label:first.label.replace(/ · 第 \d+ 份$/,'')+' · 合併柱計算'};
  output[output.indexOf(first)]=merged;for(const j of extra)output.splice(output.indexOf(j),1);
 }
 return output;
}
window.ExcelSync=(()=>{
 let busy=false,progress='',records=[],issues=[],lastSnapshot='',runSection=null,runSections=[],pendingSections=new Set(),finishes={},sizingChanges=[];
 const reports={A:{snapshot:null,issues:[],message:'',records:[]},B:{snapshot:null,issues:[],message:'',records:[]}};
 const current=()=>JSON.stringify(window.ExcelProject().project),available=()=>!!window.chrome?.webview?.postMessage||window.LocalExcel251?.available()===true;
 // Report versions ignore the transient Member Check selection and the other report's selection.
 const reportSnapshot=(section,p=window.ExcelProject().project)=>{const v=Engine.clone(p);if(v.explorer){delete v.explorer.selected;delete v.explorer[section==='A'?'reportB':'reportA'];if(section==='B')delete v.explorer.reportANotes;}for(const t of v.transferTrusses||[])delete t[section==='A'?'reportB':'reportA'];return JSON.stringify(v);};
 const send=o=>window.chrome?.webview?.postMessage?window.chrome.webview.postMessage(o):LocalExcel251.send(o),refresh=()=>WorkspacePages.refresh();
 let native279={snapshot:null,running:false,records:[],issues:[],status:'尚未進行原生 Excel RC 核對',members:0},resolve279=null;
 function nativeState279(){return {...native279,stale:native279.snapshot!==null&&native279.snapshot!==current()};}
 function nativeRefresh279(){refresh();ExplorerUI.refreshNative279?.();}
 async function verifyCheck279(){
  if(busy)throw Error('已有 Excel 工作正在進行，請完成後更新 Check');
  native279={snapshot:current(),running:false,records:[],issues:[],status:'正在準備原生 Excel RC 核對…',members:0};
  if(!available()){native279.status='App 已計算；原生 Excel 未核對，請使用 Windows App 或本機網頁版';nativeRefresh279();return false;}
  busy=true;native279.running=true;nativeRefresh279();
  try{
   await ExplorerUI.prepareNative279();
   const snapshot=current(),p=JSON.parse(snapshot),jobs=[],covered=new Set();native279.snapshot=snapshot;
   for(const section of ['A','B']){
    const v=reportPlan277(snapshot,section,null),rc=v.jobs.filter(j=>j.type==='RC');
    // Only RC issues belong to this check; wind/foundation prerequisites remain on their pages.
    native279.issues.push(...v.issues.filter(x=>x.floor!=null||String(x.id).startsWith('Scheme 1 · Section ')));
    for(const job of rc)for(const part of job.columnParts274||[job]){
     const {reportPages,...data}=part;jobs.push({...data,_reportSection:section,prepareRC279:true});
     if(section==='B')for(const m of data.members)covered.add(m.designName265);
    }
   }
   const checked=Object.entries(p.explorer?.selected||{}).filter(([,v])=>v).map(([k])=>k);
   const extra=checked.filter(k=>!p.explorer?.reportB?.[k]);
   if(extra.length){const v=plan(p,'RC','B',extra);native279.issues.push(...v.issues);for(const job of v.jobs)for(const part of job.columnParts274||[job]){const {reportPages,...data}=part;jobs.push({...data,_reportSection:'B',prepareRC279:true});for(const m of data.members)covered.add(m.designName265);}}
   native279.members=covered.size;native279.expected=jobs.length;
   if(!jobs.length)throw Error('沒有可核對的已選 RC 構件；請完成輸入並勾選 Check');
   const stamp=await fingerprint(snapshot);if(current()!==snapshot)throw Error('核對準備期間模型已修改，請更新 Check');
   native279.fingerprint=stamp;native279.started=performance.now();native279.status='原生 Excel 正在核對已選 RC；完成後供 A／B 抄重用';
   const done=new Promise(resolve=>resolve279=resolve);nativeRefresh279();
   send({kind:'excel-run',parallelReports:true,openWhenReady:false,jobs:jobs.map(j=>({...j,fingerprint:stamp,preview:true}))});return await done;
  }catch(error){native279.status='Excel RC 核對未完成：'+error.message;native279.running=false;busy=false;nativeRefresh279();return false;}
 }
 async function fingerprint(text){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
 function overallJob(p){const faces={},states={};for(const face of ['B','D']){const input=OverallGeometry.input(p,face),state=OverallGeometry.calculate(input,face);if(state.state!=='CALCULATED')throw Error(face+' 面：'+state.state);states[face]=state;const m=Overall.machine(input,face),expected={};for(const role of [1,2,3,4]){const sheet=Overall.roles[role];expected[sheet]={};for(const [cell,def] of Object.entries(Overall.source.sheets[sheet].cells)){if(!def.formula)continue;const value=m.safe(sheet,cell);if(typeof value==='string'&&(/^(#|Unsupported|Circular)/.test(value)))continue;expected[sheet][cell]=value;}}faces[face]={input:Overall.normalize(input,face),expected};}const comparison={};for(const [row,value] of Object.entries(Overall.compareFaces(states.B,states.D)))comparison['G'+row]=value;for(const face of ['B','D'])for(const [row,value] of Object.entries(states[face].results))comparison[(face==='B'?'C':'E')+row]=value;return {type:'Overall',faces,comparison,label:'Overall · B / D'};}
 function plan(p,kind,section,filter){const jobs=[],problems=[];
  const add=(id,fn)=>{try{const v=fn();if(v?.batches){jobs.push(...v.batches);problems.push(...v.issues);}else jobs.push(v);}catch(e){problems.push({id,reason:e.message});}};
  if(kind==='RC'||kind==='Report')for(const sec of section?[section]:['A','B'])add('Scheme 1 · Section '+sec,()=>{const map=sec==='Check'?p.explorer?.selected:p.explorer?.['report'+sec];if(!filter&&!Object.values(map||{}).some(Boolean)){problems.push({id:'Scheme 1 · Section '+sec,reason:'尚未勾选构件'});return {batches:[],issues:[]};}const a=RCPlan.build(p,sec,filter);a.batches.forEach(j=>{j.label='Scheme 1 · '+j.label;});return a;});
  if(kind==='Truss')add('Transfer Truss',()=>TrussReports109.jobs(p,Engine.generate(p),section,kind==='Report'));
  if(kind==='Overall'||kind==='Report'&&section==='A')add('Overall',()=>({...overallJob(p),section:'A'}));
  if(kind==='Deflection'||kind==='Report'&&section==='A')add('Deflection',()=>Deflection.jobs(p,Engine.generate(p),kind==='Report'));
  if(kind==='Steel'||kind==='Report'&&section==='A')add('Scheme 2',()=>Steel.jobs(p,Engine.generate(p)));
  if(kind==='Foundation'||kind==='Report')add('Foundation',()=>Foundation.jobs(p,section,kind==='Report'));
  let offset=0;for(const [i,j] of jobs.filter(j=>j.type==='RC'&&j.section==='B').entries()){j.reportNumberB={first:i===0,offset};offset+=j.members.filter(m=>m.selected!==false).length;}
  const rank={SLAB:1,CS:1,SB:2,MB:3,CB:3,TB:4,COL:5};
  for(const sec of ['A','B']){const selected=jobs.filter(j=>j.type==='RC'&&(j.section===sec||j.section==='Check')).flatMap(j=>j.members.filter(m=>m.selected!==false));selected.sort((a,b)=>rank[a.kind]-rank[b.kind]);selected.forEach((m,i)=>m.reportOrdinal=i+1);if(sec==='B')for(const j of jobs.filter(j=>j.type==='Foundation'))j.foundationNumberB=selected.length+4;}
  if(kind==='Report'&&section==='A')ReportContent.decorate(p,jobs,section);else if(kind==='RC')ReportContent.decorate(p,jobs.filter(j=>j.section==='A'),'A');
  return {jobs:combineColumnJobs274(jobs),issues:problems};
 }

 // Only the latest immutable model snapshot is retained; A/B share this prepared set.
 const reportPlans277=new Map();let planSnapshot277=null;
 function reportPlan277(snapshot,section,filter){
  if(snapshot!==planSnapshot277){reportPlans277.clear();planSnapshot277=snapshot;}
  const key=JSON.stringify([section,filter]);
  if(!reportPlans277.has(key))reportPlans277.set(key,plan(JSON.parse(snapshot),'Report',section,filter));
  return Engine.clone(reportPlans277.get(key));
 }
 async function start(kind,section=null,filter=null){if(busy)return;sizingChanges=[];let snapshot=current();lastSnapshot=snapshot;issues=[];records=[];runSection=kind==='Report'?section:null;runSections=kind==='Report'?(section==='AB'?['A','B']:[section]):[];pendingSections=new Set(runSections);finishes={};
  if(!available()){progress='请在桌面 App 中生成；此浏览器预览不能启动 Microsoft Excel。';for(const sec of runSections)reports[sec]={snapshot:reportSnapshot(sec,JSON.parse(snapshot)),issues:[],message:progress};pendingSections.clear();refresh();return;}
  busy=true;for(const sec of runSections){reports[sec]={snapshot:reportSnapshot(sec,JSON.parse(snapshot)),issues:[],message:'正在生成原 Excel 抄…',generatedAt:null,records:[]};WorkspacePages.clearPDF(sec);}progress='正在整理当前输入…';refresh();try{
   if(kind==='Report'){
    progress='正在確認全樓 SLAB／CS 最大彎矩及代表構件…';refresh();
    if(typeof ExplorerUI.prepareReportSlabs276!=='function')throw Error('板代表構件檢查尚未就緒，請重新開啟項目。');
    await ExplorerUI.prepareReportSlabs276();snapshot=current();lastSnapshot=snapshot;
    for(const sec of runSections)reports[sec].snapshot=reportSnapshot(sec,JSON.parse(snapshot));
   }
   const p=JSON.parse(snapshot),jobs=[];
   if(kind==='Report')for(const sec of runSections){const v=reportPlan277(snapshot,sec,filter);reports[sec].issues=[...v.issues];issues.push(...v.issues.map(x=>({...x,section:sec})));jobs.push(...v.jobs.map(j=>({...j,_reportSection:sec})));}
   else{const v=plan(p,kind,section,filter);issues=v.issues;jobs.push(...v.jobs);}
   if(!jobs.length){busy=false;pendingSections.clear();progress='没有可生成的完整输入。';for(const sec of runSections)reports[sec].message='请先完成输入并勾选本次要抄的构件。';refresh();return;}
   const stamp=await fingerprint(snapshot);if(kind==='Report'&&current()!==snapshot)throw Error('生成準備期間模型已修改，請重新生成抄。');send({kind:'excel-run',parallelReports:section==='AB',openWhenReady:kind!=='Report',jobs:jobs.map(j=>({...j,fingerprint:stamp,preview:true}))});
  }catch(e){busy=false;pendingSections.clear();progress=e.message;for(const sec of runSections)reports[sec]={snapshot:reportSnapshot(sec,JSON.parse(snapshot)),issues:[...reports[sec].issues,{id:'生成失败',reason:e.message}],message:e.message};}refresh();
 }
 async function finishReport(section){const report=reports[section],pdfs=[];
  const own=records.filter(r=>r.reportSection===section||(!r.reportSection&&runSections.length===1));
  for(const r of [...own].sort((a,b)=>({RC:0,Overall:1,Deflection:2,Steel:3}[a.type]??4)-({RC:0,Overall:1,Deflection:2,Steel:3}[b.type]??4))){if(!r.ok||r.differences?.length){report.issues.push({id:r.label,reason:r.error||'App 与 Excel 有差异，请查看本页的 Excel 文件与核对结果'});continue;}for(const file of r.files||[])if(file.base64)pdfs.push({...file,reportOrder:file.reportOrder??({RC:0,Overall:70,Deflection:80,Steel:50,Foundation:90}[r.type]??90)});}
  if(!pdfs.length){report.message='尚无可预览的抄。请查看未生成的项目。';return;}
  pdfs.sort((a,b)=>a.reportOrder-b.reportOrder);const result=await ReportCompose.compose(pdfs,section);
  await WorkspacePages.setPDF(section,result.bytes);report.layout=result.stats;report.generatedAt=new Date().toISOString();report.message='';
 }
 function finishOnce(section){return finishes[section]??=(async()=>{try{await finishReport(section);}catch(e){reports[section].message='预览未完成：'+e.message;progress=e.message;}finally{pendingSections.delete(section);refresh();}})();}
 async function receive(message){
  if(native279.running){
   if(message.record)native279.records.push(message.record);
   if(message.progress)native279.status=message.progress;
   if(message.error)native279.issues.push({id:'Excel',reason:message.error});
   if(message.done){
    const rs=native279.records,valid=rs.length===native279.expected&&rs.every(r=>r.ok&&r.preparedRC279&&r.compared>0&&!r.differences?.length&&r.fingerprint===native279.fingerprint);
    native279.seconds=(performance.now()-native279.started)/1000;native279.running=false;busy=false;
    native279.verified=valid&&!native279.issues.length&&current()===native279.snapshot;
    native279.status=current()!==native279.snapshot?'模型已改動；本次 Excel 核對屬舊版本，請更新 Check':native279.verified?'Excel RC 已核對 · '+native279.members+' 個已選構件 · '+rs.reduce((n,r)=>n+r.compared,0)+' 項一致'+(rs.every(r=>r.cached)?' · 重用已核對結果':''):'Excel RC 核對未完整；請查看未核對原因';
    const resolve=resolve279;resolve279=null;resolve?.(native279.verified);
   }
   nativeRefresh279();return;
  }
  if(message.record){records.push(message.record);const report=reports[message.record.reportSection];if(report)(report.records??=[]).push(message.record);}if(message.progress)progress=message.progress;
  if(message.error)for(const sec of runSections)reports[sec].issues.push({id:'生成中断',reason:message.error});
  if(message.sectionDone&&runSections.includes(message.sectionDone))await finishOnce(message.sectionDone);
  if(message.done){await Promise.all(runSections.map(finishOnce));busy=false;runSection=null;pendingSections.clear();}refresh();
 }
 function state(){return {busy,progress,records,issues,sizingChanges,stale:!!lastSnapshot&&lastSnapshot!==current()};}
 function reportState(section){const r=reports[section];return {...r,progress:busy&&pendingSections.has(section)?progress:'',stale:r.snapshot!==null&&r.snapshot!==reportSnapshot(section),busy:busy&&pendingSections.has(section)};}
 function ensureReport(section){return reportState(section);}
 function open(type='Overall',section,filter){window.StudioHost?.navigate(section==='B'?'reportB':'reportA');if(filter?.member)start(type,section||'Check',[filter.member]);}
 function openWorkbook(id,file){if(available())send({kind:'excel-open',id,file});}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-excel-open],[data-ex]');if(!b)return;if(b.dataset.excelOpen){e.preventDefault();e.stopImmediatePropagation();open(b.dataset.excelOpen);}else if(['preview-report','excel-row'].includes(b.dataset.ex)){e.preventDefault();e.stopImmediatePropagation();open('RC',b.dataset.section||'Check',b.dataset.ex==='excel-row'?{member:b.dataset.floor+'|'+b.dataset.token}:null);}},true);
 return {available,open,receive,overallJob,plan,state,reportState,ensureReport,verifyCheck279,nativeState279,generateReport:section=>start('Report',section),generate:type=>start(type),openWorkbook};
})();
