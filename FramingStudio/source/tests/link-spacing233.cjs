const path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));
const results=c.run(`(()=>{
 const rows=[];
 for(const kind of ['MB','SB','CB','TB'])for(const V of [100,500,1000])for(const T of [0,80,150]){
  const o={kind,L:6,b:400,h:750,fcu:45,cover:40,M:400,V,T},r=SectionB.beam(o);rows.push({kind,V,T,r});
 }
 const o={kind:'MB',L:6,b:400,h:750,fcu:45,cover:40,M:400,V:100,T:80},auto=SectionB.beam(o),manual=[];
 for(const key of ['H58','H76'])for(const spacing of [50,75,99,100]){
  const steel={...auto.steel,[key]:spacing},before=JSON.stringify(steel),r=SectionB.beam({...o,steel});
  manual.push({key,spacing,r,rc:Loading.auditChecks205({}, {kind:'MB',result:r}).b,unchanged:before===JSON.stringify(steel)});
 }
 const overloaded=SectionB.beam({...o,V:10000,T:3000});
 return {rows,auto,manual,overloaded};
})()`);
for(const {kind,V,T,r} of results.rows)for(const key of ['H58','H76'])assert(r.steel[key]>=100,`${kind} ${V}/${T} ${key}=${r.steel[key]}`);
assert.equal(results.auto.status,'OK');assert.equal(results.auto.steel.G76,10);assert.equal(results.auto.steel.H76,125,'Use a larger diameter instead of former T8 @ 75');
for(const {key,spacing,r,rc,unchanged} of results.manual){assert(unchanged);assert.equal(r.steel[key],spacing,'Preserve saved legacy spacing');const label=key==='H58'?'抗剪':'抗扭',reason=label+'箍筋間距小於項目下限 100 mm';assert.equal(r.fail.includes(reason),spacing<100);if(spacing<100){assert.equal(r.status,'NOT OK');assert.equal(rc.status,'NOT OK');assert(rc.reasons.includes(reason));}}
assert.equal(results.overloaded.status,'NOT OK');assert(results.overloaded.steel.H58>=100&&results.overloaded.steel.H76>=100);
console.log('PASS 36 automatic beam cases: shear/torsion >= 100 mm; larger diameter selection; overloaded remains failed; manual 50/75/99 rejected by RC, 100 accepted by spacing rule; legacy values unmodified');
