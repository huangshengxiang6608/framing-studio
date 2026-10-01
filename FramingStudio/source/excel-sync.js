window.ExcelSync=(()=>{
 let busy=false,progress='',records=[],issues=[],lastSnapshot='',runSection=null,runSections=[],pendingSections=new Set(),finishes={},preparedSnapshot='',sizingChanges=[];
 const reports={A:{snapshot:null,issues:[],message:''},B:{snapshot:null,issues:[],message:''}};
 const current=()=>JSON.stringify(window.ExcelProject().project),available=()=>!!window.chrome?.webview?.postMessage;
 // Report versions ignore the transient Member Check selection and the other report's selection.
 const reportSnapshot=(section,p=window.ExcelProject().project)=>{const v=Engine.clone(p);if(v.explorer){delete v.explorer.selected;delete v.explorer[section==='A'?'reportB':'reportA'];if(section==='B')delete v.explorer.reportANotes;}return JSON.stringify(v);};
 const send=o=>window.chrome.webview.postMessage(o),refresh=()=>WorkspacePages.refresh();
 async function fingerprint(text){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
 function overallJob(p){const faces={},states={};for(const face of ['B','D']){const input=OverallGeometry.input(p,face),state=OverallGeometry.calculate(input,face);if(state.state!=='CALCULATED')throw Error(face+' 面：'+state.state);states[face]=state;const m=Overall.machine(input,face),expected={};for(const role of [1,2,3,4]){const sheet=Overall.roles[role];expected[sheet]={};for(const [cell,def] of Object.entries(Overall.source.sheets[sheet].cells)){if(!def.formula)continue;const value=m.safe(sheet,cell);if(typeof value==='string'&&(/^(#|Unsupported|Circular)/.test(value)))continue;expected[sheet][cell]=value;}}faces[face]={input:Overall.normalize(input,face),expected};}const comparison={};for(const [row,value] of Object.entries(Overall.compareFaces(states.B,states.D)))comparison['G'+row]=value;for(const face of ['B','D'])for(const [row,value] of Object.entries(states[face].results))comparison[(face==='B'?'C':'E')+row]=value;return {type:'Overall',faces,comparison,label:'Overall · B / D'};}
 function plan(p,kind,section,filter){const jobs=[],problems=[];
  const add=(id,fn)=>{try{const v=fn();if(v?.batches){jobs.push(...v.batches);problems.push(...v.issues);}else jobs.push(v);}catch(e){problems.push({id,reason:e.message});}};
  if(kind==='RC'||kind==='Report')for(const sec of section?[section]:['A','B'])add('Scheme 1 · Section '+sec,()=>{const map=sec==='Check'?p.explorer?.selected:p.explorer?.['report'+sec];if(!filter&&!Object.values(map||{}).some(Boolean)){problems.push({id:'Scheme 1 · Section '+sec,reason:'尚未勾选构件'});return {batches:[],issues:[]};}const a=RCPlan.build(p,sec,filter);a.batches.forEach(j=>{j.label='Scheme 1 · '+j.label;});return a;});
  if(kind==='Overall'||kind==='Report'&&section==='A')add('Overall',()=>({...overallJob(p),section:'A'}));
  if(kind==='Deflection'||kind==='Report'&&section==='A')add('Deflection',()=>Deflection.jobs(p,Engine.generate(p),kind==='Report'));
  if(kind==='Steel'||kind==='Report'&&section==='A')add('Scheme 2',()=>Steel.jobs(p,Engine.generate(p)));
  if(kind==='Foundation'||kind==='Report')add('Foundation',()=>Foundation.jobs(p,section,kind==='Report'));
  let offset=0;for(const [i,j] of jobs.filter(j=>j.type==='RC'&&j.section==='B').entries()){j.reportNumberB={first:i===0,offset};offset+=j.members.filter(m=>m.selected!==false).length;}
  const rank={SLAB:1,CS:1,SB:2,MB:3,CB:3,TB:4,COL:5};
  for(const sec of ['A','B']){const selected=jobs.filter(j=>j.type==='RC'&&(j.section===sec||j.section==='Check')).flatMap(j=>j.members.filter(m=>m.selected!==false));selected.sort((a,b)=>rank[a.kind]-rank[b.kind]);selected.forEach((m,i)=>m.reportOrdinal=i+1);if(sec==='B')for(const j of jobs.filter(j=>j.type==='Foundation'))j.foundationNumberB=selected.length+4;}
  if(kind==='Report'&&section==='A')ReportContent.decorate(p,jobs,section);else if(kind==='RC')ReportContent.decorate(p,jobs.filter(j=>j.section==='A'),'A');
  return {jobs,issues:problems};
 }

 async function start(kind,section=null,filter=null){if(busy)return;if(kind==='Report'||kind==='RC'){busy=true;progress='检查梁深及自动加宽…';refresh();try{if(preparedSnapshot!==current()){const sized=await BeamSizing83.apply(StudioHost);sizingChanges=sized.changes||[];preparedSnapshot=current();if(sizingChanges.length){const summary=new Map();for(const v of sizingChanges){const key=v.framing+' / '+v.id,old=summary.get(key);summary.set(key,{from:old?.from??v.from,to:v.to});}StudioHost.toast('自动加宽：'+[...summary].map(([key,v])=>key+' '+v.from+' → '+v.to+' mm').join('；')+'。相关旧抄需重新生成。');}}else sizingChanges=[];}catch(e){progress=e.message;StudioHost.toast(e.message);busy=false;refresh();return;}busy=false;}const snapshot=current();lastSnapshot=snapshot;issues=[];records=[];runSection=kind==='Report'?section:null;runSections=kind==='Report'?(section==='AB'?['A','B']:[section]):[];pendingSections=new Set(runSections);finishes={};
  if(!available()){progress='请在桌面 App 中生成；此浏览器预览不能启动 Microsoft Excel。';for(const sec of runSections)reports[sec]={snapshot:reportSnapshot(sec,JSON.parse(snapshot)),issues:[],message:progress};pendingSections.clear();refresh();return;}
  busy=true;for(const sec of runSections){reports[sec]={snapshot:reportSnapshot(sec,JSON.parse(snapshot)),issues:[],message:'正在生成原 Excel 抄…',generatedAt:null};WorkspacePages.clearPDF(sec);}progress='正在整理当前输入…';refresh();try{
   const p=JSON.parse(snapshot),jobs=[];
   if(kind==='Report')for(const sec of runSections){const v=plan(JSON.parse(snapshot),kind,sec,filter);reports[sec].issues=[...v.issues];issues.push(...v.issues.map(x=>({...x,section:sec})));jobs.push(...v.jobs.map(j=>({...j,_reportSection:sec})));}
   else{const v=plan(p,kind,section,filter);issues=v.issues;jobs.push(...v.jobs);}
   if(!jobs.length){busy=false;pendingSections.clear();progress='没有可生成的完整输入。';for(const sec of runSections)reports[sec].message='请先完成输入并勾选本次要抄的构件。';refresh();return;}
   const stamp=await fingerprint(snapshot);send({kind:'excel-run',parallelReports:section==='AB',openWhenReady:kind!=='Report',jobs:jobs.map(j=>({...j,fingerprint:stamp,preview:true}))});
  }catch(e){busy=false;pendingSections.clear();progress=e.message;for(const sec of runSections)reports[sec]={snapshot:reportSnapshot(sec,JSON.parse(snapshot)),issues:[...reports[sec].issues,{id:'生成失败',reason:e.message}],message:e.message};}refresh();
 }
 async function finishReport(section){const report=reports[section],pdfs=[];
  const own=records.filter(r=>r.reportSection===section||(!r.reportSection&&runSections.length===1));
  for(const r of [...own].sort((a,b)=>({RC:0,Overall:1,Deflection:2,Steel:3}[a.type]??4)-({RC:0,Overall:1,Deflection:2,Steel:3}[b.type]??4))){if(!r.ok||r.differences?.length){report.issues.push({id:r.label,reason:r.error||'App 与 Excel 有差异，请在生成 Excel 页核对'});continue;}for(const file of r.files||[])if(file.base64)pdfs.push({...file,reportOrder:file.reportOrder??({RC:0,Overall:70,Deflection:80,Steel:50,Foundation:90}[r.type]??90)});}
  if(!pdfs.length){report.message='尚无可预览的抄。请查看未生成的项目。';return;}
  pdfs.sort((a,b)=>a.reportOrder-b.reportOrder);const result=await ReportCompose.compose(pdfs,section);
  await WorkspacePages.setPDF(section,result.bytes);report.layout=result.stats;report.generatedAt=new Date().toISOString();report.message='';
 }
 function finishOnce(section){return finishes[section]??=(async()=>{try{await finishReport(section);}catch(e){reports[section].message='预览未完成：'+e.message;progress=e.message;}finally{pendingSections.delete(section);refresh();}})();}
 async function receive(message){if(message.record)records.push(message.record);if(message.progress)progress=message.progress;
  if(message.error)for(const sec of runSections)reports[sec].issues.push({id:'生成中断',reason:message.error});
  if(message.sectionDone&&runSections.includes(message.sectionDone))await finishOnce(message.sectionDone);
  if(message.done){await Promise.all(runSections.map(finishOnce));busy=false;runSection=null;pendingSections.clear();}refresh();
 }
 function state(){return {busy,progress,records,issues,sizingChanges,stale:!!lastSnapshot&&lastSnapshot!==current()};}
 function reportState(section){const r=reports[section];return {...r,progress:busy&&pendingSections.has(section)?progress:'',stale:r.snapshot!==null&&r.snapshot!==reportSnapshot(section),busy:busy&&pendingSections.has(section)};}
 function ensureReport(section){return reportState(section);}
 function open(type='Overall',section,filter){window.StudioHost?.navigate('excel');if(filter?.member)start(type,section||'Check',[filter.member]);}
 function openWorkbook(id,file){if(available())send({kind:'excel-open',id,file});}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-excel-open],[data-ex]');if(!b)return;if(b.dataset.excelOpen){e.preventDefault();e.stopImmediatePropagation();open(b.dataset.excelOpen);}else if(['preview-report','excel-row'].includes(b.dataset.ex)){e.preventDefault();e.stopImmediatePropagation();open('RC',b.dataset.section||'Check',b.dataset.ex==='excel-row'?{member:b.dataset.floor+'|'+b.dataset.token}:null);}},true);
 return {open,receive,overallJob,plan,state,reportState,ensureReport,generateReport:section=>start('Report',section),generate:type=>start(type),openWorkbook};
})();
