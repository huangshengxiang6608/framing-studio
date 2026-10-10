const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const result=c.run(`(()=>{
 const p=Engine.clone(loading115Tests().projects.slab),t=p.types.F1;
 for(const [i,x]of [2,4].entries())t.beams.push({id:'S'+i,kind:'SB',a:{x,y:0},z:{x,y:4},b:i?275:250,d:null,on:true,widthMode:i?'manual':'default'});
 p.total=3;p.groups=[{...p.groups[0],end:2},{...p.groups[0],end:'顶层',type:'F2'}];p.types.F2=Engine.clone(t);
 const dims=q=>{const r=Engine.generate(q);return [1,2,3].map(f=>Engine.floorModel(r,f).beams.map(b=>({id:b.id,kind:b.kind,b:b.b,d:b.d,a:b.rawA,z:b.rawZ})));};
 const initial=dims(p);t.sbWidth=350;const changed=dims(p),saved=JSON.parse(JSON.stringify(p)),roundtrip=dims(saved);
 const r=Engine.generate(p),b=Engine.floorModel(r,1).beams.find(b=>b.id==='S1');Engine.editSize(p,'F1',{id:b.id,kind:b.kind},{b:null,d:null,kind:'SB'});const restored=dims(p);
 p.defaults.sb=300;const common=dims(p);delete t.sbWidth;const cleared=dims(p);
 const invalid=[];for(const value of [0,-1,20001,NaN,Infinity,'300']){const q=Engine.clone(p);q.types.F2.sbWidth=value;try{Engine.validate(q);invalid.push(false);}catch(e){invalid.push(e.message.includes('Framing SB'));}}
 const auto=Engine.clone(loading115Tests().projects.slab),at=auto.types.F1;at.beams=[];at.autoBeams101=true;at.beamLayout116={main:true,secondary:true,mainDirection:'XY',secondaryDirection:'X',gap:2000,scope:'all'};
 let ar=Engine.generate(auto),am=Engine.floorModel(ar,1);const autoInitial=am.beams.filter(b=>b.kind==='SB');at.sbWidth=320;ar=Engine.generate(auto);am=Engine.floorModel(ar,1);const autoChanged=am.beams.filter(b=>b.kind==='SB').map(b=>b.b);
 Engine.freezeAutoBeams(auto,'F1',am);at.sbWidth=360;ar=Engine.generate(auto);am=Engine.floorModel(ar,1);const frozenChanged=am.beams.filter(b=>b.kind==='SB').map(b=>b.b),ab=am.beams.find(b=>b.kind==='SB');
 Engine.editSize(auto,'F1',{id:ab.id,kind:ab.kind},{kind:'SB',b:280,d:null});at.sbWidth=400;ar=Engine.generate(auto);am=Engine.floorModel(ar,1);const override=am.beams.find(b=>b.id===ab.id).b,others=am.beams.filter(b=>b.kind==='SB'&&b.id!==ab.id).map(b=>b.b);
 return {initial,changed,roundtrip,restored,common,cleared,invalid,autoCount:autoInitial.length,autoChanged,frozenChanged,override,others};
})()`);
const x=JSON.parse(JSON.stringify(result)),beam=(rows,f,id)=>rows[f-1].find(b=>b.id===id);
assert.deepEqual(x.roundtrip,x.changed);
for(const f of [1,2]){assert.equal(beam(x.changed,f,'S0').b,.35);assert.equal(beam(x.changed,f,'S1').b,.275);assert.equal(beam(x.restored,f,'S1').b,.35);assert.equal(beam(x.common,f,'S0').b,.35);assert.equal(beam(x.cleared,f,'S0').b,.3);}
assert.deepEqual(x.changed[2],x.initial[2]);assert.equal(beam(x.common,3,'S0').b,.3);
for(const id of ['B1','B2','B3','B4'])assert.deepEqual(beam(x.changed,1,id),beam(x.initial,1,id));
assert(x.invalid.every(Boolean));assert(x.autoCount>0);assert(x.autoChanged.every(b=>b===.32));assert(x.frozenChanged.every(b=>b===.36));assert.equal(x.override,.28);assert(x.others.every(b=>b===.4));
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');assert(app.includes("['Framing','SB 預設 B · mm','SB 預設 D · mm']"));assert(app.includes("input(Engine.secondaryWidth(p,k),'framing-sb-width218'"));
console.log('PASS per-Framing default SB width: manual/automatic/frozen beams, shared floors, isolated types, explicit overrides, reset/global fallback, save roundtrip, input limits and unchanged primary beams');
