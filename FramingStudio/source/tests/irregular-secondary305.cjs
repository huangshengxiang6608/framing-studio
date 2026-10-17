// Public synthetic fixtures; private project validation remains local.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{context}=require('./audit-performance247.cjs');
const c=context(),run=(p,f)=>JSON.parse(JSON.stringify(c.run('('+f.toString()+')(argument)',p)));
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../engine.js'),'utf8').replace('const Engine=','const Probe305=').replace('return {columnReferenceAxes289,','return {irregularBays305,irregularSpans305,bayEdges171,beamBays171,columnReferenceAxes289,'),c.ctx);
const topology=run(null,()=>{
 const out=[];
 for(const vertical of [false,true])for(const shape of ['L','U']){
  const points=shape==='L'?[[0,0],[6,0],[6,4],[10,4],[10,10],[0,10]]:[[0,0],[3,0],[3,6],[7,6],[7,0],[10,0],[10,10],[0,10]],xy=([x,y])=>vertical?[y,x]:[x,y];
  const edges=points.map((p,i)=>({id:'W'+i,kind:'WALL',a:xy(p),z:xy(points[(i+1)%points.length]),rawA:xy(p),rawZ:xy(points[(i+1)%points.length]),b:.3})),ts=[{x0:0,x1:10,y0:0,y1:10,state:1}],regions=Probe305.irregularBays305(edges,ts,[]);
  if(regions.length!==1)throw Error('Closed face missing');
  for(const direction of ['X','Y','自动']){
   const spans=Probe305.irregularSpans305(regions[0],edges,direction,3);if(!spans.length)throw Error('No spans');
   for(const b of spans){const axis=b.a[1]===b.z[1]?0:1,cross=1-axis;for(const p of [b.a,b.z])if(!edges.some(e=>e.rawA[axis]===e.rawZ[axis]&&p[axis]===e.rawA[axis]&&p[cross]>=Math.min(e.rawA[cross],e.rawZ[cross])&&p[cross]<=Math.max(e.rawA[cross],e.rawZ[cross])))throw Error('Virtual support');}
   out.push({vertical,shape,direction,spans:spans.length});
  }
  if(Probe305.irregularBays305(edges.slice(1),ts,[]).length)throw Error('Open perimeter accepted');
  const gap=Engine.clone(edges);gap[0].rawA=gap[0].rawA.map((v,i)=>i===(vertical?1:0)?v+.01:v);if(Probe305.irregularBays305(gap,ts,[]).length)throw Error('Real 10 mm gap bridged');
  const opening=[{x0:0,x1:10,y0:0,y1:5,state:1},{x0:0,x1:10,y0:5,y1:10,state:2}];if(Probe305.irregularBays305(edges,opening,[]).length)throw Error('Opening treated as support');
 }
 const edge=(id,a,z)=>({id,kind:'MB',a,z,rawA:a,rawZ:z,b:.3}),edges=[edge('left',[0,0],[0,10]),edge('right',[10,0],[10,10]),edge('real',[4,0],[4,10])],region={x0:0,x1:10,y0:0,y1:10,rects:[{x0:0,x1:6,y0:0,y1:4},{x0:0,x1:10,y0:4,y1:10}]};
 const spans=Probe305.irregularSpans305(region,edges,'X',3);if(spans.some(b=>b.a[0]===6||b.z[0]===6)||!spans.some(b=>b.z[0]===4)||spans.some(b=>b.a[0]<4&&b.z[0]>4))throw Error('Actual/virtual subdivision confused');
 return out;
});assert.equal(topology.length,12);console.log('PASS L/U, both orientations and X/Y/auto; real endpoints, real internal primary cuts, open perimeters, 10 mm gaps and Opening guards');
const fixtures=run(require('./wall-copy292.cjs').fixture(),p=>{
 p.total=1;p.groups=[{...p.groups[0],end:'顶层'}];p.axes.y[1].gap=10;const out=[];
 for(const reverse of [false,true])for(const direction of ['X','Y']){
  const q=Engine.clone(p),t=q.types.F1,points=[[1,1],[6,1],[6,4],[9,4],[9,9],[1,9]];t.walls=points.map((a,i)=>{let z=points[(i+1)%points.length];if(reverse)[a,z]=[z,a];return {id:'W'+i,a:{x:a[0],y:a[1]},z:{x:z[0],y:z[1]},b:300,on:true,axisPosition:'center'};});t.beams=[];t.columns=[];t.autoBeams101=true;t.beamLayout116={main:false,secondary:true,mainDirection:'XY',secondaryDirection:direction,gap:2000,scope:'all'};
  let m=Engine.floorModel(Engine.generate(q),1),sb=m.beams.filter(b=>b.kind==='SB');if(sb.length!==3)throw Error('Expected 3 L spans '+sb.length);
  if(m.panels.length)throw Error('Virtual rectangular bays leaked into calculation model');
  const scoped=Engine.clone(q);scoped.types.F1.secondaryAreas=[{id:'L',name:'L',direction,gap:2000,rects:[{x0:1,x1:6,y0:1,y1:4},{x0:1,x1:9,y0:4,y1:9}]}];scoped.types.F1.beamLayout116.scope='selected';const selected=Engine.floorModel(Engine.generate(scoped),1);if(selected.beams.filter(b=>b.kind==='SB').length!==3||selected.issues.some(i=>/次梁区域已无/.test(i.msg)))throw Error('Valid selected L region rejected');
  for(const b of sb)for(const end of ['a','z'])if(!Loading.supportOptions(m,b,end).some(v=>v.type==='WALL'))throw Error('Physical wall support missing');
  const deleted=sb[1],token=Loading.token('SB',deleted);Engine.removeMembers(q,'F1',[{id:deleted.id,kind:'SB',f:1}],1);const suppressed=JSON.stringify(t.suppressed);
  Engine.freezeAutoBeams(q,'F1',Engine.floorModel(Engine.generate(q),1));Engine.validate(q);m=Engine.floorModel(Engine.generate(Engine.clone(q)),1);sb=m.beams.filter(b=>b.kind==='SB');if(sb.length!==2||sb.some(b=>Loading.token('SB',b)===token)||JSON.stringify(t.suppressed)!==suppressed)throw Error('Deletion lost');
  const rebuilt=BeamLayout116.candidate(q,'F1','secondary',{secondaryDirection:direction,gap:2000,scope:'all'},false);if(Engine.floorModel(rebuilt.result,1).beams.filter(b=>b.kind==='SB').length!==2)throw Error('Non-restoring rebuild lost deletion');
  out.push({reverse,direction,remaining:sb.length});
 }return out;
});assert.equal(fixtures.length,4);console.log('PASS physical L-region wall contacts, reversed walls, no virtual calculation bays, deletion, freeze, save/reopen and non-restoring rebuild');
