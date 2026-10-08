// Layout settings belong to a Framing. Apply and Reset are explicit model writes.
const BeamLayout116=(()=>{
 const clone=x=>JSON.parse(JSON.stringify(x));
 function settings(p,key){const t=p.types[key];return {main:t.autoBeams101!==false,secondary:t.autoBeams101!==false,mainDirection:'XY',secondaryDirection:p.defaults.direction,gap:p.defaults.gap,scope:'all',...t.beamLayout116};}
 // A region update owns only complete beam segments contained in its saved rectangles.
 function inSecondaryAreas(beam,areas){
  const a=beam.rawA||beam.a,z=beam.rawZ||beam.z,axis=Math.abs(z[0]-a[0])>=Math.abs(z[1]-a[1])?0:1,cross=1-axis,lo=Math.min(a[axis],z[axis]),hi=Math.max(a[axis],z[axis]),eps=1e-6;
  const cuts=areas.flatMap(area=>area.rects).filter(r=>a[cross]>=r[cross?'y0':'x0']-eps&&a[cross]<=r[cross?'y1':'x1']+eps).map(r=>[Math.max(lo,r[axis?'y0':'x0']),Math.min(hi,r[axis?'y1':'x1'])]).filter(([l,h])=>h-l>eps).sort((x,y)=>x[0]-y[0]);
  let end=lo;for(const [l,h]of cuts){if(l>end+eps)return false;end=Math.max(end,h);if(end>=hi-eps)return true;}return false;
 }
 function candidate(p,key,step,values,rebuild=false){
  const next=clone(p);Engine.validate(next);const t=next.types[key],cfg=settings(p,key),regional=step==='secondary'&&values.scope==='selected',before=regional?Engine.model(p,key):null;
  delete cfg.columnsOnly;
  if(t.autoBeamSnapshot){delete t.autoBeamSnapshot[step];if(!Object.keys(t.autoBeamSnapshot).length)delete t.autoBeamSnapshot;}
  if(step==='main')Object.assign(cfg,{main:true,mainDirection:values.mainDirection,shortSpanMain:true});
  else Object.assign(cfg,{secondary:true,secondaryDirection:values.secondaryDirection,gap:values.gap,scope:values.scope});
  t.beamLayout116=cfg;
  if(step==='secondary'&&cfg.scope==='selected'&&!t.secondaryAreas?.length)throw Error('请先拖画次梁分区。');
  if(rebuild){
   const suppressed=[...t.suppressed];t.suppressed=[];
   Engine.validate(next);const m=Engine.model(next,key),restore=new Set(m.beams.filter(b=>b.source==='auto'&&(step==='main'?(b.baseKind||b.kind)==='MB':(b.baseKind||b.kind)==='SB')).map(b=>Engine.sig(b.rawA,b.rawZ)));
   // A former continuous main beam may now be split at shorter supporting beams.
   // Restore its parent signature as well as its newly generated segment signatures.
   if(step==='main'){const parents=new Map();for(const b of m.beams.filter(b=>b.source==='auto'&&b.splitMainParent)){const list=parents.get(b.splitMainParent)||[];list.push(b);parents.set(b.splitMainParent,list);}for(const parts of parents.values()){const points=parts.flatMap(b=>[b.rawA,b.rawZ]);restore.add(Engine.sig([Math.min(...points.map(a=>a[0])),Math.min(...points.map(a=>a[1]))],[Math.max(...points.map(a=>a[0])),Math.max(...points.map(a=>a[1]))]));}}
   t.suppressed=suppressed.filter(s=>!restore.has(s));
  }
  if(regional){
   const secondary=b=>b.source==='auto'&&b.kind==='SB',areas=t.secondaryAreas,generated=Engine.model(next,key),outside=before.beams.filter(b=>secondary(b)&&!inSecondaryAreas(b,areas)),kept=before.beams.filter(b=>!secondary(b)||outside.includes(b)),used=new Set(kept.map(b=>b.id)),prior=new Map(before.beams.filter(secondary).map(b=>[Engine.sig(b.rawA,b.rawZ),b]));
   const replacement=generated.beams.filter(secondary).filter(b=>inSecondaryAreas(b,areas)).map(b=>{
    const old=prior.get(Engine.sig(b.rawA,b.rawZ));let id=old?.id||b.id,n=1;if(used.has(id)){const prefix=b.kind==='CB'?'CB':'SB';while(used.has(prefix+n))n++;id=prefix+n;}used.add(id);return {...b,id};
   });
   // Freeze the merged secondary layout; preserve the main snapshot and all manual beams.
   const frozen=clone(next);Engine.freezeAutoBeams(frozen,key,{beams:[...outside,...replacement]});t.autoBeamSnapshot={...t.autoBeamSnapshot,secondary:frozen.types[key].autoBeamSnapshot.secondary};
  }
  Engine.validate(next);return {project:next,result:Engine.generate(next)};
 }
 function clear(p,key,values){
  const t=p.types[key],before=Engine.model(p,key).columns,cfg={...settings(p,key),...values};
  // Keep physical columns fixed while clearing the beam layout; walls are retained.
  Engine.setColumnMode(p,key,'manual');
  delete t.autoBeamSnapshot;
  for(const c of t.columns)if(!before.some(b=>b.id===c.id))c.on=false;
  Object.assign(t,{autoBeams101:false,beamLayout116:{...cfg,main:false,secondary:false,columnsOnly:true,scope:'all'},beams:[],suppressed:[],secondaryAreas:[],slabVoids:[],slabSizes:[],slabDirections116:{},beamWidths83:{}});
  const after=Engine.model(p,key).columns,remap=new Map();
  for(const c of before){const n=after.find(n=>n.id===c.id),a=Engine.columnRect(c),b=n&&Engine.columnRect(n);if(!n||['x','y','w','d'].some(k=>Math.abs(a[k]-b[k])>1e-6))throw Error('柱位置未能完整保留，已取消重新布置');remap.set(Loading.token('COL',c),Loading.token('COL',n));}
  for(const f of Engine.floors(p).filter(f=>f.type===key)){
   const prefix=f.n+'|';
   for(const name of ['members','selected','reportA','reportB']){
    const records=p.explorer?.[name];if(!records)continue;const keep={};
    for(const [id,value]of Object.entries(records)){if(!id.startsWith(prefix))continue;const token=id.slice(prefix.length);if(token.startsWith('COL|')||token.startsWith('WALL|'))keep[prefix+(remap.get(token)||token)]=value;delete records[id];}
    Object.assign(records,keep);
   }
   if(p.foundation?.column?.startsWith(prefix)){const token=p.foundation.column.slice(prefix.length);if(remap.has(token))p.foundation.column=prefix+remap.get(token);}
  }
 }
 function setDirections(p,key,slabs,direction){
  if(!['X','Y'].includes(direction))throw Error('请选择 X 或 Y 方向');
  const t=p.types[key],floor=Engine.floors(p).find(f=>f.type===key)?.n;
  for(const s of slabs){const o=Loading.input(p,floor,Loading.token('SLAB',s));if(o.slabType==='CS')throw Error('所选包含悬臂板，请在 Member Check 按固定边调整方向。');}
  t.slabDirections116??={};
  for(const s of slabs){const token=Loading.token('SLAB',s);t.slabDirections116[token]=direction;}
 }
 function setThickness(p,key,changes){
  if(!p.types[key])throw Error('Framing 不存在');const values=new Map();
  for(const {slab,value}of changes){if(!slab?.rects?.length||!Number.isFinite(value)||value<1||value>20000)throw Error('樓板厚度須為 1–20000 mm，不可留空');values.set(SlabGeometry120.signature(slab),value);}
  if(!values.size)return 0;const t=p.types[key];t.slabSizes=[...(t.slabSizes||[]).filter(s=>!values.has(s.signature)),...[...values].map(([signature,value])=>({signature,value}))];return values.size;
 }
 function drawDirections(p,m,f,ctx,plot){
  const arrows=[],xy=(x,y)=>[plot.ox+x*plot.scale,plot.oy+y*plot.scale];ctx.save();ctx.setLineDash([]);
  for(const s of m.slabs){const r=[...s.rects].sort((a,b)=>(b.x1-b.x0)*(b.y1-b.y0)-(a.x1-a.x0)*(a.y1-a.y0))[0];if(!r)continue;const dir=Loading.slabDirection(p,f,Loading.token('SLAB',s),s,m),a=xy((r.x0+r.x1)/2,(r.y0+r.y1)/2),len=Math.min(13,(dir==='X'?r.x1-r.x0:r.y1-r.y0)*plot.scale*.25);if(!dir){ctx.font='12px sans-serif';ctx.fillStyle='#a35b17';ctx.textAlign='center';ctx.fillText('X / Y ?',a[0],a[1]);continue;}if(len<3)continue;ctx.strokeStyle='#21709a';ctx.lineWidth=1.7;ctx.beginPath();for(const sign of [-1,1]){const x=a[0]+(dir==='X'?len*sign:0),y=a[1]+(dir==='Y'?len*sign:0);ctx.moveTo(...a);ctx.lineTo(x,y);ctx.moveTo(x-(dir==='X'?4*sign:4),y-(dir==='Y'?4*sign:4));ctx.lineTo(x,y);ctx.lineTo(x-(dir==='X'?4*sign:-4),y-(dir==='Y'?4*sign:-4));}ctx.stroke();arrows.push({id:s.id,dir,rect:r});}
  ctx.restore();return arrows;
 }
 function drawThicknessLabels(m,ctx,plot){
  const labels=[],view=ctx.canvas.getBoundingClientRect(),xy=(x,y)=>[plot.ox+x*plot.scale,plot.oy+y*plot.scale];ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  for(const slab of m.slabs){if(!Number.isFinite(slab.thickness)||Math.abs(slab.thickness-200)<1e-6)continue;
   const mark=plot.slabDirections?.find(a=>a.id===slab.id),r=mark?.rect||[...(slab.rects||[])].sort((a,b)=>(b.x1-b.x0)*(b.y1-b.y0)-(a.x1-a.x0)*(a.y1-a.y0))[0];if(!r)continue;
   const point=xy((r.x0+r.x1)/2,(r.y0+r.y1)/2),x0=plot.ox+r.x0*plot.scale,y0=plot.oy+r.y0*plot.scale,rw=(r.x1-r.x0)*plot.scale,rh=(r.y1-r.y0)*plot.scale,text=String(Number(slab.thickness.toFixed(3)));if(point[0]<0||point[0]>view.width||point[1]<0||point[1]>view.height)continue;let box;
   const fits=b=>b.x>=x0+1&&b.y>=y0+1&&b.x+b.w<=x0+rw-1&&b.y+b.h<=y0+rh-1;
   for(const font of [11,10,9,8]){ctx.font=font+'px "Segoe UI", "Microsoft YaHei", sans-serif';const tw=Math.ceil(ctx.measureText(text).width)+4,th=font+2;
    for(const angle of [0,-Math.PI/2]){const w=angle?th:tw,h=angle?tw:th,len=Math.min(13,(mark?.dir==='X'?rw:rh)*.25),side=mark?.dir==='X'?len+4:6,vertical=mark?.dir==='Y'?len+4:6,candidates=[{x:point[0]+side,y:point[1]-h/2},{x:point[0]-side-w,y:point[1]-h/2},{x:point[0]-w/2,y:point[1]-vertical-h},{x:point[0]-w/2,y:point[1]+vertical}];if(mark?.dir==='X')candidates.unshift(...candidates.splice(2,2));
     for(const pos of candidates){const candidate={...pos,w,h,angle,font};if(fits(candidate)){box=candidate;break;}}if(box)break;
    }if(box)break;
   }
   // At very small zoom, keep the number beside the symbol instead of moving it outside the slab.
   if(!box){const angle=rw<rh?-Math.PI/2:0,font=Math.max(1,Math.min(8,(angle?rh:rw)*.30,(angle?rw:rh)*.5));ctx.font=font+'px "Segoe UI", "Microsoft YaHei", sans-serif';const tw=ctx.measureText(text).width+2,th=font+1,w=angle?th:tw,h=angle?tw:th;box={x:angle?x0+rw-w-1:point[0]-w/2,y:angle?point[1]-h/2:y0+1,w,h,angle,font};}
   ctx.font=box.font+'px "Segoe UI", "Microsoft YaHei", sans-serif';ctx.fillStyle='#fff8e9';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.fillStyle='#704a16';ctx.save();ctx.translate(box.x+box.w/2,box.y+box.h/2);ctx.rotate(box.angle);ctx.fillText(text,0,0);ctx.restore();labels.push({...box,id:slab.id,text,point});
  }
  ctx.restore();return labels;
 }
 return {settings,candidate,clear,setDirections,setThickness,drawDirections,drawThicknessLabels};
})();

function BeamLayoutUI116(host){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const $=id=>document.getElementById(id),folds={main:true,secondary:true,slab:true};
 let draft=null,selection=[],context='',gesture=null,activeTab='main';
 try{Object.assign(folds,JSON.parse(localStorage.getItem('beam-layout-folds116')||'{}'));}catch{}
 function sync(){const h=host.get(),id=h.key+'|'+JSON.stringify(h.p.types[h.key]);if(context!==id){context=id;selection=[];gesture=null;}if(draft&&(draft.key!==h.key||draft.base!==JSON.stringify(h.p)))draft=null;return h;}
 function panels(){const h=host.get();return Engine.floorModel(h.result,h.floor,h.key).slabs;}
 function selectedSlabs(){if(host.selectedMembers){const ids=new Set(host.selectedMembers().filter(h=>h.kind==='SLAB').map(h=>h.slabId));return panels().filter(s=>ids.has(s.id));}return panels().filter(s=>selection.includes(Loading.token('SLAB',s)));}
 function selectControl(id,label,value,choices){return '<label class="field">'+label+'<select id="'+id+'" data-input-state="default">'+choices.map(([v,s])=>'<option value="'+v+'" '+(v===value?'selected':'')+'>'+s+'</option>').join('')+'</select></label>';}
 const btn=(text,action,extra='')=>'<button type="button" data-bl116="'+action+'" '+extra+'>'+text+'</button>';
 function fold(step,title,content){return '<section class="beam-layout-panel116" id="bl116-panel-'+step+'" role="tabpanel" aria-labelledby="bl116-tab-'+step+'" '+(activeTab===step?'':'hidden')+'><h3>'+title.replace(/^[①②③]\s*/,'')+'</h3><div class="beam-layout-body116">'+content+'</div></section>';}
 function switchTab(step,focus=false){if(!['main','secondary','slab'].includes(step))return;remember();if(activeTab!==step){host.clearSelection();host.selectMode();gesture=null;}activeTab=step;host.refresh();if(focus)$('bl116-tab-'+step)?.focus();}
 function selectedBeams(){const h=host.get(),ids=new Set((host.selectedMembers?.()||[]).map(b=>b.kind+':'+b.id));return Engine.floorModel(h.result,h.floor,h.key).beams.filter(b=>ids.has(b.kind+':'+b.id));}
 function beamTable(h,m){const chosen=selectedBeams(),ids=new Set(chosen.map(b=>b.kind+':'+b.id)),count=chosen.length;
  return '<section id="bl116-beam-table" class="beam-parameters116" '+(activeTab==='slab'?'hidden':'')+'><h3>梁參數 · '+esc(FloorLevels.name(h.p,h.floor))+'</h3><p class="muted">只顯示圖上選中的 '+(activeTab==='main'?'MB／TB／CB':'SB')+'；修改同步至 '+esc(h.key)+' 共用樓層。</p><div class="row"><label class="field">批量梁闊 B mm<input id="bl116-beam-width" type="number" min="1" max="20000" step="any" placeholder="留空不修改" data-input-state="required"></label>'+selectControl('bl116-beam-kind','批量類型','',[['','不修改'],...['MB','SB','TB','CB'].map(k=>[k,k])])+btn('套用已選（'+count+'）','beam-selected',count?'':'disabled')+'</div>'+(count?'<div class="beam-parameters-scroll116"><table><thead><tr><th>梁</th><th>類型</th><th>B mm</th><th>D mm</th><th>跨度 m</th></tr></thead><tbody>'+m.beams.map((b,i)=>ids.has(b.kind+':'+b.id)?'<tr><td>'+esc(b.displayId||b.id)+'</td><td><select data-beam-kind="'+i+'" aria-label="'+esc(b.displayId||b.id)+' 類型">'+['MB','SB','TB','CB'].map(k=>'<option '+(k===b.kind?'selected':'')+'>'+k+'</option>').join('')+'</select></td><td><input data-beam-width="'+i+'" aria-label="'+esc(b.displayId||b.id)+' 梁闊 B mm" type="number" min="1" max="20000" step="any" value="'+Number((b.b*1000).toFixed(6))+'" data-input-state="required"></td><td title="按現有梁深規則自動計算">'+Number((b.d*1000).toFixed(3))+'</td><td>'+Math.hypot(b.rawZ[0]-b.rawA[0],b.rawZ[1]-b.rawA[1]).toFixed(2)+'</td></tr>':'').join('')+'</tbody></table></div><p class="muted">修改後按 Enter 或離開欄位即套用；可撤銷。梁闊留空恢復預設。</p>':'<p class="muted">請在圖上單擊或拖拉框選梁。</p>')+'<p class="muted">D 梁深自動：MB／TB／CB 採用樓層／局部結構高度；SB 採「00 參數」的 Framing SB 深度；個別指定值保留。自動梁修改後轉為手動梁。</p></section>';
 }
 function thicknessTable(h,m,chosen){const selected=new Set(chosen.map(s=>s.id)),count=selected.size;
  return '<section id="bl116-thickness" class="slab-thickness116" '+(activeTab==='slab'?'':'hidden')+'><h3>樓板厚度 · '+esc(FloorLevels.name(h.p,h.floor))+'</h3><p class="muted">修改同步至 '+esc(h.key)+' 的共用樓層。只顯示圖上選中的樓板。</p><div class="row"><label class="field">批量厚度 mm<input id="bl116-thickness-value" type="number" min="1" max="20000" step="any" placeholder="輸入厚度" data-input-state="required"></label>'+btn('套用已選（'+count+'）','thickness-selected',count?'':'disabled')+'</div>'+(count?'<div class="slab-thickness-scroll116"><table><thead><tr><th>樓板</th><th>跨度 L · m</th><th>淨面積 m²</th><th>厚度 mm</th></tr></thead><tbody>'+m.slabs.map((s,i)=>selected.has(s.id)?'<tr data-slab-row="'+i+'"><td>'+esc(s.id)+'</td><td>'+(()=>{const token=Loading.token('SLAB',s),dir=Loading.slabDirection(h.p,h.floor,token,s,m),L=Loading.slabCalculation(s,dir,m,Loading.input(h.p,h.floor,token)).L;return L>0?L.toFixed(3):'待確認';})()+'</td><td>'+s.area.toFixed(2)+'</td><td><input type="number" min="1" max="20000" step="any" data-slab-thickness="'+i+'" aria-label="'+esc(s.id)+' 厚度 mm" value="'+s.thickness+'" data-input-state="required"></td></tr>':'').join('')+'</tbody></table></div><p class="muted">逐列修改後按 Enter 或離開欄位即套用；可撤銷。Esc 清除圖上選取。</p>':'<p class="muted">請在圖上單擊或拖拉框選樓板。</p>')+'</section>';
 }
 function applyThickness(changes){const h=host.get();changes=changes.filter(x=>x.value!==x.slab.thickness);if(!changes.length)return;if(host.transact(()=>BeamLayout116.setThickness(h.p,h.key,changes)))host.toast('已更新 '+changes.length+' 塊樓板厚度 · '+h.key+' 共用樓層同步；可撤銷');}

 function render(){
  for(const el of document.querySelectorAll('[data-bl-fold]'))folds[el.dataset.blFold]=el.open;
  const h=sync(),cfg=BeamLayout116.settings(h.p,h.key),m=Engine.floorModel(h.result,h.floor,h.key),chosen=selectedSlabs(),preview=step=>draft?.step===step?'<p role="status">预览 '+draft.count+' 根自动'+(step==='main'?'主梁':'次梁')+'；虚线显示候选布置。</p><div class="row">'+btn('应用布置','apply')+btn('取消','cancel')+'</div>':'';
  let html='<section class="beam-layout116"><div class="beam-layout-header128"><h2>梁布置</h2>'+btn('重新布置','reset','title="清空梁及板布置，保留柱和牆"')+'</div><p class="muted">应用到 '+esc(h.key)+' 的所有楼层</p>';
  html+='<div class="beam-layout-tabs116" role="tablist" aria-label="梁與板布置">'+[['main','MB'],['secondary','SB'],['slab','Slab']].map(([step,label])=>'<button type="button" id="bl116-tab-'+step+'" role="tab" data-bl-tab="'+step+'" aria-controls="bl116-panel-'+step+'" aria-selected="'+(activeTab===step)+'" tabindex="'+(activeTab===step?'0':'-1')+'">'+label+'</button>').join('')+'</div>';
  html+=fold('main','① 自动画主梁 MB',selectControl('bl116-main-direction','布置方向',cfg.mainDirection,[['XY','X + Y 向'],['X','X 向'],['Y','Y 向']])+'<div class="row">'+btn('自动画主梁','main')+'</div>'+preview('main'));
  html+=fold('secondary','② 自动画次梁 SB','<div class="row">'+selectControl('bl116-secondary-direction','布置方向',cfg.secondaryDirection,[['自动','自动'],['X','X 向'],['Y','Y 向']])+'<label class="field">最大间距 m<input id="bl116-gap" type="number" min="0.1" max="20" step="0.1" value="'+cfg.gap/1000+'" data-input-state="default"></label></div>'+selectControl('bl116-scope','布置区域',cfg.scope,[['all','全部区域'],['selected','已儲存的 SB 分區']])+'<div class="row">'+'<button type="button" id="bl116-draw-region" data-action="draw-sb-area">框選 SB 區域</button>'+btn('預覽次梁','secondary')+'</div>'+preview('secondary')+'<details class="beam-layout-zones116" '+(cfg.scope==='selected'?'open':'')+'><summary>次梁分区 · '+(h.p.types[h.key].secondaryAreas?.length||0)+' 个</summary>'+host.zones()+'</details>');
  html+=fold('slab','③ 板受力方向','<p>单向板默认沿短跨；等跨时沿用同一 bay 内其他板的一致方向。点击单块或拖框多选后修改方向。</p><label class="beam-layout-check116"><input id="bl116-show-directions" type="checkbox" '+(host.showDirections()?'checked':'')+'> 显示方向</label><p id="bl116-default-thickness" class="muted">默認 200 mm · 非 200 mm 樓板在圖上顯示厚度</p><p id="bl116-selection" role="status">'+(chosen.length===1?esc(chosen[0].id):chosen.length?'已选 '+chosen.length+' 块板':'未选择板块')+'</p><div class="row">'+['X','Y'].map(d=>btn('单向 '+d+(d==='X'?' ↔':' ↕'),'way-'+d,(!chosen.length?'disabled ':'')+'aria-pressed="'+(chosen.length>0&&chosen.every(s=>Loading.slabDirection(h.p,h.floor,Loading.token('SLAB',s),s,m)===d))+'"')).join('')+'</div>');
  html+=thicknessTable(h,m,chosen);
  html+='<details '+(activeTab==='slab'?'hidden ':'')+'data-bl-fold="manual" '+(folds.manual?'open':'')+'><summary>手动画梁</summary><div class="beam-layout-body116">'+host.manual()+'<p class="muted">连接柱、梁端点、中点或梁中线上的位置。</p></div></details>';
  html+=beamTable(h,m);
  const selected=host.selectedMembers?.()||[];if(selected.length)html+='<div class="row beam-layout-selected116"><span id="member-selection-count">已選取 '+selected.length+' 個構件</span>'+btn('刪除所選 · Delete','delete')+'</div>';
  return html+'</section>';
 }
 function values(){const v={mainDirection:$('bl116-main-direction').value,secondaryDirection:$('bl116-secondary-direction').value,gap:Number($('bl116-gap').value)*1000,scope:$('bl116-scope').value};if(!Number.isFinite(v.gap)||v.gap<100||v.gap>20000)throw Error('次梁间距须为 0.1–20 m');return v;}
 function preview(step,rebuild){const h=host.get(),next=BeamLayout116.candidate(h.p,h.key,step,values(),rebuild),m=Engine.floorModel(next.result,h.floor,h.key);draft={...next,key:h.key,step,base:JSON.stringify(h.p),count:m.beams.filter(b=>b.source==='auto'&&(step==='main'?(b.baseKind||b.kind)==='MB':(b.baseKind||b.kind)==='SB')).length};host.selectMode();host.refresh();}
 function action(a){
  try{
   if(a==='beam-selected'){const width=$('bl116-beam-width').value.trim(),kind=$('bl116-beam-kind').value;if(width===''&&!kind){host.toast('請輸入梁闊或選擇類型');return;}host.applyBeamEdits(selectedBeams().map(beam=>({beam,size:{b:width===''?beam.b*1000:Number(width),kind:kind||beam.kind}})));return;}
   if(a==='thickness-selected'){const value=Number($('bl116-thickness-value').value);applyThickness(selectedSlabs().map(slab=>({slab,value})));return;}
   if(a==='reset'){const h=host.get(),v=values();if(host.transact(()=>BeamLayout116.clear(h.p,h.key,v))){reset();host.clearSelection();host.selectMode();host.refresh();host.toast(h.key+' 已清空梁及板布置，柱和牆已保留；可撤銷');}return;}
   if(['main','secondary'].includes(a)){preview(a,true);return;}
   if(a==='cancel'){draft=null;host.refresh();return;}
   if(a==='delete'){host.deleteSelection();return;}
   if(a==='apply'){const h=host.get();if(!draft||draft.key!==h.key||draft.base!==JSON.stringify(h.p))throw Error('输入已变化，请重新预览');const t=draft.project.types[h.key],step=draft.step;draft=null;if(!host.transact(()=>{h.p.types[h.key].beamLayout116=clone(t.beamLayout116);if(t.autoBeamSnapshot)h.p.types[h.key].autoBeamSnapshot=clone(t.autoBeamSnapshot);else delete h.p.types[h.key].autoBeamSnapshot;h.p.types[h.key].suppressed=[...t.suppressed];}))return;host.toast((step==='main'?'主梁':'次梁')+'已应用到 '+h.key+' 所有楼层，可撤销');return;}
   if(a.startsWith('way-')){const h=host.get(),chosen=selectedSlabs();if(!chosen.length)return;const direction=a.slice(-1);if(host.transact(()=>BeamLayout116.setDirections(h.p,h.key,chosen,direction))){selection=chosen.map(s=>Loading.token('SLAB',s));host.refresh();host.toast('已将 '+chosen.length+' 块板改为单向 '+direction+' · '+h.key+' 共用');}}
  }catch(e){host.toast(e.message);}
 }
 // Keep form drafts during ordinary pointer selections; previewing never changes the model.
 let form=null,thicknessForm=null,beamForm=null;
 function remember(){const h=host.get();if($('bl116-beam-width'))beamForm={key:h.key,floor:h.floor,tab:activeTab,base:JSON.stringify(h.p),width:$('bl116-beam-width').value,kind:$('bl116-beam-kind').value};if($('bl116-thickness-value'))thicknessForm={key:h.key,floor:h.floor,base:JSON.stringify(h.p),bulk:$('bl116-thickness-value').value};if(!$('bl116-gap'))return;form={key:host.get().key,base:JSON.stringify(host.get().p),values:Object.fromEntries(['main-direction','secondary-direction','gap','scope'].map(k=>[k,$('bl116-'+k).value]))};}
 function showRegions(){const el=document.querySelector('.beam-layout-zones116');if(el&&$('bl116-scope')?.value==='selected')el.open=true;}
 function restore(){const h=host.get();if(beamForm&&(beamForm.key!==h.key||beamForm.floor!==h.floor||beamForm.tab!==activeTab||beamForm.base!==JSON.stringify(h.p)))beamForm=null;if(beamForm&&$('bl116-beam-width')){$('bl116-beam-width').value=beamForm.width;$('bl116-beam-kind').value=beamForm.kind;}if(thicknessForm&&(thicknessForm.key!==h.key||thicknessForm.floor!==h.floor||thicknessForm.base!==JSON.stringify(h.p)))thicknessForm=null;if(thicknessForm?.key===h.key&&thicknessForm.floor===h.floor&&thicknessForm.base===JSON.stringify(h.p)){if($('bl116-thickness-value'))$('bl116-thickness-value').value=thicknessForm.bulk;}if(form?.key===host.get().key&&form.base===JSON.stringify(host.get().p))for(const [k,v]of Object.entries(form.values)){const e=$('bl116-'+k);if(e)e.value=v;}showRegions();}
 document.addEventListener('click',e=>{const tab=e.target.closest('[data-bl-tab]');if(tab){switchTab(tab.dataset.blTab,true);return;}const b=e.target.closest('[data-bl116]');if(!b)return;remember();action(b.dataset.bl116);});
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-slab-thickness],[data-beam-width]')){e.preventDefault();e.target.blur();return;}const tab=e.target.closest?.('[data-bl-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=['main','secondary','slab'],i=tabs.indexOf(activeTab),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;switchTab(tabs[next],true);});
 document.addEventListener('change',e=>{if(e.target.matches('[data-beam-width],[data-beam-kind]')){const h=host.get(),i=+(e.target.dataset.beamWidth??e.target.dataset.beamKind),beam=Engine.floorModel(h.result,h.floor,h.key).beams[i];if(beam&&selectedBeams().some(b=>b.id===beam.id&&b.kind===beam.kind)){const width=document.querySelector('[data-beam-width="'+i+'"]').value.trim(),kind=document.querySelector('[data-beam-kind="'+i+'"]').value;host.applyBeamEdits([{beam,size:{b:width===''?null:Number(width),kind}}]);}return;}if(e.target.matches('[data-slab-thickness]')){const slab=panels()[+e.target.dataset.slabThickness];if(activeTab==='slab'&&slab&&selectedSlabs().some(s=>s.id===slab.id))applyThickness([{slab,value:Number(e.target.value)}]);return;}if(e.target.id==='bl116-show-directions'){host.setShowDirections(e.target.checked);}else if(e.target.id?.startsWith('bl116-')){remember();draft=null;showRegions();host.repaint();}});
 document.addEventListener('toggle',e=>{if(!e.target.isConnected||!e.target.matches?.('[data-bl-fold]'))return;folds[e.target.dataset.blFold]=e.target.open;try{localStorage.setItem('beam-layout-folds116',JSON.stringify(folds));}catch{}},true);
 function begin(point,hit,append){remember();if(hit&&hit.kind!=='SLAB'){selection=[];return false;}draft=null;gesture={from:point,to:point,append};return true;}
 function move(point){if(!gesture)return false;gesture.to=point;host.repaint();return true;}
 function finish(cancel=false){if(!gesture)return false;const g=gesture;gesture=null;if(cancel){host.repaint();return true;}const box={x0:Math.min(g.from[0],g.to[0]),x1:Math.max(g.from[0],g.to[0]),y0:Math.min(g.from[1],g.to[1]),y1:Math.max(g.from[1],g.to[1])},click=Math.hypot(g.to[0]-g.from[0],g.to[1]-g.from[1])<.08;let chosen=panels().filter(s=>(s.rects||[s]).some(r=>click?g.to[0]>r.x0&&g.to[0]<r.x1&&g.to[1]>r.y0&&g.to[1]<r.y1:Math.min(r.x1,box.x1)>Math.max(r.x0,box.x0)&&Math.min(r.y1,box.y1)>Math.max(r.y0,box.y0)));if(click)chosen=chosen.slice(0,1);selection=[...new Set([...(g.append?selection:[]),...chosen.map(s=>Loading.token('SLAB',s))])];activeTab='slab';host.clearSelection();host.refresh();return true;}
 function overlay(ctx,plot){
  const h=sync(),m=Engine.floorModel(h.result,h.floor,h.key),xy=(x,y)=>[plot.ox+x*plot.scale,plot.oy+y*plot.scale];ctx.save();
  if(draft){ctx.strokeStyle='#16899d';ctx.lineWidth=2.5;ctx.setLineDash([7,4]);for(const b of Engine.floorModel(draft.result,h.floor,h.key).beams.filter(b=>b.source==='auto'&&(draft.step==='main'?(b.baseKind||b.kind)==='MB':(b.baseKind||b.kind)==='SB'))){ctx.beginPath();ctx.moveTo(...xy(...b.a));ctx.lineTo(...xy(...b.z));ctx.stroke();}ctx.setLineDash([]);}
  for(const s of m.slabs){if(!host.selectedMembers&&selection.includes(Loading.token('SLAB',s))){ctx.fillStyle='rgba(0,130,210,.20)';ctx.strokeStyle='#0082d2';ctx.lineWidth=2;for(const r of s.rects){const a=xy(r.x0,r.y0),w=(r.x1-r.x0)*plot.scale,h=(r.y1-r.y0)*plot.scale;ctx.fillRect(...a,w,h);ctx.strokeRect(...a,w,h);}}
  }
  plot.slabDirections=host.showDirections()?BeamLayout116.drawDirections(h.p,m,h.floor,ctx,plot):[];
  plot.slabThicknessLabels=BeamLayout116.drawThicknessLabels(m,ctx,plot);
  if(gesture){ctx.strokeStyle='#0082d2';ctx.fillStyle='rgba(0,130,210,.12)';ctx.setLineDash([5,3]);const a=xy(...gesture.from),b=xy(...gesture.to);ctx.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);ctx.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);}ctx.restore();
 }
 function reset(){draft=null;selection=[];gesture=null;context='';form=null;thicknessForm=null;beamForm=null;}
 const clone=BeamLayout116Clone=>JSON.parse(JSON.stringify(BeamLayout116Clone));
 return {render,restore,overlay,begin,move,finish,reset,remember,selectionKinds:()=>({main:['MB','TB','CB'],secondary:['SB'],slab:['SLAB']})[activeTab],isSlabTab:()=>activeTab==='slab'};
}
