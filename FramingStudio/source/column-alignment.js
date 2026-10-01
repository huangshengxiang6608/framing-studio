const ColumnAlignment=(()=>{
 const near=(a,b)=>Math.abs(a-b)<1e-6,coord=p=>p.map(v=>v.toFixed(6)).join('|'),pos=c=>{const r=Engine.columnRect(c);return [r.x,r.y];},key=c=>c.anchorX!==undefined?'axis:'+c.anchorX+'|'+c.anchorY:'id:'+c.id;
 const sig=b=>Engine.sig(b.rawA||b.a,b.rawZ||b.z);
 function reference(p,k,c){return Engine.columnReference(p,k,c);}
 function minimum(p,f){return Math.max(0,f.min||0,p.types[f.type].minColumnSpacing||0);}
 function rectMap(r,map){const a=map([r.x0,r.y0]),b=map([r.x1,r.y1]);return {x0:a[0],x1:b[0],y0:a[1],y1:b[1]};}
 function preview(project,opt){
  const stamp=JSON.stringify(project),p=Engine.clone(project),original=Engine.generate(p),moves=[],errors=[],skipped=[],maps=new Map(),clones=[],beams=[];
  const result=()=>({stamp,options:{...opt},moves,beams,errors:[...new Set(errors)],skipped,clones,project:errors.length?null:p,ok:!errors.length&&moves.length>0});
  if(!Number.isInteger(opt.floor)||!original.floors[opt.floor-1]||!Number.isInteger(opt.lo)||!Number.isInteger(opt.hi)||opt.lo<1||opt.hi>p.total||opt.lo>opt.hi){errors.push('请选择有效基准楼层和应用楼层范围');return result();}
  if(!['floor','axes','keep'].includes(opt.basis)||!['center','left','right','top','bottom'].includes(opt.edge)){errors.push('对齐基准无效');return result();}
  if(opt.basis==='keep')return result();
  const basisFloor=original.floors[opt.floor-1],basis=original.models[basisFloor.type],refs=basis.columns.filter(c=>opt.column==='all'||c.id===opt.column),byRef=new Map();
  if(!refs.length){errors.push('基准柱已改变，请重新选择');return result();}
  for(const c of refs){const k=coord(reference(p,basisFloor.type,c));if(byRef.has(k)){errors.push('基准柱定位重复：'+c.id);continue;}byRef.set(k,c);}
  const selected=original.floors.filter(f=>f.n>=opt.lo&&f.n<=opt.hi),types=[...new Set(selected.map(f=>f.type))];
  for(const type of types){const model=original.models[type],columns=model.columns,proposals=new Map();
   for(const c of columns){const ref=byRef.get(coord(reference(p,type,c)));if(!ref)continue;if(c.isTransferColumn||ref.isTransferColumn||c.status==='上层柱'||ref.status==='上层柱'){skipped.push(type+' · '+c.id+'：转换柱／上层柱保留原位');continue;}
    const target=opt.basis==='axes'?reference(p,basisFloor.type,ref):pos(ref),sz=opt.basis==='axes'?[0,0]:[ref.b,ref.d],to=[...target];
    if(opt.edge==='left')to[0]+=(c.b-sz[0])/2;if(opt.edge==='right')to[0]+=(sz[0]-c.b)/2;if(opt.edge==='top')to[1]+=(c.d-sz[1])/2;if(opt.edge==='bottom')to[1]+=(sz[1]-c.d)/2;
    const from=pos(c);if(near(from[0],to[0])&&near(from[1],to[1]))continue;proposals.set(c.id,{c,from,to});
   }
   if(!proposals.size)continue;
   // Every target floor must pass, including shared types with different spacing limits.
   for(const f of selected.filter(f=>f.type===type)){
    const min=minimum(p,f),label=FloorLevels.name(p,f.n);
    for(const {c,from,to}of proposals.values()){
     moves.push({floor:f.n,type,id:c.id,from,to,b:c.b,d:c.d,dx:to[0]-from[0],dy:to[1]-from[1],minimum:min});
     if(!Engine.rectAllowed(model.ts,to[0],to[1],c.b,c.d,true))errors.push(label+' '+c.id+'：柱截面超出建筑边界');
     if(Engine.noColumn(p.types[type],to[0],to[1]))errors.push(label+' '+c.id+'：进入禁柱区');
     const r={x:to[0],y:to[1],w:c.b,d:c.d};if(model.walls.some(w=>Engine.overlap(r,Engine.rect(w))))errors.push(label+' '+c.id+'：与墙重叠');
    }
    for(let i=0;i<columns.length;i++)for(let j=i+1;j<columns.length;j++){const a=columns[i],b=columns[j],ap=proposals.get(a.id)?.to||pos(a),bp=proposals.get(b.id)?.to||pos(b),distance=Math.hypot(ap[0]-bp[0],ap[1]-bp[1]);if(distance<min-1e-6)errors.push(label+' '+a.id+' / '+b.id+'：中心距 '+distance.toFixed(3)+' m，小于要求 '+min.toFixed(3)+' m');if(Engine.overlap({x:ap[0],y:ap[1],w:a.b,d:a.d},{x:bp[0],y:bp[1],w:b.b,d:b.d}))errors.push(label+' '+a.id+' / '+b.id+'：柱截面重叠');}
   }
   const direct=new Map([...proposals.values()].map(v=>[coord([v.c.x,v.c.y]),v.to])),axes=[new Map(),new Map()];
   // Extend a moved grid line only when all columns on it have the same displacement.
   for(let dim=0;dim<2;dim++){const grouped=new Map();for(const c of columns){const v=(dim?c.y:c.x).toFixed(6);grouped.set(v,[...(grouped.get(v)||[]),c]);}for(const [v,cs]of grouped){const tos=cs.map(c=>(proposals.get(c.id)?.to||[c.x,c.y])[dim]);if(tos.every(t=>near(t,tos[0]))&&!near(+v,tos[0]))axes[dim].set(v,tos[0]);}}
   // Regenerated secondary beams keep their relative position within a bay.
   const knots=[0,1].map(dim=>[...new Set([...columns.map(c=>dim?c.y:c.x),...model.walls.flatMap(w=>[w.rawA[dim],w.rawZ[dim]])])].sort((a,b)=>a-b).map(v=>[v,axes[dim].get(v.toFixed(6))??v]));
   const axisMap=(v,dim)=>{const list=knots[dim],exact=list.find(k=>near(k[0],v));if(exact)return exact[1];for(let i=1;i<list.length;i++){const a=list[i-1],b=list[i];if(v>a[0]&&v<b[0])return a[1]+(v-a[0])*(b[1]-a[1])/(b[0]-a[0]);}return v;};
   const map=pt=>direct.get(coord(pt))||pt.map(axisMap),mapRect=r=>rectMap(r,pt=>pt.map(axisMap));
   const usedElsewhere=original.floors.some(f=>f.type===type&&!selected.some(t=>t.n===f.n));let nextType=type;
   if(usedElsewhere){let n=1;do{nextType=(type.slice(0,14)+'_A'+n++);}while(p.types[nextType]);p.types[nextType]=Engine.clone(p.types[type]);clones.push({from:type,to:nextType,floors:selected.filter(f=>f.type===type).map(f=>f.n)});}
   const t=p.types[nextType];delete t.alignmentMinSpacing;t.columnPlacements=(t.columnPlacements||[]).filter(r=>![...proposals.values()].some(v=>key(v.c)===r.key));for(const v of proposals.values())t.columnPlacements.push({key:key(v.c),x:v.to[0],y:v.to[1]});
   for(const b of t.beams){const a=Engine.resolve(p,b.a,nextType),z=Engine.resolve(p,b.z,nextType),na=map(a),nz=map(z);if(!near(na[0],nz[0])&&!near(na[1],nz[1]))errors.push(type+' '+b.id+'：移动后形成斜梁，请扩大对齐柱范围或先调整梁布置');if(!near(a[0],na[0])||!near(a[1],na[1]))b.a={x:na[0],y:na[1]};if(!near(z[0],nz[0])||!near(z[1],nz[1]))b.z={x:nz[0],y:nz[1]};}
   for(const area of t.secondaryAreas||[])area.rects=area.rects.map(mapRect);
   if(p.defaults.direction==='自动'){const keep={X:[],Y:[]};for(const panel of model.panels){if(Engine.secondaryAreaRule(project.types[type],panel))continue;const [x0,x1,y0,y1]=panel;keep[x1-x0<=y1-y0?'X':'Y'].push(mapRect({x0,x1,y0,y1}));}for(const direction of ['X','Y'])if(keep[direction].length){t.secondaryAreas??=[];let n=1;while(t.secondaryAreas.some(a=>a.id==='SBA'+n))n++;t.secondaryAreas.push({id:'SBA'+n,name:'对齐保留走向 '+direction,direction,gap:null,rects:keep[direction]});}}
   const slabSig=s=>s.rects.map(r=>[r.x0,r.x1,r.y0,r.y1].map(v=>v.toFixed(6)).join(',')).sort().join('|');
   for(const size of t.slabSizes||[]){const slab=model.slabs.find(s=>slabSig(s)===size.signature);if(slab)size.signature=slabSig({rects:slab.rects.map(mapRect)});else errors.push(type+'：已有板厚记录无法对应，请先核对板块');}
   t.suppressed=(t.suppressed||[]).map(s=>{const points=s.split('|').map(x=>x.split(',').map(Number));return points.length===2&&points.every(a=>a.length===2&&a.every(Number.isFinite))?Engine.sig(...points.map(map)):s;});
   maps.set(type,{proposals,map,mapRect,nextType,model});
  }
  if(errors.length||!moves.length)return result();
  // Split only the requested floors when a Framing is shared outside the range.
  const groups=[];let start=1;for(const g of p.groups){const end=Math.min(p.total,g.end==='顶层'?p.total:g.end);for(let n=start;n<=end;n++){const row={...g,end:n,type:n>=opt.lo&&n<=opt.hi?(maps.get(g.type)?.nextType||g.type):g.type},last=groups.at(-1);if(last&&JSON.stringify({...last,end:0})===JSON.stringify({...row,end:0}))last.end=n;else groups.push(row);}start=end+1;}groups.at(-1).end='顶层';p.groups=groups;
  // A partial-floor alignment clones the Framing, preserving its architectural axes.
  // Keep each local-height Area anchored to the clone used by its reference floor.
  const alignedFloors=Engine.floors(p);for(const entry of p.localHeights96||[]){const mapping=maps.get(entry.type),reference=alignedFloors[entry.base];if(mapping&&reference?.type===mapping.nextType)entry.type=mapping.nextType;}
  let generated;try{generated=Engine.generate(p);}catch(e){errors.push(e.message);return result();}
  for(const [type,m]of maps){const next=generated.models[m.nextType];m.tokens=new Map();m.changedBeams=[];
   for(const c of m.model.columns){const found=next.columns.find(v=>key(v)===key(c));if(!found){errors.push(type+' '+c.id+'：移动后未生成柱');continue;}m.tokens.set(Loading.token('COL',c),Loading.token('COL',found));}
   for(const b of m.model.beams){const mapped={rawA:m.map(b.rawA),rawZ:m.map(b.rawZ)},expected=sig(mapped),found=next.beams.filter(v=>v.kind===b.kind&&sig(v)===expected),changed=expected!==sig(b);if(found.length===1){m.tokens.set(Loading.token(b.kind,b),Loading.token(found[0].kind,found[0]));if(changed){m.changedBeams.push(found[0]);beams.push({type,id:b.displayId||b.id,from:[b.rawA,b.rawZ],to:[found[0].rawA,found[0].rawZ]});}}else if(changed)errors.push(type+' '+(b.displayId||b.id)+'：相连梁无法保持原连接，请调整对齐范围');}
   for(const slab of m.model.slabs){const mapped={rects:slab.rects.map(m.mapRect)},token=Loading.token('SLAB',mapped),found=next.slabs.find(s=>Loading.token('SLAB',s)===token);if(found)m.tokens.set(Loading.token('SLAB',slab),token);}
   for(const size of p.types[m.nextType].slabSizes||[]){const signature=s=>s.rects.map(r=>[r.x0,r.x1,r.y0,r.y1].map(v=>v.toFixed(6)).join(',')).sort().join('|');if(!next.slabs.some(s=>signature(s)===size.signature))errors.push(type+'：移动后自定义板厚无法对应板块');}
   // No newly invalid beam geometry/support is silently accepted.
   const oldProblems=new Set(m.model.issues.map(v=>v.id+'|'+v.msg));for(const issue of next.issues)if(!oldProblems.has(issue.id+'|'+issue.msg)&&/梁越界|非正交|悬空|未建立两端/.test(issue.msg))errors.push(m.nextType+' '+issue.id+'：'+issue.msg);
  }
  if(errors.length)return result();
  const ex=LoadData.init(p);
  for(const f of selected){const m=maps.get(f.type);if(!m)continue;const current=Loading.members(p,generated,f.n),live=new Set(current.map(v=>v.token)),prefix=f.n+'|';
   for(const name of ['members','selected','reportA','reportB']){const source=ex[name]||{},updates={};for(const [k,v]of Object.entries(source)){if(!k.startsWith(prefix))continue;const oldToken=k.slice(prefix.length),mapped=m.tokens.get(oldToken);if(mapped){updates[prefix+mapped]=Engine.clone(v);delete source[k];}else if(!live.has(oldToken))errors.push(FloorLevels.name(p,f.n)+'：'+name+' 的构件记录无法对应新位置，请先处理 '+oldToken.split('|')[0]);}Object.assign(source,updates);}
   for(const [k,o]of Object.entries(ex.members))if(k.startsWith(prefix)){for(const prop of ['supportA','supportZ'])if(m.tokens.has(o[prop]))o[prop]=m.tokens.get(o[prop]);const token=k.slice(prefix.length),member=current.find(v=>v.token===token);if(member&&!['COL','SLAB'].includes(member.kind)){const b=member.member,L=Math.hypot(b.rawZ[0]-b.rawA[0],b.rawZ[1]-b.rawA[1]);if(Array.isArray(o.beamLoads)){const err=BeamLoads.resolve(o,L).errors;if(err.length)errors.push(FloorLevels.name(p,f.n)+' '+member.id+'：梁跨改变后 '+err.join('；'));}else if(o.points?.some(v=>v.x>L))errors.push(FloorLevels.name(p,f.n)+' '+member.id+'：原集中荷载位置超出新跨度');}}
   for(const area of ex.areas[f.n]||[])area.panels=area.panels.map(t=>m.tokens.get(t)||t);
   const areaErrors=LoadData.validate(p,f.n,Engine.floorModel(generated,f.n,m.nextType).slabs.map(s=>Loading.token('SLAB',s)));if(areaErrors.length)errors.push(...areaErrors.map(v=>FloorLevels.name(p,f.n)+'：'+v));
   if(p.foundation?.column?.startsWith(prefix)){const token=p.foundation.column.slice(prefix.length);if(m.tokens.has(token))p.foundation.column=prefix+m.tokens.get(token);else if(!live.has(token))errors.push('Foundation 所选柱无法对应新位置');}
  }
  p.alignColumns=false;p.alignmentWorkflow=1;
  return result();
 }
 function apply(p,plan){if(!plan||plan.stamp!==JSON.stringify(p))throw Error('项目已变化，请重新预览柱对齐');if(!plan.ok||!plan.project)throw Error(plan?.errors?.join('；')||'没有可应用的移动');Object.keys(p).forEach(k=>delete p[k]);Object.assign(p,Engine.clone(plan.project));}
 return {preview,apply,reference,minimum};
})();
