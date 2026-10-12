const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const result=c.run(`(()=>{
 const p=Engine.clone(loading115Tests().projects.slab);p.groups[0].sh=3200;p.groups[0].h=6;
 for(const col of p.types.F1.columns)col.b=col.d=1000;
 const beam=p.types.F1.beams[0];beam.b=1500;beam.d=3200;beam.widthMode='manual';
 let r=Engine.generate(p),b=Engine.floorModel(r,1).beams.find(b=>b.id==='B1');p.explorer.selected['1|'+Loading.token(b.kind,b)]=true;
 const row=Loading.run(p,r,'B').rows.find(r=>r.id==='B1'),before=JSON.stringify(row.result),checks=Loading.auditChecks205(p,row),item={kind:'MB',status:checks.b.status,checks205:checks,deflection211:{state:'available',L:6,max:1}};
 const variants=['N40','N44','N52','N59','N69','N77','N78'].map(k=>{const copy=Engine.clone(row);copy.result.values[k]='NOT OKAY';return Loading.auditChecks205(p,copy).b;});
 const copy=Engine.clone(row);copy.result.fail.push('不明 RC 錯誤');const unknown=Loading.auditChecks205(p,copy).b;
 const pending=Engine.clone(row);pending.result.status='INPUT REQUIRED';pending.result.fail=['支承待确认'];const incomplete=Loading.auditChecks205(p,pending).b;
 const audit=Loading.audit(p,r,BeamLoadUI.summary211),entry=audit.items.find(i=>i.id==='B1'&&i.checks205);
 return {p,row,checks,variants,unknown,incomplete,entry,key:BeamLoadUI.combinationKey214(item),status:BeamLoadUI.auditStatus214(item),defaults:BeamLoadUI.defaultCombinations214(),unchanged:JSON.stringify(row.result)===before};
})()`);
assert(result.row.result.widthViolation);assert.equal(result.row.result.status,'NOT OK');assert(result.unchanged);
assert.equal(result.checks.b.status,'OK');assert.equal(result.checks.b.reasons.length,0);assert.equal(result.checks.b.warnings.length,1);assert.match(result.checks.b.warnings[0],/1500.*1000/);
assert.equal(result.key,'PPP');assert.equal(result.status,'OK');assert(!result.defaults.includes('PPP'));assert.equal(result.entry.checks205.b.warnings.length,1);
for(const v of result.variants){assert.equal(v.status,'NOT OK');assert(v.reasons.length);assert.equal(v.warnings.length,1);}
assert.equal(result.unknown.status,'NOT OK');assert.equal(result.incomplete.status,'INPUT REQUIRED');
const ui=fs.readFileSync(path.join(__dirname,'../explorer-ui.js'),'utf8'),render=ui.slice(ui.indexOf(' function auditDeflectionHTML211'),ui.indexOf(' function beamFilterHTML214')),helpers=ui.split('\n').find(l=>l.startsWith(' const $=id=>'));
const html=c.run(`(()=>{${helpers}\n${render};return auditChecksHTML205(argument,false);})()`,{kind:'MB',checks205:result.checks});
assert.match(html,/Section B · RC Check<\/b><br><span[^>]*>通過/);assert.match(html,/data-audit-size219/);assert.match(html,/尺寸提示/);assert.match(html,/不影響 RC 判定/);
(async()=>{const output=await c.run('BeamSizing83.prepare(argument)',result.p);assert(output.stopped.some(s=>s.id==='B1'&&s.reason.includes('超过柱宽')));assert(!output.changes.some(s=>s.id==='B1'));console.log('PASS actual over-wide MB: original result preserved, Summary RC OK, separate dimensions warning, independent filters, seven structural failures retained, unknown/input guards, warning-only audit collection, HTML and unchanged automatic widening stop');})().catch(e=>{console.error(e);process.exitCode=1;});
