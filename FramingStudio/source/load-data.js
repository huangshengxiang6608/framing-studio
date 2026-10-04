const LoadData=(()=>{
 const U=typeof UsageOptions!=='undefined'?UsageOptions:require('./usage.js');
 const colours=['#168b9b','#cf8241','#8058ac','#4e9368','#c95283','#526cc1'];
 const clone=x=>JSON.parse(JSON.stringify(x)),label=f=>f+'/F',key=(f,t)=>f+'|'+t;
 function init(p){p.explorer??={};const e=p.explorer;for(const k of ['settings','floors','members','selected','reportA','reportB','areas'])e[k]??={};e.schema=2;return e;}
 function floor(p,f){const old=p.explorer?.floors?.[f];return old?{usage:'',...old,basis:old.basis||'legacy-additional'}:{usage:'',dl:null,sdl:0,ll:null,direction:'短跨',basis:'total'};}
 function areas(p,f){return p.explorer?.areas?.[f]||[];}
 function live(v){return v.ll!==null&&v.ll!==undefined&&v.ll!==''?v.ll:U.find(u=>u.name===v.usage)?.ll??null;}
 function clean(v){for(const k of ['dl','sdl','ll'])if(v[k]!==null&&v[k]!==undefined&&(!Number.isFinite(v[k])||v[k]<0))throw Error(k+' 须为非负数或留空');return {usage:String(v.usage||''),dl:v.dl??null,sdl:v.sdl??null,ll:v.ll??null,direction:v.direction||'短跨',basis:'total'};}
 function setFloor(p,f,v,confirm=true){const basis=confirm?'total':floor(p,f).basis;init(p).floors[f]={...clean(v),basis};if(basis!=='total')return;const e=p.explorer;for(const [k,o]of Object.entries(e.members))if(k.startsWith(f+'|SLAB|'))for(const field of ['dl','sdl','ll'])if(o[field]!==undefined){(o.legacyLoading??={})[field]=o[field];delete o[field];}}
 function addArea(p,f){const e=init(p),a=e.areas[f]??=[],used=new Set(a.map(x=>x.id));let n=1;while(used.has('A'+n))n++;const item={...clean(floor(p,f)),id:'A'+n,name:'Area '+n,panels:[],colour:colours[(n-1)%colours.length]};a.push(item);return item;}
 function toggle(p,f,id,token){const a=areas(p,f),target=a.find(a=>a.id===id);if(!target)throw Error('请先选择荷载区域');const other=a.find(a=>a.id!==id&&a.panels.includes(token));if(other)throw Error('此板块已属于 '+other.name+'，请先从该区域移除');target.panels=target.panels.includes(token)?target.panels.filter(t=>t!==token):[...target.panels,token];}
 function effective(p,f,token){if(areas(p,f).some(a=>a.rects?.length)){const rects=LoadRegions83.region({panels:[token]});if(rects.length)return LoadRegions83.summary(LoadRegions83.pieces(p,f,{rects}));}const base=floor(p,f),a=areas(p,f).filter(a=>a.panels.includes(token));if(a.length>1)throw Error('同一板块属于多个荷载区域');const row=a[0]||base;return {...row,ll:live(row),areaName:a[0]?.name||'整层默认',basis:row.basis||base.basis};}
 // Remap only when the saved region is exactly the same union of rectangles.
 // Splitting/reordering panels must not erase loads; changed boundaries stay unresolved.
 function reconcile(p,result,tokenFn){let repaired=0;const rects=t=>{try{if(!t.startsWith('SLAB|'))return null;const r=JSON.parse(t.slice(5));return Array.isArray(r)&&r.length&&r.every(x=>Array.isArray(x)&&x.length===4&&x.every(Number.isFinite)&&x[1]>x[0]&&x[3]>x[2])?r:null;}catch{return null;}};
  const unionArea=rs=>{const xs=[...new Set(rs.flatMap(r=>[r[0],r[1]]))].sort((a,b)=>a-b);let area=0;for(let i=1;i<xs.length;i++){const mid=(xs[i]+xs[i-1])/2,ys=rs.filter(r=>r[0]<mid&&r[1]>mid).map(r=>[r[2],r[3]]).sort((a,b)=>a[0]-b[0]);let end=-Infinity,len=0;for(const [a,b]of ys){len+=Math.max(0,b-Math.max(a,end));end=Math.max(end,b);}area+=(xs[i]-xs[i-1])*len;}return area;};
  const intersect=(a,b)=>{const r=[Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.min(a[3],b[3])];return r[1]>r[0]&&r[3]>r[2]?[r]:[];};
  for(const f of result.floors){const aa=areas(p,f.n),current=Engine.floorModel(result,f).slabs.map(s=>({token:tokenFn('SLAB',s),rs:s.rects.map(r=>[r.x0,r.x1,r.y0,r.y1])})),valid=new Set(current.map(s=>s.token));
   const proposals=aa.map(a=>{if(a.rects)return a.panels||[];if(a.panels.every(t=>valid.has(t)))return a.panels;const parsed=a.panels.map(rects);if(parsed.some(x=>!x))return a.panels;const region=parsed.flat(),total=unionArea(region),eps=Math.max(1e-8,total*1e-9),picked=[];let covered=0;
    for(const s of current){const overlap=unionArea(region.flatMap(a=>s.rs.flatMap(b=>intersect(a,b)))),size=unionArea(s.rs);if(overlap<=eps)continue;if(Math.abs(overlap-size)>eps)return a.panels;picked.push(s.token);covered+=size;}
    return Math.abs(covered-total)<=eps&&picked.length?picked:a.panels;
   });
   // Do not introduce overlap between previously independent load areas.
   const counts=new Map();for(const ps of proposals)for(const t of ps)counts.set(t,(counts.get(t)||0)+1);
   proposals.forEach((ps,i)=>{if(ps!==aa[i].panels&&!ps.some(t=>counts.get(t)>1)){aa[i].panels=ps;repaired++;}});
  }return repaired;
 }

 function validate(p,f,tokens,model=null){const set=new Set(tokens),seen=new Set(),errors=[],aa=areas(p,f);for(let i=0;i<aa.length;i++)for(let j=i+1;j<aa.length;j++)if(LoadRegions83.region(aa[i]).some(a=>LoadRegions83.region(aa[j]).some(b=>LoadRegions83.intersect(a,b))))errors.push('荷载区域重叠，请重新框选');for(const a of areas(p,f)){if(a.rects){const footprint=model?LoadRegions83.surface(model):LoadRegions83.region({panels:tokens}),clipped=LoadRegions83.union(a.rects.flatMap(r=>footprint.map(q=>LoadRegions83.intersect(r,q)).filter(Boolean)));if(Math.abs(clipped.reduce((n,r)=>n+LoadRegions83.area(r),0)-a.rects.reduce((n,r)=>n+LoadRegions83.area(r),0))>1e-6)errors.push(a.name+' 的范围已改变，请重新框选');}for(const t of a.panels){if(!set.has(t))errors.push(a.name+' 的板块已改变，请重新点选区域');if(seen.has(t))errors.push('板块荷载区域重复');seen.add(t);}}return [...new Set(errors)];}
 function copy(p,result,from,lo,hi,tokenFn){if(!Number.isInteger(lo)||!Number.isInteger(hi)||lo<1||hi>p.total||lo>hi)throw Error('楼层范围无效');const source=floor(p,from);const aa=areas(p,from);for(let f=lo;f<=hi;f++){const model=Engine.floorModel(result,f),tokens=new Set(model.slabs.map(c=>tokenFn('SLAB',c)));if(aa.some(a=>a.panels.some(t=>!tokens.has(t))))throw Error(f+'/F 板块不同，不能直接复制区域；请单独设置');}for(let f=lo;f<=hi;f++){setFloor(p,f,source);init(p).areas[f]=clone(aa);}}
 function parseRange(text,total){const s=String(text).trim().toUpperCase().replace(/\s/g,'').replace(/／/g,'/').replace(/[–—~～至]/g,'-');const m=s.match(/^(\d+)(?:\/F)?(?:-(\d+)(?:\/F)?)?$/);if(!m)throw Error('楼层范围请填 1-10/F 或 3/F');const lo=Number(m[1]),hi=Number(m[2]||m[1]);if(!Number.isSafeInteger(lo)||!Number.isSafeInteger(hi)||lo<1||hi<lo||hi>total)throw Error('楼层范围须在 1-'+total+'/F 内，且起始层不大于结束层');return {lo,hi};}
 function applyRange(p,text,v){const range=parseRange(text,p.total),value=clean(v);if(value.sdl===null||live(value)===null)throw Error('请填写 SDL 和 LL；LL 可由 Usage 自动带出');for(let f=range.lo;f<=range.hi;f++)setFloor(p,f,{...floor(p,f),usage:value.usage,dl:value.dl,sdl:value.sdl,ll:value.ll});return range;}

 return {reconcile,parseRange,applyRange,init,floor,areas,live,clean,setFloor,addArea,toggle,effective,validate,copy,label,key,colours};
})();
if(typeof module!=='undefined')module.exports=LoadData;

const LoadGroups=(()=>{
 const clone=x=>JSON.parse(JSON.stringify(x)),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function list(p,result,key){const out=[],last=new Map();for(const f of result.floors.filter(f=>f.type===key)){
  const rows=[];if(Object.hasOwn(p.explorer?.floors||{},f.n))rows.push({scope:'whole',value:clone(LoadData.floor(p,f.n)),ref:{f:f.n,snapshot:clone(p.explorer.floors[f.n])}});
  for(const a of LoadData.areas(p,f.n)){const {id,...value}=a;rows.push({scope:'area',value:clone(value),ref:{f:f.n,id,snapshot:clone(a)}});}
  for(const row of rows){const stamp=JSON.stringify([row.scope,row.value]),g=last.get(stamp);if(g&&g.hi===f.n-1){g.hi=f.n;g.refs.push(row.ref);}else{const next={id:'G'+out.length,scope:row.scope,lo:f.n,hi:f.n,value:row.value,refs:[row.ref]};out.push(next);last.set(stamp,next);}}
 }return out;}
 function assertSource(p,source){if(!source)return;for(const r of source.refs){const actual=source.scope==='whole'?p.explorer?.floors?.[r.f]:LoadData.areas(p,r.f).find(a=>a.id===r.id);if(!eq(actual,r.snapshot))throw Error('这组荷载已改变，请重新选择后编辑');}}
 function remove(p,source){assertSource(p,source);for(const r of source.refs){if(source.scope==='whole')delete p.explorer.floors[r.f];else p.explorer.areas[r.f]=LoadData.areas(p,r.f).filter(a=>a.id!==r.id);}}
 function save(p,result,key,draft,source){
  const range=LoadData.parseRange(draft.lo+'-'+draft.hi+'/F',p.total),value=LoadData.clean(draft);assertSource(p,source);
  if(!['whole','area'].includes(draft.scope))throw Error('请选择整层或指定区域');if(value.sdl===null||LoadData.live(value)===null)throw Error('请填写 SDL 和 LL；LL 可采用 Usage 默认值');
  const panels=[...new Set(draft.panels||[])];if(draft.scope==='area'){
   if(!String(draft.name||'').trim())throw Error('请填写区域名称');if(!panels.length&&!draft.rects?.length)throw Error('请先在 Plan 拖框选择范围');if(draft.rects){const clipped=LoadRegions83.clipSurface(draft.rects,Engine.floorModel(result,range.lo,key));if(Math.abs(clipped.reduce((n,r)=>n+LoadRegions83.area(r),0)-draft.rects.reduce((n,r)=>n+LoadRegions83.area(r),0))>1e-6)throw Error('范围已超出楼板，请重新框选');}
   for(let f=range.lo;f<=range.hi;f++){if(result.floors[f-1].type!==key)throw Error(f+'/F 使用不同 Framing，请分开设置区域荷载组');if(draft.rects){const clipped=LoadRegions83.clipSurface(draft.rects,Engine.floorModel(result,f,key));if(Math.abs(clipped.reduce((n,r)=>n+LoadRegions83.area(r),0)-draft.rects.reduce((n,r)=>n+LoadRegions83.area(r),0))>1e-6)throw Error(FloorLevels.name(p,f)+' 区域穿过局部挑高或无楼板区，请分开设置');}const available=new Set(Engine.floorModel(result,f,key).slabs.map(c=>Loading.token('SLAB',c)));if(panels.some(t=>!available.has(t)))throw Error('所选板块已变化，请重新框选');
    const own=source?.scope==='area'?source.refs.find(r=>r.f===f)?.id:null,model=Engine.floorModel(result,f,key);const overlap=LoadRegions83.surfaceRegions(p,f,model).find(a=>a.id!==own&&LoadRegions83.region(a).some(r=>LoadRegions83.region(draft).some(q=>LoadRegions83.intersect(r,q))));if(overlap&&!draft.replaceOverlap)throw Error(f+'/F 与 '+overlap.name+' 的区域重叠，请先调整范围');
   }
  }
  const oldFloors=new Map();for(let f=range.lo;f<=range.hi;f++)oldFloors.set(f,LoadData.floor(p,f));
  if(source)remove(p,source);const ex=LoadData.init(p);
  for(let f=range.lo;f<=range.hi;f++){
   if(draft.scope==='whole')LoadData.setFloor(p,f,{...value,direction:oldFloors.get(f).direction});
   else{if(draft.replaceOverlap)removeRegion(p,result,f,LoadRegions83.region(draft));const aa=ex.areas[f]??=[],old=source?.scope==='area'?source.refs.find(r=>r.f===f)?.snapshot:null;let n=1;while(aa.some(a=>a.id==='A'+n))n++;const id=old&&!aa.some(a=>a.id===old.id)?old.id:'A'+n;aa.push({...old,...value,id,name:String(draft.name).trim(),direction:source?.value?.direction||'短跨',colour:old?.colour||source?.value?.colour||LoadData.colours[(n-1)%LoadData.colours.length],panels:[...panels],...(draft.rects?{rects:LoadRegions83.union(draft.rects),selectionRects:draft.selectionRects?LoadRegions83.union(draft.selectionRects):undefined}:{rects:undefined,selectionRects:undefined})});}
  }return range;
 }
 function pick(slabs,box){return slabs.filter(s=>s.rects.some(r=>Math.min(r.x1,box.x1)-Math.max(r.x0,box.x0)>1e-8&&Math.min(r.y1,box.y1)-Math.max(r.y0,box.y0)>1e-8)).map(s=>Loading.token('SLAB',s));}
 function inkMap84(p,result){
  const stamp=v=>JSON.stringify({usage:v.usage||'',dl:v.dl??null,sdl:v.sdl??null,ll:LoadData.live(v),basis:v.basis}),all=new Set();
  for(const f of result.floors){all.add(stamp(LoadData.floor(p,f.n)));for(const a of LoadData.areas(p,f.n))all.add(stamp(a));}
  const used=[],map=new Map(),distance=(a,b)=>Math.min(Math.abs(a-b),360-Math.abs(a-b)),gap=Math.min(65,300/Math.max(1,all.size));
  for(const key of [...all].sort()){let hash=2166136261;for(const ch of key)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;let hue=hash%360;for(let n=0;n<360&&used.some(h=>distance(h,hue)<gap);n++)hue=(hue+1)%360;used.push(hue);map.set(key,`hsl(${hue} 67% 40%)`);}
  return {map,stamp};
 }
 function overview(p,result,f){
  const model=Engine.floorModel(result,f);if(!model)return [];const groups=[],byValue=new Map(),inks=inkMap84(p,result);
  for(const part of LoadRegions83.pieces(p,f,{rects:LoadRegions83.surface(model)},LoadRegions83.surfaceRegions(p,f,model))){const v=part.load,values={usage:v.usage||'',dl:v.dl??null,sdl:v.sdl??null,ll:LoadData.live(v),basis:v.basis},unassigned=v.areaId===null&&!v.usage&&v.ll==null&&(v.sdl==null||v.sdl===0),stamp=JSON.stringify([unassigned,values]),conflict=false;let g=byValue.get(stamp);
   if(!g){const n=groups.filter(g=>!g.unassigned).length;let hash=2166136261;for(const ch of stamp)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;g={...values,conflict,unassigned,number:unassigned?null:n+1,name:unassigned?'未分配荷载':values.usage||'未选用途',colour:unassigned?'#f7f8f9':inks.map.get(inks.stamp(v))||`hsl(${hash%360} 67% 40%)`,rects:[],panels:[],areaIds:[],area:0};groups.push(g);byValue.set(stamp,g);}
   const {load,...rect}=part;g.rects.push(rect);for(const slab of model.slabs)if(slab.rects.some(r=>LoadRegions83.intersect(r,rect))){const t=Loading.token('SLAB',slab);if(!g.panels.includes(t))g.panels.push(t);}if(!g.areaIds.includes(v.areaId))g.areaIds.push(v.areaId);g.area+=LoadRegions83.area(part);
  }return groups;
 }

 // Guard the displayed legend against stale load assignments. Only this floor
 // is edited, even when the saved-group list combines several floors.
 function legendState(p,f){return JSON.stringify([p.explorer?.floors?.[f]??null,LoadData.areas(p,f)]);}
 function removeLegend(p,result,f,row,snapshot){
  if(!Number.isInteger(f)||!result.floors[f-1]||!row||row.unassigned)throw Error('请选择已分配的荷载图例');
  const current=overview(p,result,f).find(g=>eq(g,row));
  if(!current||snapshot!==legendState(p,f))throw Error('荷载图例已变化，请重新选择后删除');
  const selected=new Set(current.panels),ex=LoadData.init(p);if(current.areaIds.includes(null))delete ex.floors[f];
  ex.areas[f]=LoadData.areas(p,f).filter(a=>!current.areaIds.includes(a.id));
  const remaining=overview(p,result,f);
  return {panels:selected.size,restoredDefault:remaining.some(g=>!g.unassigned&&g.panels.some(t=>selected.has(t)))};
 }

 function completion(p,result,f){
  const view=overview(p,result,f),tokens=Engine.floorModel(result,f).slabs.map(s=>Loading.token('SLAB',s)),total=view.reduce((n,g)=>n+g.area,0);
  if(!total)return {status:'empty',label:'无受荷楼面',complete:0,total:0};
  const valid=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
  const complete=view.reduce((n,g)=>n+(!g.conflict&&[g.sdl,g.ll].every(valid)?g.area:0),0);
  const issues=LoadData.validate(p,f,tokens,Engine.floorModel(result,f)),base=LoadData.floor(p,f),areas=LoadData.areas(p,f);
  if(Math.abs(complete-total)<1e-6&&!issues.length)return {status:'complete',label:'荷载已填齐',complete,total};
  const started=complete>0||areas.length>0||!!base.usage||base.ll!=null||(base.sdl!=null&&base.sdl!==0);
  return {status:started?'partial':'empty',label:issues.length?'区域需核对':started?'荷载未填齐':'未填写',complete,total};
 }


 // Explicit edits remove only the chosen footprint, including beam tops.
 function removeRegion(p,result,f,rects){
  if(!result.floors[f-1])throw Error('请选择有效楼层');if(!rects.length)return;
  const model=Engine.floorModel(result,f),expanded=LoadRegions83.surfaceRegions(p,f,model),ex=LoadData.init(p);
  ex.areas[f]=LoadData.areas(p,f).map(a=>{const region=expanded.find(r=>r.id===a.id)?.rects||[];if(!region.some(r=>rects.some(q=>LoadRegions83.intersect(r,q))))return a;
   return {...a,panels:[],rects:LoadRegions83.difference(LoadRegions83.clipSurface(region,model),rects),selectionRects:LoadRegions83.difference(a.selectionRects||region,rects)};
  }).filter(a=>a.rects?a.rects.length:(a.panels||[]).length);
 }
 function removePanels(p,result,f,panels){
  if(!result.floors[f-1])throw Error('请选择有效楼层');const m=Engine.floorModel(result,f),chosen=new Set(panels),rs=m.slabs.filter(s=>chosen.has(Loading.token('SLAB',s))).flatMap(s=>s.rects);if(!rs.length)throw Error('请选择 Slab');
  const ex=LoadData.init(p);ex.areas[f]=LoadData.areas(p,f).map(a=>a.rects?{...a,rects:LoadRegions83.difference(a.rects,rs)}:{...a,panels:a.panels.filter(t=>!chosen.has(t))}).filter(a=>a.rects?a.rects.length:a.panels.length);
 }
 return {list,save,remove,pick,overview,completion,legendState,removeLegend,removePanels,removeRegion};
})();
