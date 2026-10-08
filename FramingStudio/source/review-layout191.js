// Drawing-only beam offsets. Engine geometry, supports and loads remain authoritative.
const ReviewLayout191=(()=>{
 const token=b=>b.kind+':'+b.id,signature=b=>JSON.stringify([b.a,b.z,b.b]),fmt=n=>String(Number(n.toFixed(6))),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function offsets(p,key){const map=p.drawingOffsets191?.[key];return map&&typeof map==='object'&&!Array.isArray(map)?map:{};}
 function offset(b,map){const o=map[token(b)];return o&&o.signature===signature(b)&&[o.dx,o.dy].every(Number.isFinite)?o:{dx:0,dy:0};}
 function beam(b,map){const o=offset(b,map);return o.dx||o.dy?{...b,a:[b.a[0]+o.dx,b.a[1]+o.dy],z:[b.z[0]+o.dx,b.z[1]+o.dy]}:b;}
 function model(m,map){return {...m,beams:m.beams.map(b=>beam(b,map))};}
 function move(p,m,ids,dx,dy){if(![dx,dy].every(Number.isFinite)||Math.max(Math.abs(dx),Math.abs(dy))>1000)throw Error('移動距離須為有限數字，單次不超過 1000 m');
  const rows=m.beams.filter(b=>ids.includes(token(b)));if(!rows.length)throw Error('請先選取梁');
  const next={...offsets(p,m.key)};for(const b of rows){const o=offset(b,next),x=Number((o.dx+dx).toFixed(6)),y=Number((o.dy+dy).toFixed(6));if(Math.max(Math.abs(x),Math.abs(y))>10000)throw Error('累計出圖位移不可超過 10000 m');if(Math.abs(x)+Math.abs(y)<1e-9)delete next[token(b)];else next[token(b)]={signature:signature(b),dx:x,dy:y};}
  p.drawingOffsets191={...p.drawingOffsets191,[m.key]:next};
 }
 function restore(p,key){if(p.drawingOffsets191){delete p.drawingOffsets191[key];if(!Object.keys(p.drawingOffsets191).length)delete p.drawingOffsets191;}}
 function checkPaper(p,m,ratio,paper){const map=offsets(p,m.key);if(!Object.keys(map).length)return;const W=paper.size==='A3'?(paper.portrait?297:420):297,H=paper.size==='A3'?(paper.portrait?420:297):210,s=1000/ratio,xs=Engine.axes(p,'x',m.key),ys=Engine.axes(p,'y',m.key),ox=(W-xs.at(-1).v*s)/2,oy=(H-ys.at(-1).v*s)/2;
  for(const b of m.beams){const o=offset(b,map);if(!o.dx&&!o.dy)continue;const r=Engine.rect(beam(b,map));if(ox+(r.x-r.w/2)*s<5||ox+(r.x+r.w/2)*s>W-5||oy+(r.y-r.d/2)*s<5||oy+(r.y+r.d/2)*s>H-20)throw Error('移動後的梁超出圖紙範圍；請調整打印比例或恢復出圖位置');}
 }
 function create({canvas,get,update,refresh,redraw,toast}){
  let scope='',project=null,selected=new Set(),box=null,distance='0.1',filter='ALL';
  const enabled=s=>s.tab==='review'&&s.mode==='plan'&&!s.measuring;
  function context(){const s=get(),id=s.floor+'|'+s.key;if(scope!==id||project!==s.p){scope=id;project=s.p;selected.clear();box=null;}const live=new Set(s.model.beams.map(token));selected=new Set([...selected].filter(t=>live.has(t)));return s;}
  function rows(s){return s.model.beams.filter(b=>(filter==='ALL'||(b.displayKind||b.kind)===filter)&&s.visible[b.kind]!==false);}
  function render(){const s=context(),map=offsets(s.p,s.key),all=rows(s),moved=s.model.beams.filter(b=>{const o=offset(b,map);return o.dx||o.dy;}).length,stale=Object.keys(map).filter(k=>!s.model.beams.some(b=>token(b)===k&&map[k]?.signature===signature(b))).length;
   return '<section id="review-layout191"><h3>出圖梁位調整</h3><p class="muted">只調整本頁平面及打印／SVG；'+esc(s.key)+' 共用樓層同步。Functional Framing、支承及計算保持原位。</p><div class="row"><label>梁類型 <select id="review-filter191">'+['ALL','MB','SB','TB','CB'].map(v=>'<option value="'+v+'" '+(filter===v?'selected':'')+'>'+({ALL:'全部梁'}[v]||v)+'</option>').join('')+'</select></label><button data-review191="all">全選列表</button><button data-review191="none">清除選取</button></div><p>已選 '+selected.size+' 根 · 已移動 '+moved+' 根</p><div class="row"><label>移動距離 · m <input id="review-distance191" type="number" min="0.000001" max="1000" step="any" value="'+esc(distance)+'" style="width:110px"></label></div><div class="row">'+[['up','↑ 上'],['down','↓ 下'],['left','← 左'],['right','→ 右']].map(([v,t])=>'<button data-review191="'+v+'" '+(!selected.size?'disabled':'')+'>'+t+'</button>').join('')+'</div><div class="row"><button data-review191="restore" '+(!Object.keys(map).length?'disabled':'')+'>恢復 Functional Framing</button></div><p class="muted">單擊或框選累加；表格取消勾選，Esc 清除。上＝−Y，下＝＋Y；可用上方「撤銷」。恢復會清除 '+esc(s.key)+' 全部出圖位移。</p>'+(stale?'<p class="notice">'+stale+' 項舊位移的構件已變更，暫不套用；可恢復清除。</p>':'')+'<div class="table-wrap" style="max-height:310px;overflow:auto"><table style="min-width:0;width:100%;table-layout:fixed"><thead><tr><th style="width:37%">選取／梁</th><th>B × D mm</th><th>ΔX m</th><th>ΔY m</th></tr></thead><tbody>'+all.map(b=>{const k=token(b),o=offset(b,map);return '<tr><td style="overflow-wrap:anywhere"><label><input type="checkbox" data-review-select191="'+esc(k)+'" '+(selected.has(k)?'checked':'')+'> '+esc(b.displayId||b.id)+' · '+esc(b.displayKind||b.kind)+'</label></td><td>'+Math.round(b.b*1000)+' × '+Math.round(b.d*1000)+'</td><td>'+fmt(o.dx)+'</td><td>'+fmt(o.dy)+'</td></tr>';}).join('')+'</tbody></table></div></section>';
  }
  document.getElementById('side').addEventListener('input',e=>{if(e.target.id==='review-distance191')distance=e.target.value;});
  document.getElementById('side').addEventListener('change',e=>{if(e.target.id==='review-filter191'){filter=e.target.value;refresh();}else if(e.target.dataset.reviewSelect191){const k=e.target.dataset.reviewSelect191;e.target.checked?selected.add(k):selected.delete(k);refresh();}});
  document.getElementById('side').addEventListener('click',e=>{const b=e.target.closest('[data-review191]');if(!b)return;const s=context(),action=b.dataset.review191;if(action==='all'){for(const b of rows(s))selected.add(token(b));refresh();return;}if(action==='none'){selected.clear();refresh();return;}if(action==='restore'){update(()=>restore(s.p,s.key));return;}const n=Number(distance);if(!Number.isFinite(n)||n<=0||n>1000){toast('請輸入大於 0、最多 1000 m 的移動距離');return;}const vector={up:[0,-n],down:[0,n],left:[-n,0],right:[n,0]}[action];if(vector)update(()=>move(s.p,s.model,[...selected],...vector));});
  const block=e=>{e.preventDefault();e.stopImmediatePropagation();};
  const point=(e,s)=>{const r=canvas.getBoundingClientRect();return s.plot.world(e.clientX-r.left,e.clientY-r.top);};
  canvas.addEventListener('pointerdown',e=>{const s=context();if(!enabled(s)||!s.plot||e.button!==0||s.spaceHeld)return;block(e);canvas.focus({preventScroll:true});box={a:point(e,s),z:point(e,s),x:e.clientX,y:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);},true);
  canvas.addEventListener('pointermove',e=>{if(!box)return;const s=context();if(!box||!enabled(s)){box=null;return;}block(e);box.z=point(e,s);box.moved||=Math.hypot(e.clientX-box.x,e.clientY-box.y)>4;redraw();},true);
  canvas.addEventListener('pointerup',e=>{if(!box)return;block(e);const q=box,s=context();box=null;if(!q||!enabled(s))return;const hits=(s.plot.hits||[]).filter(h=>s.model.beams.some(b=>token(b)===token(h))&&s.visible[h.kind]!==false);let chosen;
   if(q.moved){const x0=Math.min(q.a[0],q.z[0]),x1=Math.max(q.a[0],q.z[0]),y0=Math.min(q.a[1],q.z[1]),y1=Math.max(q.a[1],q.z[1]);chosen=hits.filter(h=>h.r.x+h.r.w/2>=x0&&h.r.x-h.r.w/2<=x1&&h.r.y+h.r.d/2>=y0&&h.r.y-h.r.d/2<=y1);}
   else{const pad=5/s.plot.scale;chosen=hits.filter(h=>Math.abs(q.a[0]-h.r.x)<=h.r.w/2+pad&&Math.abs(q.a[1]-h.r.y)<=h.r.d/2+pad).reverse().slice(0,1);}
   for(const h of chosen)selected.add(token(h));refresh();
  },true);
  for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{box=null;redraw();});
  canvas.addEventListener('contextmenu',e=>{if(get().tab==='review'){block(e);toast('本頁只調整出圖位置；尺寸請在原 Framing 頁編輯');}},true);
  window.addEventListener('keydown',e=>{const s=get();if(s.tab!=='review'||s.measuring||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.isContentEditable)return;if(['Delete','Backspace','Escape'].includes(e.key)){block(e);selected.clear();box=null;refresh();}},true);
  function draw(ctx,plot){const s=context();if(!enabled(s)){box=null;return;}document.getElementById('hint').textContent='出圖梁多選：單擊／框選累加 · Esc 清除 · 右側按距離移動 · 中鍵／空格平移';ctx.save();ctx.strokeStyle='#008fc7';ctx.fillStyle='rgba(0,143,199,.10)';ctx.lineWidth=2;ctx.setLineDash([5,3]);
   for(const h of plot.hits.filter(h=>selected.has(token(h)))){const r=h.r,x=plot.ox+(r.x-r.w/2)*plot.scale,y=plot.oy+(r.y-r.d/2)*plot.scale;ctx.fillRect(x,y,r.w*plot.scale,r.d*plot.scale);ctx.strokeRect(x-2,y-2,r.w*plot.scale+4,r.d*plot.scale+4);}
   if(box?.moved){const x=plot.ox+Math.min(box.a[0],box.z[0])*plot.scale,y=plot.oy+Math.min(box.a[1],box.z[1])*plot.scale;ctx.strokeRect(x,y,Math.abs(box.z[0]-box.a[0])*plot.scale,Math.abs(box.z[1]-box.a[1])*plot.scale);}ctx.restore();
  }
  return {render,draw};
 }
 return {offsets,offset,beam,model,move,restore,checkPaper,create};
})();
