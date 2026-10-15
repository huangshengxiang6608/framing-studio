const assert=require('assert/strict'),cp=require('child_process'),{context}=require('./audit-performance247.cjs');
const c=context(),old=context();
// A separate baseline binding proves automatic steel and all calculated values unchanged.
const baseline=cp.execFileSync('git',['show','b17fa420042b81109ce6964e505666f12f31a7b1:FramingStudio/source/checks.js'],{encoding:'utf8'}).replace('const SectionB=','globalThis.Old283=');old.run(baseline);
let count=0;
for(const kind of ['MB','SB','TB','CB']){
 for(const [b,h,M,V]of [[250,500,200,80],[400,750,400,100],[1800,3200,123940.851,31418.78]]){
  const o={acceptance261:'rc',kind,L:kind==='CB'?3:6,b,h,M,V,T:0,cover:50,fcu:45};
  assert.equal(JSON.stringify(c.run('SectionB.beam(argument)',o)),JSON.stringify(old.run('Old283.beam(argument)',o)),'Automatic parity '+kind+' '+b);count++;
 }
 const base={G14:1800,G15:3200,G16:50,G58:12,C40:18,D40:32,C44:18,D44:40,C45:18,D45:40,C46:18,D46:40,C47:18,D47:40,C114:20,D114:40,C115:20,D115:40};
 const oldGeometry=c.run('SectionB.machine(argument.kind,argument.v).geometry()',{kind,v:base});
 const manual=c.run('SectionB.machine(argument.kind,argument.v,true).geometry()',{kind,v:base});
 assert.equal(oldGeometry.faces[1].fit,false);assert.equal(manual.faces[1].fit,true);
 assert.equal(manual.faces[1].depth,oldGeometry.faces[1].depth,'Vertical depth unchanged');
 const o={acceptance261:'rc',kind,L:30,b:1800,h:3200,M:123940.851,V:31418.78,T:0,cover:50,fcu:45,steel:{...base,E58:18,G58:12,H58:100,E76:2,G76:10,H76:250}};
 // Supply only actual steel inputs.
 for(const k of ['G14','G15','G16'])delete o.steel[k];
 const r=c.run('SectionB.beam(argument)',o);assert(r.inputs&&r.values&&r.manualSpacing283);assert.equal(r.steel.C114,20);
 const nativeRule=c.run('SectionB.machine(argument.kind,argument.inputs).get("N44")',r);assert.equal(nativeRule,'NOT OKAY','Unchanged Excel policy remains a separate restriction');
 o.steel.C114=22;assert.throws(()=>c.run('SectionB.beam(argument)',o),/第 5 層 22T40.*37\.905 mm，小於 40 mm/);
 const s={G58:10,C40:3,D40:40,C44:2,D44:20};
 assert.equal(c.run('SectionB.horizontalErrors283("MB",argument,50,{G58:10,C40:3,D40:40})',320).length,0,'Exactly 40 accepted');
 assert.equal(c.run('SectionB.horizontalErrors283("MB",argument,50,{G58:10,C40:3,D40:40})',319.999).length,1,'Below 40 rejected');
 assert.equal(c.run('SectionB.horizontalErrors283("MB",argument,50,{G58:10,C40:1,D40:40})',180).length,0,'One bar has no interbar gap');
 const e=c.run('SectionB.horizontalErrors283("CB",320,50,{G58:10,C44:4,D44:40})');assert(e[0].startsWith('上筋第 1 層'),'Cantilever physical face');
}
console.log('PASS '+count+' automatic baselines unchanged; MB/SB/TB/CB manual override, retained depth/steel, exact/below 40 boundary, single bar and physical-face errors');
