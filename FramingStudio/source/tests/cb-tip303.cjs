// Portable regression; optional local project argument is never bundled.
const fs=require('fs'),assert=require('assert/strict'),{context}=require('./audit-performance247.cjs');
const c=context(),run=(p,f)=>JSON.parse(JSON.stringify(c.run('('+f.toString()+')(argument)',p)));
const p=require('./wall-copy292.cjs').fixture();
const cases=run(p,p=>{
 const out=[];p.total=1;p.groups=[{...p.groups[0],end:'顶层'}];p.axes.y[1].gap=10;
 for(const vertical of [false,true])for(const reversed of [false,true])for(const saved of [false,true])for(const rootMode of ['column','wall','manual']){
  const q=Engine.clone(p),t=q.types.F1,xy=([x,y])=>vertical?[y,x]:[x,y],point=v=>({x:xy(v)[0],y:xy(v)[1]}),axis=vertical?1:0;
  t.cbColumnWidth171=true;t.walls=[];t.columns=[];t.beams=[];
  for(const [i,y]of [2,8].entries()){
   if(rootMode==='wall')t.walls.push({id:'W'+i,a:point([6,y-1]),z:point([6,y+1]),b:300,axisPosition:'center',on:true});
   else t.columns.push({id:'C'+i,...point([6,y]),b:1000,d:1000,on:true,status:'上下贯通'});
   const ends=reversed?[[10,y],[6,y]]:[[6,y],[10,y]];
   t.beams.push({id:'CB'+i,kind:'CB',a:point(ends[0]),z:point(ends[1]),b:1000,d:600,widthMode:'manual',on:true});
  }
  if(rootMode==='manual'){
   const r=Engine.generate(q),m=Engine.floorModel(r,1);
   for(const b of m.beams)q.explorer.members['1|'+Loading.token(b.kind,b)]={fixedEnd:reversed?'z':'a'};
  }
  const before=Engine.floorModel(Engine.generate(q),1),free=reversed?'a':'z';
  const baseline=before.beams.filter(b=>b.kind==='CB').map(b=>({id:b.id,tip:b[free],span:Loading.beamSpan(b).value,length:Math.hypot(b.z[0]-b.a[0],b.z[1]-b.a[1])}));
  if(saved){t.autoBeamSnapshot={main:[],secondary:[],primary:before.beams.map(b=>({...b,[free]:b[free].map((v,i)=>i===axis?v-.15:v)}))};t.beams=[];}
  t.beams.push({id:'EDGE',kind:'MB',manualKind294:'MB',a:point([10,2]),z:point([10,8]),b:300,d:600,widthMode:'manual',on:true});
  const r=Engine.generate(q),m=Engine.floorModel(r,1),edge=m.beams.find(b=>b.id==='EDGE');
  if(!edge||edge.supportStatus!=='connected')throw Error('MB lost its CB support');
  for(const b of m.beams.filter(b=>b.kind==='CB')){
   const old=baseline.find(v=>v.id===b.id);
   if(JSON.stringify(b[free])!==JSON.stringify(old.tip))throw Error('CB tip moved');
   if(Math.abs(Math.hypot(b.z[0]-b.a[0],b.z[1]-b.a[1])-old.length)>1e-7||Loading.beamSpan(b).value!==old.span)throw Error('Span/geometry changed');
   if(b.b!==1||b.supportStatus!=='connected')throw Error('CB width/support changed');
  }
  if(Math.abs(edge.a[axis]-9.85)>1e-7)throw Error('MB no longer fits inside outline');
  for(const end of ['a','z'])if(!Loading.supportOptions(m,edge,end).some(v=>v.type==='BEAM'&&v.member.kind==='CB'))throw Error('MB endpoint not on CB');
  const roundtrip=Engine.floorModel(Engine.generate(JSON.parse(JSON.stringify(q))),1);
  if(JSON.stringify(m.beams)!==JSON.stringify(roundtrip.beams))throw Error('Save/reopen differs');
  out.push({vertical,reversed,saved,rootMode});
 }
 return out;
});assert.equal(cases.length,24);console.log('PASS 24 CB-root direction/orientation/manual-root/wall-root/snapshot combinations; MB supports, physical spans, widths and save/reopen');
const guards=run(null,()=>({overlap:Engine.beamSpaceConflict({a:[2,5],z:[8,5],b:1},[{a:[3,5],z:[9,5],b:1}]),opening:Engine.align([{x0:0,x1:10,y0:0,y1:4,state:1},{x0:0,x1:10,y0:4,y1:6,state:2},{x0:0,x1:10,y0:6,y1:10,state:1}],[5,2],[5,8],.3)}));assert(guards.overlap);assert.equal(guards.opening,null);console.log('PASS genuine overlap and crossing Opening remain rejected');
if(process.argv[2]){
 const project=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const results=run(project,p=>{
  const baseline=Engine.clone(p),t=baseline.types.F03,edge=t.beams.find(b=>b.id==='MB_1');if(!edge)throw Error('Expected current-model connecting MB');
  t.beams=t.beams.filter(b=>b!==edge);const old=Engine.floorModel(Engine.generate(baseline),5),out=[];
  for(const width of [200,300,500]){
   const q=Engine.clone(p);q.types.F03.beams.find(b=>b.id==='MB_1').b=width;
   const m=Engine.floorModel(Engine.generate(q),5),mb=m.beams.find(b=>b.id==='MB_1');
   if(!mb||mb.supportStatus!=='connected')throw Error('Connecting MB lost');
   for(const id of ['CB_1','CB_2']){
    const a=old.beams.find(b=>b.id===id),b=m.beams.find(b=>b.id===id),span=Loading.beamSpan(b).value,length=Math.hypot(b.z[0]-b.a[0],b.z[1]-b.a[1]);
    if(JSON.stringify(a.a)!==JSON.stringify(b.a)||JSON.stringify(a.z)!==JSON.stringify(b.z)||Math.abs(span-length)>1e-7)throw Error('Current model CB changed');
    out.push({width,id,span,length,status:b.supportStatus});
   }
   if(JSON.stringify(Engine.floorModel(Engine.generate(Engine.clone(q)),5).beams)!==JSON.stringify(m.beams))throw Error('Reload unstable');
  }return out;
 });console.log('PASS current project: three MB widths, unchanged CB ends and geometry/span consistency, connected supports, save/reopen');console.log(JSON.stringify(results));
}

