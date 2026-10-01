// Display the geometric tributary areas used by the A/B column calculation.
const ColumnLoads101=(()=>{
 let target=null,sourceView=false,cacheKey='',cache=new Map();
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=x=>Number.isFinite(x)?Number(x.toFixed(3)):'—',ar=r=>(r.x1-r.x0)*(r.y1-r.y0),intersection=(a,b)=>{const r={x0:Math.max(a.x0,b.x0),x1:Math.min(a.x1,b.x1),y0:Math.max(a.y0,b.y0),y1:Math.min(a.y1,b.y1)};return ar(r)>1e-8&&r.x1>r.x0&&r.y1>r.y0?r:null;};
 function select(t){target=t;sourceView=false;}
 function clear(){target=null;sourceView=false;}
 function shape(p,result,g){const rects=(g.rects||[]).map(r=>({...r})),polygons=(g.polygons||[]).map(q=>({...q,points:q.points.map(p=>[...p])}));return {rects,polygons,b:g.b??null,d:g.d??null,partitioned:!!g.partitioned,weighted:[...rects,...polygons].some(r=>Math.abs(r.fraction-1)>1e-6)};}
 function schedule(p,result,f,token,auto=true){const stamp=JSON.stringify(p);if(stamp!==cacheKey){cacheKey=stamp;cache=new Map();}const key=f+'|'+token+'|'+auto;if(cache.has(key))return cache.get(key);const o=Loading.input(p,f,token),a=auto?Loading.columnAreas(p,result,f,token):{groups:Loading.parseColumnAreaRows(o.sectionAAreas,p,f),errors:[]},rows=[];for(let n=f;n<=p.total;n++){const groups=a.groups.filter(g=>g.lo<=n&&g.hi>=n),parts=[];let G=0,Q=0,area=0,complete=true;for(const g of groups){let load=Loading.floorload(p,n);if(g.areaId||g.areaName&&g.areaName!=='整层默认'){const aa=LoadData.areas(p,n).filter(x=>g.areaId?x.id===g.areaId:x.name===g.areaName||x.id===g.areaName);if(aa.length!==1){complete=false;load={dl:null,sdl:null,ll:null,basis:'total'};}else load=aa[0];}const ll=LoadData.live(load),shapeData=auto?shape(p,result,{...g,lo:n},f,token):{rects:[],polygons:[],b:g.b,d:g.d,weighted:false},good=[load.dl,load.sdl,ll].every(x=>Number.isFinite(x)&&x>=0)&&load.basis==='total';complete&&=good;const dead=good?g.area*(load.dl+load.sdl):null,live=good?g.area*ll:null;G+=dead||0;Q+=live||0;area+=g.area;parts.push({...g,...shapeData,dl:load.dl,sdl:load.sdl,ll,G:dead,Q:live});}rows.push({floor:n,parts,area,G:complete?G:null,Q:complete?Q:null});}
 // Geometry remains visible when transfer mapping needs confirmation.
 let upperG=0,upperQ=0,valid=!a.errors.length;for(const r of [...rows].reverse()){r.upperG=valid?upperG:null;r.upperQ=valid?upperQ:null;valid&&=r.G!==null&&r.Q!==null;r.totalG=valid?upperG+r.G:null;r.totalQ=valid?upperQ+r.Q:null;r.design=valid?1.4*r.totalG+1.6*r.totalQ:null;upperG+=r.G||0;upperQ+=r.Q||0;}const missing=rows.filter(r=>r.G===null||r.Q===null).map(r=>FloorLevels.name(p,r.floor)+' 的 DL／SDL／LL 或荷载基准未完整确认');const answer={rows,errors:[...new Set([...a.errors,...missing])],totalG:valid?upperG:null,totalQ:valid?upperQ:null,auto};cache.set(key,answer);return answer;}
 function table(h,auto){if(!h.selected)return '';selectSame(h.floor,h.selected.token);let d;try{d=schedule(h.p,h.result,h.floor,h.selected.token,auto);}catch(e){return '<div class="issue">'+esc(e.message)+'</div>';}
  const force=(g,q)=>'<span style="display:block">G '+num(g)+'</span><span style="display:block">Q '+num(q)+'</span>',dims=r=>{if(r.parts.length===1&&r.parts[0].b!=null)return [r.parts[0].b,r.parts[0].d];const rs=r.parts.flatMap(x=>x.rects);if(r.parts.some(x=>x.polygons?.length)||!rs.length||rs.some(r=>Math.abs(r.fraction-1)>1e-6))return [null,null];const b=Math.max(...rs.map(r=>r.x1))-Math.min(...rs.map(r=>r.x0)),dd=Math.max(...rs.map(r=>r.y1))-Math.min(...rs.map(r=>r.y0));return Math.abs(b*dd-r.area)<1e-5?[b,dd]:[null,null];};
  const design=Number.isFinite(d.totalG)&&Number.isFinite(d.totalQ)?1.4*d.totalG+1.6*d.totalQ:null;
  return '<h3>'+esc(FloorLevels.name(h.p,h.floor))+' · '+esc(h.selected.id)+' 逐层受荷</h3>'+(d.errors.length?'<div class="issue">'+d.errors.map(esc).join('<br>')+'</div>':'')+'<div class="table-wrap column-load-table101"><table style="font-size:12px;min-width:440px"><thead><tr><th>来源楼层</th><th>受荷 B m</th><th>受荷 D m</th><th>面积 m²</th><th>本层<br>G / Q kN</th><th>上部<br>G / Q kN</th><th>累计<br>G / Q kN</th></tr></thead><tbody>'+d.rows.map(r=>{const [b,dd]=dims(r);return '<tr'+(r.floor===(h.viewFloor||h.floor)?' style="background:#e6f5f7"':'')+'><td><button data-column-source101="'+r.floor+'">'+esc(FloorLevels.name(h.p,r.floor))+'</button></td><td>'+num(b)+'</td><td>'+num(dd)+'</td><td>'+num(r.area)+'</td><td>'+force(r.G,r.Q)+'</td><td>'+force(r.upperG,r.upperQ)+'</td><td>'+force(r.totalG,r.totalQ)+'</td></tr>';}).join('')+'</tbody></table></div><p>所选柱累计 G = <b>'+num(d.totalG)+'</b> kN；Q = <b>'+num(d.totalQ)+'</b> kN；1.4G + 1.6Q = <b>'+num(design)+'</b> kN。</p><p class="muted">面积按相邻柱／墙支承线各取半跨，边缘取到建筑边界，Opening／删板范围扣除；不规则柱网中相交的半跨范围按柱参考点等距线分界，同一块板只计入一次；本层 G = 面积 × (DL + SDL)，Q = 面积 × LL；DL 已含自重。上部累计不包含本层，累计为本层加上部。B / D 是受荷范围尺寸；非矩形或转换梁分配的面积显示 —。点击来源楼层查看其给本柱传荷的区域。柱项目系数仍在柱 Check 中独立采用。几何面积与传荷检查分开；梁传荷错误仍在构件 Check 中提示。</p><details><summary>查看各荷载区域及 DL / SDL / LL</summary><div class="table-wrap"><table><thead><tr><th>楼层</th><th>区域</th><th>面积 m²</th><th>DL kPa</th><th>SDL kPa</th><th>LL kPa</th><th>本区域 G / Q kN</th></tr></thead><tbody>'+d.rows.flatMap(r=>r.parts.map(x=>'<tr><td>'+esc(FloorLevels.name(h.p,r.floor))+'</td><td>'+esc(x.areaName)+'</td><td>'+num(x.area)+'</td><td>'+num(x.dl)+'</td><td>'+num(x.sdl)+'</td><td>'+num(x.ll)+'</td><td>'+force(x.G,x.Q)+'</td></tr>')).join('')+'</tbody></table></div></details>';
 }
 function selectSame(f,t){if(target?.floor!==f||target?.token!==t)select({floor:f,token:t});}
 function highlights(p,result,f){if(!target)return [];const col=Loading.members(p,result,target.floor).find(x=>x.token===target.token);if(!col||col.kind!=='COL'){clear();return [];}const o=Loading.input(p,target.floor,target.token),auto=!String(o.sectionAAreas||'').trim()||o.sectionAAreaMode==='auto';let d;try{d=schedule(p,result,target.floor,target.token,auto);}catch{return [];}const r=d.rows.find(r=>r.floor===f);if(!r)return [];return r.parts.flatMap(x=>x.weighted?x.rects.map((rect,i)=>({colour:'#0096a7',fraction:rect.fraction,active:true,name:i===0?col.id+' · '+num(r.area)+' m² · 几何面积经 TB 分配':' ',rects:[rect]})):[{colour:'#0096a7',active:true,name:col.id+' · '+num(r.area)+' m²',rects:x.rects}]);}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-column-source101]');if(!b||!target)return;sourceView=true;StudioHost.viewFloor(+b.dataset.columnSource101);});
 // Geometric footprints are independent of force-solver errors.
 function viewData(p,result,f){if(target&&p.transferTrusses?.length&&TrussUI109.results(p,result).rows.some(r=>r.floor===target.floor&&r.token===target.token&&r.truss109?.length))return null;
  if(!target)return null;
  const col=Loading.members(p,result,target.floor).find(x=>x.token===target.token);
  if(!col||col.kind!=='COL'){clear();return null;}
  const o=Loading.input(p,target.floor,target.token),auto=!String(o.sectionAAreas||'').trim()||o.sectionAAreaMode==='auto';
  let d;try{d=schedule(p,result,target.floor,target.token,auto);}catch{return null;}
  const row=d.rows.find(r=>r.floor===f);if(!row)return null;
  const polygons=row.parts.flatMap(x=>x.polygons||[]),rects=row.parts.flatMap(x=>x.rects).filter(r=>[r.x0,r.x1,r.y0,r.y1].every(Number.isFinite)&&r.x1>r.x0&&r.y1>r.y0);
  const weighted=row.parts.some(x=>x.weighted||x.rects.some(r=>Math.abs(r.fraction-1)>1e-6));
  return {id:col.id,token:target.token,targetFloor:target.floor,targetName:FloorLevels.name(p,target.floor),floor:f,floorName:FloorLevels.name(p,f),area:row.area,rects,polygons,partitioned:row.parts.some(x=>x.partitioned),weighted,auto,errors:d.errors,targetRect:Engine.columnRect(col.member||col)};
 }
 // Union boundaries omit internal joints and retain real Opening boundaries.
 function outline(rects){
  const xs=[...new Set(rects.flatMap(r=>[r.x0,r.x1]))].sort((a,b)=>a-b),segments=[];
  const merge=ys=>{const out=[];for(const pair of ys.sort((a,b)=>a[0]-b[0])){const last=out.at(-1);if(last&&pair[0]<=last[1]+1e-8)last[1]=Math.max(last[1],pair[1]);else out.push([...pair]);}return out;};
  const vertical=(x,a,b)=>{const ys=[...new Set([...a,...b].flat())].sort((a,b)=>a-b),within=(s,y)=>s.some(r=>r[0]<y&&r[1]>y);for(let i=0;i<ys.length-1;i++){const y=(ys[i]+ys[i+1])/2;if(within(a,y)!==within(b,y))segments.push([[x,ys[i]],[x,ys[i+1]]]);}};
  let previous=[];
  for(let i=0;i<xs.length-1;i++){const x=(xs[i]+xs[i+1])/2,ys=merge(rects.filter(r=>r.x0<x&&r.x1>x).map(r=>[r.y0,r.y1]));vertical(xs[i],previous,ys);for(const [a,b]of ys){segments.push([[xs[i],a],[xs[i+1],a]],[[xs[i],b],[xs[i+1],b]]);}previous=ys;}
  if(xs.length)vertical(xs.at(-1),previous,[]);
  return segments;
 }
 function issueCaption(data){
  const errors=data.errors||[];if(!errors.length)return '';
  const reasons=[];
  if(errors.some(e=>/参考点重合|半跨范围.*重叠/.test(e)))reasons.push('柱位置／面积划分待核对');
  if(errors.some(e=>/荷载区域重叠/.test(e)))reasons.push('Loading 区域重叠');
  if(errors.some(e=>/DL|SDL|LL|荷载基准|荷载区域(?!重叠)/.test(e)))reasons.push('荷载输入待补齐');
  if(errors.some(e=>/柱／TB|支承|转换路径|固定端/.test(e)))reasons.push('转换支承待确认');
  if(!reasons.length)reasons.push('输入待核对');
  return [...new Set(reasons)].join('；');
 }
 function region(ctx,plot,w,h,data){
  if(!data||!Number.isFinite(data.area)||!data.rects.length&&!data.polygons?.length)return null;
  const {scale,ox,oy}=plot,rects=data.rects.map(r=>({x:ox+r.x0*scale,y:oy+r.y0*scale,w:(r.x1-r.x0)*scale,h:(r.y1-r.y0)*scale})),polygons=(data.polygons||[]).map(q=>q.points.map(p=>[ox+p[0]*scale,oy+p[1]*scale]));
  const path=()=>{ctx.beginPath();for(const r of rects)ctx.rect(r.x,r.y,r.w,r.h);for(const ps of polygons){ctx.moveTo(...ps[0]);for(const p of ps.slice(1))ctx.lineTo(...p);ctx.closePath();}};
  ctx.save();ctx.setLineDash([]);path();ctx.clip();ctx.fillStyle='rgba(201,237,255,.76)';ctx.fillRect(0,0,w,h);
  if(data.weighted){ctx.strokeStyle='rgba(0,99,156,.42)';ctx.lineWidth=1;ctx.beginPath();for(let x=-h;x<w+h;x+=13){ctx.moveTo(x,h);ctx.lineTo(x+h,0);}ctx.stroke();}ctx.restore();
  // Split and cancel shared edges, including diagonal equal-distance boundaries.
  const ps=[...data.rects.map(r=>[[r.x0,r.y0],[r.x1,r.y0],[r.x1,r.y1],[r.x0,r.y1]]),...(data.polygons||[]).map(q=>q.points)],vertices=ps.flat(),edges=new Map();
  const key=p=>p.map(x=>Math.round(x*1e7)).join(',');
  for(const poly of ps)for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;if(l2<1e-14)continue;const ts=[0,1];for(const q of vertices){const t=((q[0]-a[0])*dx+(q[1]-a[1])*dy)/l2;if(t>1e-8&&t<1-1e-8&&Math.abs((q[0]-a[0])*dy-(q[1]-a[1])*dx)<1e-7*Math.sqrt(l2))ts.push(t);}ts.sort((a,b)=>a-b);for(let j=0;j<ts.length-1;j++){if(ts[j+1]-ts[j]<1e-8)continue;const u=[a[0]+ts[j]*dx,a[1]+ts[j]*dy],v=[a[0]+ts[j+1]*dx,a[1]+ts[j+1]*dy],k=[key(u),key(v)].sort().join('|');if(edges.has(k))edges.delete(k);else edges.set(k,[u,v]);}}
  const segments=[...edges.values()];ctx.save();ctx.setLineDash([]);ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();for(const [a,b]of segments){ctx.moveTo(ox+a[0]*scale,oy+a[1]*scale);ctx.lineTo(ox+b[0]*scale,oy+b[1]*scale);}ctx.strokeStyle='#ffffff';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle='#006aa6';ctx.lineWidth=3;ctx.stroke();ctx.restore();
  const occupied=[...rects,...polygons.map(ps=>({x:Math.min(...ps.map(p=>p[0])),y:Math.min(...ps.map(p=>p[1])),w:Math.max(...ps.map(p=>p[0]))-Math.min(...ps.map(p=>p[0])),h:Math.max(...ps.map(p=>p[1]))-Math.min(...ps.map(p=>p[1]))}))];
  return {rects:occupied,segments,weighted:data.weighted,fillOpacity:.76,boundaryWidth:3};
 }

 function badge(ctx,plot,w,h,data,paint){
  if(!data||w<80||h<60)return null;
  const margin=12,bw=Math.min(w<700?242:280,w-2*margin),bh=Math.min(98,h-2*margin),overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  const canvasBox=ctx.canvas.id==='canvas'?ctx.canvas.getBoundingClientRect():null,overlays=canvasBox?[document.getElementById('hint'),ctx.canvas.parentElement.querySelector('.canvas-actions')].filter(Boolean).map(el=>{const r=el.getBoundingClientRect();return {x:r.left-canvasBox.left-6,y:r.top-canvasBox.top-6,w:r.width+12,h:r.height+12};}):[];
  const belowHint=Math.max(margin,...overlays.filter(r=>r.y<h/2).map(r=>r.y+r.h+6));
  const candidates=[{x:margin,y:margin},{x:w-bw-margin,y:margin},{x:margin,y:belowHint},{x:w-bw-margin,y:belowHint},{x:margin,y:h-bh-48},{x:w-bw-margin,y:h-bh-48}].map(r=>({...r,y:Math.max(margin,Math.min(h-bh-margin,r.y)),w:bw,h:bh}));
  const occupied=paint?.rects||[],targetHit=plot.hits?.find(x=>x.kind==='COL'&&x.id===data.id&&(!x.f||x.f===data.targetFloor)),targetBox=targetHit&&{x:plot.ox+(targetHit.r.x-targetHit.r.w/2)*plot.scale-20,y:plot.oy+(targetHit.r.y-targetHit.r.d/2)*plot.scale-20,w:targetHit.r.w*plot.scale+40,h:targetHit.r.d*plot.scale+40};
  const score=r=>occupied.reduce((n,t)=>n+overlap(r,t),0)+(targetBox?overlap(r,targetBox)*10:0)+overlays.reduce((n,t)=>n+overlap(r,t)*1000,0);
  const box=candidates.reduce((a,b)=>score(a)<=score(b)?a:b),colour='#005c91';
  ctx.save();ctx.setLineDash([]);ctx.shadowColor='rgba(28,64,86,.18)';ctx.shadowBlur=8;ctx.shadowOffsetY=2;ctx.fillStyle='#ffffff';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle='#7bb4d0';ctx.lineWidth=1;ctx.strokeRect(box.x,box.y,box.w,box.h);ctx.fillStyle=colour;ctx.fillRect(box.x,box.y,4,box.h);
  ctx.beginPath();ctx.rect(box.x+8,box.y+4,box.w-16,box.h-8);ctx.clip();
  const write=(s,y,size=12,bold=false,ink=colour,whole=false)=>{const font=()=>ctx.font=(bold?'600 ':'')+size+'px "Segoe UI", "Microsoft YaHei", sans-serif';font();ctx.fillStyle=ink;const max=box.w-28;if(whole)while(ctx.measureText(s).width>max&&size>10){size--;font();}while(ctx.measureText(s).width>max&&s.length>1)s=s.slice(0,-2)+'…';ctx.fillText(s,box.x+14,box.y+y);};
  const same=data.floor===data.targetFloor,title=same?data.id+' · '+data.floorName:data.id+' · 目标柱 '+data.targetName;
  write(title,19,13,true);write(Number.isFinite(data.area)?'受荷面积 '+num(data.area)+' m²':'受荷面积待确认',46,21,true,colour,true);
  write('来源楼层：'+data.floorName,66,12,false,'#36586d');
  const caption=issueCaption(data)||(!data.rects.length&&!data.polygons?.length?(data.auto?'所选范围没有楼板面积':'手动面积，暂无对应几何范围'):data.weighted?'斜线：几何面积经转换梁分配':data.partitioned?'半跨按等距线分界 · Opening 已扣除':'几何半跨范围 · Opening 已扣除');
  write(caption,87,12,false,'#36586d',true);ctx.restore();
  return {...box,title,caption,area:data.area,floor:data.floor,targetFloor:data.targetFloor,overlayOverlap:overlays.reduce((n,t)=>n+overlap(box,t),0)};
 }

 return {select,clear,table,schedule,highlights,viewData,region,badge,outline,issueCaption,browsing:()=>sourceView,matches:(t,f)=>target?.floor===f&&target?.token===t};
})();