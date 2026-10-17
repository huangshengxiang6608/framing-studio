/* Local geometry diagnostics. Never mutate project data while rendering/checking. */
const GeometryIssuesLocal=(()=>{
 const eps=1e-6,esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let focus=null;
 function columnRecord(p,key,record){
  const t=p.types[key],df={...p.defaults,...t.columnDefaults101},q=Engine.resolve(p,record,key),b=(record.bMode201==='default'?df.cb:record.b)/1000,d=(record.dMode201==='default'?df.cd:record.d)/1000;
  if(![...q,b,d].every(Number.isFinite)||b<=0||d<=0)return null;
  const c={...record,x:q[0],y:q[1],b,d},xx=Engine.axes(p,'x',key),yy=Engine.axes(p,'y',key),near=(a,z)=>Math.abs(a-z)<eps;
  c.cx=c.x+(near(c.x,xx[0].v)?b/2:near(c.x,xx.at(-1).v)?-b/2:0);c.cy=c.y+(near(c.y,yy[0].v)?d/2:near(c.y,yy.at(-1).v)?-d/2:0);
  const placement=t.columnPlacements?.find(v=>v.key===Engine.columnPositionKey(c)),position=Engine.columnPositionRecord(t,c);
  if(placement){c.x=c.cx=placement.resize174?placement.resize174.x+placement.resize174.dx*b/2:placement.x;c.y=c.cy=placement.resize174?placement.resize174.y+placement.resize174.dy*d/2:placement.y;}
  else if(position){const ref=Engine.columnReference(p,key,c),offset=Engine.columnDirections[position.position];if(offset){c.cx=ref[0]+offset[0]*b/2;c.cy=ref[1]+offset[1]*d/2;}}
  return c;
 }
 function outsideColumns(p,key){
  const t=p.types[key];if(!t)return [];
  // Openings remain part of the building outline. Touching/partly crossing
  // columns need review, not automatic deletion. Visibility is irrelevant.
  const outline=Engine.tiles(p,t).filter(r=>r.state!==0);
  return t.columns.filter(c=>c.on&&(t.mode!=='auto'||c.autoAdded)).map(c=>columnRecord(p,key,c)).filter(Boolean).filter(c=>{const r=Engine.columnRect(c);return !outline.some(t=>r.x+r.w/2>=t.x0-eps&&r.x-r.w/2<=t.x1+eps&&r.y+r.d/2>=t.y0-eps&&r.y-r.d/2<=t.y1+eps);});
 }
 function cleanup(p,key){
  const t=p.types[key],removed=outsideColumns(p,key);if(!removed.length)return [];
  const ids=new Set(removed.map(c=>c.id)),keys=new Set(removed.map(Engine.columnPositionKey)),tokens=new Set(removed.map(c=>Loading.token('COL',c)));
  for(const record of t.columns.filter(c=>ids.has(c.id))){const q=Engine.resolve(p,record,key);tokens.add(Loading.token('COL',{x:q[0],y:q[1]}));}
  t.columns=t.columns.filter(c=>!ids.has(c.id));
  for(const field of ['columnAxisPositions','columnPlacements'])if(t[field])t[field]=t[field].filter(c=>!keys.has(c.key));
  // Remove only selections/inputs for these records on floors of this Framing.
  // Same IDs in a different Framing are independent and stay intact.
  const ex=p.explorer,representatives=ex?.representatives250;
  for(const f of Engine.floors(p).filter(f=>f.type===key))for(const map of [ex?.members,ex?.selected,ex?.reportA,ex?.reportB,representatives?.owned,representatives?.overrides,representatives?.hidden290]){
   if(!map||Array.isArray(map))continue;for(const token of tokens)delete map[f.n+'|'+token];
  }
  return removed.map(c=>c.id);
 }
 function syncBoundary(p,before){
  if(!before)return [];
  Engine.bindWallChanges302(p,before);
  for(const key of Object.keys(p.types))if(before.types[key]&&JSON.stringify(p.types[key].noColumnZones)!==JSON.stringify(before.types[key].noColumnZones))Engine.bindMainColumns164(p,key,Engine.model(before,key));
  const changes=[];for(const key of Object.keys(p.types)){if(!before.types[key])continue;
   const shape=q=>JSON.stringify([q.types[key].building,Engine.axisData(q,key)]);
   if(shape(p)===shape(before))continue;const ids=cleanup(p,key);if(ids.length)changes.push({key,ids});
  }return changes;
 }
 function groups(items){
  const map=new Map();for(const i of items.filter(i=>i.kind==='MODEL')){
   const key=JSON.stringify([i.framing,i.reasons]);if(!map.has(key))map.set(key,{framing:i.framing,reasons:i.reasons,items:[],members:new Set(),floors:new Set()});
   const g=map.get(key);g.items.push(i);g.members.add(i.id);g.floors.add(i.floor);
  }return [...map.values()].map(g=>({...g,members:[...g.members].sort(),floors:[...g.floors].sort((a,b)=>a-b)}));
 }
 function floorLabel(p,values){
  const runs=[];for(const f of values){const last=runs.at(-1);if(last&&last[1]+1===f)last[1]=f;else runs.push([f,f]);}
  return runs.map(([a,b])=>a===b?FloorLevels.name(p,a):FloorLevels.range(p,a,b)).join('、');
 }
 function render(p,items,stale=false){
  const rows=groups(items);if(!rows.length)return '';
  return '<details open data-geometry-groups-local><summary>模型几何问题 · '+rows.length+' 组（涉及 '+items.filter(i=>i.kind==='MODEL').length+' 项楼层记录）</summary>'+rows.map(g=>{
   const outside=outsideColumns(p,g.framing),canClean=g.reasons.some(r=>r==='柱位于建筑外，未作为支承')&&outside.length;
   return '<div class="issue" data-geometry-group-local><b>'+esc(g.framing)+' · '+g.members.length+' 个构件</b><br>'+g.reasons.map(esc).join('；')+'<br><small>影响 '+esc(floorLabel(p,g.floors))+' · '+g.floors.length+' 层'+(stale?' · 上次结果，待更新':'')+'</small><div class="row" style="margin-top:8px">'+g.members.map(id=>'<button type="button" data-geometry-locate-local="'+esc(id)+'" data-framing="'+esc(g.framing)+'" data-floor="'+g.items.find(i=>i.id===id).floor+'">定位 '+esc(id)+'</button>').join('')+'</div>'+(canClean?'<button type="button" data-geometry-clean-local="'+esc(g.framing)+'">清理 '+esc(g.framing)+' 范围外柱（'+outside.length+'）</button><small> · 仅当前 Framing，可撤销</small>':'')+'</div>';
  }).join('')+'</details>';
 }
 function panel(p,result,key){
  const items=[];for(const i of result.issues.filter(i=>i.type===key))for(const f of i.floor?[i.floor]:result.floors.filter(f=>f.type===key).map(f=>f.n))items.push({kind:'MODEL',framing:key,id:i.id,floor:f,reasons:[i.msg]});
  return render(p,items);
 }
 function shape(p,result,key,floor,id){
  const m=Engine.floorModel(result,floor,key),t=p.types[key],column=m.columns.find(c=>c.id===id),beam=[...m.beams,...m.walls].find(b=>b.id===id);
  if(column)return {rect:Engine.columnRect(column),missing:false};if(beam)return {rect:Engine.rect(beam),missing:false};
  const c=t.columns.find(c=>c.id===id);if(c){const actual=columnRecord(p,key,c);if(actual)return {rect:Engine.columnRect(actual),missing:true};}
  const b=[...t.beams,...t.walls].find(b=>b.id===id);if(b){const a=Engine.resolve(p,b.a,key),z=Engine.resolve(p,b.z,key),width=(b.b||p.defaults.mb)/1000;if([...a,...z,width].every(Number.isFinite))return {rect:Engine.rect({a,z,b:width}),missing:true};}
  const parts=id.split(/[\/、]/).filter(Boolean);if(parts.length>1){const shapes=parts.map(id=>shape(p,result,key,floor,id)).filter(Boolean);if(shapes.length){const x0=Math.min(...shapes.map(s=>s.rect.x-s.rect.w/2)),x1=Math.max(...shapes.map(s=>s.rect.x+s.rect.w/2)),y0=Math.min(...shapes.map(s=>s.rect.y-s.rect.d/2)),y1=Math.max(...shapes.map(s=>s.rect.y+s.rect.d/2));return {rect:{x:(x0+x1)/2,y:(y0+y1)/2,w:x1-x0,d:y1-y0},missing:shapes.some(s=>s.missing)};}}
  return null;
 }
 function locate(p,result,key,floor,id){const target=shape(p,result,key,floor,id);focus=target?{...target,key,floor,id,stamp:JSON.stringify(p)}:null;return !!focus;}
 function current(p,key,floor){if(focus&&(focus.stamp!==JSON.stringify(p)||focus.key!==key||focus.floor!==floor))focus=null;return focus;}
 function focusPanel(p,key,floor){const f=current(p,key,floor);return f?'<div class="notice" data-geometry-focus-local><b>'+esc(key+' · '+FloorLevels.name(p,floor)+' · '+f.id)+'</b><br>'+ (f.missing?'橙色虚线为未生成记录，不参与计算。':'橙色虚线为当前几何提示涉及的构件。')+'<br><button type="button" data-geometry-clear-local>关闭几何定位</button></div>':'';}
 function bounds(p,key,floor,base){const f=current(p,key,floor);if(!f)return base;const r=f.rect;return {x0:Math.min(base.x0,r.x-r.w/2-1),x1:Math.max(base.x1,r.x+r.w/2+1),y0:Math.min(base.y0,r.y-r.d/2-1),y1:Math.max(base.y1,r.y+r.d/2+1)};}
 function overlay(ctx,plot,p,key,floor){const f=current(p,key,floor);if(!f)return;const r=f.rect,x=plot.ox+(r.x-r.w/2)*plot.scale,y=plot.oy+(r.y-r.d/2)*plot.scale;
  ctx.save();ctx.strokeStyle='#c24917';ctx.fillStyle='rgba(194,73,23,.12)';ctx.lineWidth=3;ctx.setLineDash([7,4]);ctx.fillRect(x,y,r.w*plot.scale,r.d*plot.scale);ctx.strokeRect(x-3,y-3,r.w*plot.scale+6,r.d*plot.scale+6);ctx.setLineDash([]);
  const label=f.id+(f.missing?' · 未生成记录（不参与计算）':' · 几何提示定位');ctx.font='13px Segoe UI';const tx=Math.max(8,Math.min(ctx.canvas.width/((window.devicePixelRatio)||1)-ctx.measureText(label).width-12,x)),ty=Math.max(22,y-12);ctx.fillStyle='#fff';ctx.fillRect(tx-3,ty-15,ctx.measureText(label).width+6,20);ctx.fillStyle='#993a12';ctx.fillText(label,tx,ty);ctx.restore();
 }
 if(typeof document!=='undefined')document.addEventListener('click',e=>{
  const clear=e.target.closest?.('[data-geometry-clear-local]');if(clear){window.StudioHost?.clearGeometryLocal();return;}
  const clean=e.target.closest?.('[data-geometry-clean-local]');if(clean){const h=StudioHost.get(),key=clean.dataset.geometryCleanLocal;let ids=[];if(StudioHost.transact(()=>{ids=cleanup(h.p,key);}))StudioHost.toast('已清理 '+key+' 范围外柱 '+ids.length+' 根；可撤销，请更新 Check 后保存项目');return;}
  const b=e.target.closest?.('[data-geometry-locate-local]');if(!b)return;const h=StudioHost.get(),key=b.dataset.framing,floor=+b.dataset.floor;
  if(!h.p.types[key]||h.result.floors[floor-1]?.type!==key||!locate(h.p,h.result,key,floor,b.dataset.geometryLocateLocal)){StudioHost.toast('该记录已不存在，请更新检查结果');return;}
  StudioHost.focusGeometryLocal({key,floor});
 });
 return {columnRecord,outsideColumns,cleanup,syncBoundary,groups,render,panel,locate,bounds,overlay,focusPanel,clear(){focus=null;}};
})();
if(typeof module!=='undefined')module.exports=GeometryIssuesLocal;
