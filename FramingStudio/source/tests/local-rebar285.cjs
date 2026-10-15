// A local RC display must never upgrade stale report/whole-model results.
const assert=require('assert/strict'),{context,fixture}=require('./audit-performance247.cjs');
(async()=>{
 let cases=0;
 for(const kind of ['MB','SB','TB','CB']){
  const c=context(),p=c.run(fixture,kind);
  p.types.F1.beams[0].b=1800;
  for(const o of Object.values(p.explorer.members)){o.beamSelfWeight=false;if(kind==='CB')o.fixedEnd='a';for(const l of o.beamLoads||[]){l.dl=2;l.ll=0;}}
  c.run(`globalThis.t285={p:argument,floor:1,key:'F1'};t285.result=Engine.generate(t285.p);t285.ui=ExplorerUI({get:()=>t285,refresh(){},toast(){},transact(fn){fn();return true;}});`,p);
  await c.run('t285.ui.calculate()');
  const initial=c.run(`(()=>{const t=t285;t.row=t.ui.getOutput().rows.find(r=>r.kind===argument&&r.result.inputs&&r.result.steel);if(!t.row)return null;t.key=t.row.floor+'|'+t.row.token;return t.row;})()`,kind);
  if(!initial)throw Error('Missing valid '+kind+' fixture');
  for(const mode of ['manual','automatic']){
   c.run(`(()=>{const t=t285,o=t.p.explorer.members[t.key];o.steel=argument==='manual'?{...t.row.result.steel,H58:150}:null;})()`,mode);
   const start=performance.now(),local=c.run('t285.ui.getMemberResult227(t285.p,t285.row.floor,t285.row.token)');
   assert(local?.localRebar285,kind+' '+mode+' local result before full audit');
   assert.equal(c.run('t285.ui.getReportOutput254(t285.p)'),null,'Local RC is not a fresh A/B output');
   const elapsed=performance.now()-start;
   const invalidations=[`t.p.name+='changed'`,`t.p.explorer.members[t.key].torsion=123`,`t.p.types.F1.beams[0].b+=50`,`t.p.explorer.settings={...t.p.explorer.settings,fcu:60}`];
   for(const change of invalidations){c.run(`(()=>{const t=t285;t.old=JSON.stringify(t.p);${change};})()`);assert.equal(c.run('t285.ui.getMemberResult227(t285.p,t285.row.floor,t285.row.token)'),null,'Non-steel edits invalidate load basis');c.run('t285.p=JSON.parse(t285.old)');}
   await c.run('t285.ui.calculate(true)');
   const full=c.run('t285.ui.getMemberResult227(t285.p,t285.row.floor,t285.row.token)');
   assert.deepEqual(JSON.parse(JSON.stringify(local.result)),JSON.parse(JSON.stringify(full.result)),kind+' '+mode+' exact local/full formula and steel parity');
   assert(!full.localRebar285);cases++;console.log('PASS',kind,mode,'local RC',elapsed.toFixed(2)+' ms; exact full-audit parity');
  }
 }
 console.log('PASS '+cases+' local/manual/automatic cases; stale report gating and unrelated-input invalidation');
})().catch(e=>{console.error(e);process.exitCode=1});
