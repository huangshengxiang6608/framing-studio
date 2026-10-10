const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));
c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const result=c.run(`(()=>{
 const p=loading115Tests().projects.slab,raw=SectionB.beam({kind:'CB',L:4.5,b:1500,h:700,fcu:45,cover:50,M:5564.468671875,V:1645.048125,T:0}),before=JSON.stringify(raw);
 const row={floor:1,token:'CB|CB_1',kind:'CB',member:{d:.7,displayKind:'CB'},loading:{L:4.5},result:raw};
 const checks=Loading.auditChecks205(p,row),item={kind:'CB',status:'NOT OK',checks205:checks,deflection211:{state:'available',L:4.5,max:20.0391}};
 const variants=[];
 for(const k of ['N40','N44','N52','N59','N69','N77','N78']){const r=Engine.clone(row);r.result.values[k]='NOT OKAY';variants.push({cell:k,b:Loading.auditChecks205(p,r).b});}
 const classify=edit=>{const r=Engine.clone(row);edit(r.result);return Loading.auditChecks205(p,r).b;};
 const aOnly=Engine.clone(item);aOnly.checks205.a.status='NOT OK';aOnly.deflection211.max=10;
 const missing=classify(r=>{delete r.values.N44;r.status='OK';r.fail=[];});
 const unknown=classify(r=>r.fail.push('选筋未收敛'));
 const geometry=classify(r=>r.fail.push('每面单一直径及两级直径差'));
 const width=classify(r=>{r.widthViolation=true;r.fail.push('梁宽 1500 mm 超过相接柱宽上限 1000 mm');});
 const widthHint=classify(r=>r.fail.push('梁宽上限 1500.0 mm；下一步加宽 50 mm 将超限，仍未通过'));
 const pending=classify(r=>{r.status='INPUT REQUIRED';r.fail=['支承待确认'];});
 const slab={...row,kind:'SLAB'},slabResult=Loading.auditChecks205(p,slab).b;
 return {raw,checks,key:BeamLoadUI.combinationKey214(item),status:BeamLoadUI.auditStatus214(item),aOnlyKey:BeamLoadUI.combinationKey214(aOnly),aOnlyStatus:BeamLoadUI.auditStatus214(aOnly),defaults:BeamLoadUI.defaultCombinations214(),variants,missing,unknown,geometry,width,widthHint,pending,slabResult,unchanged:before===JSON.stringify(raw)};
})()`);
assert.equal(result.raw.status,'NOT OK');assert.equal(result.raw.values.N87,'NOT OKAY');assert.equal(result.raw.values.G87,7.88);assert.equal(result.raw.values.G86,7.56);
assert.equal(result.checks.a.status,'OK');assert.equal(result.checks.b.status,'OK');assert.equal(result.checks.b.reasons.length,0);assert(result.unchanged);
assert.equal(result.key,'PFP');assert.equal(result.status,'NOT OK');assert(!result.defaults.includes(result.key));
assert.equal(result.aOnlyKey,'FPP');assert.equal(result.aOnlyStatus,'OK (SHORT-TERM)');assert(!result.defaults.includes(result.aOnlyKey));
for(const v of result.variants){assert.equal(v.b.status,'NOT OK',v.cell);assert(v.b.reasons.length);assert(!v.b.reasons.includes('挠度'));}
assert.equal(result.missing.status,'INPUT REQUIRED');for(const key of ['unknown','geometry'])assert.equal(result[key].status,'NOT OK',key);
assert.equal(result.width.status,'OK');assert.equal(result.width.warnings.length,1);assert.equal(result.widthHint.status,'OK');assert.equal(result.pending.status,'INPUT REQUIRED');assert.deepEqual(result.slabResult.reasons,result.raw.fail);
console.log('PASS CB_1: original N87 7.88 > 7.56 unchanged; Summary RC passes; short-term deflection still fails/default hidden; all seven structural failures, input/geometry/unknown guards and separate width advisory, passing-deflection filter, slab preservation and immutability');
const ui=fs.readFileSync(path.join(__dirname,'../explorer-ui.js'),'utf8'),render=ui.slice(ui.indexOf(' function auditDeflectionHTML211'),ui.indexOf(' function beamFilterHTML214'));
const helpers=ui.split('\n').find(line=>line.startsWith(' const $=id=>'));
const html=c.run(`(()=>{${helpers}\n${render};return auditChecksHTML205(argument,false);})()`,{kind:'CB',checks205:result.checks,deflection211:{state:'available',L:4.5,max:20.0391}});
assert.match(html,/Section B · RC Check<\/b><br><span[^>]*>通過<\/span>/);assert.match(html,/短期撓度未通過/);assert(!html.includes('查看原因'));
console.log('PASS Summary HTML shows RC passed independently of short-term deflection failure');
