const assert=require('node:assert/strict');
const {context}=require('./audit-performance247.cjs');
function fixture(){
 const col=(id,x,y)=>({id,x,y,b:1500,d:1500,on:true,status:'上下贯通'});
 const beam=(id,kind,a,z,b)=>({id,kind,a:{x:a[0],y:a[1]},z:{x:z[0],y:z[1]},b,d:null,on:true,widthMode:'manual'});
 return {format:'framing-app',version:1,name:'Beam end and type regression',total:2,
  axes:{x:[{id:'1',gap:0},{id:'2',gap:10}],y:[{id:'A',gap:0},{id:'B',gap:10}]},
  defaults:{cb:1500,cd:1500,gap:3000,direction:'X',mb:300,sb:250,tb:600,tbd:900,slab:200,wall:300},
  groups:[{end:'顶层',h:4.5,type:'F01',sh:900,min:0}],
  types:{F01:{mode:'manual',cbColumnWidth171:true,autoBeams101:false,building:{'0,0':true},opening:{},
   columns:[col('TOP',.75,.75),col('BOTTOM',.75,9.25)],walls:[],suppressed:[],
   beams:[beam('TOP_CB','CB',[.75,.75],[10,.75],1500),beam('BOTTOM_CB','CB',[.75,9.25],[10,9.25],1500),beam('EDGE','MB',[10,9.25],[10,0],300)]}}};
}
module.exports={fixture};
if(require.main===module){
 const c=context(),passed=c.run(`(()=>{
 const ok=(v,msg)=>{if(!v)throw Error(msg)},near=(x,y,msg)=>ok(Math.abs(x-y)<1e-6,msg+': '+x+' / '+y),passed=[];
 const fixture=()=>Engine.clone(argument),edge=m=>m.beams.find(b=>b.id==='EDGE');
 for(const transpose of [false,true])for(const reverse of [false,true]){
  const p=fixture(),t=p.types.F01;
  if(transpose){[p.axes.x,p.axes.y]=[p.axes.y,p.axes.x];for(const c of t.columns)[c.x,c.y]=[c.y,c.x];for(const b of t.beams)for(const q of [b.a,b.z])[q.x,q.y]=[q.y,q.x];}
  if(reverse)for(const b of t.beams)[b.a,b.z]=[b.z,b.a];
  const r=Engine.generate(p),m=Engine.floorModel(r,1),b=edge(m),status=Loading.supportModel(p,m,1).beams.find(v=>v.id===b.id);
  ok(b.kind==='MB'&&status.supportStatus==='connected','Physical edge beam keeps MB with two supports');
  const end=reverse?'a':'z',opts=Loading.supportOptions(m,b,end),target=opts.find(v=>v.member.id==='TOP_CB');
  ok(target?.contact.section,'Top end uses physical perpendicular section');
  // The CB now retains x=10; the 300 mm edge MB centre is at 9.85.
  // A physical section contact therefore lies 150 mm inside the retained tip.
  near(target.contact.x,reverse?.15:9.1,'Contact projected to receiver reference span');
  ok(Loading.supportSummary(p,r,1,b).every(s=>s.text.includes('CB')),'Both support summaries show actual receivers');
  for(const f of [1,2])LoadData.setFloor(p,f,{usage:'Dormitory',dl:10,sdl:0,ll:2});
  const beamOnly=Engine.clone(r);for(const q of [...Object.values(beamOnly.models),...Object.values(beamOnly.floorModels||{})])q.slabs=[];
  Loading.init(p);const token=Loading.token(b.kind,b);p.explorer.members['1|'+token]={mode:'manual',beamSelfWeight:false,beamLoads:[{type:'line',a:0,b:9.25,dl:10,ll:5}]};
  let run=Loading.run(p,beamOnly,'B',false,1),row=run.rows.find(v=>v.member.id==='EDGE');
  ok(row.actions,'Two-end edge beam calculation resolves: '+JSON.stringify(row.result));
  const receivers=run.rows.filter(v=>['TOP_CB','BOTTOM_CB'].includes(v.member.id)),points=receivers.flatMap(v=>v.loading.automaticPoints.filter(q=>q.label==='EDGE'));
  ok(points.length===2,'Both CBs receive one EDGE reaction');near(points.reduce((n,v)=>n+v.g,0),92.5,'Dead reaction conservation');near(points.reduce((n,v)=>n+v.q,0),46.25,'Live reaction conservation');
  const point=receivers.find(v=>v.member.id==='TOP_CB').loading.automaticPoints.find(v=>v.label==='EDGE');near(point.x,target.contact.x,'Load station agrees with support UI');
  Loading.saveFramingSupports(p,1,token,{[end==='a'?'supportA':'supportZ']:target.value},[end==='a'?'supportA':'supportZ']);
  ok(!Loading.manualSupport(p,m,2,b,end).invalid,'Manual section-contact support shared across floors');
  run=Loading.run(p,beamOnly,'B',false,1);near(run.rows.find(v=>v.member.id==='TOP_CB').loading.automaticPoints.find(v=>v.label==='EDGE').g,point.g,'Manual and automatic reaction agree');
 }
 passed.push('Physical edge supports and force transfer: X/Y, reversed ends, shared manual supports and conserved reactions');
 {
  const p=fixture(),m=Engine.floorModel(Engine.generate(p),1),b=edge(m),upper=m.beams.find(v=>v.id==='TOP_CB');
  ok(!Loading.contact(b.rawZ,upper),'Generic point-load contact remains strict');
  const gap=Engine.clone(b);gap.z[1]=-.001;gap.rawZ[1]=-.001;ok(!Loading.beamEndContact294(gap,'z',upper),'Positive gap is not snapped');
  const parallel=Engine.clone(b);parallel.a=[8,0];parallel.z=[9,0];parallel.rawA=[8,0];parallel.rawZ=[9,0];ok(!Loading.beamEndContact294(parallel,'z',upper),'Parallel sections do not become end supports');
  const beyond=Engine.clone(b);beyond.a[0]=beyond.z[0]=beyond.rawA[0]=beyond.rawZ[0]=10.001;ok(!Loading.beamEndContact294(beyond,'z',upper),'No contact beyond receiver length');
  const ambiguous=Engine.clone(m),duplicate=Engine.clone(upper);duplicate.id='OVERLAP';duplicate.rawA[0]+=.001;ambiguous.beams.push(duplicate);ok(Loading.supportModel(p,ambiguous,1).beams.find(v=>v.id==='EDGE').supportStatus==='unverified','Multiple receiving beams stay unresolved');
  const cycle=Engine.clone(m);cycle.columns=[];ok(Loading.supportModel(p,cycle,1).beams.every(v=>v.supportStatus==='unverified'),'Circular beam-only graph is not a support');
 }
 passed.push('No invented point contacts, gaps, parallel joints, out-of-length supports, ambiguous supports or circular paths');
 for(const source of ['manual','auto']){
  const p=fixture(),t=p.types.F01;t.beams=t.beams.filter(b=>b.id!=='TOP_CB');
  if(source==='auto'){const row=t.beams.pop(),a=[row.a.x,row.a.y],z=[row.z.x,row.z.y];t.autoBeamSnapshot={main:[{...row,a,z,rawA:a,rawZ:z,b:.3,d:.9}],secondary:[],primary:[]};}
  let m=Engine.floorModel(Engine.generate(p),1),b=edge(m);ok(b.autoCantilever173&&b.kind==='CB','Original auto-cantilever behavior remains');
  const token=Loading.token(b.kind,b);Loading.init(p);p.explorer.members['1|'+token]={extraDead:2};
  Engine.editSize(p,'F01',{id:b.id,kind:b.kind,f:1},{kind:'MB',b:300,d:null,manualKind294:true});
  for(let i=0;i<2;i++){
   const saved=JSON.parse(JSON.stringify(p)),r=Engine.generate(saved);m=Engine.floorModel(r,1);b=edge(m);
   ok(b.kind==='MB'&&b.manualKind294==='MB'&&!b.autoCantilever173,'Explicit MB retained after regeneration/reload');
   ok(Loading.token(b.kind,b)===token&&Loading.input(saved,1,token).extraDead===2,'Member input identity retained');
   ok(Loading.supportModel(saved,m,1).beams.find(v=>v.id===b.id).supportStatus==='unverified','Type override cannot fabricate support');
   for(const f of [1,2])LoadData.setFloor(saved,f,{usage:'Dormitory',dl:10,sdl:0,ll:2});
   saved.explorer.selected['1|'+token]=true;const check=Loading.run(saved,r,'B',false,1).rows.find(v=>v.member.id==='EDGE');ok(check.result.status==='INPUT REQUIRED'&&check.result.fail.some(s=>s.includes('支承')),'Unresolved type override blocks valid Check: '+JSON.stringify(check.result));
   ok(Engine.floorModel(r,2).beams.find(v=>v.id===b.id).kind==='MB','Shared floor keeps chosen type');
   Engine.freezeAutoBeams(p,'F01',m);
  }
  Engine.editSize(p,'F01',{id:b.id,kind:'MB',f:1},{kind:'SB',b:300,d:600,manualKind294:true,depthOverride184:true});
  b=edge(Engine.floorModel(Engine.generate(p),1));ok(b.kind==='SB'&&b.manualKind294==='SB','Other explicit type change persists');
 }
 passed.push('Manual and snapshot beam overrides survive regeneration, shared floors, freeze, save/reload and retain unresolved Check plus load identity');
 {
  const p=Engine.clone(loading115Tests().projects.tc);p.types.F1.beams[0].kind='MB';p.types.F1.slabVoids=[{x0:0,x1:6,y0:0,y1:4}];
  const r=Engine.generate(p),b=Engine.floorModel(r,1).beams.find(b=>b.id==='TB1'),before=Loading.run(p,r,'B').rows.find(v=>v.member.id==='TB1');
  ok(b.autoTransfer&&b.kind==='TB','Transfer fixture starts in automatic mode');
  Engine.editSize(p,'F1',{id:b.id,kind:b.kind,f:1},{kind:'MB',b:700,d:null,manualKind294:true});
  const rr=Engine.generate(JSON.parse(JSON.stringify(p))),after=Engine.floorModel(rr,1).beams.find(v=>v.id===b.id),row=Loading.run(p,rr,'B').rows.find(v=>v.member.id===b.id);
  ok(after.kind==='MB'&&after.transferLandings.length===1,'Explicit MB keeps upper column landing');
  ok(JSON.stringify(before.loading.automaticPoints)===JSON.stringify(row.loading.automaticPoints),'Type choice does not drop upper column loads');
 }
 passed.push('Explicit type retains transfer-column landing and automatic point loads');
 return passed;
 })()`,fixture());
 assert(passed.length===4);console.log(passed.join('\n'));
}
