const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs'),fixture=require('./tributary187.cjs');
const root=path.resolve(__dirname,'../..'),c=context(root);c.ctx.setTimeout=setTimeout;c.ctx.clearTimeout=clearTimeout;
const ui=fs.readFileSync(path.join(root,'source/explorer-ui.js'),'utf8'),flow=ui.slice(ui.indexOf(' function calculate('),ui.indexOf(' function read('));
const project=c.run(`(()=>{const p=Engine.clone(argument),r=Engine.generate(p);Loading.init(p);const m=Loading.members(p,r,1).find(m=>m.kind==='MB');p.explorer.selected={[1+'|'+m.token]:true};p.explorer.reportA={[1+'|'+m.token]:true};p.explorer.reportB={[1+'|'+m.token]:true};return p;})()`,fixture.p);
(async()=>{
 const data=await c.run(`(async()=>{const p=argument,r=Engine.generate(p),before=JSON.stringify(p),legacy=Loading.audit(p,r,BeamLoadUI.summary211,true),answer=await AuditRunner132.run(p,r,{beamSummary:BeamLoadUI.summary211,includePassedBeams:true,retainOutput226:true}),{output226,...summary}=answer,direct=Loading.run(p,r,'B');return {same:JSON.stringify(summary)===JSON.stringify(legacy),unchanged:before===JSON.stringify(p),rows:output226.rows.map(row=>({key:row.floor+'|'+row.token,checked:row.checked,selected:p.explorer.selected[row.floor+'|'+row.token]===true})),checkedParity:output226.rows.filter(r=>r.checked).every(row=>JSON.stringify(row)===JSON.stringify(direct.rows.find(v=>v.floor===row.floor&&v.token===row.token))),maps:JSON.stringify([output226.reportA,output226.reportB])===JSON.stringify([p.explorer.reportA,p.explorer.reportB]),answer};})()`,project);
 assert(data.same);assert(data.unchanged);assert(data.checkedParity);assert(data.maps);assert(data.rows.some(r=>r.checked));assert(data.rows.some(r=>!r.checked));for(const r of data.rows)assert.equal(r.checked,r.selected);
 // Execute the actual UI calculation functions with a controlled runner to test races.
 const scenarios=await c.run(`(async()=>{
 const answer=argument.answer,p=Engine.clone(argument.p),host={get:()=>({p,result:{}}),refresh(){},toast(){}},oldRun=AuditRunner132.run,oldSize=BeamSizing83.apply;let requests=[],sizeCalls=0;
 AuditRunner132.run=async(q,r,options)=>{return await new Promise((resolve,reject)=>requests.push({resolve,reject,options}));};BeamSizing83.apply=async()=>{sizeCalls++;throw Error('Sizing must not run');};
 let cache228=null,auditJob132=0,auditBusy131=false,auditOpen131=false,auditProgress132='',auditNotice132='',busy=false,calculation=null,output=null,stamp='',audit131=null,auditStamp131='',auditBatchStamp157='',auditApplied157=new Set(),auditBatchStates157=new Map();
 ${flow}
 const tick=()=>new Promise(r=>setTimeout(r,30)),before=JSON.stringify(p),first=calculate(),same=first===calculate();await tick();const count=requests.length;requests.shift().resolve(answer);await first;
 const success=output===answer.output226&&audit131.total===answer.total&&stamp===JSON.stringify(p)&&auditStamp131===stamp&&!busy&&!auditBusy131;
 const previous=output,previousStamp=stamp,changed=calculate();await tick();p.name+=' changed';requests.shift().resolve({...answer,output226:{rows:['stale']}});await changed;const stale=output===previous&&stamp===previousStamp&&stamp!==JSON.stringify(p);
 const failed=calculate();await tick();requests.shift().reject(Error('test failure'));await failed;const failure=output===previous&&!busy&&!auditBusy131;
 const cancelled=calculate();await tick();const oldRequest=requests.shift();auditJob132++;auditBusy131=false;busy=false;calculation=null;const newer=calculate();await tick();const newRequest=requests.shift();oldRequest.resolve({...answer,output226:{rows:['cancelled']}});await cancelled;const waiting=busy&&calculation===newer;newRequest.resolve(answer);await newer;const cancelledSafe=waiting&&output===answer.output226&&!busy;
 AuditRunner132.run=oldRun;BeamSizing83.apply=oldSize;
 return {same,count,success,stale,failure,cancelledSafe,sizeCalls,dimensions:JSON.stringify(p.types)===JSON.stringify(JSON.parse(before).types)};
 })()`,{p:project,answer:data.answer});
 assert(scenarios.same);assert.equal(scenarios.count,1);for(const k of ['success','stale','failure','cancelledSafe','dimensions'])assert(scenarios[k],k);assert.equal(scenarios.sizeCalls,0);
 const excel=await c.run(`(async()=>{const p=argument,before=JSON.stringify(p);globalThis.ExcelProject=()=>({project:p});WorkspacePages.refresh=()=>{};globalThis.StudioHost={get:()=>({p,result:Engine.generate(p)}),refresh(){},toast(){}};let calls=0;const old=BeamSizing83.apply;BeamSizing83.apply=async()=>{calls++;throw Error('unexpected resizing');};await ExcelSync.generateReport('B');BeamSizing83.apply=old;return {calls,unchanged:JSON.stringify(p)===before};})()`,project);
 assert.equal(excel.calls,0);assert(excel.unchanged);
 assert(!ui.includes("计算／更新 Check','run"));assert(!ui.includes('BeamSizing83.apply'));
 console.log('PASS unified audit/detail results and selected report scopes; no resizing; one concurrent run; stale/failure/cancelled jobs cannot publish or overwrite new jobs; native export preflight preserves dimensions');
})().catch(e=>{console.error(e);process.exitCode=1;});
