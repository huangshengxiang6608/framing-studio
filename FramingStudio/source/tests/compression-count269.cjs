const assert=require('assert/strict'),cp=require('child_process');
const {context,app}=require('./audit-performance247.cjs'),c=context();
c.run(cp.execFileSync('git',['show','c868474:FramingStudio/source/checks.js'],{cwd:app,encoding:'utf8'}).replace('const SectionB=','const SectionB268='));
const cases=c.run(`(()=>{const out=[];for(const kind of ['MB','SB','TB','CB'])for(const b of [250,400,1800])for(const h of [400,750,3200])for(const M of [100,400,1500]){
 const input={acceptance261:'rc',kind,L:6,b,h,fcu:45,cover:50,M,V:100,T:0},old=SectionB268.beam(input),r=SectionB.beam(input);
 out.push({input,old,r,manual:SectionB.beam({...input,steel:old.steel}),reference:SectionB268.beam({...input,steel:old.steel}),measures:BeamRebar116.measures237({kind,result:r})});
}return out;})()`);
let successful=0,increased=0,multi=0;
for(const {input,old,r,manual,reference,measures}of cases){
 assert.deepEqual(manual,reference,'Manual inputs and every calculation must remain identical');
 if(r.autoFailed){assert.equal(r.status,'NOT OK');continue;}
 successful++;if(r.steel.C40>old.steel.C40)increased++;
 for(const [f,part]of [[40,'top'],[44,'bottom']]){
  const rows=Array.from({length:8},(_,i)=>f+i+(i>3?66:0)),occupied=rows.filter(k=>r.steel['C'+k]>0);
  assert(occupied.length>0);if(occupied.length>1)multi++;
  assert(occupied.every(k=>r.steel['C'+k]===r.steel.C44),'Every occupied compression/tension layer follows tension first-layer count');
  const area=occupied.reduce((a,k)=>a+r.steel['C'+k]*r.steel['D'+k]**2*Math.PI/4,0);
  assert(area<=input.b*input.h*.04+1e-8);assert.equal(measures[part].provided,area);
  assert.equal(measures[part].ratio,100*area/(input.b*input.h));
 }
}
assert(successful>0&&increased>0&&multi>0);
const missing=c.run('BeamRebar116.measures237(null,{C40:4,D40:25})');assert.equal(missing.top.ratio,null);
console.log(JSON.stringify({cases:cases.length,successful,increasedCompression:increased,multiLayerFaces:multi,manualParity:true,grossSectionRatios:true}));
