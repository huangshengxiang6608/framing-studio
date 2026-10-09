require('./deflection-criterion212.cjs');
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');const c=context(path.resolve(__dirname,'../..'));
const actual=c.run(`(()=>{
 const rows=[];for(const a of ['P','F'])for(const d of ['P','F'])for(const b of ['P','F']){const i={kind:'MB',status:a==='F'||b==='F'?'NOT OK':'OK',checks205:{a:{status:a==='P'?'OK':'NOT OK'},b:{status:b==='P'?'OK':'NOT OK'}},deflection211:{state:'available',L:6,max:d==='P'?10:30}},result=BeamLoadUI.beamResult214(i);rows.push({key:result.key,failed:result.failed,status:BeamLoadUI.auditStatus214(i),default:BeamLoadUI.defaultCombinations214().includes(result.key)});}
 const missing={kind:'MB',status:'INPUT REQUIRED',checks205:{a:{status:'OK'},b:{status:'NOT OK'}},deflection211:{state:'pending'}};
 const pendingFail=BeamLoadUI.beamResult214(missing);missing.checks205.b.status='INPUT REQUIRED';const pending=BeamLoadUI.beamResult214(missing);
 return {rows,pendingFail,pending,nonbeam:BeamLoadUI.combinationKey214({kind:'COL'}),choices:BeamLoadUI.combinations214};
})()`);
assert.equal(new Set(actual.rows.map(r=>r.key)).size,8);assert.equal(actual.rows.filter(r=>r.default).length,6);
for(const r of actual.rows){const failed=r.key[1]==='F'||r.key[2]==='F';assert.equal(r.failed,failed);assert.equal(r.default,failed);assert.equal(r.status,failed?'NOT OK':r.key[0]==='F'?'OK (SHORT-TERM)':'OK');}
assert.equal(actual.pendingFail.key,'pending-fail');assert.equal(actual.pending.key,'pending');assert.equal(actual.nonbeam,'other');
const fixtures=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../../tmp/release205/fixtures.json'),'utf8'));
const all=c.run(`(()=>{const p=argument,r=Engine.generate(p),snapshot=JSON.stringify(p),legacy=Loading.audit(p,r,BeamLoadUI.summary211),full=Loading.audit(p,r,BeamLoadUI.summary211,true),expected=r.floors.reduce((n,f)=>n+Loading.members(p,r,f.n).filter(m=>['MB','SB','TB','CB'].includes(m.kind)).length,0);return {legacy,full,expected,unchanged:snapshot===JSON.stringify(p)};})()`,fixtures['OK / OK'].p);
assert(all.unchanged);assert.equal(all.legacy.items.find(i=>i.id==='B1'&&i.path==='Check'),undefined);assert(all.full.items.find(i=>i.id==='B1'&&i.path==='Check'));
assert.equal(all.full.items.filter(i=>i.checks205&&['MB','SB','TB','CB'].includes(i.kind)).length,all.expected);
for(const item of all.legacy.items)assert.deepEqual(all.full.items.find(i=>i.floor===item.floor&&i.id===item.id&&i.path===item.path),item);
console.log('PASS all eight independent states, exact default OR rule, pending/nonbeam categories, optional complete beam collection, legacy audit preservation and no project mutation');
