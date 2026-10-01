// Floor-scoped voids between an existing lower and upper level. Framing inputs remain shared.
const LocalHeights96=(()=>{
 const eps=1e-7,entries=p=>p.localHeights96||[],overlap=(a,b)=>Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
 function rectangles(p,e){const xs=Engine.axes(p,'x',e.type),ys=Engine.axes(p,'y',e.type);return e.cells.map(c=>{const x0=xs.find(a=>a.id===c.x0)?.v,x1=xs.find(a=>a.id===c.x1)?.v,y0=ys.find(a=>a.id===c.y0)?.v,y1=ys.find(a=>a.id===c.y1)?.v;return {x0,x1,y0,y1};});}
 function grid(p,type){const xs=Engine.axes(p,'x',type),ys=Engine.axes(p,'y',type),out=[];for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++)out.push({cell:{x0:xs[i].id,x1:xs[i+1].id,y0:ys[j].id,y1:ys[j+1].id},rect:{x0:xs[i].v,x1:xs[i+1].v,y0:ys[j].v,y1:ys[j+1].v}});return out;}
 const token=c=>JSON.stringify([c.x0,c.x1,c.y0,c.y1]);
 function normalHeight(p,e){return Engine.floors(p).filter(f=>f.n>e.base&&f.n<=e.top).reduce((sum,f)=>sum+f.h,0);}
 function height(p,e){return e.height??normalHeight(p,e);}
 function levels(p){const z=[0];for(const f of Engine.floors(p))z.push(z.at(-1)+f.h);return z;}
 const contains=(r,x,y)=>x>=r.x0-eps&&x<=r.x1+eps&&y>=r.y0-eps&&y<=r.y1+eps;
 function changed(p){return entries(p).some(e=>e.height!==undefined&&e.cells.length);}
 // Intermediate column/wall segments are continuous through the omitted floors.
 // Each region is anchored to its actual lower level; global floor levels stay fixed.
 function levelAt(p,f,x,y,z=levels(p)){
  for(const e of entries(p))if(f>e.base&&f<=e.top&&rectangles(p,e).some(r=>contains(r,x,y))){
   const base=levelAt(p,e.base,x,y,z),ratio=(z[f]-z[e.base])/(z[e.top]-z[e.base]);
   return base+height(p,e)*ratio;
  }
  return z[f]??z.at(-1)+(f-z.length+1)*(z.at(-1)-z.at(-2));
 }
 function extent(p,lo,hi){const z=levels(p);let top=z[hi];for(const e of entries(p))if(e.top>=lo&&e.top<=hi)for(const r of rectangles(p,e))top=Math.max(top,levelAt(p,e.top,(r.x0+r.x1)/2,(r.y0+r.y1)/2,z));return top;}
 function parts(p,r,kind,member){
  let xs=[r.x-r.w/2,r.x+r.w/2],ys=[r.y-r.d/2,r.y+r.d/2];
  if(kind==='COL')return [{r,x:r.x,y:r.y}];
  // Split long members along their length, keeping their full section width.
  const a=member.a,b=member.z,horizontal=a&&b&&Math.abs(a[1]-b[1])<eps,vertical=a&&b&&Math.abs(a[0]-b[0])<eps;
  for(const e of entries(p))for(const q of rectangles(p,e)){
   if(!vertical)for(const x of [q.x0,q.x1])if(x>xs[0]+eps&&x<xs[1]-eps)xs.push(x);
   if(!horizontal)for(const y of [q.y0,q.y1])if(y>ys[0]+eps&&y<ys[1]-eps)ys.push(y);
  }
  xs=[...new Set(xs)].sort((a,b)=>a-b);ys=[...new Set(ys)].sort((a,b)=>a-b);const out=[];
  for(let i=1;i<xs.length;i++)for(let j=1;j<ys.length;j++){const x=(xs[i]+xs[i-1])/2,y=(ys[j]+ys[j-1])/2;out.push({r:{x,y,w:xs[i]-xs[i-1],d:ys[j]-ys[j-1]},x:vertical?(member.rawA||a)[0]:x,y:horizontal?(member.rawA||a)[1]:y});}return out;
 }
 function solids(p,result,f,m=Engine.floorModel(result,f),hi=result.floors.length){
  const out=[],z=levels(p),add=(r,kind,member,lower,upper,depth)=>{
   for(const part of parts(p,r,kind,member)){const z1=levelAt(p,upper,part.x,part.y,z),z0=depth===undefined?levelAt(p,lower,part.x,part.y,z):z1-depth;
    out.push({r:part.r,z0,z1,kind,id:member.id,displayId:member.displayId||member.id,f,member});}
  };
  for(const c of m.columns){let lower=f-1,upper=f;if(c.status==='上层柱'){lower=f;upper=f+1;if(f<hi&&Engine.floorModel(result,f+1).columns.some(n=>n.status!=='上层柱'&&Math.hypot(n.x-c.x,n.y-c.y)<eps))continue;}add(Engine.columnRect(c),'COL',c,lower,upper);}
  for(const w of m.walls)add(Engine.rect(w),'WALL',w,f-1,f);
  for(const b of m.beams)add(Engine.rect(b),b.kind,b,f-1,f,b.d);
  for(const s of m.slabs)for(const r of s.rects)add({x:(r.x0+r.x1)/2,y:(r.y0+r.y1)/2,w:r.x1-r.x0,d:r.y1-r.y0},'SLAB',s,f-1,f,s.thickness/1000);
  return out;
 }
 function columnHeight(p,result,f,c){const x=c.cx??c.x,y=c.cy??c.y,z=levels(p);if(!changed(p)){let h=result.floors[f-1]?.h||0;for(const e of entries(p))if(f>e.base&&f<=e.top&&rectangles(p,e).some(r=>contains(r,x,y)))h=Math.max(h,height(p,e));return h;}for(const e of entries(p))if(f>e.base&&f<=e.top&&rectangles(p,e).some(r=>contains(r,x,y)))return height(p,e);return levelAt(p,f,x,y,z)-levelAt(p,f-1,x,y,z);}
 function validate(p){if(p.localHeights96===undefined)return;const rows=entries(p),fs=Engine.floors(p),ids=new Set();if(!Array.isArray(rows)||rows.length>100)throw Error('局部层高最多 100 项');for(const e of rows){if(!e||typeof e.id!=='string'||!e.id||e.id.length>40||ids.has(e.id))throw Error('局部层高编号无效或重复');ids.add(e.id);if(typeof e.name!=='string'||!e.name.trim()||e.name.length>80)throw Error('局部层高名称须为 1–80 字');if(!Number.isInteger(e.base)||!Number.isInteger(e.top)||e.base<0||e.top>p.total||e.top<=e.base)throw Error('局部层高起点／顶部楼层无效，请先调整对应条目');if(!p.types[e.type]||fs[e.base]?.type!==e.type)throw Error('局部层高参考 Framing 已变化，请先删除该局部条目再调整分组');if(!Array.isArray(e.cells)||e.cells.length>400)throw Error('局部层高 Area 数据无效');const valid=new Set(grid(p,e.type).map(a=>token(a.cell))),used=new Set();for(const c of e.cells){const k=token(c);if(!valid.has(k)||used.has(k))throw Error('局部层高 Area 轴线已改变，请清空 Area 后重画');used.add(k);}if(e.height!==undefined&&(!Number.isFinite(e.height)||e.height<.1||e.height>1000))throw Error('局部总高须为 0.1–1000 m');const rs=rectangles(p,e);for(let f=e.base+1;f<e.top;f++){const ts=Engine.tiles(p,p.types[fs[f-1].type]);for(const r of rs){let covered=0;for(const t of ts){const a=overlap(t,r);if(a<eps)continue;const total=(t.x1-t.x0)*(t.y1-t.y0);if(Math.abs(a-total)>eps)throw Error('局部层高 Area 边界须对应各中间楼层的完整轴线格');covered+=a;}if(Math.abs(covered-(r.x1-r.x0)*(r.y1-r.y0))>eps)throw Error('局部层高 Area 超出中间楼层轴网范围');}}
 }for(let i=0;i<rows.length;i++)for(let j=0;j<i;j++){const a=rows[i],b=rows[j];if(Math.max(a.base,b.base)>=Math.min(a.top,b.top))continue;if(rectangles(p,a).some(x=>rectangles(p,b).some(y=>overlap(x,y)>eps)))throw Error('同一高度范围的局部层高 Area 不能重叠');}const z=levels(p);for(const e of rows)if(e.top<p.total)for(const r of rectangles(p,e)){const x=(r.x0+r.x1)/2,y=(r.y0+r.y1)/2;if(levelAt(p,e.top+1,x,y,z)-levelAt(p,e.top,x,y,z)<.1-eps)throw Error('局部顶部与上一层须保留至少 0.1 m 高差');}}
 function cuts(p,f){return entries(p).filter(e=>f>e.base&&f<e.top).flatMap(e=>rectangles(p,e));}
 function build(p,result,make){if(!entries(p).some(e=>e.cells.length))return result;const floorModels={...result.floorModels};for(const f of result.floors){const rs=cuts(p,f.n);if(!rs.length)continue;const reference=Engine.floorModel(result,f.n),m=make(p,f.type,rs,reference);m.localHeight96={floor:f.n,rects:rs};floorModels[f.n]=m;for(const q of m.issues)result.issues.push({...q,floor:f.n});}result.floorModels=floorModels;return result;}

 return {entries,rectangles,grid,token,height,validate,cuts,build,columnHeight,overlap,normalHeight,levels,levelAt,changed,extent,solids};
})();

const LocalHeightsUI96=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let host,active=null,editing=false,drag=null,foldOpen=false,draft=null,draftKey=null;
 const state=()=>host.context(),entry=()=>LocalHeights96.entries(state().p).find(e=>e.id===active),button=(s,a,id)=>'<button data-lh-action="'+a+'"'+(id!==undefined?' data-lh-id="'+esc(id)+'"':'')+'>'+s+'</button>';
 function options(p,start,end,value){return Array.from({length:end-start+1},(_,i)=>i+start).map(n=>'<option value="'+n+'" '+(n===value?'selected':'')+'>'+esc(FloorLevels.name(p,n))+'</option>').join('');}
 function selectEntry(id){active=id;const e=entry();draft=e?Engine.clone(e.cells):[];draftKey=e?JSON.stringify(e.cells):null;editing=false;drag=null;}
 function current(){const e=entry();if(e&&draftKey!==JSON.stringify(e.cells)){draft=Engine.clone(e.cells);draftKey=JSON.stringify(e.cells);}return e;}
 function group(p,start,end,dirty){const rows=LocalHeights96.entries(p).filter(e=>e.base>=start-1&&e.base<end);return '<tr class="lh96-group"><td colspan="8"><div class="row"><b>局部层高</b>'+(!dirty?button('＋添加','add',start-1):'<span class="muted">先应用楼层分组</span>')+'</div>'+rows.map(e=>'<div class="lh96-entry"><span>'+esc(e.id)+'</span><label>起点<select data-lh-id="'+esc(e.id)+'" data-lh-field="base">'+options(p,start-1,end-1,e.base)+'</select></label><label>顶部楼层<select data-lh-id="'+esc(e.id)+'" data-lh-field="top">'+options(p,e.base+1,p.total,e.top)+'</select></label><label>局部总高 m<input type="number" min="0.1" max="1000" step="0.1" style="width:88px" data-lh-id="'+esc(e.id)+'" data-lh-field="height" aria-label="'+esc(e.id)+' 局部总高 m" title="输入所选 Area 从起点至顶部的总高度；清空恢复楼层默认高度" value="'+LocalHeights96.height(p,e)+'"></label>'+button(esc(e.name)+' · Area '+e.cells.length,'edit',e.id)+button('×','delete',e.id)+'</div>').join('')+'</td></tr>';}
 function render(p){const rows=LocalHeights96.entries(p);if(!rows.some(e=>e.id===active)){active=rows[0]?.id||null;draft=null;draftKey=null;}const e=current();return '<details id="lh96-fold" '+(foldOpen?'open':'')+'><summary>局部层高 Area</summary><div class="lh96-body">'+(!e?'<p class="muted">在上方楼层组添加局部层高，再拖框指定 Area。</p>':'<div class="row"><label class="field">对应局部条目<select id="lh96-current">'+rows.map(r=>'<option value="'+esc(r.id)+'" '+(r.id===active?'selected':'')+'>'+esc(r.id+' · '+FloorLevels.name(p,r.base)+' → '+FloorLevels.name(p,r.top))+'</option>').join('')+'</select></label><label class="field">Area 名称<input data-lh-id="'+esc(e.id)+'" data-lh-field="name" value="'+esc(e.name)+'" maxlength="80"></label></div><div class="row">'+button(editing?'结束框选':'拖框选择 Area',editing?'stop':'draw')+button('清空选择','clear')+button('应用 Area','apply')+'</div><p id="lh96-count">已选 '+(draft||[]).length+' 个轴网 Area · '+e.cells.length+' 个已应用</p><p class="muted">在左侧平面直接拖框；Alt + 拖框移出选择。无需已有楼板。</p><div class="notice">'+esc(FloorLevels.name(p,e.base)+' → '+FloorLevels.name(p,e.top))+' · '+LocalHeights96.height(p,e).toFixed(2)+' m。'+(e.top>e.base+1?'选定 Area 的中间楼层不生成梁板；边界梁按剩余楼板需要保留，柱墙继续保留。':'顶部为紧邻楼层，不跳过梁板。')+' 输入局部总高后，所选 Area 顶部梁板随之升降；清空高度恢复默认，整层标高不变。</div>')+'</div></details>';}
 function validContext(){const s=state(),e=current();return e&&s.tab==='floors'&&s.mode==='plan'&&s.floor===e.base+1&&s.key===e.type&&!s.groupDirty;}
 function change(e){const a=e.target;if(a.id==='lh96-current'){selectEntry(a.value);foldOpen=true;host.refresh();return;}const field=a.dataset.lhField;if(!field)return;const id=a.dataset.lhId,value=field==='name'?a.value.trim():Number(a.value);host.transact(()=>{const s=state(),row=LocalHeights96.entries(s.p).find(v=>v.id===id);if(!row)throw Error('局部条目已删除');if(field==='base'){row.base=value;row.type=s.result.floors[value].type;row.cells=[];row.top=Math.max(row.top,value+1);}else if(field==='height'&&a.value.trim()==='')delete row.height;else row[field]=value;});}
 function action(e){const b=e.target.closest('[data-lh-action]');if(!b)return;const a=b.dataset.lhAction,id=b.dataset.lhId,s=state();if(a==='add'){if(s.groupDirty){host.toast('请先应用楼层分组');return;}let n=1;while(LocalHeights96.entries(s.p).some(e=>e.id==='LH'+n))n++;const base=Number(id),row={id:'LH'+n,name:'Area '+n,base,top:Math.min(s.p.total,base+2),type:s.result.floors[base].type,cells:[]};if(host.transact(()=>{(state().p.localHeights96??=[]).push(row);})){selectEntry(row.id);foldOpen=true;host.refresh();}return;}if(a==='delete'){host.transact(()=>{state().p.localHeights96=LocalHeights96.entries(state().p).filter(e=>e.id!==id);});if(active===id){active=null;editing=false;drag=null;}host.refresh();return;}if(a==='edit'){selectEntry(id);foldOpen=true;host.refresh();document.getElementById('lh96-fold')?.scrollIntoView({block:'nearest'});return;}const row=current();if(!row)return;if(a==='draw'){if(s.groupDirty){host.toast('请先应用楼层分组');return;}editing=true;foldOpen=true;host.floor(row.base+1);return;}if(a==='stop'){editing=false;drag=null;host.refresh();return;}if(a==='clear'){draft=[];host.refresh();return;}if(a==='apply'){const cells=Engine.clone(draft||[]);if(host.transact(()=>{entry().cells=cells;})){editing=false;draftKey=JSON.stringify(cells);host.refresh();host.toast('局部层高 Area 已应用，可撤销');}return;}}
 function begin(q,remove){if(!editing||!validContext())return false;drag={a:q,z:q,remove};return true;}
 function move(q){if(!drag)return false;drag.z=q;host.repaint();return true;}
 function finish(cancel){if(!drag)return;const d=drag;drag=null;if(!cancel&&validContext()){const row=entry(),box={x0:Math.min(d.a[0],d.z[0]),x1:Math.max(d.a[0],d.z[0]),y0:Math.min(d.a[1],d.z[1]),y1:Math.max(d.a[1],d.z[1])},map=new Map((draft||[]).map(c=>[LocalHeights96.token(c),c]));const click=Math.hypot(d.a[0]-d.z[0],d.a[1]-d.z[1])<.02;for(const {cell,rect:r}of LocalHeights96.grid(state().p,row.type)){if(click?d.z[0]>=r.x0&&d.z[0]<r.x1&&d.z[1]>=r.y0&&d.z[1]<r.y1:LocalHeights96.overlap(r,box)>1e-8){const k=LocalHeights96.token(cell);d.remove?map.delete(k):map.set(k,cell);}}draft=[...map.values()];host.refresh();}else host.repaint();}
 function overlay(ctx,plot){const s=state(),e=current();if(!e||s.tab!=='floors'||s.mode!=='plan'||s.key!==e.type||s.floor!==e.base+1)return;ctx.save();ctx.strokeStyle='#16768d';ctx.fillStyle='rgba(22,118,141,.14)';ctx.lineWidth=2;ctx.setLineDash([6,4]);for(const r of LocalHeights96.rectangles(s.p,{...e,cells:draft||[]})){const x=plot.ox+r.x0*plot.scale,y=plot.oy+r.y0*plot.scale,w=(r.x1-r.x0)*plot.scale,h=(r.y1-r.y0)*plot.scale;ctx.fillRect(x,y,w,h);ctx.strokeRect(x+2,y+2,w-4,h-4);}if(drag){const x=plot.ox+Math.min(...[drag.a[0],drag.z[0]])*plot.scale,y=plot.oy+Math.min(drag.a[1],drag.z[1])*plot.scale;ctx.strokeRect(x,y,Math.abs(drag.a[0]-drag.z[0])*plot.scale,Math.abs(drag.a[1]-drag.z[1])*plot.scale);}ctx.restore();}
 function init(h){host=h;document.addEventListener('click',action);document.addEventListener('change',change);document.addEventListener('toggle',e=>{if(e.target.id==='lh96-fold'&&e.target.isConnected)foldOpen=e.target.open;},true);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&editing){editing=false;drag=null;host.refresh();}});}
 return {init,group,render,begin,move,finish,overlay};
})();
