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
 function pieces(p,f,s){let free=s.rects.map(r=>({...r})),out=[];const base=LoadData.floor(p,f),token=Loading.token('SLAB',s);
  for(const a of LoadData.areas(p,f)){const rs=a.rects||((a.panels||[]).includes(token)?s.rects:[]);for(const r of rs){for(const q of free){const hit=intersect(r,q);if(hit)out.push({...hit,load:{...a,ll:LoadData.live(a),basis:a.basis||base.basis,areaName:a.name,areaId:a.id}});}free=difference(free,[r]);}}
  return out.concat(free.map(r=>({...r,load:{...base,ll:LoadData.live(base),areaName:'整层默认',areaId:null}})));
 }
 function summary(parts){const total=parts.reduce((n,r)=>n+area(r),0),v={...parts[0]?.load};for(const k of ['dl','sdl','ll'])v[k]=parts.every(r=>Number.isFinite(r.load[k]))?parts.reduce((n,r)=>n+area(r)*r.load[k],0)/total:null;v.mixed=new Set(parts.map(r=>JSON.stringify([r.load.dl,r.load.sdl,r.load.ll,r.load.basis]))).size>1;v.basis=parts.every(r=>r.load.basis==='total')?'total':'legacy-additional';v.areaName=[...new Set(parts.map(r=>r.load.areaName))].join(' / ');return v;}
 // Reaction per metre along the support, integrated across the original span.
 function reaction(parts,dir,mid,lo,span,right,cs,sw,autoSW){const axis=dir==='X'?'y':'x',cross=dir==='X'?'x':'y';let out={g:0,q:0,sw:0,dl:0,sdl:0,mG:0,mQ:0,good:true};for(const r of parts){if(mid<=r[axis+'0']||mid>=r[axis+'1'])continue;const u=r[cross+'0']-lo,v=r[cross+'1']-lo,len=v-u,moment=right?span*len-(v*v-u*u)/2:(v*v-u*u)/2,weight=cs?len:right?(v*v-u*u)/(2*span):len-(v*v-u*u)/(2*span),load=r.load,dl=autoSW?0:load.dl;if(![dl,load.sdl,load.ll].every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0)){out.good=false;continue;}out.sw+=sw*weight;out.dl+=dl*weight;out.sdl+=load.sdl*weight;out.g+=(sw+dl+load.sdl)*weight;out.q+=load.ll*weight;out.mG+=(sw+dl+load.sdl)*moment;out.mQ+=load.ll*moment;}return out;}
 return {area,valid,intersect,subtract,difference,union,region,clip,pieces,summary,reaction};
})();
