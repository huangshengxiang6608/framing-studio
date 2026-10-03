// Synthetic engineering regressions; no user project data.
function loading126Tests(){
 const passed=[],assert=(v,n)=>{if(!v)throw Error(n);},near=(a,b,n)=>assert(Number.isFinite(a)&&Math.abs(a-b)<1e-7,n+': '+a+' / '+b),copy=Engine.clone;
 const fixtures=loading115Tests().projects,rect=r=>({x0:r.x-r.w/2,x1:r.x+r.w/2,y0:r.y-r.d/2,y1:r.y+r.d/2});
 // Independent cell oracle, not the production union/subtraction routines.
 function oracle(m){
  const solids=m.walls.map(Engine.rect).concat(m.columns.filter(c=>c.status!=='上层柱').map(Engine.columnRect)).map(rect),holes=m.slabVoids||[],beam=m.beams.map(Engine.rect).map(rect),all=[...m.ts,...solids,...holes,...beam,...m.slabs.flatMap(s=>s.rects)],cuts=dim=>[...new Set(all.flatMap(r=>[r[dim+'0'],r[dim+'1']]))].sort((a,b)=>a-b),xs=cuts('x'),ys=cuts('y'),has=(r,x,y)=>x>r.x0&&x<r.x1&&y>r.y0&&y<r.y1;
  let surface=0,top=0,net=0;for(let i=1;i<xs.length;i++)for(let j=1;j<ys.length;j++){const x=(xs[i]+xs[i-1])/2,y=(ys[j]+ys[j-1])/2,area=(xs[i]-xs[i-1])*(ys[j]-ys[j-1]);if(!m.ts.some(r=>r.state===1&&has(r,x,y))||[...solids,...holes].some(r=>has(r,x,y)))continue;surface+=area;if(beam.some(r=>has(r,x,y)))top+=area;else net+=area;}return {surface,top,net};
 }
 function checkSurface(p,label){
  const before=JSON.stringify(p),r=Engine.generate(p),m=Engine.floorModel(r,1),expected=oracle(m),out=Loading.run(p,r),br=out.rows.filter(r=>['MB','SB','TB','CB'].includes(r.kind));
  near(br.reduce((n,r)=>n+r.loading.surfaceArea,0),expected.top,label+' beam union area');
  near(m.slabs.reduce((n,s)=>n+s.area,0),expected.net,label+' net slab area');
  const wrappers=m.beams.map(member=>({member,kind:member.kind,token:Loading.token(member.kind,member)})),patches=LoadRegions83.beamSurface(p,1,m,wrappers).flatMap(x=>x.rects);
  for(let i=0;i<patches.length;i++)for(let j=0;j<i;j++)assert(!LoadRegions83.intersect(patches[i],patches[j]),label+' intersection counted once');
  const applied=br.flatMap(r=>r.loading.automaticLines).filter(l=>l.surface126),base=LoadData.floor(p,1);
  for(const [k,w]of [['g',base.sdl],['q',base.ll]]){const total=applied.reduce((n,l)=>n+l[k]*(l.end-l.start),0),bound=applied.reduce((n,l)=>n+.0100001*(l.end-l.start),0);assert(total>=expected.top*w-1e-6&&total-expected.top*w<bound+1e-6,label+' beam-top '+k+' conserved with upward rounding');}
  assert(before===JSON.stringify(p),label+' inputs unchanged');return {r,m,out,expected};
 }
 for(const width of [150,250,600,1000])for(const reverse of [false,true]){
  const p=copy(fixtures.slab),t=p.types.F1;for(const b of t.beams){b.b=width;b.d=600;if(reverse)[b.a,b.z]=[b.z,b.a];}LoadData.setFloor(p,1,{dl:10,sdl:1.5,ll:5});checkSurface(p,'width '+width+' reverse '+reverse);
 }
 passed.push('Net concrete and full beam-top SDL/LL coverage for four widths and reversed beam endpoints');
 const base=copy(fixtures.slab),t=base.types.F1;t.beams.push({id:'MID',kind:'SB',a:{x:0,y:2},z:{x:6,y:2},b:250,d:400,on:true});LoadData.setFloor(base,1,{dl:10,sdl:1.5,ll:5});
 let checked=checkSurface(base,'secondary intersections');
 const all=checked.out.rows.filter(r=>r.kind==='COL');assert(all.every(r=>!r.loadErrors.length),'Complete transfer path remains valid');
 const Q=all.reduce((n,r)=>n+r.loading.live,0);assert(Q>=checked.expected.surface*5-1e-6&&Q-checked.expected.surface*5<.3,'Total base reactions conserve occupied-floor Q');
 const flipped=copy(base);flipped.types.F1.beams.reverse();flipped.types.F1.beams.forEach(b=>[b.a,b.z]=[b.z,b.a]);let other=Loading.run(flipped,Engine.generate(flipped));for(const row of all)near(other.rows.find(r=>r.id===row.id).loading.live,row.loading.live,'Stable ownership on reorder/reverse '+row.id);
 passed.push('Secondary-to-main intersections counted once; total reactions, member reordering and reversal');
 for(const kind of ['void','opening','wall','offset','upper']){
  const p=copy(base),t=p.types.F1;
  if(kind==='void')t.slabVoids=[{x0:2,x1:4,y0:1.8,y1:2.2}];
  if(kind==='opening'){p.axes.x=[{id:'1',gap:0},{id:'2',gap:3},{id:'3',gap:3}];t.building['1,0']=true;t.opening['1,0']=true;}
  if(kind==='wall')t.walls=[{id:'W',a:{x:3,y:0},z:{x:3,y:4},b:300,on:true}];
  if(kind==='offset')t.beams.find(b=>b.id==='MID').a.x=.125;
  if(kind==='upper')t.columns.push({id:'UPPER',x:3,y:2,b:1000,d:1000,on:true,status:'上层柱'});
  checkSurface(p,kind);
 }
 passed.push('Openings, removed floor, solid walls, offset sections and display-only upper columns');
 // A panel assignment follows its share of the adjacent beam top, while exact
 // coordinate areas are clipped at their saved coordinates.
 const regional=copy(base);let r=Engine.generate(regional),m=Engine.floorModel(r,1),slabs=[...m.slabs].sort((a,b)=>a.y0-b.y0);
 assert(slabs.length===2,'Two regional panels');LoadData.setFloor(regional,1,{dl:10,sdl:null,ll:null});
 for(let i=0;i<2;i++){const area=LoadData.addArea(regional,1);Object.assign(area,{name:'Panel '+i,dl:10,sdl:i?1:3,ll:i?2:8,panels:[Loading.token('SLAB',slabs[i])]});}
 const regions=Loading.run(regional,r),mid=regions.rows.find(r=>r.id==='MID');assert(mid.actions,'Panel regions cover the adjoining beam top: '+mid.loadErrors.join(';'));
 const top=mid.loading.lines.filter(l=>l.surface126);assert(top.length>0,'Regional beam top exists');for(const l of top){near(l.q,1.25,'Half beam width for each panel LL');near(l.g,.5,'Half beam width for each panel SDL');}
 assert(regions.rows.filter(r=>['MB','SB'].includes(r.kind)).every(r=>r.actions),'All assigned panel top surfaces have valid loads');
 const exact=copy(base),area=LoadData.addArea(exact,1);Object.assign(area,{name:'Exact strip',dl:10,sdl:4,ll:8,rects:[{x0:1,x1:3,y0:0,y1:.25}]});
 const bx=Loading.run(exact,Engine.generate(exact)).rows.find(r=>r.id==='B1'),lines=bx.loading.automaticLines.filter(l=>l.surface126),a=bx.member.rawA[0];
 assert(bx.actions,'Exact beam-top region passes surface validation');
 assert(lines.some(l=>Math.abs(l.start-(1-a))<1e-7&&Math.abs(l.end-(3-a))<1e-7&&Math.abs(l.q-2)<1e-7),'Exact regional strip replaces default only on its saved footprint');
 const migrated=copy(exact);delete migrated.slabBoundary120;const originalRegion=JSON.stringify(migrated.explorer.areas[1][0].rects);Engine.generate(migrated);assert(JSON.stringify(migrated.explorer.areas[1][0].rects)===originalRegion,'Legacy coordinate region retains beam-top surface after migration');
 const conflict=copy(regional);conflict.explorer.areas[1].push({...copy(conflict.explorer.areas[1][0]),id:'OVERLAP',name:'Overlap'});assert(Loading.run(conflict,Engine.generate(conflict)).rows.find(r=>r.id==='MID').loadErrors.some(e=>e.includes('重叠')),'Overlapping beam-top regions stay pending');
 const missing=copy(base);LoadData.setFloor(missing,1,{dl:10,sdl:1.5,ll:null});const missingRow=Loading.run(missing,Engine.generate(missing)).rows.find(r=>r.id==='B1');assert(!missingRow.actions&&missingRow.loadErrors.some(x=>x.includes('梁顶')),'Missing beam-top LL stays pending');
 const endSlab={rects:[{x0:2,x1:4,y0:0,y1:2}]},endModel={slabs:[endSlab],beams:[{a:[0,1],z:[2,1],b:.2}]},endArea=copy(base);endArea.explorer.areas[1]=[{id:'END',name:'End contact',panels:[Loading.token('SLAB',endSlab)],dl:10,sdl:2,ll:5}];near(LoadRegions83.surfaceRegions(endArea,1,endModel)[0].rects.reduce((n,r)=>n+LoadRegions83.area(r),0),4,'Beam end contact does not extend a panel region along the beam length');
 passed.push('Panel-region half-widths, outer beam widths, exact coordinate overrides and missing-input guards');
 // Code Eq. 5.4 example independent of the force model: 2.125 + .1 + .1.
 const slab={id:'SL-SAMPLE',x0:1,x1:5.5,y0:1,y1:3.125,rects:[{x0:1,x1:5.5,y0:1,y1:3.125}],area:4.5*2.125,rectangular:true,netBoundary120:true,thickness:200};
 const member=(id,a,z,b)=>({id,kind:'MB',a,z,rawA:a,rawZ:z,b,d:.6}),support={columns:[],walls:[],beams:[member('MB',[.5,.5],[6,.5],1),member('SB',[.5,3.25],[6,3.25],.25)]};
 let span=Loading.slabSpan(slab,'Y',support);near(span.clear,2.125,'Sample net span');near(span.effective,2.325,'Sample effective span');
 near(Loading.slabSpan(slab,'Y',support,'top').effective,2.225,'Cantilever root extension only');
 const narrow=copy(support);narrow.beams[1]=member('SB',[.5,3.175],[6,3.175],.1);near(Loading.slabSpan(slab,'Y',narrow).effective,2.275,'Narrow support controls extension');
 const transpose=o=>{const n=copy(o);for(const b of n.beams){b.a.reverse();b.z.reverse();b.rawA.reverse();b.rawZ.reverse();}return n;},sx={...slab,x0:slab.y0,x1:slab.y1,y0:slab.x0,y1:slab.x1};near(Loading.slabSpan(sx,'X',transpose(support)).effective,2.325,'X/Y span symmetry');
 const gap=copy(support);gap.beams[1].a[1]+=.01;gap.beams[1].z[1]+=.01;assert(Loading.slabSpan(slab,'Y',gap).effective===null,'No fabricated span over support gap');
 const duplicate=copy(support);duplicate.beams.push(copy(duplicate.beams[0]));assert(Loading.slabSpan(slab,'Y',duplicate).effective===null,'Ambiguous support does not create an effective span');
 passed.push('Effective span, unequal/narrow supports, X/Y, cantilever root and invalid-support guards');
 // Design span goes to every existing calculation consumer; transfer uses net
 // geometry. Native report templates are not modified.
 const design=copy(fixtures.slab),dr=Engine.generate(design),s=Engine.floorModel(dr,1).slabs[0],token=Loading.token('SLAB',s);design.explorer.selected['1|'+token]=true;design.explorer.reportA['1|'+token]=true;design.explorer.reportB['1|'+token]=true;
 const result=Loading.run(design,dr),row=result.rows.find(r=>r.token===token);near(row.loading.clearSpan,3.5,'Net span retained');near(row.loading.L,3.7,'Design uses effective span');near(row.result.inputs.C2,3700,'Section B check input');
 const reactionQ=row.slabReactions.reduce((n,e)=>n+e.q*e.length,0);near(reactionQ,s.area*2,'Effective span adds no slab load');
 for(const sec of ['A','B']){const plan=RCPlan.build(design,sec);assert(plan.issues.length===0,sec+' native plan ready');near(plan.batches[0].cells.B34,3.7,sec+' native span input');}
 const changed=copy(design);changed.types.F1.slabSizes=[{signature:SlabGeometry120.signature(s),value:180}];const rr=Loading.run(changed,Engine.generate(changed)).rows.find(r=>r.token===token);near(rr.loading.L,3.68,'Slab depth updates effective span');near(rr.slabReactions.reduce((n,e)=>n+e.q*e.length,0),reactionQ,'Slab depth does not enlarge LL area');
 passed.push('Section A/B native input parity; effective span does not alter slab LL or floor area');
 return {passed};
}
