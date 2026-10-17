const fs=require('fs'),assert=require('assert/strict'),{context}=require('./audit-performance247.cjs');
const c=context(),run=(p,fn)=>JSON.parse(JSON.stringify(c.run('('+fn.toString()+')(argument)',p)));
const fixture=run(require('./wall-copy292.cjs').fixture(),p=>{
 p.total=1;p.groups=[{...p.groups[0],end:'顶层'}];p.axes.y[1].gap=10;const t=p.types.F1,pts=[[1,1],[6,1],[6,4],[9,4],[9,9],[1,9]];
 t.walls=pts.slice(0,-1).map((a,i)=>({id:'W'+i,a:{x:a[0],y:a[1]},z:{x:pts[i+1][0],y:pts[i+1][1]},b:300,on:true,axisPosition:'center'}));
 t.columns=[{id:'C1',x:1,y:1,b:300,d:300,on:true,status:'上下贯通'},{id:'C2',x:1,y:9,b:300,d:300,on:true,status:'上下贯通'}];
 t.beams=[{id:'P',kind:'MB',a:{x:1,y:1},z:{x:1,y:9},b:300,d:600,on:true,positionMode175:'fixed'}];t.autoBeams101=true;t.beamLayout116={main:false,secondary:true,mainDirection:'XY',secondaryDirection:'X',gap:2000,scope:'all'};
 t.slabVoids=[{x0:0,x1:1,y0:0,y1:10},{x0:9,x1:10,y0:0,y1:10},{x0:1,x1:9,y0:0,y1:1},{x0:1,x1:9,y0:9,y1:10},{x0:6,x1:9,y0:1,y1:4}];
 LoadData.setFloor(p,1,{dl:10,sdl:1,ll:3});Engine.validate(p);return p;
});
module.exports={fixture};
const data=run(fixture,p=>{const r=Engine.generate(p),out=Loading.run(p,r,'B',false,1);return {rows:out.rows,issues:out.issues,m:Engine.floorModel(r,1)};});
console.log(JSON.stringify({issues:data.issues,beams:data.rows.filter(r=>['SB','MB'].includes(r.kind)).map(r=>({id:r.id,act:!!r.actions,e:r.loadErrors})),slabs:data.rows.filter(r=>r.kind==='SLAB').map(r=>({id:r.id,physical:r.physicalTransfer306,transfer:r.transferErrors,rc:r.loadErrors}))}));
const near=(a,b,label)=>assert(Math.abs(a-b)<1e-7,`${label}: ${a} != ${b}`);
for(const transpose of [false,true])for(const reverse of [false,true]){
 const got=run({p:fixture,transpose,reverse},({p,transpose,reverse})=>{
  p=Engine.clone(p);const t=p.types.F1;if(transpose){[p.axes.x,p.axes.y]=[p.axes.y,p.axes.x];for(const b of [...t.beams,...t.walls])for(const e of ['a','z'])[b[e].x,b[e].y]=[b[e].y,b[e].x];for(const v of t.columns)[v.x,v.y]=[v.y,v.x];for(const v of t.slabVoids)[v.x0,v.x1,v.y0,v.y1]=[v.y0,v.y1,v.x0,v.x1];t.beamLayout116.secondaryDirection='Y';}if(reverse)for(const b of [...t.beams,...t.walls])[b.a,b.z]=[b.z,b.a];
  const r=Engine.generate(p),before=JSON.stringify(p),out=Loading.run(p,r,'B',false,1),slab=out.rows.find(x=>x.physicalTransfer306),beams=out.rows.filter(x=>['MB','SB'].includes(x.kind));if(JSON.stringify(p)!==before)throw Error('Run mutated inputs');if(!slab||slab.transferErrors.length||!slab.loadErrors.length)throw Error('RC/transfer separation failed');if(beams.some(b=>!b.actions))throw Error('Downstream blocked by RC');
  const sum=key=>slab.slabReactions.reduce((n,s)=>n+s[key]*s.length,0),sent=beams.flatMap(b=>b.loading.lines.filter(l=>l.label===slab.id).map(l=>({beam:b.id,length:l.end-l.start,g:l.g,q:l.q,expanded:!!l.slabLoad179}))),expectedBeam=slab.slabReactions.filter(v=>v.supportType==='BEAM').reduce((n,v)=>n+v.q*v.length,0);
  if(sent.some(l=>l.expanded))throw Error('Net concave load expanded onto virtual boundary');
  const transfers=beams.flatMap(receiver=>receiver.loading.automaticPoints.filter(p=>p.sourceEnd).map(point=>({receiver:receiver.id,point,source:beams.find(b=>b.id===point.label)?.actions}))),plan=RCPlan.build(p,'B',['1|'+slab.token]);
  const broken=Engine.clone(p);LoadData.setFloor(broken,1,{dl:10,sdl:null,ll:3});const bad=Loading.run(broken,Engine.generate(broken),'B',false,1);
  return {slab:{area:slab.member.area,G:sum('g'),Q:sum('q'),sw:slab.loading.sw,sdl:slab.loading.sdl,ll:slab.loading.ll},sent,expectedBeam,transfers,planIssues:plan.issues.length,missingBlocked:bad.rows.some(b=>b.kind==='SB'&&!b.actions),beamCount:beams.length};
 });
 near(got.slab.G,got.slab.area*(got.slab.sw+got.slab.sdl),'net polygon G');near(got.slab.Q,got.slab.area*got.slab.ll,'net polygon Q');near(got.sent.reduce((s,l)=>s+l.q*l.length,0),got.expectedBeam,'exact slab load reaching beams');assert(got.planIssues>0);assert(got.missingBlocked);assert.equal(got.beamCount,4);
 const keys=new Set();for(const t of got.transfers){assert(t.source);const side=t.point.sourceEnd==='A'?'left':'right';near(t.point.g,t.source.dead[side],'reaction G');near(t.point.q,t.source.live[side],'reaction Q');const key=t.point.label+'|'+side;assert(!keys.has(key));keys.add(key);}
}
console.log('PASS X/Y and reversal: concave net G/Q, exact receiving lines, unique SB→MB reactions, RC export stays pending, missing loads remain blocked');
const area=run(fixture,p=>{const r=Engine.generate(p),m=Engine.floorModel(r,1),a=LoadData.addArea(p,1);Object.assign(a,{rects:[{x0:1,x1:6,y0:1,y1:4}],panels:[],ll:8});const original=Engine.clone(a),before=JSON.stringify(p),out=Loading.run(p,r,'B',false,1);if(JSON.stringify(p)!==before)throw Error('Scoped normalization mutated input');LoadData.reconcile(p,r,Loading.token);const repaired=Engine.clone(p.explorer.areas[1][0]),once=JSON.stringify(p);LoadData.reconcile(p,r,Loading.token);if(once!==JSON.stringify(p))throw Error('Non-idempotent migration');const outside=LoadData.addArea(p,1);Object.assign(outside,{rects:[{x0:-1,x1:0,y0:0,y1:1}],panels:[]});LoadData.reconcile(p,r,Loading.token);const invalid=LoadData.validate(p,1,m.slabs.map(s=>Loading.token('SLAB',s)),m);const op=LoadData.addArea(p,1);Object.assign(op,{rects:[{x0:7,x1:8,y0:2,y1:3}],panels:[]});LoadData.reconcile(p,r,Loading.token);return {original,repaired,invalid,opening:LoadData.validate(p,1,m.slabs.map(s=>Loading.token('SLAB',s)),m),out};});
assert(area.repaired.wallClip306.removedArea>0);assert.deepEqual(area.repaired.wallClip306.originalRects,area.original.rects);assert.equal(area.repaired.ll,8);assert(area.invalid.length);assert(area.opening.length>=2);assert(!area.out.issues.some(i=>i.msg.includes('范围已改变')));console.log('PASS wall-only area repair, archived original extent, immutable runtime, idempotent save/reopen, outside/Opening errors retained');
