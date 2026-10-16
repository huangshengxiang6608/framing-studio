// Exercise the actual UI freshness guard and planner against independent calculations.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {context,app}=require('./audit-performance247.cjs');
const c=context();
let ui=fs.readFileSync(path.join(app,'source/explorer-ui.js'),'utf8');
ui=ui.slice(ui.indexOf('function ExplorerUI(host)'));
// Seed the private completed-audit state only in this isolated test context.
ui=ui.replace('return {parameters176:', 'return {_seed254(p,o){output=o;stamp=JSON.stringify(p);inputStamp231=checkStamp231(p);},parameters176:');
c.run(ui);
const result=c.run(`(()=>{
 const p=Engine.clone(loading115Tests().projects.slab),model=Engine.generate(p);
 const members=Loading.members(p,model,1),m=members.find(m=>m.kind==='MB');
 const key='1|'+m.token;
 for(const map of ['selected','reportA','reportB'])p.explorer[map]={[key]:true};
 const api=ExplorerUI({get:()=>({p,result:model,floor:1})});
 const expected=RCPlan.build(p,'B'),before=JSON.stringify(p),output=Loading.run(Engine.clone(p),model,'B');
 api._seed254(p,output);
 const original=Loading.run;let calls=0;
 Loading.run=(...a)=>{calls++;return original(...a)};
 try{
  const actual=RCPlan.build(p,'B');
  if(calls!==0||JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Fresh cached B differs or recalculated');
  const copy=ExplorerUI.getReportOutput254(p);copy.rows[0].id='mutated';
  if(ExplorerUI.getReportOutput254(p).rows[0].id==='mutated')throw Error('Cached result leaked by reference');
  if(before!==JSON.stringify(p))throw Error('Report planning mutated project');
  const selection=Engine.clone(p);selection.explorer.reportA={};selection.explorer.selected={};
  if(!ExplorerUI.getReportOutput254(selection))throw Error('Selection-only changes invalidated calculations');
  const changes=[q=>q.types.F1.beams[0].b+=50,q=>q.types.F1.beams[0].d+=50,
   q=>q.explorer.members[key]={steel:{C44:4,D44:25}},q=>q.groups[0].frr=4,
   q=>LoadData.setFloor(q,1,{usage:'Dormitory',dl:15,sdl:3,ll:4})];
  for(const change of changes){const q=Engine.clone(p);change(q);if(ExplorerUI.getReportOutput254(q)!==null)throw Error('Stale input accepted');}
  calls=0;RCPlan.build(p,'A');if(calls!==1)throw Error('A load convention was bypassed');
  api._seed254(p,{...output,rows:output.rows.filter(r=>r.floor+'|'+r.token!==key)});
  calls=0;RCPlan.build(p,'B');if(calls!==1)throw Error('Missing member did not recalculate');
  api._seed254(p,{...output,section:'A'});if(ExplorerUI.getReportOutput254(p)!==null)throw Error('Wrong-section result accepted');
  const adopt=actual.batches.flatMap(b=>b.members).filter(m=>m.adopt254);
  if(!adopt.length||adopt.some(m=>!m.adopt254.steel||!m.adopt254.expected))throw Error('Missing adopted inputs/formula expectations');
  return {freshReuse:true,independentParity:true,staleEdits:changes.length,selectionReuse:true,cloneIsolation:true,missingFallback:true,sectionSeparation:true};
 }finally{Loading.run=original;}
})()`);
assert(result.freshReuse);console.log('PASS',JSON.stringify(result));
for(const name of ['rc-plan.js','explorer-ui.js']){
 const source=fs.readFileSync(path.join(app,'source',name),'utf8').replace(/\r\n/g,'\n').trim();
 const html=fs.readFileSync(path.join(app,'assets/index.html'),'utf8').replace(/\r\n/g,'\n');
 assert.equal(html.split(source).length,2, name+' served source parity');
}
console.log('PASS served module parity');
(async()=>{
 const result=await c.run(`(async()=>{
  const p=Engine.clone(loading115Tests().projects.slab),model=Engine.generate(p),m=Loading.members(p,model,1).find(m=>m.kind==='MB');
  for(const name of ['selected','reportA','reportB'])p.explorer[name]={[1+'|'+m.token]:true};
  const api=ExplorerUI({get:()=>({p,result:model,floor:1})}),independent=RCPlan.build(p,'B');
  const audit=await AuditRunner132.run(p,model,{beamSummary:BeamLoadUI.summary211,includePassedBeams:true,retainOutput226:true,capture228:true});
  api._seed254(p,audit.output226);
  const original=Loading.run;Loading.run=()=>{throw Error('Summary result was not reused')};
  try{if(JSON.stringify(RCPlan.build(p,'B'))!==JSON.stringify(independent))throw Error('Summary result differs from independent report calculation');}
  finally{Loading.run=original;}
  const slab=Loading.members(p,model,1).find(m=>m.kind==='SLAB'),key='1|'+slab.token;
  p.explorer.reportB={[key]:true};p.explorer.members[key]={slabType:'CS',csFixedEdge:'left',slabSpan131:{L:1.5,width:null,selfWeight:'net'}};
  const automatic=RCPlan.build(p,'B');
  if(!automatic.batches.some(b=>b.members.some(m=>m.kind==='CS'&&m.adopt254)))throw Error('Automatic CS did not reuse checked inputs and steel');
  return {summaryReuse:true,independentParity:true,automaticCsAdoption:true};
 })()`);
 console.log('PASS',JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1});
