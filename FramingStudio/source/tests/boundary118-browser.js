// Synthetic boundary regression cases; no user project is embedded here.
function boundary118Tests(){
 const passed=[],fail=(x,m)=>{if(!x)throw Error(m);},near=(a,b,m)=>fail(Number.isFinite(a)&&Math.abs(a-b)<1e-7,m+': '+a+' != '+b);
 const cells={rectangle:['0,0','1,0','2,0','0,1','1,1','2,1','0,2','1,2','2,2'],L:['0,0','0,1','0,2','1,2','2,2'],U:['0,0','0,1','0,2','1,2','2,2','2,1','2,0'],hole:['0,0','1,0','2,0','0,1','2,1','0,2','1,2','2,2'],steps:['0,0','0,1','1,1','0,2','1,2','2,2']};
 function fixture(name,flip=false){
  const occupied=new Set(cells[name]),point=(x,y)=>({x,y}),p={format:'framing-app',version:1,name:'Boundary regression '+name,total:1,axes:{x:['1','2','3','4'].map((id,i)=>({id,gap:i?2:0})),y:['A','B','C','D'].map((id,i)=>({id,gap:i?2:0}))},defaults:{cb:300,cd:300,gap:3000,direction:'自动',mb:250,sb:250,tb:600,tbd:1200,slab:200,wall:300},groups:[{end:'顶层',h:3.5,type:'F1',sh:500,min:0,headroom:2.5,em:.5}],types:{F1:{mode:'manual',autoBeams101:false,building:Object.fromEntries([...occupied].map(k=>[k,true])),opening:{},columns:[],walls:[],beams:[],suppressed:[],beamDepth:500}}};
  const t=p.types.F1,add=(a,z)=>{if(flip)[a,z]=[z,a];t.beams.push({id:'EDGE'+(t.beams.length+1),kind:'MB',a:point(...a),z:point(...z),b:250,d:500,on:true});};
  for(const k of occupied){const [i,j]=k.split(',').map(Number),x=i*2,y=j*2;if(!occupied.has((i-1)+','+j))add([x,y],[x,y+2]);if(!occupied.has((i+1)+','+j))add([x+2,y],[x+2,y+2]);if(!occupied.has(i+','+(j-1)))add([x,y],[x+2,y]);if(!occupied.has(i+','+(j+1)))add([x,y+2],[x+2,y+2]);}
  LoadData.setFloor(p,1,{usage:'Dormitory',dl:10,sdl:1,ll:2});return p;
 }
 // Independent oracle: a line's physical source must have material immediately
 // on exactly one side, and integrating all receiving edges conserves load.
 function inspect(p,dir,section,areaTracing=false){
  const r=Engine.generate(p),m=Engine.floorModel(r,1);fail(m.slabs.length===1,'fixture has one connected slab');const s=m.slabs[0];BeamLayout116.setDirections(p,'F1',[s],dir);
  const out=Loading.run(p,Engine.generate(p),section,areaTracing),rows=out.rows.filter(r=>['MB','SB','CB','TB'].includes(r.kind)),spanAxis=dir==='X'?0:1,along=1-spanAxis;let g=0,q=0,len=0,trace=0;
  for(const row of rows)for(const l of row.loading.automaticLines){
   fail(l.start>=-1e-7&&l.end<=row.loading.L+1e-7,'line lies within receiving beam');
   const a=row.member.rawA,z=row.member.rawZ,L=Math.hypot(z[0]-a[0],z[1]-a[1]),mid=a.map((v,i)=>v+(z[i]-v)*(l.start+l.end)/(2*L)),inside=point=>s.rects.some(r=>point[0]>r.x0&&point[0]<r.x1&&point[1]>r.y0&&point[1]<r.y1),low=[...mid],high=[...mid];low[spanAxis]-=1e-5;high[spanAxis]+=1e-5;
   fail(inside(low)!==inside(high),'line touches actual slab boundary, never an empty bounding-box edge: '+row.id+' '+JSON.stringify(mid));fail(Math.abs(a[spanAxis]-z[spanAxis])<1e-8,'receiver perpendicular to slab span');
   g+=l.g*(l.end-l.start);q+=l.q*(l.end-l.start);len+=l.end-l.start;trace+=(l.sources101||[]).reduce((v,s)=>v+s.area,0);
  }
  const net=LoadRegions83.netSelfWeight(s,m).reduce((v,r)=>v+LoadRegions83.area(r),0),parts=LoadRegions83.pieces(p,1,s),expectedG=(section==='B'?net*4.9:0)+parts.reduce((v,r)=>v+LoadRegions83.area(r)*(r.load.sdl+(section==='A'?r.load.dl:0)),0),expectedQ=parts.reduce((v,r)=>v+LoadRegions83.area(r)*r.load.ll,0);
  fail(g>=expectedG-1e-7&&g-expectedG<=.01*len+1e-7,'dead load conserved including roundup '+g+'/'+expectedG);fail(q>=expectedQ-1e-7&&q-expectedQ<=.01*len+1e-7,'live load conserved');if(areaTracing)near(trace,expectedQ,'source tracing conserved');
  if(!s.rectangular){fail(rows.filter(r=>r.loading.automaticLines.length).every(r=>!r.actions&&r.loadErrors.length),'irregular slab does not bypass design validation');}
  return {p,rows,g,q,s};
 }
 for(const shape of Object.keys(cells))for(const dir of ['X','Y'])for(const reverse of [false,true])for(const section of ['A','B']){inspect(fixture(shape,reverse),dir,section,true);passed.push(shape+' '+dir+' '+(reverse?'reversed':'forward')+' Section '+section);}
 const regional=fixture('U');const area=LoadData.addArea(regional,1);Object.assign(area,{name:'Local loading',dl:20,sdl:2,ll:5,rects:[{x0:.3,x1:1.4,y0:1,y1:5.5}]});for(const section of ['A','B'])for(const dir of ['X','Y'])inspect(Engine.clone(regional),dir,section,true);passed.push('Different partial load regions on a U-shaped slab preserve force and source tracing');
 // Inset border beams leave a connected peripheral lobe whose envelope crosses
 // another, independent corner slab. It must not load the remote corner beam.
 for(const transpose of [false,true])for(const reverse of [false,true]){
  const p=fixture('rectangle'),t=p.types.F1;t.beams=[];const pt=q=>({x:q[transpose?1:0],y:q[transpose?0:1]}),add=(id,a,z)=>{if(reverse)[a,z]=[z,a];t.beams.push({id,kind:'MB',a:pt(a),z:pt(z),b:250,d:500,on:true});};
  for(const [id,a,z]of [['IN_TOP',[.4,.4],[4,.4]],['IN_LEFT',[.4,.4],[.4,4]],['IN_RIGHT',[4,.4],[4,4]],['IN_BOTTOM',[.4,4],[4,4]],['RIGHT_CUT',[4,4],[6,4]],['BOTTOM_CUT',[4,4],[4,6]],['TIP_BOTTOM',[4,6],[6,6]],['REMOTE',[6,4],[6,6]]])add(id,a,z);
  const r=Engine.generate(p),m=Engine.floorModel(r,1),outer=m.slabs.find(s=>!s.rectangular);fail(outer,'inset peripheral slab exists');BeamLayout116.setDirections(p,'F1',m.slabs,transpose?'Y':'X');
  for(const section of ['A','B']){const rows=Loading.run(p,Engine.generate(p),section).rows,remote=rows.find(r=>r.id==='REMOTE');fail(remote.loading.automaticLines.length>0,'corner slab still loads remote beam');fail(remote.loading.automaticLines.every(l=>l.label!==outer.id),'peripheral slab never jumps to remote beam');fail(!remote.loadErrors.some(e=>e.startsWith(outer.id+'：')||e.startsWith(outer.id+' 荷载')),'remote beam not marked as directly carrying peripheral slab');}
  passed.push('Inset boundary with separate corner, '+(transpose?'transposed':'original')+', '+(reverse?'reversed':'forward'));
 }
 const missing=fixture('rectangle');missing.types.F1.beams=missing.types.F1.beams.filter(b=>!(b.a.x===0&&b.z.x===0&&Math.min(b.a.y,b.z.y)===2));const mr=Engine.generate(missing),ms=Engine.floorModel(mr,1).slabs[0];BeamLayout116.setDirections(missing,'F1',[ms],'X');const missingRows=Loading.run(missing,Engine.generate(missing),'B').rows;fail(missingRows.find(r=>r.kind==='SLAB').loadErrors.some(e=>e.includes('支承边不完整')),'gap support is not invented');fail(missingRows.filter(r=>r.kind==='MB'&&r.loading.automaticLines.length).every(r=>!r.actions),'missing support blocks actions');passed.push('Missing boundary segment stays unconfirmed');
 return {passed,fixture:fixture('U')};
}
