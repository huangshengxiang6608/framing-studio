// Exercise the actual Report entry point without ever rendering Member Check.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),{webcrypto}=require('crypto'),{context}=require('./audit-performance247.cjs');
function setup(p){
 const c=context();c.ctx.crypto=webcrypto;c.ctx.sent276=[];
 c.run(`globalThis.h276={p:argument};h276.result=Engine.generate(h276.p);globalThis.host276={get:()=>h276,refresh(){},toast(){},transact(fn){fn();h276.result=Engine.generate(h276.p);return true;}};
 globalThis.ui276=ExplorerUI(host276);window.ExcelProject=()=>({project:Engine.clone(h276.p)});WorkspacePages.refresh=()=>{};WorkspacePages.clearPDF=()=>{};window.chrome={webview:{postMessage:x=>sent276.push(x)}};
 globalThis.audits276=0;const original276=AuditRunner132.run;AuditRunner132.run=(...args)=>{audits276++;return original276(...args)};`,p);
 return c;
}
const seed=context(),fixture=seed.run(`(()=>{const p=Engine.clone(loading115Tests().projects.slab);for(const n of ['selected','reportA','reportB'])p.explorer[n]={};return p;})()`);
(async()=>{
 for(const section of ['A','B','AB']){
  const c=setup(structuredClone(fixture));await c.run('ExcelSync.generateReport(argument)',section);
  const messages=c.ctx.sent276;assert.equal(messages.length,1,JSON.stringify(c.run('ExcelSync.state()')));
  const rc=messages[0].jobs.filter(j=>j.type==='RC');assert.equal(rc.length,section==='AB'?2:1);assert(rc.every(j=>j.members.some(m=>m.kind==='SLAB')));
  const state=c.run('h276.p.explorer');for(const n of ['selected','reportA','reportB'])assert(Object.keys(state[n]).some(k=>k.includes('|SLAB|')&&state[n][k]));
  for(const sec of section==='AB'?['A','B']:[section])assert.equal(c.run('ExcelSync.reportState(argument).stale',sec),false);
  assert.equal(c.run('audits276'),1);await c.run('ExcelSync.receive({done:true})');await c.run('ExcelSync.generateReport(argument)',section);assert.equal(c.run('audits276'),1,'Fresh Check reused');
  if(section==='B'){await c.run('ExcelSync.receive({done:true})');c.run("LoadData.setFloor(h276.p,1,{usage:'Dormitory',dl:10,sdl:0,ll:3})");await c.run("ExcelSync.generateReport('B')");assert.equal(c.run('audits276'),2,'Changed loads invalidate cached Check');assert.equal(c.run("ExcelSync.reportState('B').stale"),false);}
 }
 // Scope cleanup must not remove previously automatic beam/column selections.
 seed.run(`(()=>{const ex={selected:{'1|MB|B':true,'1|COL|C':true,'1|SLAB|old':true},reportA:{},reportB:{},representatives250:{owned:{'1|MB|B':{selected:true},'1|COL|C':{selected:true},'1|SLAB|old':{selected:true}},overrides:{}}};BeamRepresentatives250.syncSlabs(ex,[]);if(!ex.selected['1|MB|B']||!ex.selected['1|COL|C']||ex.selected['1|SLAB|old'])throw Error('Scoped cleanup');})()`);
 const manual=structuredClone(fixture),model=seed.run('Engine.generate(argument)',manual),slab=seed.run('Loading.members(argument.p,argument.r,1).find(m=>m.kind===\'SLAB\')',{p:manual,r:model}),key='1|'+slab.token;
 manual.explorer.reportB[key]=false;manual.explorer.representatives250={owned:{},overrides:{[key]:{reportB:false}}};const m=setup(manual);await m.run("ExcelSync.generateReport('B')");assert(!m.ctx.sent276.some(x=>x.jobs.some(j=>j.members?.some(x=>x.kind==='SLAB'))));assert.equal(m.run('h276.p.explorer.reportB[argument]',key),false);
 const cs=structuredClone(fixture);cs.explorer.members[key]={slabType:'CS',csFixedEdge:'left',slabSpan131:{L:1.5,width:null,selfWeight:'net'}};const k=setup(cs);await k.run("ExcelSync.generateReport('B')");assert(k.ctx.sent276[0].jobs.some(j=>j.members?.some(m=>m.kind==='CS'&&m.sheet==='Section B Cantilever Slab Check'&&m.designName265)));
 const changed=setup(structuredClone(fixture));changed.run("AuditRunner132.run=async(...args)=>{h276.p.name='edited during preflight';return original276(...args)}");await changed.run("ExcelSync.generateReport('AB')");assert.equal(changed.ctx.sent276.length,0);assert(changed.run('ExcelSync.state().progress').includes('修改'));assert.equal(changed.run('ExcelSync.state().busy'),false);
 const missing=setup(structuredClone(fixture));missing.run("h276.p.explorer.members[argument]={slabSpan131:{L:-1,width:null,selfWeight:'net'}}",key);await missing.run("ExcelSync.generateReport('B')");assert.equal(missing.ctx.sent276.length,0);assert(missing.run('ExcelSync.state().progress').includes('最大板彎矩'));
 const duplicate=setup(structuredClone(fixture));await Promise.all([duplicate.run("ExcelSync.generateReport('AB')"),duplicate.run("ExcelSync.generateReport('AB')")]);assert.equal(duplicate.ctx.sent276.length,1);
 console.log('PASS direct A/B/AB without Member Check; empty selection; SLAB/CS named sheets; fresh-cache reuse; scoped cleanup; manual deselection; incomplete data; mid-flight edits; duplicate clicks; report snapshot freshness');
 if(process.argv[2]){
  const p=JSON.parse(fs.readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/,'')),before=JSON.stringify(p);
  // Emulate an older saved project with no automatic slab selection yet.
  for(const n of ['selected','reportA','reportB'])for(const key of Object.keys(p.explorer[n]||{}))if(key.includes('|SLAB|'))delete p.explorer[n][key];
  for(const key of Object.keys(p.explorer.representatives250?.owned||{}))if(key.includes('|SLAB|'))delete p.explorer.representatives250.owned[key];
  const real=setup(p);await real.run("ExcelSync.generateReport('AB')");assert.equal(real.ctx.sent276.length,1,JSON.stringify(real.run('ExcelSync.state()')));const msg=real.ctx.sent276[0];assert.equal(msg.jobs.filter(j=>j.type==='RC').length,2);assert(msg.jobs.filter(j=>j.type==='RC').every(j=>j.members.some(m=>m.kind==='SLAB'&&m.designName265==='2/F SL-21')));
  const dir=path.dirname(process.argv[2]);fs.mkdirSync(path.join(dir,'host'),{recursive:true});fs.writeFileSync(path.join(dir,'host/request.json'),JSON.stringify(msg));fs.writeFileSync(path.join(dir,'prepared-model.json'),JSON.stringify(real.run('h276.p')));fs.writeFileSync(path.join(dir,'check-rows.json'),JSON.stringify(real.run('ui276.getOutput().rows')));
  console.log('PASS current model direct AB generation captured: 2/F SL-21 included in both jobs; original source file untouched');
 }
})().catch(e=>{console.error(e);process.exitCode=1});
