const fs=require('fs'),assert=require('assert'),vm=require('vm');
const B=require('../checks.js'),F=require('../excel-formulas.js');const base={id:'LIMIT',b:1000,h:1000,height:4.5,factor:1,fcu:60,ratio:2.5,projectFactor:1.25,dead:0,live:0,system:'Braced'};
const run=(N,extra={})=>B.column({...base,dead:N/1.4/1.25,...extra});const passed=[];
let r=run(30000);assert.equal(r.status,'OK (AXIAL ONLY)');assert(r.values.C34<=4);passed.push('Automatic selection under 4% passes');
r=run(35000);assert.equal(r.status,'NOT OK');assert(r.fail.includes('NO BAR OPTION'));passed.push('Demand requiring 4–6% now fails instead of selecting excess steel');
assert.equal(run(20000,{steel:{C5:32,C32:40}}).status,'OK (AXIAL ONLY)');assert.equal(run(20000,{steel:{C5:40,C32:40}}).status,'NOT OK');passed.push('Manual steel is checked against the same 4% limit');
for(const [rho,ok] of [[3.9999,true],[4,true],[4.0001,false],[6,false]]){const m=B.machine('COL',{C5:32,C30:25000,C33:rho*10000,C34:rho});assert.equal(m.get('C40')==='OKAY (AREA ONLY)',ok);}passed.push('Steel check accepts exactly 4% and rejects values above 4%');
assert(run(20000,{ratio:4}).values.C30!== '');assert.equal(run(20000,{ratio:4.001}).values.C30,'');passed.push('Legacy/imported target ratios above 4% cannot pass');
fs.mkdirSync('tmp/column-limit4',{recursive:true});fs.writeFileSync('tmp/column-limit4/check-results.json',JSON.stringify({passed},null,2));console.log(passed.join('\n'));
