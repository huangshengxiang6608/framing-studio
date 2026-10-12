const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));c.ctx.assert=assert;c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const measured=c.run(`(()=>{
 function make(){const p=Engine.clone(loading115Tests().projects.slab),t=p.types.F1;p.axes.x[1].gap=166;p.axes.y[1].gap=8;for(const c of t.columns){if(c.x===6)c.x=166;if(c.y===4)c.y=8;}p.total=4;p.groups=[{...p.groups[0],end:'顶层',fire241:4,sh:900}];delete p.groups[0].headroom;delete p.groups[0].em;t.beams=[];t.suppressed=[];delete t.autoBeamSnapshot;t.autoBeams101=true;t.beamDepth=650;t.beamLayout116={main:true,secondary:true,mainDirection:'XY',secondaryDirection:'Y',gap:2000,scope:'all'};Engine.validate(p);return p;}
 const base=make(),r=Engine.generate(base),m=Engine.floorModel(r,1),chosen=m.beams.filter(b=>b.kind==='SB');assert.equal(chosen.length,82);
 const edits=chosen.map(beam=>({beam,size:{kind:'SB',b:350}})),token=Loading.token('SB',chosen[0]);
 base.explorer.members['1|'+token]={extraDead:7};base.explorer.reportA['1|'+token]=true;base.explorer.reportB['1|'+token]=true;
 const old=Engine.clone(base),fast=Engine.clone(base),t0=performance.now();
 Engine.freezeAutoBeams(old,'F1',m);
 for(const {beam,size}of edits){const live=Engine.floorModel(Engine.generate(old),1).beams.find(b=>Engine.sig(b.rawA,b.rawZ)===Engine.sig(beam.rawA,beam.rawZ));Engine.editSize(old,'F1',{id:live.id,kind:live.kind,f:1},{...size,d:null,depthOverride184:false,preserveDepth184:true});}
 const oldResult=Engine.generate(old),oldMs=performance.now()-t0,t1=performance.now();
 assert(Engine.editBeamWidths244(fast,'F1',m,edits));const next=Engine.generate(fast);Engine.validateDimensionChanges241(fast,base,next,r);const fastMs=performance.now()-t1;
 const projection=result=>result.floors.map(f=>{const m=Engine.floorModel(result,f.n);return {beams:m.beams.map(b=>({id:b.id,kind:b.kind,b:b.b,d:b.d,a:b.a,z:b.z,rawA:b.rawA,rawZ:b.rawZ,depth:b.depthOverride184,widthMode:b.widthMode,token:Loading.token(b.kind,b)})),slabs:m.slabs,columns:m.columns};});
 assert.equal(JSON.stringify(projection(next)),JSON.stringify(projection(oldResult)),'batch and sequential geometry must match across shared floors');
 assert.equal(JSON.stringify(fast.explorer),JSON.stringify(base.explorer),'loads, report A/B selections unchanged');
 const reopened=Engine.generate(JSON.parse(JSON.stringify(fast)));assert.equal(JSON.stringify(projection(reopened)),JSON.stringify(projection(next)));
 assert.equal(Engine.floorModel(next,1).beams.filter(b=>b.kind==='SB').length,82);
 assert(Engine.floorModel(next,1).beams.filter(b=>b.kind==='SB').every(b=>b.b===.35&&b.d===.65));
 const invalid=Engine.clone(base),snapshot=JSON.stringify(invalid);assert.throws(()=>Engine.editBeamWidths244(invalid,'F1',m,[edits[0],{beam:chosen[1],size:{kind:'SB',b:250}}]),/280/);assert.equal(JSON.stringify(invalid),snapshot,'preflight must reject the whole batch before writing');
 for(const change of [{...edits[0],size:{kind:'SB',b:350,d:700}},{...edits[0],size:{kind:'SB',b:null}},{beam:{...chosen[0],splitSecondaryParent200:'parent'},size:edits[0].size},{beam:chosen[0],size:{kind:'MB',b:350}}]){
  const q=Engine.clone(base),before=JSON.stringify(q);assert.equal(Engine.editBeamWidths244(q,'F1',m,[change]),false);assert.equal(JSON.stringify(q),before,'unsupported edits retain the original path');
 }
 // Manual SBs use the same width-only batch path without losing explicit depth.
 const manual=Engine.clone(base);manual.types.F1.autoBeams101=false;manual.types.F1.beamLayout116.main=false;manual.types.F1.beamLayout116.secondary=false;
 manual.types.F1.beams=[{id:'S1',kind:'SB',a:{x:2,y:0},z:{x:2,y:8},b:300,d:700,on:true,widthMode:'manual'}];
 const mm=Engine.floorModel(Engine.generate(manual),1),mb=mm.beams.find(b=>b.id==='S1');assert(mb);assert(Engine.editBeamWidths244(manual,'F1',mm,[{beam:mb,size:{kind:'SB',b:350}}]));assert.equal(manual.types.F1.beams[0].d,700);
 return {beams:chosen.length,floors:base.total,sequentialMs:oldMs,batchMs:fastMs,speedup:oldMs/fastMs};
})()`);
console.log('PASS batch/sequential parity, depths, shared floors, load/report selections, reload, preflight rollback and complex-edit fallback');console.log(JSON.stringify(measured));
