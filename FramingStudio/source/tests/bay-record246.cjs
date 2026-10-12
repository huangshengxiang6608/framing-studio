const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const root=path.resolve(__dirname,'../..'),c=context(root);c.ctx.assert=assert;
// Reuse the existing primary-bay regression body in the offline computation VM.
// No browser automation or project writes are required.
const legacy=fs.readFileSync(path.join(__dirname,'bays171.cjs'),'utf8'),body=legacy.slice(legacy.indexOf(' const ok='),legacy.indexOf('});assert.deepEqual(errors'));
console.log(c.run('(()=>{'+body+'})()').join('\n'));
const fixture=legacy.slice(legacy.indexOf(' function fixture()'),legacy.indexOf(' for(const legacy'));
c.run(fixture);
const answer=c.run(`(()=>{
 const results=[];
 for(const batch of [false,true])for(const mode of ['b','d','both']){
  const p=fixture(),m=Engine.floorModel(Engine.generate(p),1),sb=m.beams.filter(b=>b.kind==='SB'),before=JSON.stringify(p.explorer);
  assert(sb.length>0);assert(sb.every(b=>!b.bay171),'exercise newly generated untagged members');
  const edits=sb.map(beam=>({beam,size:{kind:'SB',b:mode==='d'?beam.b*1000:300,...(mode!=='b'?{d:450}:{})}}));
  if(batch)assert(Engine.editBeamSizes245(p,'F01',m,edits));else for(const {beam,size}of edits)Engine.editSize(p,'F01',{id:beam.id,kind:'SB',f:1},{...size,d:size.d??null,depthOverride184:mode!=='b',preserveDepth184:mode==='b'});
  const snap=p.types.F01.autoBeamSnapshot.secondary;assert(snap.every(b=>Array.isArray(b.bay171)),'dimension edit must retain freshly frozen bay tags');
  const next=Engine.generate(p);assert(!next.issues.some(i=>i.msg.includes('bay 已改變')));assert.equal(JSON.stringify(p.explorer),before);
  const reload=Engine.generate(JSON.parse(JSON.stringify(p)));assert.equal(JSON.stringify(next),JSON.stringify(reload));
  // Existing valid historical tags still detect a real change after an edit.
  p.types.F01.beams.push({id:'CB1',kind:'CB',a:{x:.75,y:5},z:{x:5.5,y:5},b:300,d:null,widthMode:'manual',on:true});
  assert(Engine.generate(p).issues.some(i=>i.msg.includes('構件輸入')),'real primary-bay change must remain guarded');
  results.push((batch?'batch':'single')+' '+mode);
 }
 // For an unchanged layout, reconstruct only missing tags; do not change saved inputs.
 const p=fixture(),m=Engine.floorModel(Engine.generate(p),1);Engine.freezeAutoBeams(p,'F01',m);
 for(const s of p.types.F01.autoBeamSnapshot.secondary){delete s.bay171;s.depthOverride184=450;}
 const before=JSON.stringify(p),r=Engine.generate(p);assert.equal(JSON.stringify(p),before);
 assert(Engine.floorModel(r,1).beams.filter(b=>b.kind==='SB').every(b=>b.bay171));
 assert(!r.issues.some(i=>i.msg.includes('bay 已改變')));
 return results;
})()`);
console.log('PASS bay metadata survives single/batch B, D, B+D and reload; genuine boundary-change protection retained; non-mutating legacy recovery',JSON.stringify(answer));
