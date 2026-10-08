const path=require('path'),fs=require('fs'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs'),c=context(path.resolve(__dirname,'../..'));
c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const out=c.run(`(()=>{
 const make=()=>{const p=Engine.clone(loading115Tests().projects.slab),t=p.types.F1;t.beams=[];t.suppressed=[];delete t.autoBeamSnapshot;t.autoBeams101=true;t.beamDepth=500;t.beamLayout116={main:true,secondary:true,mainDirection:'XY',secondaryDirection:'X',gap:2000,scope:'all'};p.groups.forEach(g=>{g.sh=700;delete g.headroom;delete g.em;});return p;};
 const model=p=>Engine.floorModel(Engine.generate(p),1),data=b=>({id:b.id,kind:b.kind,b:b.b,d:b.d,source:b.source,token:Loading.token(b.kind,b)});
 const p=make(),t=p.types.F1,m=model(p);Engine.freezeAutoBeams(p,'F1',m);
 // An old automatic snapshot without a widthMode is not an individual override.
 const sb=t.autoBeamSnapshot.secondary[0];delete sb.widthMode;sb.b=.15;p.defaults.sb=280;const legacy=data(model(p).beams.find(b=>b.id===sb.id));
 const targets=model(p).beams.filter(b=>['MB','SB'].includes(b.kind)).filter((b,i,a)=>a.findIndex(v=>v.kind===b.kind)===i),results=[];
 for(const target of targets){let q=Engine.clone(p),before=JSON.stringify(q.explorer),token=Loading.token(target.kind,target);q.explorer.members['1|'+token]={extraDead:17};q.explorer.reportA['1|'+token]=true;q.explorer.reportB['1|'+token]=true;before=JSON.stringify(q.explorer);
  Engine.editSize(q,'F1',{id:target.id,kind:target.kind,f:1},{b:310,d:300,depthOverride184:true});let b=model(q).beams.find(b=>b.id===target.id);const edited=data(b);Engine.freezeAutoBeams(q,'F1',model(q));q=Engine.clone(q);const reopened=data(model(q).beams.find(b=>b.id===target.id)),untouched=JSON.stringify(q.explorer)===before;
  const step=target.kind==='SB'?'secondary':'main',rebuilt=BeamLayout116.candidate(q,'F1',step,BeamLayout116.settings(q,'F1'),true).project;const regen=data(model(rebuilt).beams.find(b=>Engine.sig(b.rawA,b.rawZ)===Engine.sig(target.rawA,target.rawZ)));
  Engine.editSize(q,'F1',{id:b.id,kind:b.kind,f:1},{b:null,d:null,depthOverride184:true});q.defaults.sb=290;q.types.F1.beamDepth=600;const reset=data(model(q).beams.find(b=>b.id===target.id));results.push({edited,reopened,regen,reset,untouched,token,manual:q.types.F1.beams.length});
 }
 const q=make(),cols=[];q.types.F1.autoBeams101=false;q.types.F1.beamLayout116.main=false;q.types.F1.beamLayout116.secondary=false;q.types.F1.columns=[];q.types.F1.mode='manual';
 const col=Engine.addColumn(q,'F1',3,2);FloorColumns101.defaults(q,'F1',1,'cb',450);FloorColumns101.defaults(q,'F1',1,'cd',550);cols.push(model(q).columns.find(c=>c.id===col.id));
 Engine.editSize(q,'F1',{kind:'COL',id:col.id,f:1},{b:350,d:null});FloorColumns101.defaults(q,'F1',1,'cb',500);FloorColumns101.defaults(q,'F1',1,'cd',600);cols.push(model(q).columns.find(c=>c.id===col.id));
 Engine.editSize(q,'F1',{kind:'COL',id:col.id,f:1},{b:null,d:null});FloorColumns101.defaults(q,'F1',1,'cb',520);cols.push(model(q).columns.find(c=>c.id===col.id));
 // Old manual dimensions are explicit: do not guess away user data.
 const old=make();old.types.F1.autoBeams101=false;old.types.F1.columns=[{id:'legacy',x:3,y:2,b:370,d:470,on:true,status:'上下贯通'}];old.types.F1.mode='manual';old.types.F1.columnDefaults101={cb:600,cd:600};const oldCol=model(old).columns.find(c=>c.id==='legacy');
 const auto=make();auto.types.F1.mode='auto';const ac=model(auto).columns[0];Engine.editSize(auto,'F1',{kind:'COL',id:ac.id,f:1},{b:350,d:null});FloorColumns101.defaults(auto,'F1',1,'cd',500);const ac2=model(auto).columns.find(c=>c.anchorX===ac.anchorX&&c.anchorY===ac.anchorY);Engine.setColumnMode(auto,'F1','manual');FloorColumns101.defaults(auto,'F1',1,'cd',550);const ac3=model(auto).columns.find(c=>c.id===ac.id);
 return {legacy,results,cols:cols.map(c=>[c.b,c.d]),oldCol:[oldCol.b,oldCol.d],autoCols:[[ac2.b,ac2.d],[ac3.b,ac3.d]]};
})()`);
assert.equal(out.legacy.b,.28);assert.equal(out.legacy.d,.5);
for(const r of out.results){for(const b of [r.edited,r.reopened,r.regen]){assert.equal(b.source,'auto');assert.equal(b.b,.31);assert.equal(b.d,.3);assert.equal(b.token,r.token);}assert(r.untouched);assert.equal(r.manual,0);assert.equal(r.reset.d,r.reset.kind==='SB'?.6:.7);if(r.reset.kind==='SB')assert.equal(r.reset.b,.29);}
assert.deepEqual(JSON.parse(JSON.stringify(out.cols)),[[.45,.55],[.35,.6],[.52,.6]]);assert.deepEqual(Array.from(out.oldCol),[.37,.47]);assert.deepEqual(JSON.parse(JSON.stringify(out.autoCols)),[[.35,.5],[.35,.55]]);
console.log('PASS: legacy automatic SB follows width/default depth; automatic MB/SB edits retain IDs/source/load and report input tokens; explicit B/D survive freeze/reload/replan, reset follows defaults; manual/automatic column per-dimension defaults, overrides, reset, mode conversion and legacy explicit sizes');
