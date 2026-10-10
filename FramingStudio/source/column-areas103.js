// Geometric tributary areas. No unit-load cases or force-to-area conversion.
const ColumnAreas103=(()=>{
 const eps=1e-7,R=LoadRegions83;
 let stamp='',cache=new Map();
 // Loading runs use immutable project/model snapshots. Hash that pair once per
 // scoped run; interactive calls outside the scope still detect in-place edits.
 const snapshots228=new WeakMap();
 function snapshot228(p,result){
  let entries=snapshots228.get(p);if(!entries){entries=new Map();snapshots228.set(p,entries);}
  let entry=entries.get(result);if(!entry){entry={key:JSON.stringify([p,result]),count:0};entries.set(result,entry);}entry.count++;
  let released=false;return ()=>{if(released)return;released=true;if(--entry.count===0)entries.delete(result);if(!entries.size)snapshots228.delete(p);};
 }

 const area=R.area,copy=x=>JSON.parse(JSON.stringify(x)),a=b=>b.rawA||b.a,z=b=>b.rawZ||b.z;
 const active=m=>m.columns.filter(c=>c.status!=='上层柱');
 function point(p,m,c){
  // A saved axis reference and a physical centre are different coordinates.
  // Use actual centres consistently for copied, aligned and offset columns.
  const r=Engine.columnRect(c);return [r.x,r.y];
 }
 // Resolve well-bounded rectangular half-bays first; less constrained columns
 // receive the remaining area. Equal-priority candidates retain an exact
 // equal-distance split, never a column-order or identifier tie breaker.
 const rectangle=r=>[[r.x0,r.y0],[r.x1,r.y0],[r.x1,r.y1],[r.x0,r.y1]];
 const polygonArea=ps=>Math.abs(ps.reduce((s,q,i)=>{const r=ps[(i+1)%ps.length];return s+q[0]*r[1]-r[0]*q[1];},0))/2;
 const bounds=ps=>({x0:Math.min(...ps.map(q=>q[0])),x1:Math.max(...ps.map(q=>q[0])),y0:Math.min(...ps.map(q=>q[1])),y1:Math.max(...ps.map(q=>q[1]))});
 function tidy(ps){
  ps=ps.filter((q,i)=>{const r=ps[(i+ps.length-1)%ps.length];return Math.hypot(q[0]-r[0],q[1]-r[1])>eps;});
  let changed=true;while(changed&&ps.length>3){changed=false;ps=ps.filter((q,i)=>{const u=ps[(i+ps.length-1)%ps.length],v=ps[(i+1)%ps.length],cross=(q[0]-u[0])*(v[1]-q[1])-(q[1]-u[1])*(v[0]-q[0]);if(Math.abs(cross)<eps){changed=true;return false;}return true;});}
  return ps.length>=3&&polygonArea(ps)>eps?ps:[];
 }
 function half(ps,nx,ny,k){
  if(!ps.length)return [];const out=[];
  for(let i=0;i<ps.length;i++){const u=ps[i],v=ps[(i+1)%ps.length],du=nx*u[0]+ny*u[1]-k,dv=nx*v[0]+ny*v[1]-k,inU=du<=0,inV=dv<=0;if(inU)out.push(u);if(inU!==inV){const t=du/(du-dv);out.push([u[0]+t*(v[0]-u[0]),u[1]+t*(v[1]-u[1])]);}}
  return tidy(out);
 }
 function clipPolygon(ps,r){return half(half(half(half(ps,-1,0,-r.x0),1,0,r.x1),0,-1,-r.y0),0,1,r.y1);}
 function subtractPolygon(ps,r){if(!ps.length)return [];const b=bounds(ps);if(!R.intersect(b,r))return [ps];return R.subtract(b,r).map(q=>clipPolygon(ps,q)).filter(q=>q.length);}
 const pieces=s=>[...(s.rects||[]).map(rectangle),...(s.polygons||[]).map(q=>q.points)];
 function format(ps){
  const rects=[],polygons=[];let total=0;for(const q of ps){const aa=polygonArea(q);if(aa<eps)continue;total+=aa;const b=bounds(q);if(Math.abs(aa-area(b))<eps)rects.push(b);else polygons.push({points:q});}
  const all=ps.flat(),box=all.length?bounds(all):null,rectangular=box&&Math.abs(total-area(box))<eps;
  return {rects:rectangular?[box]:R.union(rects),polygons:rectangular?[]:polygons,area:total,b:rectangular?box.x1-box.x0:null,d:rectangular?box.y1-box.y0:null};
 }
 let partitions=new WeakMap();
 // Walls own geometric tributaries as connected groups. Split at half spans
 // to neighbouring support lines; a core includes the half-bays at its ends.
 const wallPartitions158=new WeakMap();
 function subtractConvex158(subject,clip){
  let rest=subject;const out=[];for(let i=0;i<clip.length&&rest.length;i++){const u=clip[i],v=clip[(i+1)%clip.length],nx=v[1]-u[1],ny=u[0]-v[0],k=nx*u[0]+ny*u[1],outside=half(rest,-nx,-ny,-k);if(outside.length)out.push(outside);rest=half(rest,nx,ny,k);}return out;
 }
 function wallShapes(p,m){
  if(wallPartitions158.has(m))return wallPartitions158.get(m);
  const solid=R.difference(R.union(m.ts.filter(t=>t.state===1)),m.slabVoids||[]),building=m.ts.filter(t=>t.state!==0);
  if(!building.length||!m.walls.length){wallPartitions158.set(m,[]);return [];}
  const limit=bounds(building.flatMap(rectangle)),cols=active(m).map(c=>point(p,m,c)),groups=[];
  const touches=(w,v)=>[0,1].every(i=>Math.max(Math.min(a(w)[i],z(w)[i]),Math.min(a(v)[i],z(v)[i]))<=Math.min(Math.max(a(w)[i],z(w)[i]),Math.max(a(v)[i],z(v)[i]))+eps);
  for(const w of m.walls){const touching=groups.filter(g=>g.members.some(v=>touches(w,v)));const g={members:[w,...touching.flatMap(g=>g.members)]};for(const old of touching)groups.splice(groups.indexOf(old),1);groups.push(g);}
  const low=(vs,v,edge)=>{const q=vs.filter(q=>q<v-eps);return q.length?(Math.max(...q)+v)/2:edge;},high=(vs,v,edge)=>{const q=vs.filter(q=>q>v+eps);return q.length?(Math.min(...q)+v)/2:edge;};
  for(const g of groups){
   g.signature=g.members.map(w=>Engine.sig(a(w),z(w))).sort().join(';');g.box=bounds(g.members.flatMap(w=>[a(w),z(w)]));g.point=[(g.box.x0+g.box.x1)/2,(g.box.y0+g.box.y1)/2];
   const candidates=[];
   for(const w of g.members){const u=a(w),v=z(w),horizontal=Math.abs(u[1]-v[1])<eps,axis=horizontal?0:1,cross=1-axis,lo=Math.min(u[axis],v[axis]),hi=Math.max(u[axis],v[axis]),at=u[cross];
    const along=cols.filter(q=>Math.abs(q[cross]-at)<eps).map(q=>q[axis]),across=cols.filter(q=>q[axis]>=lo-eps&&q[axis]<=hi+eps).map(q=>q[cross]);
    for(const other of m.walls){if(other===w)continue;const x=a(other),y=z(other);if(Math.abs(x[axis]-y[axis])<eps&&at>=Math.min(x[cross],y[cross])-eps&&at<=Math.max(x[cross],y[cross])+eps)along.push(x[axis]);if(Math.abs(x[cross]-y[cross])<eps&&Math.min(hi,Math.max(x[axis],y[axis]))>=Math.max(lo,Math.min(x[axis],y[axis]))-eps)across.push(x[cross]);}
    const aa=axis?'y':'x',cc=cross?'y':'x',box={[aa+'0']:low(along,lo,limit[aa+'0']),[aa+'1']:high(along,hi,limit[aa+'1']),[cc+'0']:low(across,at,limit[cc+'0']),[cc+'1']:high(across,at,limit[cc+'1'])};candidates.push(box);
   }
   g.rects=R.union(candidates.flatMap(q=>solid.map(r=>R.intersect(q,r)).filter(Boolean)));
  }
  // Different wall groups divide any shared candidate area once, independently
  // of input order. Connected wall legs are already unioned into a single group.
  const answer=groups.map(g=>{let ps=g.rects.map(rectangle);for(const other of groups){if(other===g)continue;const dx=other.point[0]-g.point[0],dy=other.point[1]-g.point[1],k=(other.point[0]**2+other.point[1]**2-g.point[0]**2-g.point[1]**2)/2;for(const r of other.rects)ps=ps.flatMap(poly=>{const hit=clipPolygon(poly,r);if(!hit.length)return [poly];const out=subtractPolygon(poly,r),keep=half(hit,dx,dy,k);if(keep.length)out.push(keep);return out;});}return {...g,...format(ps),errors:[],method:'wall-half-bay'};});
  wallPartitions158.set(m,answer);return answer;
 }
 // A geometric tributary includes support footprints. Recover a saved drawn
 // load region over wall faces as well, without changing slab/beam surface loads.
 function geometricAreas158(p,f,m){
  const loads=R.effectiveAreas(p,f,m),occupied=loads.flatMap(r=>R.region(r)),walls=m.walls.map(w=>{const r=Engine.rect(w);return {x0:r.x-r.w/2,x1:r.x+r.w/2,y0:r.y-r.d/2,y1:r.y+r.d/2};});
  return loads.map(load=>{if(!load.rects||!load.selectionRects?.length)return load;const extra=R.difference(load.selectionRects.flatMap(r=>walls.map(w=>R.intersect(r,w)).filter(Boolean)),occupied);return extra.length?{...load,rects:R.union([...load.rects,...extra])}:load;});
 }
 function wallSchedule(p,result,f,id){
  const selected=wallShapes(p,Engine.floorModel(result,f)).find(g=>g.members.some(w=>w.id===id));if(!selected)return {rows:[],errors:['所選牆已不存在'],totalG:null,totalQ:null};
  const rows=[],errors=[];let continuous=true;
  for(let n=f;n<=p.total;n++){const model=Engine.floorModel(result,n),group=wallShapes(p,model).find(g=>g.signature===selected.signature);if(!group){continuous=false;continue;}if(!continuous){errors.push(FloorLevels.name(p,n)+' 牆組不連續，未自動累加');continue;}
   let free=pieces(group),G=0,Q=0,valid=true;const parts=[],loads=geometricAreas158(p,n,model);
   const add=(ps,load)=>{const shape=format(ps);if(shape.area<eps)return;const ll=LoadData.live(load),good=[load.dl,load.sdl,ll].every(v=>Number.isFinite(v)&&v>=0)&&load.basis==='total';valid&&=good;const g=good?shape.area*(load.dl+load.sdl):null,q=good?shape.area*ll:null;G+=g||0;Q+=q||0;parts.push({...shape,name:load.name||'整層荷載',dl:load.dl,sdl:load.sdl,ll,G:g,Q:q});};
   for(let i=0;i<loads.length;i++)for(let j=0;j<i;j++)if(R.region(loads[i]).some(a=>R.region(loads[j]).some(b=>{const hit=R.intersect(a,b);return hit&&free.some(poly=>clipPolygon(poly,hit).length);})))errors.push(FloorLevels.name(p,n)+' 牆受荷範圍內荷載區重疊');
   for(const load of loads){const rs=R.union(R.region(load));add(free.flatMap(poly=>rs.map(r=>clipPolygon(poly,r)).filter(x=>x.length)),load);for(const r of rs)free=free.flatMap(poly=>subtractPolygon(poly,r));}add(free,Loading.floorload(p,n));if(!valid)errors.push(FloorLevels.name(p,n)+' 牆面積荷載 DL / SDL / LL 未填齊');rows.push({floor:n,area:group.area,rects:group.rects,polygons:group.polygons,parts,G:valid?G:null,Q:valid?Q:null});
  }
  return {rows,errors:[...new Set(errors)],members:selected.members.map(w=>w.id).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})),signature:selected.signature,totalG:errors.length?null:rows.reduce((n,r)=>n+r.G,0),totalQ:errors.length?null:rows.reduce((n,r)=>n+r.Q,0)};
 }
 function rawFootprint(p,m,c,solid,buildingBounds){
  const [x,y]=point(p,m,c),locations=active(m).filter(q=>q!==c).map(q=>point(p,m,q));
  const xs=locations.filter(q=>Math.abs(q[1]-y)<eps).map(q=>q[0]),ys=locations.filter(q=>Math.abs(q[0]-x)<eps).map(q=>q[1]);
  for(const w of m.walls){const u=a(w),v=z(w);if(Math.abs(u[0]-v[0])<eps&&y>=Math.min(u[1],v[1])-eps&&y<=Math.max(u[1],v[1])+eps)xs.push(u[0]);if(Math.abs(u[1]-v[1])<eps&&x>=Math.min(u[0],v[0])-eps&&x<=Math.max(u[0],v[0])+eps)ys.push(u[1]);}
  const low=(vs,v,fallback)=>{const q=vs.filter(q=>q<v-eps);return q.length?(Math.max(...q)+v)/2:fallback;},high=(vs,v,fallback)=>{const q=vs.filter(q=>q>v+eps);return q.length?(Math.min(...q)+v)/2:fallback;};
  const box={x0:low(xs,x,buildingBounds.x0),x1:high(xs,x,buildingBounds.x1),y0:low(ys,y,buildingBounds.y0),y1:high(ys,y,buildingBounds.y1)};
  const rects=R.union(solid.map(r=>R.intersect(r,box)).filter(Boolean)),physical=Engine.columnRect(c);
  // A real neighbour/wall or a column face at the perimeter closes a side.
  // Falling back to a distant site edge does not make an offset column a
  // well-defined bay. This distinguishes the regular bays (1) from residuals (2).
  const closed=[xs.some(v=>v<x-eps)||physical.x-physical.w/2<=buildingBounds.x0+eps,
   xs.some(v=>v>x+eps)||physical.x+physical.w/2>=buildingBounds.x1-eps,
   ys.some(v=>v<y-eps)||physical.y-physical.d/2<=buildingBounds.y0+eps,
   ys.some(v=>v>y+eps)||physical.y+physical.d/2>=buildingBounds.y1-eps].filter(Boolean).length;
  const rectangular=rects.length>0&&Math.abs(rects.reduce((n,r)=>n+area(r),0)-area(bounds(rects.flatMap(rectangle))))<eps;
  return {column:c,point:[x,y],box,rects,priority:closed*2+Number(rectangular)};
 }
 function partition(p,m){
  if(partitions.has(m))return partitions.get(m);
  const solid=R.difference(R.union(m.ts.filter(t=>t.state===1).map(t=>({x0:t.x0,x1:t.x1,y0:t.y0,y1:t.y1}))),m.slabVoids||[]),building=m.ts.filter(t=>t.state!==0),map=new Map();
  if(!solid.length||!building.length){partitions.set(m,map);return map;}
  const buildingBounds={x0:Math.min(...building.map(t=>t.x0)),x1:Math.max(...building.map(t=>t.x1)),y0:Math.min(...building.map(t=>t.y0)),y1:Math.max(...building.map(t=>t.y1))},raw=active(m).map(c=>rawFootprint(p,m,c,solid,buildingBounds));
  for(const c of raw){
   let ps=c.rects.map(rectangle);const errors=[];for(const wall of wallShapes(p,m))for(const poly of pieces(wall))ps=ps.flatMap(q=>subtractConvex158(q,poly));
   for(const q of raw){if(q===c||!q.rects.length||!R.intersect(c.box,q.box))continue;
    const dx=q.point[0]-c.point[0],dy=q.point[1]-c.point[1],coincident=Math.hypot(dx,dy)<eps,k=(q.point[0]**2+q.point[1]**2-c.point[0]**2-c.point[1]**2)/2;
    // Among equally well-bounded candidates, settle the smaller bay first.
    // A long bay spanning missing intermediate columns receives its residual.
    const order=q.priority-c.priority||area(c.box)-area(q.box);
    if(!coincident&&order<-eps)continue;
    let shared=false;ps=ps.flatMap(poly=>{const hit=clipPolygon(poly,q.box);if(!hit.length)return [poly];shared=true;const out=subtractPolygon(poly,q.box),keep=coincident||order>eps?[]:half(hit,dx,dy,k);if(keep.length)out.push(keep);return out;});
    if(coincident&&shared)errors.push('柱 '+c.column.id+' 与 '+q.column.id+' 的参考点重合；重合范围未分配，请核对柱位置');
   }
   const s=format(ps),oldArea=c.rects.reduce((n,r)=>n+area(r),0);map.set(c.column,{...s,box:c.box,partitioned:oldArea-s.area>eps,errors,method:'geometric-half-bay'});
  }
  partitions.set(m,map);return map;
 }
 function footprint(p,m,c){return partition(p,m).get(c)||{rects:[],polygons:[],b:null,d:null,box:null,area:0,errors:[],method:'geometric-half-bay'};}

 function calculate(p,result,f,target){
  const key=snapshots228.get(p)?.get(result)?.key??JSON.stringify([p,result]);if(key!==stamp){stamp=key;cache=new Map();}const id=f+'|'+target;if(cache.has(id))return copy(cache.get(id));
  const base=Engine.floorModel(result,f),selected=base&&active(base).find(c=>Loading.token('COL',c)===target);
  if(!selected)return {groups:[],errors:['当前楼层未找到所选下层柱'],method:'geometric-half-bay'};
  const memo=new Map(),groups=[],errors=[],shapeCache=new WeakMap();
  const geometry=(m,c)=>{let values=shapeCache.get(m);if(!values){values=new Map();shapeCache.set(m,values);}const key=Loading.token('COL',c);if(!values.has(key))values.set(key,footprint(p,m,c));return values.get(key);},baseShape=geometry(base,selected);
  const inside=(c,q)=>{const r=Engine.columnRect(c);return Math.abs(r.x-q[0])<=r.w/2+eps&&Math.abs(r.y-q[1])<=r.d/2+eps;};
  const on=(q,b)=>{const u=a(b),v=z(b),dx=v[0]-u[0],dy=v[1]-u[1],l2=dx*dx+dy*dy;if(l2<eps)return false;const t=((q[0]-u[0])*dx+(q[1]-u[1])*dy)/l2;return Math.abs((q[0]-u[0])*dy-(q[1]-u[1])*dx)<eps*Math.sqrt(l2)&&t>=-eps&&t<=1+eps;};
  const merge=entries=>{const map=new Map();for(const e of entries){const t=Loading.token('COL',e.column),old=map.get(t);if(old)old.weight+=e.weight;else map.set(t,{...e});}return [...map.values()];};
  function beamLanding(m,n,b,q,path=new Set()){
   const bt=Loading.token(b.kind,b);if(path.has(bt))return {entries:[],errors:['转换路径梁相互支承：'+b.id]};path=new Set(path);path.add(bt);
   const u=a(b),v=z(b),dx=v[0]-u[0],dy=v[1]-u[1],l2=dx*dx+dy*dy,o=Loading.input(p,n,bt);if(l2<eps)return {entries:[],errors:['转换梁跨度无效：'+b.id]};
   const t=Math.max(0,Math.min(1,((q[0]-u[0])*dx+(q[1]-u[1])*dy)/l2)),root=b.displayKind==='CB'?Loading.cbRoot(p,result,n,b).fixedEnd:null,weights=b.displayKind==='CB'?(root==='a'?[1,0]:root==='z'?[0,1]:null):[1-t,t];
   if(!weights)return {entries:[],errors:['CB 固定端待确认：'+b.id]};
   const entries=[],err=[];
   for(let i=0;i<2;i++){if(weights[i]<eps)continue;const endpoint=i?v:u,end=i?'z':'a',manual=Loading.manualSupport(p,m,n,b,end);let sink;
    if(manual){if(manual.invalid){err.push(b.id+' 手动支承待确认');continue;}sink=manual;}
    else{const cs=active(m).filter(c=>inside(c,endpoint)),ws=m.walls.filter(w=>on(endpoint,w)),bs=m.beams.filter(x=>x!==b&&Loading.contact(endpoint,x)&&!path.has(Loading.token(x.kind,x)));if(cs.length===1)sink={type:'COL',member:cs[0]};else if(!cs.length&&ws.length)sink={type:'WALL'};else if(!cs.length&&!ws.length&&bs.length===1)sink={type:'BEAM',member:bs[0]};}
    if(!sink){err.push(b.id+' '+(i?'终点':'起点')+' 支承待确认');continue;}
    if(sink.type==='COL')entries.push({column:sink.member,weight:weights[i]});
    else if(sink.type==='BEAM'){const next=beamLanding(m,n,sink.member,endpoint,path);entries.push(...next.entries.map(e=>({...e,weight:e.weight*weights[i]})));err.push(...next.errors);}
   }
   return {entries:merge(entries),errors:[...new Set(err)]};
  }
  const overrides=(n,c,source)=>{const o=Loading.input(p,n,Loading.token('COL',c));return !!(String(o.sectionAAreas||'').trim()&&o.sectionAAreaMode!=='auto'||Object.hasOwn(o.sectionAAreaOverrides115||{},source));};
  function route(n,c,source=n,bypass=false){
   const k=n+'|'+Loading.token('COL',c)+'|'+source+'|'+bypass;if(n>f&&!bypass&&overrides(n,c,source))return {entries:[],errors:[]};if(memo.has(k))return memo.get(k);
   if(n===f){const answer={entries:[{column:c,weight:1}],errors:[]};memo.set(k,answer);return answer;}
   const below=Engine.floorModel(result,n-1),matches=active(below).filter(d=>Engine.overlap(Engine.columnRect(c),Engine.columnRect(d)));let landing;
   if(matches.length===1)landing={entries:[{column:matches[0],weight:1}],errors:[]};
   else{const node=Loading.columnLoadPoint(p,Engine.floorModel(result,n),c),target=Engine.transferBeamAt(p,below,n-1,node),tbs=target?.kind==='TB'?[target]:[];landing=tbs.length===1?beamLanding(below,n-1,tbs[0],node):{entries:[],errors:[FloorLevels.name(p,n)+' 柱 '+c.id+' 至下层的柱／TB 关系待确认']};}
   const entries=[],err=[...landing.errors];for(const e of landing.entries){const next=route(n-1,e.column,source);entries.push(...next.entries.map(q=>({...q,weight:q.weight*e.weight})));err.push(...next.errors);}const answer={entries:merge(entries),errors:[...new Set(err)]};memo.set(k,answer);return answer;
  }
  for(let n=f;n<=p.total;n++){
   const m=Engine.floorModel(result,n);
   for(const c of active(m)){
    const routing=route(n,c),weight=routing.entries.filter(e=>Loading.token('COL',e.column)===target).reduce((s,e)=>s+e.weight,0);
    if(routing.errors.length){const q=point(p,m,c),box=baseShape.box,near=box&&q[0]>=box.x0-eps&&q[0]<=box.x1+eps&&q[1]>=box.y0-eps&&q[1]<=box.y1+eps;if(weight>eps||near)errors.push(...routing.errors);}
    if(weight<eps)continue;
    const shape=geometry(m,c);let free=pieces(shape);errors.push(...shape.errors.map(e=>FloorLevels.name(p,n)+' '+e));
    const loads=geometricAreas158(p,n,m);for(let i=0;i<loads.length;i++)for(let j=0;j<i;j++)if(R.region(loads[i]).some(a=>R.region(loads[j]).some(b=>{const hit=R.intersect(a,b);return hit&&free.some(poly=>clipPolygon(poly,hit).length);})))errors.push(FloorLevels.name(p,n)+' 柱 '+c.id+' 的荷载区域重叠，请核对 Loading');
    function add(ps,load){const s=format(ps),A=s.area*weight;if(A<eps)return;groups.push({lo:n,hi:n,area:A,b:Math.abs(weight-1)<eps?s.b:null,d:Math.abs(weight-1)<eps?s.d:null,areaId:load?.id??null,areaName:load?.name||'整层默认',automatic:true,geometric103:true,rects:s.rects.map(r=>({...r,fraction:weight})),polygons:s.polygons.map(q=>({...q,fraction:weight})),partitioned:shape.partitioned,sourceColumn:c.id,transferWeight:weight,method:weight===1?'geometric-half-bay':'geometric-area-transfer'});}
    for(const load of loads){const regions=R.union(R.region(load)),ps=free.flatMap(poly=>regions.map(r=>clipPolygon(poly,r)).filter(q=>q.length));add(ps,load);for(const r of regions)free=free.flatMap(poly=>subtractPolygon(poly,r));}add(free,null);
   }
  }
  // A confirmed upper-column area replaces its geometric contribution exactly
  // once along the same column/TB route, including further transfers below it.
  for(let n=f+1;n<=p.total;n++)for(const c of active(Engine.floorModel(result,n))){
   const o=Loading.input(p,n,Loading.token('COL',c));if(!(String(o.sectionAAreas||'').trim()&&o.sectionAAreaMode!=='auto')&&!Object.keys(o.sectionAAreaOverrides115||{}).length)continue;
   const a=Reports.columnA(p,{floor:n,token:Loading.token('COL',c),id:c.id},result);
   for(let source=n;source<=p.total;source++){if(!overrides(n,c,source))continue;const routing=route(n,c,source,true),weight=routing.entries.filter(e=>Loading.token('COL',e.column)===target).reduce((v,e)=>v+e.weight,0);if(weight<eps)continue;errors.push(...routing.errors,...a.errors);
    for(const x of a.rows.filter(x=>x.lo<=source&&x.hi>=source)){const named=x.areaName&&x.areaName!=='整层默认',load=named?LoadData.areas(p,source).find(l=>l.name===x.areaName||l.id===x.areaName):null;groups.push({lo:source,hi:source,area:x.area*weight,b:null,d:null,areaId:load?.id??null,areaName:load?.name||'整层默认',automatic:true,manualArea:true,rects:[],polygons:[],sourceColumn:c.id,transferWeight:weight});}
   }
  }
  // One row per source floor and load region, including several columns carried by a TB.
  const grouped=new Map();for(const g of groups){const k=g.lo+'|'+g.areaId;const previous=grouped.get(k);if(previous){previous.area+=g.area;previous.rects.push(...g.rects);previous.polygons.push(...g.polygons);previous.partitioned||=g.partitioned;previous.manualArea||=g.manualArea;previous.sourceColumns.push({id:g.sourceColumn,weight:g.transferWeight});}else grouped.set(k,{...g,sourceColumns:[{id:g.sourceColumn,weight:g.transferWeight}]});}
  for(const g of grouped.values()){
   const rects=new Map();for(const r of g.rects){const k=JSON.stringify([r.x0,r.x1,r.y0,r.y1]),prev=rects.get(k);if(prev)prev.fraction+=r.fraction;else rects.set(k,{...r});}g.rects=[...rects.values()];
   const points=pieces(g).flat(),box=points.length?bounds(points):null,rectangular=box&&[...g.rects,...g.polygons].every(r=>Math.abs(r.fraction-1)<eps)&&Math.abs(area(box)-g.area)<eps;g.b=rectangular?box.x1-box.x0:null;g.d=rectangular?box.y1-box.y0:null;if(g.sourceColumns.length>1){delete g.sourceColumn;delete g.transferWeight;}
  }
  const answer={groups:[...grouped.values()],errors:[...new Set(errors)],method:'geometric-half-bay'};cache.set(id,answer);return copy(answer);
 }
 return {snapshot228,calculate,footprint,wallShapes,wallSchedule,polygonArea,clipPolygon,subtractPolygon};
})();