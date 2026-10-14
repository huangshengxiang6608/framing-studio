const assert=require('assert/strict'),fs=require('fs'),path=require('path'),{webcrypto}=require('crypto'),{context}=require('./audit-performance247.cjs');
const c=context();c.ctx.crypto=webcrypto;c.ctx.sent277=[];
const p=JSON.parse(fs.readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/,''));
c.run(`globalThis.h277={p:argument};h277.result=Engine.generate(h277.p);globalThis.ui277=ExplorerUI({get:()=>h277,refresh(){},toast(){},transact(fn){fn();h277.result=Engine.generate(h277.p);return true;}});window.ExcelProject=()=>({project:Engine.clone(h277.p)});WorkspacePages.refresh=()=>{};WorkspacePages.clearPDF=()=>{};window.chrome={webview:{postMessage:x=>sent277.push(x)}};`,p);
c.run('globalThis.plans277=0;const originalPlan277=RCPlan.build;RCPlan.build=(...args)=>{plans277++;return originalPlan277(...args)}');
(async()=>{
 const results=[];
 for(const trial of ['cold','warm','warm2']){
  const start=performance.now();await c.run("ExcelSync.generateReport('AB')");
  assert(c.ctx.sent277.length===results.length+1,JSON.stringify(c.run('ExcelSync.state()')));
  assert.equal(c.run('plans277'),2,'A/B planned once for this unchanged snapshot');
  results.push({trial,seconds:(performance.now()-start)/1000});
  await c.run('ExcelSync.receive({done:true})');
 }
 for(const message of c.ctx.sent277.slice(1))assert.deepEqual(message,c.ctx.sent277[0],'identical export jobs and fingerprint');
 fs.writeFileSync(path.join(path.dirname(process.argv[2]),'planning-request277.json'),JSON.stringify(c.ctx.sent277[0]));
 const file=path.join(path.dirname(process.argv[2]),'planning-benchmark277.json');fs.writeFileSync(file,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
 // UI distinguishes a previous verified result from a newly performed check.
 const {parseHTML}=require('linkedom'),{document}=parseHTML('<html><head></head><body><div class="layout"><div class="stage"></div></div></body></html>');c.ctx.document=document;c.ctx.DeflectionFraming91={park(){}};
 c.run(`WorkspacePages.init({get:()=>h277,toast(){}});ExcelSync.reportState=()=>({busy:false,stale:false,issues:[],records:[{ok:true,cached:true,compared:24,label:'SLAB'}]});ExcelSync.state=()=>({busy:false,issues:[],records:[]});WorkspacePages.render('reportB');`);
 assert(document.querySelector('#workspace-pages').textContent.includes('本次未重算'));
 const d=context();d.ctx.crypto=webcrypto;d.ctx.messages277=[];
 d.run(`globalThis.h277={p:Engine.clone(loading115Tests().projects.slab)};h277.result=Engine.generate(h277.p);ExplorerUI({get:()=>h277,refresh(){},toast(){},transact(fn){fn();h277.result=Engine.generate(h277.p);return true;}});window.ExcelProject=()=>({project:Engine.clone(h277.p)});WorkspacePages.refresh=()=>{};WorkspacePages.clearPDF=()=>{};window.chrome={webview:{postMessage:x=>messages277.push(x)}};globalThis.plans277=0;const build277=RCPlan.build;RCPlan.build=(...args)=>{plans277++;return build277(...args)};`);
 await d.run("ExcelSync.generateReport('B')");const before=JSON.stringify(d.ctx.messages277[0].jobs[0].cells);await d.run('ExcelSync.receive({done:true})');
 d.run("LoadData.setFloor(h277.p,1,{usage:'Dormitory',dl:10,sdl:0,ll:3})");await d.run("ExcelSync.generateReport('B')");
 assert.equal(d.run('plans277'),2,'Changed input rebuilds export preparation');assert.notEqual(JSON.stringify(d.ctx.messages277[1].jobs[0].cells),before,'Changed loads reach new Excel job');
 console.log('PASS identical A/B jobs across repeated generation and explicit cached-result UI');
})().catch(e=>{console.error(e);process.exitCode=1});
