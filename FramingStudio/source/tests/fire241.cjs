const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs'),fixture=require('./tributary187.cjs');
const c=context(path.resolve(__dirname,'../..'));c.ctx.assert=assert;
c.run(`(()=>{
 const p=Engine.clone(argument);p.defaults.slab=200;p.total=2;p.groups=[{...p.groups[0],end:1,fire241:1},{...p.groups[0],end:'顶层',fire241:4}];
 const key='F1';p.explorer.settings={...p.explorer.settings,fire:2,tbFire:4};
 assert.equal(Engine.beamFire241(p,1,'TB'),1);assert.equal(Engine.beamFire241(p,2,'SB'),4);
 assert.equal(Engine.beamMinimum241(p,key,'SB').width,280);
 for(const kind of ['MB','SB','CB','TB']){
  assert.throws(()=>Engine.assertBeamWidth241(p,key,kind,279),/280/);Engine.assertBeamWidth241(p,key,kind,280);
 }
 const r=Engine.generate(p),snapshot=JSON.stringify(p);
 // Same transaction validator as the app: reject before committing and keep old project.
 function attempt(change){const q=Engine.clone(p);try{change(q);const next=Engine.generate(q);Engine.validateDimensionChanges241(q,p,next,r);return {q,next};}catch(e){assert.equal(JSON.stringify(p),snapshot);return {error:e.message};}}
 assert.throws(()=>Engine.assertBeamWidth241(p,key,'SB',250),/280/);
 assert.match(attempt(q=>q.types.F1.sbWidth=249).error,/280/);
 assert(attempt(q=>q.types.F1.sbWidth=280).q);
 assert.match(attempt(q=>q.defaults.slab=199).error,/200/);
 assert(attempt(q=>q.defaults.slab=200).q);
 const b=Engine.floorModel(r,1).beams.find(b=>b.id==='B1');
 const edit=(q,width)=>Engine.editSize(q,key,{id:b.id,kind:b.kind,f:1},{b:width,d:null,kind:b.kind,preserveDepth184:true});
 assert.match(attempt(q=>edit(q,250)).error,/280/);
 assert(attempt(q=>edit(q,280)).q);
 const s=Engine.floorModel(r,1).slabs[0],oldSizes=JSON.stringify(p.types.F1.slabSizes);
 assert.throws(()=>BeamLayout116.setThickness(p,key,[{slab:s,value:199}]),/200/);assert.equal(JSON.stringify(p.types.F1.slabSizes),oldSizes);
 const thickness=attempt(q=>BeamLayout116.setThickness(q,key,[{slab:s,value:200}]));assert(thickness.q);
 const legacy=Engine.clone(p);delete legacy.groups[0].fire241;delete legacy.groups[1].fire241;
 assert.equal(Engine.beamFire241(legacy,1,'MB'),2);assert.equal(Engine.beamFire241(legacy,1,'TB'),4);
 for(const fire of [1,2,4]){legacy.groups.forEach(g=>g.fire241=fire);const min=fire===4?280:200;assert.throws(()=>Engine.assertBeamWidth241(legacy,key,'MB',min-1));Engine.assertBeamWidth241(legacy,key,'MB',min);}
 const saved=JSON.parse(JSON.stringify(p));assert.equal(Engine.beamFire241(saved,2,'TB'),4);Engine.validate(saved);
 // FRR-only changes keep geometry, recalculate cover and report undersized legacy members.
 const narrow=Engine.clone(p);narrow.total=1;narrow.groups=[{...narrow.groups[0],end:'顶层',fire241:1}];narrow.types.F1.beams.find(b=>b.id==='B1').b=250;
 const before=Engine.generate(narrow),changed=Engine.clone(narrow);changed.groups[0].fire241=4;const after=Engine.generate(changed);
 Engine.validateDimensionChanges241(changed,narrow,after,before);
 assert(after.issues.some(q=>q.id==='B1'&&q.msg.includes('280')));
 assert.equal(Engine.floorModel(after,1).beams.find(b=>b.id==='B1').b,.25);
 function checked(q,r){for(const m of Loading.members(q,r,1))q.explorer.selected['1|'+m.token]=true;return Loading.run(q,r,'B');}
 const out=checked(changed,after),bad=out.rows.find(q=>q.id==='B1'&&q.kind==='MB');assert(bad.result.fail.some(s=>s.includes('280')));
 const covers=[];for(const fire of [1,2,4]){const q=Engine.clone(narrow);q.groups[0].fire241=fire;q.types.F1.beams.find(b=>b.id==='B1').b=500;const o=checked(q,Engine.generate(q));covers.push(o.rows.find(r=>r.id==='B1'&&r.kind==='MB').result.inputs.G16);}
 assert.equal(covers.join(','),'30,50,80');
 const invalid=Engine.clone(p);invalid.groups[0].fire241=3;assert.throws(()=>Engine.validate(invalid),/FRR/);
 return true;
})()`,fixture.p);
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
assert(app.includes("['沿用共同設定',1,2,4],'group',i,'fire241'"));
assert(app.includes('Engine.validateDimensionChanges241(p,old,next,result)'));
console.log('PASS floor FRR inheritance/override, shared Framing max, width boundaries, rejected edit rollback, slab 200 boundary, reload, legacy diagnostics, Loading cover and insufficient-width rejection');
