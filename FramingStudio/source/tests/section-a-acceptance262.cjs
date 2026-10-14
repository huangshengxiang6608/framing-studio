const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {context,app}=require('./audit-performance247.cjs'),c=context();
let ui=fs.readFileSync(path.join(app,'source/explorer-ui.js'),'utf8');
ui=ui.slice(ui.indexOf('function ExplorerUI(host)')).replace('return {parameters176:','return {_seed262(p,o){output=o;stamp=JSON.stringify(p);inputStamp231=checkStamp231(p);},parameters176:');
c.run(ui);
const result=c.run(`(()=>{
 const p=Engine.clone(loading115Tests().projects.slab);
 LoadData.setFloor(p,1,{usage:'Dormitory',dl:80,sdl:0,ll:2});
 const model=Engine.generate(p),m=Loading.members(p,model,1).find(m=>m.id==='B1'),key='1|'+m.token;
 for(const n of ['selected','reportA','reportB'])p.explorer[n]={[key]:true};
 const original=Loading.run,a=original(p,model,'A'),b=original(p,model,'B'),ar=a.rows.find(r=>r.token===m.token),br=b.rows.find(r=>r.token===m.token);
 if(!ar.result.autoFailed||!Loading.beamAcceptance261(p,br).pass)throw Error('Fixture must reproduce A failed selection / B passed Check');
 const api=ExplorerUI({get:()=>({p,result:model,floor:1})});api._seed262(p,b);
 const before=JSON.stringify(p);let calls=[];Loading.run=(...args)=>{calls.push(args[2]);return original(...args)};
 try{
  const plan=RCPlan.build(p,'A'),job=plan.batches[0],member=job?.members.find(m=>m.id==='B1');
  if(plan.issues.length||!member)throw Error('Passed Check did not release A');
  if(calls.join()!=='A')throw Error('Fresh B Check unnecessarily recalculated');
  if(!member.adopt254||JSON.stringify(member.adopt254.steel)!==JSON.stringify(br.result.steel))throw Error('Successful shared beam steel not adopted');
  if(job.fullLoads.find(m=>m.id==='B1').expected.M!==br.actions.M||ar.actions.M===br.actions.M)throw Error('A beam loads not aligned with shared Check');
  if(job.cells.C9!==80||job.cells.D9!==0||job.cells.E9!==2)throw Error('A floor input changed');
  if(JSON.stringify(p)!==before)throw Error('Project mutated');
  // Failed, absent and stale Check data cannot authorize a report.
  for(const mutate of [r=>r.result.autoFailed=true,r=>r.result.values.N44='NOT OKAY',r=>r.loadErrors=['missing load']]){
   const bad=Engine.clone(b);mutate(bad.rows.find(r=>r.token===m.token));api._seed262(p,bad);
   if(RCPlan.build(p,'A').batches.length)throw Error('Failed Check released A');
  }
  api._seed262(p,b);const changed=Engine.clone(p);LoadData.setFloor(changed,1,{usage:'Dormitory',dl:80,sdl:100,ll:2});
  calls=[];if(RCPlan.build(changed,'A').batches.length||calls.join()!=='A,B')throw Error('Stale Check reused');
  const missing=Engine.clone(b);missing.rows=missing.rows.filter(r=>r.token!==m.token);api._seed262(p,missing);
  calls=[];if(RCPlan.build(p,'A').issues.length||calls.join()!=='A,B')throw Error('Incomplete cache not recalculated');
  api._seed262(p,b);calls=[];RCPlan.build(p,'B');if(calls.length)throw Error('B fresh reuse changed');
  return {differentLoads:true,sharedBeamReinforcementAdopted:true,freshReuse:true,staleRejected:true,missingRecomputed:true,failedCheckRejected:true,unchangedFloorInputs:true,unchangedProject:true};
 }finally{Loading.run=original}
})()`);
assert(result);console.log('PASS Section A eligibility uses current Summary/Member Check; uses shared beam loads and rejects failed/stale Check',JSON.stringify(result));
