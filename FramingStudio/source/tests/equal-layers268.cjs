const assert=require('assert/strict'),fs=require('fs'),cp=require('child_process');
const {context,app}=require('./audit-performance247.cjs'),c=context();
const baseline=cp.execFileSync('git',['show','8121fd9:FramingStudio/source/checks.js'],{cwd:app,encoding:'utf8'});
c.run(baseline.replace('const SectionB=','const SectionB267='));
const result=c.run(`(()=>{
 const cases=[];
 for(const kind of ['MB','SB','TB','CB'])for(const b of [250,400,1800])for(const h of [400,750,3200])for(const M of [100,400,1500]){
  const input={acceptance261:'rc',kind,L:6,b,h,fcu:45,cover:50,M,V:100,T:0};
  const r=SectionB.beam(input),old=SectionB267.beam(input);
  const manual=SectionB.beam({...input,steel:old.steel}),snapshot=JSON.stringify(old.steel);
  const reference=SectionB267.beam({...input,steel:old.steel});
  cases.push({input,r,manual,reference,unchanged:snapshot===JSON.stringify(old.steel)});
 }
 return cases;
})()`);
let passed=0,multi=0,failed=0;
for(const {input,r,manual,reference,unchanged}of result){
 assert(unchanged);assert.deepEqual(manual,reference,'Manual calculation must be identical for identical inputs');
 if(r.autoFailed){failed++;assert.equal(r.status,'NOT OK');continue;}
 for(const f of [40,44]){
  const rows=Array.from({length:8},(_,i)=>f+i+(i>3?66:0)),counts=rows.map(row=>Number(r.steel['C'+row]||0)).filter(Boolean);
  assert(counts.every(n=>n===counts[0]),JSON.stringify(input));
  const area=rows.reduce((sum,row)=>sum+Number(r.steel['C'+row]||0)*Number(r.steel['D'+row]||0)**2*Math.PI/4,0);
  assert(area<=input.b*input.h*.04+1e-8,'Rounding must not bypass the original 4% limit');
  if(counts.length>1)multi++;
 }
 if(r.status==='OK')passed++;
}
assert(passed>0&&multi>0&&failed>0);
// Explicit user's manual 2+1 configuration remains independent on both faces.
const manual=c.run(`(()=>{const input={acceptance261:'rc',kind:'SB',L:6,b:400,h:750,fcu:45,cover:50,M:200,V:100,T:0},base=SectionB.beam(input),steel={...base.steel};for(const f of [40,44])for(let i=0;i<8;i++){let row=f+i+(i>3?66:0);steel['C'+row]=i===0?2:i===1?1:0;steel['D'+row]=25;}return {a:SectionB.beam({...input,steel}),b:SectionB267.beam({...input,steel})};})()`);
assert.deepEqual(manual.a,manual.b);assert.equal(manual.a.steel.C41,1);assert.equal(manual.a.steel.C45,1);
console.log(JSON.stringify({cases:result.length,passed,multiLayerFaces:multi,automaticFailures:failed,manualParity:true}));
