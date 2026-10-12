const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const {context,app}=require('./audit-performance247.cjs');
const solver=require('../checks.js');
let baseline;
if(process.env.FRAMING_CHECKS_BASELINE255){
 const m={exports:{}};vm.runInNewContext(fs.readFileSync(process.env.FRAMING_CHECKS_BASELINE255,'utf8'),{module:m,require:()=>require('../excel-formulas.js')});baseline=m.exports;
}
const plain=x=>JSON.parse(JSON.stringify(x));let count=0,failures=0;
for(const kind of ['SLAB','CS'])for(const L of [1.5,2,2.5,5.625])for(const h of [200,300])for(const fire of [1,2,4]){
 const input={kind,L,h,fire,fcu:45,dl:0,sdl:0,ll:2},r=solver.slab(input);count++;
 if(baseline){const old=baseline.slab(input);for(const k of ['values','inputs','fail','status','source'])assert.deepEqual(plain(r[k]),plain(old[k]),k);if(!r.autoFailed){assert.deepEqual(plain(r.steel),plain(old.steel));assert.equal(r.description,old.description);}}
 if(r.autoFailed){failures++;assert.equal(r.steel,null);assert.equal(r.status,'NOT OK');assert(!r.description.includes('@'));}
 else assert(r.steel);
 const manual={...input,steel:{F35:12,H35:200,C57:10,D57:250}},m=solver.slab(manual);
 assert.equal(Boolean(m.autoFailed),false);assert.deepEqual(m.steel,manual.steel);
 if(baseline){const old=baseline.slab(manual);for(const k of ['values','inputs','fail','status','steel','description'])assert.deepEqual(plain(m[k]),plain(old[k]),'manual '+k);}
}
assert(failures>0);console.log('PASS',count,'automatic +',count,'manual cases; original numeric inputs/formulas/status unchanged');
// Exercise transverse-selection exhaustion independently of main-bar failure.
const transverse=solver.slab({kind:'CS',L:1.5,h:4000,fire:2,fcu:45,dl:0,sdl:0,ll:2});
assert(transverse.values.I35>=transverse.values.F34);assert.equal(transverse.values.I46,'OK');
assert(transverse.autoFailed);assert.equal(transverse.steel,null);assert(transverse.fail.includes('分布筋不足'));
const c=context();
let ui=fs.readFileSync(path.join(app,'source/explorer-ui.js'),'utf8');
ui=ui.slice(ui.indexOf('function ExplorerUI(host)')).replace('return {parameters176:','return {_slab255:slabSteel121,parameters176:');c.run(ui);
if(process.env.FRAMING_PLAN_BASELINE255)c.run(fs.readFileSync(process.env.FRAMING_PLAN_BASELINE255,'utf8').replace('const RCPlan=','const RCPlanOld255='));
const result=c.run(`(()=>{
 const p=Engine.clone(loading115Tests().projects.slab),model=Engine.generate(p),m=Loading.members(p,model,1).find(m=>m.kind==='SLAB'),key='1|'+m.token;
 for(const name of ['selected','reportA','reportB'])p.explorer[name]={[key]:true};
 p.explorer.members[key]={slabType:'CS',csFixedEdge:'left'};
 const before=JSON.stringify(p);
 for(const section of ['A','B','Check']){const plan=RCPlan.build(p,section);if(plan.batches.length||!plan.issues.some(i=>i.reason.includes('自动选筋失败')))throw Error('Failed CS was planned for '+section);}
 if(before!==JSON.stringify(p))throw Error('Planner mutated inputs');
 const ordinary=Engine.clone(p);ordinary.explorer.members[key]={slabSpan131:{L:20,width:null,selfWeight:'net'}};
 for(const section of ['A','B','Check']){const plan=RCPlan.build(ordinary,section);if(plan.batches.length||!plan.issues.some(i=>i.reason.includes('自动选筋失败')))throw Error('Failed ordinary slab was planned for '+section);}
 const failed=Loading.run(Engine.clone(p),model,'B').rows.find(r=>r.token===m.token),api=ExplorerUI({get:()=>({p,result:model,floor:1})});
 const html=api._slab255({data:p.explorer.members[key]},failed);
 if(!html.includes('data-slab-auto-failed255'))throw Error('Failure UI missing');
 for(const id of ['ex-slab-dia','ex-slab-space','ex-trans-dia','ex-trans-space']){
  const select=html.split('id="'+id+'"')[1]?.split('</select>')[0];
  if(!select||!/<option value="" selected>/.test(select)||/<option value="[0-9]+" selected>/.test(select))throw Error('Residual steel prefilled '+id);
 }
 p.explorer.members[key].slabSpan131={L:1.5,width:null,selfWeight:'net'};
 for(const section of ['A','B','Check']){const plan=RCPlan.build(p,section);if(!plan.batches.length||plan.issues.length)throw Error('Passing CS blocked '+section);if(typeof RCPlanOld255!=='undefined'&&JSON.stringify(plan)!==JSON.stringify(RCPlanOld255.build(p,section)))throw Error('Passing report payload changed '+section);}
 const good=Loading.run(Engine.clone(p),Engine.generate(p),'B').rows.find(r=>r.token===m.token);
 if(api._slab255({data:p.explorer.members[key]},good).includes('data-slab-auto-failed255'))throw Error('Success UI marked failed');
 delete p.explorer.members[key].slabSpan131;p.explorer.members[key].steel={F35:12,H35:200,C57:10,D57:250};
 const manual=Loading.run(Engine.clone(p),Engine.generate(p),'B').rows.find(r=>r.token===m.token);
 if(manual.result.autoFailed||!manual.result.steel)throw Error('Manual failure confused with automatic selection failure');
 if(api._slab255({data:p.explorer.members[key]},manual).includes('data-slab-auto-failed255'))throw Error('Saved manual steel hidden');
 return {failedABCBlocked:true,passingPayloadUnchanged:true,failedInputsBlank:true,manualPreserved:true};
})()`);
console.log('PASS',JSON.stringify(result));
for(const name of ['checks.js','rc-plan.js','explorer-ui.js','slab-panel121.js']){
 const source=fs.readFileSync(path.join(app,'source',name),'utf8').replace(/\r\n/g,'\n').trim(),html=fs.readFileSync(path.join(app,'assets/index.html'),'utf8').replace(/\r\n/g,'\n');assert.equal(html.split(source).length,2,name);
}
console.log('PASS served/source parity');
