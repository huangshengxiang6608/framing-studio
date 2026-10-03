// Exact plan rectangles; load regions never change physical slab geometry/span.
const LoadRegions83=(()=>{
 const area=r=>(r.x1-r.x0)*(r.y1-r.y0),valid=r=>r&&['x0','x1','y0','y1'].every(k=>Number.isFinite(r[k]))&&r.x1-r.x0>1e-8&&r.y1-r.y0>1e-8;
 const intersect=(a,b)=>{const r={x0:Math.max(a.x0,b.x0),x1:Math.min(a.x1,b.x1),y0:Math.max(a.y0,b.y0),y1:Math.min(a.y1,b.y1)};return valid(r)?r:null;};
 function subtract(a,b){const q=intersect(a,b);if(!q)return [a];return [{x0:a.x0,x1:q.x0,y0:a.y0,y1:a.y1},{x0:q.x1,x1:a.x1,y0:a.y0,y1:a.y1},{x0:q.x0,x1:q.x1,y0:a.y0,y1:q.y0},{x0:q.x0,x1:q.x1,y0:q.y1,y1:a.y1}].filter(valid);}
 function difference(rs,cuts){let out=rs;for(const c of cuts){out=out.flatMap(r=>subtract(r,c));if(out.length>4000)throw Error('荷载区域过于复杂，请减少框选次数');}return out;}
 function union(rs){let out=[];for(const r of rs){if(!valid(r))throw Error('荷载区域坐标无效');out.push(...difference([r],out));}return out;}
 const fromTokens=tokens=>(tokens||[]).flatMap(t=>{try{return JSON.parse(t.slice(5)).map(r=>({x0:r[0],x1:r[1],y0:r[2],y1:r[3]}));}catch{return [];}});
 const region=a=>Array.isArray(a.rects)?a.rects:fromTokens(a.panels);
 const clip=(rs,slabs)=>union(rs.flatMap(r=>slabs.flatMap(s=>s.rects.map(q=>intersect(r,q)).filter(Boolean))));
 function pieces(p,f,s,assigned=LoadData.areas(p,f)){let free=s.rects.map(r=>({...r})),out=[];const base=LoadData.floor(p,f),token=Loading.token('SLAB',s);
  for(const a of assigned){const rs=a.rects||((a.panels||[]).includes(token)?s.rects:[]);for(const r of rs){for(const q of free){const hit=intersect(r,q);if(hit)out.push({...hit,load:{...a,ll:LoadData.live(a),basis:a.basis||base.basis,areaName:a.name,areaId:a.id}});}free=difference(free,[r]);}}
  return out.concat(free.map(r=>({...r,load:{...base,ll:LoadData.live(base),areaName:'整层默认',areaId:null}})));
 }
 function summary(parts){const total=parts.reduce((n,r)=>n+area(r),0),v={...parts[0]?.load};for(const k of ['dl','sdl','ll'])v[k]=parts.every(r=>Number.isFinite(r.load[k]))?parts.reduce((n,r)=>n+area(r)*r.load[k],0)/total:null;v.mixed=new Set(parts.map(r=>JSON.stringify([r.load.dl,r.load.sdl,r.load.ll,r.load.basis]))).size>1;v.basis=parts.every(r=>r.load.basis==='total')?'total':'legacy-additional';v.areaName=[...new Set(parts.map(r=>r.load.areaName))].join(' / ');return v;}
 // Physical concrete between member faces; crossing members deduct their union.
 function netSelfWeight(s,model){
  if(s.netBoundary120)return s.rects.map(r=>({...r,load:{dl:0,sdl:0,ll:0}}));
  const cuts=[...model.beams,...model.walls].map(b=>{const r=Engine.rect(b);return {x0:r.x-r.w/2,x1:r.x+r.w/2,y0:r.y-r.d/2,y1:r.y+r.d/2};});
  return difference(s.rects,cuts).map(r=>({...r,load:{dl:0,sdl:0,ll:0}}));
 }
 const box=r=>({x0:r.x-r.w/2,x1:r.x+r.w/2,y0:r.y-r.d/2,y1:r.y+r.d/2}),eps=1e-6;
 // Floor surface is independent of net slab concrete. Openings, removed slabs,
 // solid walls and lower columns are not occupied floor surface.
 function surface(model){return difference(union((model.ts||[]).filter(t=>t.state===1).map(({x0,x1,y0,y1})=>({x0,x1,y0,y1}))),[...(model.slabVoids||[]),...model.walls.map(w=>box(Engine.rect(w))),...model.columns.filter(c=>c.status!=='上层柱').map(c=>box(Engine.columnRect(c)))]);}
 function clipSurface(rs,model){const floor=surface(model);return union(rs.flatMap(r=>floor.map(q=>intersect(r,q)).filter(Boolean)));}
 // Panel selections include their half of an adjoining beam top. At an outer
 // edge the sole adjoining panel covers the remaining beam width. Explicit
 // coordinate regions retain their saved footprint (no inferred expansion).
 function surfaceRegions(p,f,model){
  const beams=model.beams.map(b=>({...box(Engine.rect(b)),cross:Math.abs(b.a[1]-b.z[1])<eps?'y':'x'})),slabs=model.slabs.flatMap(s=>s.rects),out=[];
  function expand(rect){
   const nearby=beams.filter(b=>['x','y'].some((dim,i)=>{const other=i?'x':'y';return b.cross===dim&&(Math.abs(rect[dim+'0']-b[dim+'1'])<eps||Math.abs(rect[dim+'1']-b[dim+'0'])<eps)&&Math.min(rect[other+'1'],b[other+'1'])-Math.max(rect[other+'0'],b[other+'0'])>eps;}));
   if(!nearby.length)return [rect];
   const cuts=dim=>[...new Set([rect[dim+'0'],rect[dim+'1'],...[...nearby,...slabs].flatMap(r=>[r[dim+'0'],r[dim+'1']]).filter(v=>v>rect[dim+'0']+eps&&v<rect[dim+'1']-eps)])].sort((a,b)=>a-b),xs=cuts('x'),ys=cuts('y'),rs=[];
   for(let i=1;i<xs.length;i++)for(let j=1;j<ys.length;j++){
    const cell={x0:xs[i-1],x1:xs[i],y0:ys[j-1],y1:ys[j]},next={...cell};
    for(const dim of ['x','y'])for(const side of [0,1]){const other=dim==='x'?'y':'x',key=dim+side;
     if(Math.abs(cell[key]-rect[key])>eps)continue;
     const hits=nearby.filter(b=>b.cross===dim&&Math.abs(cell[key]-b[dim+(1-side)])<eps&&b[other+'0']<=cell[other+'0']+eps&&b[other+'1']>=cell[other+'1']-eps);
     if(hits.length!==1)continue;const b=hits[0],far=b[dim+side],mid=(cell[other+'0']+cell[other+'1'])/2;
     const opposite=slabs.some(r=>Math.abs(r[dim+(1-side)]-far)<eps&&mid>r[other+'0']&&mid<r[other+'1']);
     next[key]=opposite?(b[dim+'0']+b[dim+'1'])/2:far;
    }rs.push(next);
   }return rs;
  }
  for(const a of LoadData.areas(p,f))out.push(a.rects?a:{...a,rects:union(model.slabs.filter(s=>(a.panels||[]).includes(Loading.token('SLAB',s))).flatMap(s=>s.rects.flatMap(expand)))});
  return out;
 }
 // Partition beam footprints once. Receiving beams own intersections before
 // supported beams; independent crossings use depth, kind and stable geometry.
 // This is surface-load bookkeeping, not a new frame/joint analysis.
 function beamSurface(p,f,model,beams){
  let free=difference(surface(model),model.slabs.flatMap(s=>s.rects));const assigned=surfaceRegions(p,f,model),out=[],ordered=[],seen=new Set();
  const rank={TB:0,MB:1,CB:2,SB:3},sorted=[...beams].sort((a,b)=>b.member.d-a.member.d||(rank[a.member.displayKind||a.kind]??4)-(rank[b.member.displayKind||b.kind]??4)||a.token.localeCompare(b.token));
  function visit(b){if(seen.has(b))return;seen.add(b);for(const s of b.sinks||[])if(s?.type==='BEAM')visit(s.target);ordered.push(b);}sorted.forEach(visit);
  for(const b of ordered){const footprint=box(Engine.rect(b.member)),rs=free.map(r=>intersect(r,footprint)).filter(Boolean);if(!rs.length)continue;const errors=[];
   for(let i=0;i<assigned.length;i++)for(let j=0;j<i;j++)if(assigned[i].rects.some(a=>assigned[j].rects.some(b=>{const hit=intersect(a,b);return hit&&rs.some(r=>intersect(hit,r));})))errors.push('梁顶荷载区域重叠：'+assigned[i].name+' / '+assigned[j].name+'，请核对区域范围');
   out.push({beam:b,rects:rs,parts:pieces(p,f,{rects:rs},assigned),errors});free=difference(free,[footprint]);}
  return out;
 }
 // Reaction per metre along the support, integrated across the original span.
 function reaction(parts,dir,mid,lo,span,right,cs,sw,autoSW){const axis=dir==='X'?'y':'x',cross=dir==='X'?'x':'y';let out={g:0,q:0,sw:0,dl:0,sdl:0,mG:0,mQ:0,good:true};for(const r of parts){if(mid<=r[axis+'0']||mid>=r[axis+'1'])continue;const u=r[cross+'0']-lo,v=r[cross+'1']-lo,len=v-u,moment=right?span*len-(v*v-u*u)/2:(v*v-u*u)/2,weight=cs?len:right?(v*v-u*u)/(2*span):len-(v*v-u*u)/(2*span),load=r.load,dl=autoSW?0:load.dl;if(![dl,load.sdl,load.ll].every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0)){out.good=false;continue;}out.sw+=sw*weight;out.dl+=dl*weight;out.sdl+=load.sdl*weight;out.g+=(sw+dl+load.sdl)*weight;out.q+=load.ll*weight;out.mG+=(sw+dl+load.sdl)*moment;out.mQ+=load.ll*moment;}return out;}
 return {area,valid,intersect,subtract,difference,union,region,clip,pieces,summary,reaction,netSelfWeight,surface,clipSurface,surfaceRegions,beamSurface};
})();
if(typeof module!=='undefined')module.exports=LoadRegions83;
