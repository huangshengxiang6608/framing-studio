// Drawing-only member offsets. Engine geometry, supports and loads remain authoritative.
const ReviewLayout191=(()=>{
 const token=b=>b.kind+':'+b.id,signature=b=>JSON.stringify(b.kind==='COL'?['COL',Engine.columnRect(b)]:[b.a,b.z,b.b]),fmt=n=>String(Number(n.toFixed(6))),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function offsets(p,key){const map=p.drawingOffsets191?.[key];return map&&typeof map==='object'&&!Array.isArray(map)?map:{};}
 function offset(b,map){const o=map[token(b)];return o&&o.signature===signature(b)&&[o.dx,o.dy].every(Number.isFinite)?o:{dx:0,dy:0};}
 function beam(b,map,columns=[]){
  const o=offset(b,map),ends=['a','z'].map(end=>{const point=b[end],hits=columns.filter(c=>{if(c.status==='上层柱')return false;const r=Engine.columnRect(c);return Math.abs(point[0]-r.x)<=r.w/2+1e-6&&Math.abs(point[1]-r.y)<=r.d/2+1e-6;});
   const co=hits.length===1?offset({...hits[0],kind:'COL'},map):null,move=co&&(co.dx||co.dy)?co:o;
   return [point[0]+move.dx,point[1]+move.dy];
  });return {...b,a:ends[0],z:ends[1]};
 }
 function beamPolygon(b){const dx=b.z[0]-b.a[0],dy=b.z[1]-b.a[1],L=Math.hypot(dx,dy);if(L<1e-9)return [];const x=-dy/L*b.b/2,y=dx/L*b.b/2;return [[b.a[0]+x,b.a[1]+y],[b.z[0]+x,b.z[1]+y],[b.z[0]-x,b.z[1]-y],[b.a[0]-x,b.a[1]-y]];}
 function beamRect(b){const pts=beamPolygon(b);if(!pts.length)return {x:b.a[0],y:b.a[1],w:0,d:0};const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);return {x:(x0+x1)/2,y:(y0+y1)/2,w:x1-x0,d:y1-y0};}
 const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
 function insidePolygon(point,poly){if(poly.length<3)return false;const sides=poly.map((a,i)=>{const z=poly[(i+1)%poly.length];return cross([z[0]-a[0],z[1]-a[1]],[point[0]-a[0],point[1]-a[1]]);});return sides.every(v=>v>1e-8)||sides.every(v=>v< -1e-8);}
 // Remove only stroke portions strictly inside another beam face (including skew display spans).
 function outsideSegments(a,z,polygons){const d=[z[0]-a[0],z[1]-a[1]],cuts=[0,1];for(const poly of polygons)for(let i=0;i<poly.length;i++){const v=poly[i],w=poly[(i+1)%poly.length],e=[w[0]-v[0],w[1]-v[1]],den=cross(d,e);if(Math.abs(den)<1e-10)continue;const q=[v[0]-a[0],v[1]-a[1]],t=cross(q,e)/den,u=cross(q,d)/den;if(t>0&&t<1&&u>=-1e-8&&u<=1+1e-8)cuts.push(t);}
  cuts.sort((a,b)=>a-b);const point=t=>[a[0]+t*d[0],a[1]+t*d[1]],out=[];for(let i=1;i<cuts.length;i++){const lo=cuts[i-1],hi=cuts[i];if(hi-lo>1e-9&&!polygons.some(p=>insidePolygon(point((lo+hi)/2),p)))out.push([point(lo),point(hi)]);}return out;
 }
 // Keep the supporting primary beam outline at original T-junctions in drawing mode.
 // Bind to functional geometry so display offsets do not change which member supports the end.
 function supportsEnd224(support,attached){
  if(!['MB','TB','CB'].includes(support.displayKind||support.kind)||(attached.displayKind||attached.kind)==='CB')return false;
  const a=support.a,z=support.z,dx=z[0]-a[0],dy=z[1]-a[1],L=Math.hypot(dx,dy),ex=attached.z[0]-attached.a[0],ey=attached.z[1]-attached.a[1],E=Math.hypot(ex,ey);
  if(L<1e-9||E<1e-9||Math.abs(dx*ey-dy*ex)<=1e-6*L*E)return false;
  return [attached.a,attached.z].some(q=>{const t=((q[0]-a[0])*dx+(q[1]-a[1])*dy)/(L*L);return t*L>1e-6&&(1-t)*L>1e-6&&Math.abs((q[0]-a[0])*dy-(q[1]-a[1])*dx)/L<=1e-6;});
 }
 function members(m){return [...m.beams,...m.columns.map(c=>({...c,kind:'COL'}))];}
 function column(c,map){const o=offset({...c,kind:'COL'},map);if(!o.dx&&!o.dy)return c;const r=Engine.columnRect(c);return {...c,x:c.x+o.dx,y:c.y+o.dy,cx:r.x+o.dx,cy:r.y+o.dy};}
 function columnEntry(c,map,f){if(c.floor!=null&&c.floor!==f)return c;const o=offset({...c.column,kind:'COL'},map);if(!o.dx&&!o.dy)return c;return {...c,column:column(c.column,map),...(c.rect?{rect:{...c.rect,x:c.rect.x+o.dx,y:c.rect.y+o.dy}}:{})};}
 // Recompute above/below fragments from each floor's display positions.
 function columnPlan(p,result,f,map){
  const floorModels={...result.floorModels};
  for(const n of [f,f+1]){if(!result.floors[n-1])continue;const m=Engine.floorModel(result,n),o=n===f?map:offsets(p,m.key);floorModels[n]={...m,columns:m.columns.map(c=>column(c,o))};}
  return ColumnPlan87.items({...result,floorModels},f);
 }
 // Bind to original CB contacts, never to incidental overlap after a drawing move.
 function model(m,map){
  const base=m.beams.map(b=>beam(b,map,m.columns)),isCB=b=>(b.displayKind||b.kind)==='CB';
  const beams=base.map((b,i)=>{if(isCB(b))return b;const original=m.beams[i],ends=['a','z'].map(end=>{
   const point=original[end],direct=m.columns.some(c=>{const r=Engine.columnRect(c);return c.status!=='上层柱'&&Math.abs(point[0]-r.x)<=r.w/2+1e-6&&Math.abs(point[1]-r.y)<=r.d/2+1e-6;})||(m.walls||[]).some(w=>Loading.contact(point,w));
   if(direct)return b[end];
   const hits=m.beams.map((cb,j)=>({cb,j,hit:isCB(cb)?Loading.contact(point,cb):null})).filter(h=>h.hit);
   if(hits.length!==1)return b[end];
   const {cb,j,hit}=hits[0],a=cb.rawA||cb.a,z=cb.rawZ||cb.z,L=Math.hypot(z[0]-a[0],z[1]-a[1]);if(L<1e-9)return b[end];
   const t=hit.x/L,display=base[j],delta=[0,1].map(k=>(1-t)*(display.a[k]-cb.a[k])+t*(display.z[k]-cb.z[k]));
   return delta.some(v=>Math.abs(v)>1e-9)?point.map((v,k)=>v+delta[k]):b[end];
  });return {...b,a:ends[0],z:ends[1]};});
  return {...m,beams,columns:m.columns.map(c=>column(c,map))};
 }
 function contains(bounds,r){const e=1e-8;return r.x-r.w/2>=bounds.x0-e&&r.x+r.w/2<=bounds.x1+e&&r.y-r.d/2>=bounds.y0-e&&r.y+r.d/2<=bounds.y1+e;}

 function move(p,m,ids,dx,dy){if(![dx,dy].every(Number.isFinite)||Math.max(Math.abs(dx),Math.abs(dy))>1000)throw Error('移動距離須為有限數字，單次不超過 1000 m');
  const rows=members(m).filter(b=>ids.includes(token(b)));if(!rows.length)throw Error('請先選取梁或柱');
  const next={...offsets(p,m.key)};for(const b of rows){const o=offset(b,next),x=Number((o.dx+dx).toFixed(6)),y=Number((o.dy+dy).toFixed(6));if(Math.max(Math.abs(x),Math.abs(y))>10000)throw Error('累計出圖位移不可超過 10000 m');if(Math.abs(x)+Math.abs(y)<1e-9)delete next[token(b)];else next[token(b)]={signature:signature(b),dx:x,dy:y};}
  p.drawingOffsets191={...p.drawingOffsets191,[m.key]:next};
 }
 function restore(p,key){if(p.drawingOffsets191){delete p.drawingOffsets191[key];if(!Object.keys(p.drawingOffsets191).length)delete p.drawingOffsets191;}}
 function checkPaper(p,m,ratio,paper,result){const map=offsets(p,m.key),f=paper.floor,upper=result&&result.floors[f-1]?.type===m.key&&result.floors[f]?Engine.floorModel(result,f+1):null,upperMap=upper?offsets(p,upper.key):{};if(!Object.keys(map).length&&!Object.keys(upperMap).length)return;const W=paper.size==='A3'?(paper.portrait?297:420):297,H=paper.size==='A3'?(paper.portrait?420:297):210,s=1000/ratio,xs=Engine.axes(p,'x',m.key),ys=Engine.axes(p,'y',m.key),ox=(W-xs.at(-1).v*s)/2,oy=(H-ys.at(-1).v*s)/2;
  const displayed=model(m,map).beams;
  for(const [b,displayMap]of [...members(m).map(b=>[b,map]),...(upper?.columns||[]).map(c=>[{...c,kind:'COL'},upperMap])]){const o=offset(b,displayMap);if(!o.dx&&!o.dy&&b.kind==='COL')continue;const r=b.kind==='COL'?Engine.columnRect(column(b,displayMap)):beamRect(displayed.find(q=>token(q)===token(b)));if(ox+(r.x-r.w/2)*s<5||ox+(r.x+r.w/2)*s>W-5||oy+(r.y-r.d/2)*s<5||oy+(r.y+r.d/2)*s>H-20)throw Error('移動後的構件超出圖紙範圍；請調整打印比例或恢復出圖位置');}
 }
 function create({canvas,get,update,refresh,redraw,toast}){
  let scope='',project=null,selected=new Set(),box=null,distance='0.1',filter='ALL';
  const enabled=s=>s.tab==='review'&&s.mode==='plan'&&!s.measuring;
  function context(){const s=get(),id=s.floor+'|'+s.key;if(scope!==id||project!==s.p){scope=id;project=s.p;selected.clear();box=null;}const live=new Set(members(s.model).map(token));selected=new Set([...selected].filter(t=>live.has(t)));return s;}
  function rows(s){return members(s.model).filter(b=>(filter==='ALL'||(b.displayKind||b.kind)===filter)&&s.visible[b.kind]!==false);}
  function render(){const s=context(),map=offsets(s.p,s.key),all=members(s.model).filter(b=>selected.has(token(b))),moved=members(s.model).filter(b=>{const o=offset(b,map);return o.dx||o.dy;}).length,stale=Object.keys(map).filter(k=>!members(s.model).some(b=>token(b)===k&&map[k]?.signature===signature(b))).length;
   return '<section id="review-layout191"><h3>出圖構件位置調整</h3><p class="muted">只調整本頁平面及打印／SVG；'+esc(s.key)+' 共用樓層同步。Functional Framing、支承及計算保持原位。</p><div class="row"><label>選取類型 <select id="review-filter191">'+['ALL','COL','MB','SB','TB','CB'].map(v=>'<option value="'+v+'" '+(filter===v?'selected':'')+'>'+({ALL:'全部梁／柱',COL:'柱 COL'}[v]||v)+'</option>').join('')+'</select></label><button data-review191="none">清除選取</button></div><p>已選 '+selected.size+' 個 · 已移動 '+moved+' 個</p><div class="row"><label>移動距離 · m <input id="review-distance191" type="number" min="0.000001" max="1000" step="any" value="'+esc(distance)+'" style="width:110px"></label></div><div class="row">'+[['up','↑ 上'],['down','↓ 下'],['left','← 左'],['right','→ 右']].map(([v,t])=>'<button data-review191="'+v+'" '+(!selected.size?'disabled':'')+'>'+t+'</button>').join('')+'</div><div class="row"><button data-review191="restore" '+(!Object.keys(map).length?'disabled':'')+'>恢復 Functional Framing</button></div><p class="muted">移柱或 CB 時，原支承的梁端會跟隨伸縮。單擊累加，Shift＋左鍵取消該項；框選只加入完全包住的梁／柱。表格取消勾選，Esc 清除。上＝−Y，下＝＋Y；可用上方「撤銷」。恢復會清除 '+esc(s.key)+' 全部出圖位移。</p>'+(stale?'<p class="notice">'+stale+' 項舊位移的構件已變更，暫不套用；可恢復清除。</p>':'')+(all.length?'<div class="table-wrap" style="max-height:310px;overflow:auto"><table style="min-width:0;width:100%;table-layout:fixed"><thead><tr><th style="width:37%">已選構件</th><th>B × D mm</th><th>ΔX m</th><th>ΔY m</th></tr></thead><tbody>'+all.map(b=>{const k=token(b),o=offset(b,map);return '<tr><td style="overflow-wrap:anywhere"><label><input type="checkbox" data-review-select191="'+esc(k)+'" '+(selected.has(k)?'checked':'')+'> '+esc(b.displayId||b.id)+' · '+esc(b.displayKind||b.kind)+'</label></td><td>'+Math.round(b.b*1000)+' × '+Math.round(b.d*1000)+'</td><td>'+fmt(o.dx)+'</td><td>'+fmt(o.dy)+'</td></tr>';}).join('')+'</tbody></table></div>':'<p class="muted">請在圖上單擊或完整框選梁／柱；此處只列已選構件。</p>')+'</section>';
  }
  document.getElementById('side').addEventListener('input',e=>{if(e.target.id==='review-distance191')distance=e.target.value;});
  document.getElementById('side').addEventListener('change',e=>{if(e.target.id==='review-filter191'){filter=e.target.value;refresh();}else if(e.target.dataset.reviewSelect191){const k=e.target.dataset.reviewSelect191;e.target.checked?selected.add(k):selected.delete(k);refresh();}});
  document.getElementById('side').addEventListener('click',e=>{const b=e.target.closest('[data-review191]');if(!b)return;const s=context(),action=b.dataset.review191;if(action==='all'){for(const b of rows(s))selected.add(token(b));refresh();return;}if(action==='none'){selected.clear();refresh();return;}if(action==='restore'){update(()=>restore(s.p,s.key));return;}const n=Number(distance);if(!Number.isFinite(n)||n<=0||n>1000){toast('請輸入大於 0、最多 1000 m 的移動距離');return;}const vector={up:[0,-n],down:[0,n],left:[-n,0],right:[n,0]}[action];if(vector)update(()=>move(s.p,s.model,[...selected],...vector));});
  const block=e=>{e.preventDefault();e.stopImmediatePropagation();};
  const point=(e,s)=>{const r=canvas.getBoundingClientRect();return s.plot.world(e.clientX-r.left,e.clientY-r.top);};
  canvas.addEventListener('pointerdown',e=>{const s=context();if(!enabled(s)||!s.plot||e.button!==0||s.spaceHeld)return;block(e);canvas.focus({preventScroll:true});box={a:point(e,s),z:point(e,s),x:e.clientX,y:e.clientY,moved:false,remove:e.shiftKey};canvas.setPointerCapture(e.pointerId);},true);
  canvas.addEventListener('pointermove',e=>{if(!box)return;const s=context();if(!box||!enabled(s)){box=null;return;}block(e);box.z=point(e,s);box.moved||=Math.hypot(e.clientX-box.x,e.clientY-box.y)>4;redraw();},true);
  canvas.addEventListener('pointerup',e=>{if(!box)return;block(e);const q=box,s=context();box=null;if(!q||!enabled(s))return;const map=offsets(s.p,s.key),displayed=model(s.model,map).beams,hits=rows(s).filter(b=>(s.plot.hits||[]).some(h=>token(h)===token(b)&&(h.f==null||h.f===s.floor))).map(b=>({kind:b.kind,id:b.id,poly:b.kind==='COL'?null:beamPolygon(displayed.find(q=>token(q)===token(b))),r:b.kind==='COL'?Engine.columnRect(column(b,map)):beamRect(displayed.find(q=>token(q)===token(b)))}));let chosen;
   if(q.moved){const x0=Math.min(q.a[0],q.z[0]),x1=Math.max(q.a[0],q.z[0]),y0=Math.min(q.a[1],q.z[1]),y1=Math.max(q.a[1],q.z[1]);chosen=hits.filter(h=>contains({x0,x1,y0,y1},h.r));}
   else{const pad=5/s.plot.scale;chosen=hits.filter(h=>h.poly?insidePolygon(q.a,h.poly)||h.poly.some((a,i)=>{const z=h.poly[(i+1)%h.poly.length],dx=z[0]-a[0],dy=z[1]-a[1],t=Math.max(0,Math.min(1,((q.a[0]-a[0])*dx+(q.a[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(q.a[0]-a[0]-t*dx,q.a[1]-a[1]-t*dy)<=pad;}):Math.abs(q.a[0]-h.r.x)<=h.r.w/2+pad&&Math.abs(q.a[1]-h.r.y)<=h.r.d/2+pad).reverse().slice(0,1);}
   for(const h of chosen)q.remove?selected.delete(token(h)):selected.add(token(h));refresh();
  },true);
  for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{box=null;redraw();});
  canvas.addEventListener('contextmenu',e=>{if(get().tab==='review'){block(e);toast('本頁只調整出圖位置；尺寸請在原 Framing 頁編輯');}},true);
  window.addEventListener('keydown',e=>{const s=get();if(s.tab!=='review'||s.measuring||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.isContentEditable)return;if(['Delete','Backspace','Escape'].includes(e.key)){block(e);selected.clear();box=null;refresh();}},true);
  function draw(ctx,plot){const s=context();if(!enabled(s)){box=null;return;}document.getElementById('hint').textContent='出圖梁／柱：單擊累加／Shift＋左鍵取消 · 框選完整包住 · Esc 清除 · 右側按距離移動 · 中鍵／空格平移';ctx.save();ctx.strokeStyle='#008fc7';ctx.fillStyle='rgba(0,143,199,.10)';ctx.lineWidth=2;ctx.setLineDash([5,3]);
   for(const h of plot.hits.filter(h=>selected.has(token(h))&&(h.f==null||h.f===s.floor))){const r=h.r,x=plot.ox+(r.x-r.w/2)*plot.scale,y=plot.oy+(r.y-r.d/2)*plot.scale;ctx.fillRect(x,y,r.w*plot.scale,r.d*plot.scale);ctx.strokeRect(x-2,y-2,r.w*plot.scale+4,r.d*plot.scale+4);}
   if(box?.moved){const x=plot.ox+Math.min(box.a[0],box.z[0])*plot.scale,y=plot.oy+Math.min(box.a[1],box.z[1])*plot.scale;ctx.strokeRect(x,y,Math.abs(box.z[0]-box.a[0])*plot.scale,Math.abs(box.z[1]-box.a[1])*plot.scale);}ctx.restore();
  }
  return {render,draw};
 }
 return {supportsEnd224,offsets,offset,beam,column,columnEntry,columnPlan,beamPolygon,beamRect,insidePolygon,outsideSegments,members,model,contains,move,restore,checkPaper,create};
})();
