const fs=require('fs'),assert=require('assert/strict'),{context}=require('./audit-performance247.cjs');
const c=context(),run=(p,fn)=>JSON.parse(JSON.stringify(c.run('('+fn.toString()+')(argument)',p)));
const p=require('./wall-copy292.cjs').fixture();
const edges=run(p,p=>{
 const out=[];p.total=1;p.groups=[{...p.groups[0],end:'顶层'}];
 for(const [id,a,z,expected]of [['L',[0,0],[0,8],[.15,4]],['R',[10,8],[10,0],[9.85,4]],['T',[0,0],[10,0],[5,.15]],['B',[10,8],[0,8],[5,7.85]]]){
  const t=p.types.F1;t.walls=[{id,a:{x:a[0],y:a[1]},z:{x:z[0],y:z[1]},b:300,on:true}];t.opening={'0,0':true};
  const before=Engine.clone(p),old=Engine.floorModel(Engine.generate(p),1).walls[0];Engine.setRegion(p,'F1','0,0','building',true);GeometryIssuesLocal.syncBoundary(p,before);
  const next=Engine.floorModel(Engine.generate(p),1),w=next.walls[0],r=Engine.rect(w);
  out.push({id,expected,actual:[r.x,r.y],same:JSON.stringify(old.a)===JSON.stringify(w.a)&&JSON.stringify(old.z)===JSON.stringify(w.z),inside:Engine.rectAllowed(next.ts,r.x,r.y,r.w,r.d,true)});
 }
 return out;
});
for(const e of edges){assert.deepEqual(e.actual,e.expected);assert(e.same&&e.inside);}console.log('PASS all four exterior edges, reversed endpoints, Opening restored without moving the automatic outer wall outside');
const manual=run(p,p=>{
 const t=p.types.F1;t.walls=[{id:'W',a:{x:0,y:1},z:{x:0,y:7},b:300,on:true,axisPosition:'left'}];
 const before=JSON.stringify(t.walls),r=Engine.generate(p),w=Engine.floorModel(r,1).walls[0];
 return {unchanged:before===JSON.stringify(t.walls),x:Engine.rect(w).x,warning:r.issues.some(i=>i.id==='W'&&i.msg.includes('手動牆身越出建築範圍')),panel:GeometryIssuesLocal.panel(p,r,'F1')};
});assert(manual.unchanged&&manual.warning);assert.equal(manual.x,-.15);assert(manual.panel.includes('手動牆身越出建築範圍'));console.log('PASS explicit outward offset retained with visible model diagnostic');
const contacts=run(p,p=>{
 p.total=1;p.groups=[{...p.groups[0],end:'顶层'}];p.axes.x=[{id:'1',gap:0},{id:'2',gap:5},{id:'3',gap:5}];const t=p.types.F1;
 t.building={'0,0':true,'1,0':true};t.opening={'0,0':true};t.columns=[];t.walls=[{id:'W',a:{x:5,y:0},z:{x:5,y:8},b:300,on:true}];
 t.beams=[{id:'B',kind:'MB',a:{x:5,y:2},z:{x:10,y:2},b:300,widthMode:'manual',d:600,on:true}];
 // Draw a wall-face contact on the opposite side, then change the OP side.
 t.opening={'1,0':true};t.beams[0].a={x:0,y:2};t.beams[0].z={x:5,y:2};
 let m=Engine.floorModel(Engine.generate(p),1);t.beams[0].z={x:m.beams[0].z[0],y:2};
 const before=Engine.clone(p),oldWalls=JSON.stringify(t.walls),raw=JSON.stringify(t.beams[0].z);Engine.setRegion(p,'F1','1,0','building',true);GeometryIssuesLocal.syncBoundary(p,before);
 const r=Engine.generate(p);m=Engine.floorModel(r,1);const b=m.beams[0],w=m.walls[0],opts=Loading.supportOptions(m,b,'z');
 return {wallX:w.a[0],end:b.z[0],face:w.a[0]-w.b/2,width:b.b,rawSame:raw===JSON.stringify(t.beams[0].z),wallsSame:oldWalls===JSON.stringify(t.walls),support:opts.some(o=>o.type==='WALL'&&o.member.id==='W'),saved:JSON.stringify(Engine.floorModel(Engine.generate(Engine.clone(p)),1).beams)===JSON.stringify(m.beams)};
});assert.equal(contacts.end,contacts.face);assert.equal(contacts.width,.3);assert(contacts.rawSame&&contacts.wallsSame&&contacts.support&&contacts.saved);console.log('PASS existing manual beam follows the changed wall face; width, reference, identity, save/reopen and support resolution retained');
const guards=run(null,()=>{
 const ts=[{x0:0,x1:10,y0:0,y1:8,state:1}],bad=Engine.wallPosition(ts,[0,0],[0,8],12),outside=Engine.wallPosition(ts,[-1,0],[-1,8],.3),mixed=[{x0:0,x1:5,y0:0,y1:4,state:1},{x0:5,x1:10,y0:4,y1:8,state:1}];
 return {bad,outside,mixed:Engine.wallPosition(mixed,[5,0],[5,8],.3)};
});assert.equal(guards.bad,null);assert.equal(guards.outside,null);assert.equal(guards.mixed,null);console.log('PASS impossible thickness, outside reference and contradictory exterior directions rejected');
for(const snapshot of [false,true]){
 const tracked=run({p,snapshot},({p,snapshot})=>{
  p.total=1;p.groups=[{...p.groups[0],end:'顶层'}];p.axes.x=[{id:'1',gap:0},{id:'2',gap:5},{id:'3',gap:5}];const t=p.types.F1;
  t.building={'0,0':true,'1,0':true};t.opening={};t.walls=[{id:'W',a:{x:5,y:0},z:{x:5,y:8},b:300,on:true,axisPosition:'center'}];
  const b={id:'FACE',kind:'SB',a:{x:0,y:2},z:{x:4.85,y:2},b:300,widthMode:'manual',d:600,on:true};t.beams=[b];
  if(snapshot){t.beams=[];t.autoBeamSnapshot={secondary:[{...b,a:[0,2],z:[4.85,2],rawA:[0,2],rawZ:[4.85,2],b:.3,d:.6}],main:[],primary:[]};}
  const old=Engine.clone(p);t.walls[0].axisPosition='right';GeometryIssuesLocal.syncBoundary(p,old);
  const record=snapshot?t.autoBeamSnapshot.secondary[0]:t.beams[0],m=Engine.floorModel(Engine.generate(p),1),beam=m.beams.find(b=>b.id==='FACE'),link=record.wallSupports302.z;
  // A later intentional endpoint edit must not retain the old attachment.
  if(snapshot){record.z=[4,2];record.rawZ=[4,2];}else record.z={x:4,y:2};
  const changed=Engine.floorModel(Engine.generate(p),1).beams.find(b=>b.id==='FACE');
  return {followed:beam.z[0],link,edited:changed.z[0]};
 });assert.equal(tracked.followed,5);assert.deepEqual(tracked.link.raw,[4.85,2]);assert.equal(tracked.edited,4);
}console.log('PASS non-axis face contacts for manual and snapshot SBs; later deliberate endpoint edits invalidate stale links');
if(process.argv[2]){
 const current=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const report=run(current,p=>{
  const original=JSON.stringify(p),key='F01',out=[];
  for(const side of ['auto','center','left','right']){
   const q=Engine.clone(p),t=q.types[key],tile=Engine.tiles(q,t).find(t=>t.k==='0,0'),mid=(tile.y0+tile.y1)/2,w=t.walls.find(w=>{const a=Engine.resolve(q,w.a,key),z=Engine.resolve(q,w.z,key);return a[0]===tile.x0&&z[0]===tile.x0&&Math.min(a[1],z[1])<mid&&Math.max(a[1],z[1])>mid;});
   w.axisPosition=side;Engine.setRegion(q,key,'0,0','opening',true);const before=Engine.clone(q);Engine.setRegion(q,key,'0,0','building',true);GeometryIssuesLocal.syncBoundary(q,before);
   const r=Engine.generate(q),m=Engine.floorModel(r,1),actual=m.walls.find(a=>a.id===w.id),box=Engine.rect(actual),issues=r.issues.filter(i=>i.type===key&&i.id===w.id);
   const saved=Engine.clone(q),again=Engine.floorModel(Engine.generate(saved),1);
   out.push({side,inside:Engine.rectAllowed(m.ts,box.x,box.y,box.w,box.d,true),warning:issues.some(i=>i.msg.includes('手動牆身越出建築範圍')),wallCount:m.walls.length,beamCount:m.beams.length,reopen:JSON.stringify(m.walls)===JSON.stringify(again.walls)&&JSON.stringify(m.beams)===JSON.stringify(again.beams)});
  }
  return {out,unchanged:JSON.stringify(p)===original};
 });assert(report.unchanged);for(const row of report.out){assert(row.reopen);if(['center','left'].includes(row.side))assert(row.warning&&!row.inside);else assert(row.inside&&!row.warning);}console.log('PASS current private model variants and complete save/reopen geometry:',JSON.stringify(report));
}
