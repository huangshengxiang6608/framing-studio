// Synthetic fixtures only. An optional local project is never bundled.
const fs=require('fs'),assert=require('assert/strict'),{context}=require('./audit-performance247.cjs');
const c=context(),run=(p,f)=>JSON.parse(JSON.stringify(c.run('('+f.toString()+')(argument)',p)));
const fixture=require('./wall-copy292.cjs').fixture();
const results=run(fixture,p=>{
 const results=[];p.total=1;p.groups=[{...p.groups[0],end:'顶层'}];p.axes.y[1].gap=10;
 for(const vertical of [false,true])for(const manual of [false,true])for(const deletion of ['none','single','batch','all']){
  const q=Engine.clone(p),t=q.types.F1,xy=([x,y])=>vertical?[y,x]:[x,y],point=v=>({x:xy(v)[0],y:xy(v)[1]}),axis=vertical?1:0;
  t.cbColumnWidth171=true;t.walls=[];t.columns=[];t.beams=[];t.suppressed=[];delete t.autoBeamSnapshot;
  t.autoBeams101=true;t.beamLayout116={main:false,secondary:true,mainDirection:'XY',secondaryDirection:vertical?'Y':'X',gap:2000,scope:'all'};
  for(const [i,y]of [2,8].entries()){
   t.columns.push({id:'C'+i,...point([6,y]),b:1000,d:1000,on:true,status:'上下贯通'});
   t.beams.push({id:'CB'+i,kind:'CB',a:point([6,y]),z:point([10,y]),b:1000,d:600,widthMode:'manual',on:true});
  }
  for(const [id,x]of [['INNER',6],['EDGE',10]])t.beams.push({id,kind:'MB',manualKind294:'MB',a:point([x,2]),z:point([x,8]),b:300,d:600,widthMode:'manual',on:true});
  let m=Engine.floorModel(Engine.generate(q),1),sb=m.beams.filter(b=>b.kind==='SB');if(sb.length!==2)throw Error('Fixture expected two SB: '+sb.length);
  if(manual){t.beamLayout116.secondary=false;for(const b of sb)t.beams.push({id:b.id,kind:'SB',a:{x:b.rawA[0],y:b.rawA[1]},z:{x:b.rawZ[0],y:b.rawZ[1]},b:300,d:600,widthMode:'manual',on:true});m=Engine.floorModel(Engine.generate(q),1);sb=m.beams.filter(b=>b.kind==='SB');}
  const deleted=deletion==='none'?null:sb[0],before=sb.filter(b=>deletion!=='all'&&b!==deleted).map(b=>({id:b.id,rawA:b.rawA,rawZ:b.rawZ,cross:b.a[1-axis]}));
  if(deletion==='single')Engine.removeBeam(q,'F1',deleted.id,'SB',1);
  if(deletion==='batch')Engine.removeMembers(q,'F1',[{id:deleted.id,kind:'SB',f:1}],1);
  if(deletion==='all')Engine.removeMembers(q,'F1',sb.map(b=>({id:b.id,kind:'SB',f:1})),1);
  const token='1|'+Loading.token('SB',sb.at(-1));q.explorer.members[token]={note:'preserve member input',udl:12};const inputs=JSON.stringify(q.explorer);
  for(const width of [500,200,600,300]){
   Engine.editSize(q,'F1',{id:'EDGE',kind:'MB',f:1},{kind:'MB',b:width,d:null,preserveDepth184:true});
   Engine.validate(q);m=Engine.floorModel(Engine.generate(q),1);sb=m.beams.filter(b=>b.kind==='SB');
   if(sb.length!==before.length)throw Error('SB count changed '+JSON.stringify({vertical,deletion,width,n:sb.length}));
   for(const old of before){const b=sb.find(b=>b.id===old.id);if(!b||JSON.stringify([b.rawA,b.rawZ])!==JSON.stringify([old.rawA,old.rawZ]))throw Error('SB identity changed');if(Math.abs(b.z[axis]-(10-width/2000))>1e-7||b.a[1-axis]!==old.cross)throw Error('Attachment/spacing changed');}
   if(inputs!==JSON.stringify(q.explorer))throw Error('Member input changed');
   const reloaded=Engine.floorModel(Engine.generate(JSON.parse(JSON.stringify(q))),1);if(JSON.stringify(m.beams)!==JSON.stringify(reloaded.beams))throw Error('Reload differs');
   results.push({vertical,manual,deletion,width,count:sb.length});
  }
 }
 return results;
});assert.equal(results.length,64);console.log('PASS 64 width/orientation/manual-auto/deletion cases; SB identities, spacing, receiving endpoints, inputs, save/reopen');
if(process.argv[2]){
 const p=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const result=run(p,p=>{
  const out=[];
  for(const restore of [false,true]){
   const q=Engine.clone(p),t=q.types.F03;
   // Diagnostic copy with the existing snapshot fully visible; never rewrite the user's deletions.
   if(restore){const snapshot=new Set(t.autoBeamSnapshot.secondary.map(b=>Engine.sig(b.rawA,b.rawZ)));t.suppressed=t.suppressed.filter(s=>!snapshot.has(s));}
   let m=Engine.floorModel(Engine.generate(q),5),sb=m.beams.filter(b=>b.kind==='SB');const baseline=sb.map(b=>[b.id,b.rawA,b.rawZ]),inputs=JSON.stringify(q.explorer);
   for(const width of [300,600,400,500]){
    for(const id of ['MB_1','MB_2','MB_3'])Engine.editSize(q,'F03',{kind:'MB',id},{kind:'MB',b:width,d:null,preserveDepth184:true});
    Engine.validate(q);m=Engine.floorModel(Engine.generate(q),5);sb=m.beams.filter(b=>b.kind==='SB');
    if(JSON.stringify(sb.map(b=>[b.id,b.rawA,b.rawZ]))!==JSON.stringify(baseline))throw Error('Current model SB identities changed');
    if(inputs!==JSON.stringify(q.explorer))throw Error('Current member inputs changed');
    if(JSON.stringify(m.beams)!==JSON.stringify(Engine.floorModel(Engine.generate(Engine.clone(q)),5).beams))throw Error('Current reload differs');
    out.push({restore,width,secondary:sb.length,deleted:t.autoBeamSnapshot.secondary.filter(b=>b.deleted304).length});
   }
  }return out;
 });console.log(JSON.stringify(result));
}
