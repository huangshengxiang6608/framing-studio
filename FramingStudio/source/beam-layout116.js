// Layout settings belong to a Framing. Existing projects opt in only on Apply.
const BeamLayout116=(()=>{
 const clone=x=>JSON.parse(JSON.stringify(x));
 function settings(p,key){const t=p.types[key];return {main:t.autoBeams101!==false,secondary:t.autoBeams101!==false,mainDirection:'XY',secondaryDirection:p.defaults.direction,gap:p.defaults.gap,scope:'all',...t.beamLayout116};}
 function candidate(p,key,step,values,rebuild=false){
  const next=clone(p),t=next.types[key],cfg=settings(p,key);
  if(step==='main')Object.assign(cfg,{main:true,mainDirection:values.mainDirection});
  else Object.assign(cfg,{secondary:true,secondaryDirection:values.secondaryDirection,gap:values.gap,scope:values.scope});
  t.beamLayout116=cfg;
  if(step==='secondary'&&cfg.scope==='selected'&&!t.secondaryAreas?.length)throw Error('请先拖画次梁分区。');
  if(rebuild){
   const suppressed=[...t.suppressed];t.suppressed=[];
   Engine.validate(next);const m=Engine.model(next,key),restore=new Set(m.beams.filter(b=>b.source==='auto'&&(step==='main'?b.kind==='MB':b.kind==='SB'||b.secondaryCantilever101)).map(b=>Engine.sig(b.rawA,b.rawZ)));
   t.suppressed=suppressed.filter(s=>!restore.has(s));
  }
  Engine.validate(next);return {project:next,result:Engine.generate(next)};
 }
 function setDirections(p,key,slabs,direction){
  if(!['X','Y'].includes(direction))throw Error('请选择 X 或 Y 方向');
  const t=p.types[key],floor=Engine.floors(p).find(f=>f.type===key)?.n;
  for(const s of slabs){const o=Loading.input(p,floor,Loading.token('SLAB',s));if(o.slabType==='CS')throw Error('所选包含悬臂板，请在 Member Check 按固定边调整方向。');}
  t.slabDirections116??={};
  for(const s of slabs){const token=Loading.token('SLAB',s);t.slabDirections116[token]=direction;}
 }
 function drawDirections(p,m,f,ctx,plot){
  const arrows=[],xy=(x,y)=>[plot.ox+x*plot.scale,plot.oy+y*plot.scale];ctx.save();ctx.setLineDash([]);
  for(const s of m.slabs){const r=[...s.rects].sort((a,b)=>(b.x1-b.x0)*(b.y1-b.y0)-(a.x1-a.x0)*(a.y1-a.y0))[0];if(!r)continue;const dir=Loading.slabDirection(p,f,Loading.token('SLAB',s),s,m),a=xy((r.x0+r.x1)/2,(r.y0+r.y1)/2),len=Math.min(13,(dir==='X'?r.x1-r.x0:r.y1-r.y0)*plot.scale*.25);if(!dir){ctx.font='12px sans-serif';ctx.fillStyle='#a35b17';ctx.textAlign='center';ctx.fillText('X / Y ?',a[0],a[1]);continue;}if(len<3)continue;ctx.strokeStyle='#21709a';ctx.lineWidth=1.7;ctx.beginPath();for(const sign of [-1,1]){const x=a[0]+(dir==='X'?len*sign:0),y=a[1]+(dir==='Y'?len*sign:0);ctx.moveTo(...a);ctx.lineTo(x,y);ctx.moveTo(x-(dir==='X'?4*sign:4),y-(dir==='Y'?4*sign:4));ctx.lineTo(x,y);ctx.lineTo(x-(dir==='X'?4*sign:-4),y-(dir==='Y'?4*sign:-4));}ctx.stroke();arrows.push({id:s.id,dir,rect:r});}
  ctx.restore();return arrows;
 }
 return {settings,candidate,setDirections,drawDirections};
})();

function BeamLayoutUI116(host){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const $=id=>document.getElementById(id),folds={main:true,secondary:true,slab:true};
 let draft=null,selection=[],context='',gesture=null,showDirections=true;
 try{Object.assign(folds,JSON.parse(localStorage.getItem('beam-layout-folds116')||'{}'));}catch{}
 function sync(){const h=host.get(),id=h.key+'|'+JSON.stringify(h.p.types[h.key]);if(context!==id){context=id;selection=[];gesture=null;}if(draft&&(draft.key!==h.key||draft.base!==JSON.stringify(h.p)))draft=null;return h;}
 function panels(){const h=host.get();return Engine.floorModel(h.result,h.floor,h.key).slabs;}
 function selectedSlabs(){return panels().filter(s=>selection.includes(Loading.token('SLAB',s)));}
 function selectControl(id,label,value,choices){return '<label class="field">'+label+'<select id="'+id+'" data-input-state="default">'+choices.map(([v,s])=>'<option value="'+v+'" '+(v===value?'selected':'')+'>'+s+'</option>').join('')+'</select></label>';}
 const btn=(text,action,extra='')=>'<button type="button" data-bl116="'+action+'" '+extra+'>'+text+'</button>';
 function fold(step,title,content){return '<details class="beam-layout-fold116" data-bl-fold="'+step+'" '+(folds[step]?'open':'')+'><summary>'+title+'</summary><div class="beam-layout-body116">'+content+'</div></details>';}
 function render(){
  for(const el of document.querySelectorAll('[data-bl-fold]'))folds[el.dataset.blFold]=el.open;
  const h=sync(),cfg=BeamLayout116.settings(h.p,h.key),m=Engine.floorModel(h.result,h.floor,h.key),chosen=selectedSlabs(),preview=step=>draft?.step===step?'<p role="status">预览 '+draft.count+' 根自动'+(step==='main'?'主梁':'次梁')+'；虚线显示候选布置。</p><div class="row">'+btn('应用布置','apply')+btn('取消','cancel')+'</div>':'';
  let html='<section class="beam-layout116"><h2>梁布置</h2><p class="muted">应用到 '+esc(h.key)+' 的所有楼层</p>';
  html+=fold('main','① 自动画主梁 MB',selectControl('bl116-main-direction','布置方向',cfg.mainDirection,[['XY','X + Y 向'],['X','X 向'],['Y','Y 向']])+'<div class="row">'+btn('自动画主梁','main')+btn('重新布置','rebuild-main')+'</div>'+preview('main'));
  html+=fold('secondary','② 自动画次梁 SB','<div class="row">'+selectControl('bl116-secondary-direction','布置方向',cfg.secondaryDirection,[['自动','自动'],['X','X 向'],['Y','Y 向']])+'<label class="field">最大间距 m<input id="bl116-gap" type="number" min="0.1" max="20" step="0.1" value="'+cfg.gap/1000+'" data-input-state="default"></label></div>'+selectControl('bl116-scope','布置区域',cfg.scope,[['all','全部区域'],['selected','已绘制分区']])+'<div class="row">'+btn('自动画次梁','secondary')+btn('重新布置','rebuild-secondary')+'</div>'+preview('secondary')+'<details class="beam-layout-zones116"><summary>次梁分区 · '+(h.p.types[h.key].secondaryAreas?.length||0)+' 个</summary>'+host.zones()+'</details>');
  html+=fold('slab','③ 板受力方向','<p>单向板默认沿短跨；点击单块或拖框多选后修改方向。</p><label class="beam-layout-check116"><input id="bl116-show-directions" type="checkbox" '+(showDirections?'checked':'')+'> 显示方向</label><p id="bl116-selection" role="status">'+(chosen.length===1?esc(chosen[0].id):chosen.length?'已选 '+chosen.length+' 块板':'未选择板块')+'</p><div class="row">'+['X','Y'].map(d=>btn('单向 '+d+(d==='X'?' ↔':' ↕'),'way-'+d,(!chosen.length?'disabled ':'')+'aria-pressed="'+(chosen.length>0&&chosen.every(s=>Loading.slabDirection(h.p,h.floor,Loading.token('SLAB',s),s,m)===d))+'"')).join('')+'</div>');
  html+='<details data-bl-fold="manual" '+(folds.manual?'open':'')+'><summary>手动画梁</summary><div class="beam-layout-body116">'+host.manual()+'<p class="muted">连接柱、梁端点、中点或梁中线上的位置。</p></div></details>';
  if(h.selected&&['MB','SB','TB','CB'].includes(h.selected.kind))html+='<div class="beam-layout-selected116">已选 '+esc(h.selected.id)+'<div class="row">'+btn('删除所选梁 · Delete','delete')+'</div></div>';
  return html+'</section>';
 }
 function preview(step,rebuild){const h=host.get();const values={mainDirection:$('bl116-main-direction').value,secondaryDirection:$('bl116-secondary-direction').value,gap:Number($('bl116-gap').value)*1000,scope:$('bl116-scope').value};if(!Number.isFinite(values.gap)||values.gap<100||values.gap>20000)throw Error('次梁间距须为 0.1–20 m');const next=BeamLayout116.candidate(h.p,h.key,step,values,rebuild),m=Engine.floorModel(next.result,h.floor,h.key);draft={...next,key:h.key,step,base:JSON.stringify(h.p),count:m.beams.filter(b=>b.source==='auto'&&(step==='main'?b.kind==='MB':b.kind==='SB'||b.secondaryCantilever101)).length};host.selectMode();host.refresh();}
 function action(a){
  try{
   if(['main','secondary','rebuild-main','rebuild-secondary'].includes(a)){preview(a.replace('rebuild-',''),a.startsWith('rebuild-'));return;}
   if(a==='cancel'){draft=null;host.refresh();return;}
   if(a==='delete'){host.deleteSelection();return;}
   if(a==='apply'){const h=host.get();if(!draft||draft.key!==h.key||draft.base!==JSON.stringify(h.p))throw Error('输入已变化，请重新预览');const t=draft.project.types[h.key],step=draft.step;draft=null;if(!host.transact(()=>{h.p.types[h.key].beamLayout116=clone(t.beamLayout116);h.p.types[h.key].suppressed=[...t.suppressed];}))return;host.toast((step==='main'?'主梁':'次梁')+'已应用到 '+h.key+' 所有楼层，可撤销');return;}
   if(a.startsWith('way-')){const h=host.get(),chosen=selectedSlabs();if(!chosen.length)return;const direction=a.slice(-1);if(host.transact(()=>BeamLayout116.setDirections(h.p,h.key,chosen,direction))){selection=chosen.map(s=>Loading.token('SLAB',s));host.refresh();host.toast('已将 '+chosen.length+' 块板改为单向 '+direction+' · '+h.key+' 共用');}}
  }catch(e){host.toast(e.message);}
 }
 // Keep form drafts during ordinary pointer selections; applying is the only model write.
 let form=null;
 function remember(){if(!$('bl116-gap'))return;form={key:host.get().key,base:JSON.stringify(host.get().p),values:Object.fromEntries(['main-direction','secondary-direction','gap','scope'].map(k=>[k,$('bl116-'+k).value]))};}
 function restore(){if(form?.key===host.get().key&&form.base===JSON.stringify(host.get().p))for(const [k,v]of Object.entries(form.values)){const e=$('bl116-'+k);if(e)e.value=v;}}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-bl116]');if(!b)return;remember();action(b.dataset.bl116);});
 document.addEventListener('change',e=>{if(e.target.id==='bl116-show-directions'){showDirections=e.target.checked;host.repaint();}else if(e.target.id?.startsWith('bl116-')){remember();draft=null;host.repaint();}});
 document.addEventListener('toggle',e=>{if(!e.target.isConnected||!e.target.matches?.('[data-bl-fold]'))return;folds[e.target.dataset.blFold]=e.target.open;try{localStorage.setItem('beam-layout-folds116',JSON.stringify(folds));}catch{}},true);
 function begin(point,hit,append){remember();if(hit&&hit.kind!=='SLAB'){selection=[];return false;}draft=null;gesture={from:point,to:point,append};return true;}
 function move(point){if(!gesture)return false;gesture.to=point;host.repaint();return true;}
 function finish(cancel=false){if(!gesture)return false;const g=gesture;gesture=null;if(cancel){host.repaint();return true;}const box={x0:Math.min(g.from[0],g.to[0]),x1:Math.max(g.from[0],g.to[0]),y0:Math.min(g.from[1],g.to[1]),y1:Math.max(g.from[1],g.to[1])},click=Math.hypot(g.to[0]-g.from[0],g.to[1]-g.from[1])<.08;let chosen=panels().filter(s=>(s.rects||[s]).some(r=>click?g.to[0]>r.x0&&g.to[0]<r.x1&&g.to[1]>r.y0&&g.to[1]<r.y1:Math.min(r.x1,box.x1)>Math.max(r.x0,box.x0)&&Math.min(r.y1,box.y1)>Math.max(r.y0,box.y0)));if(click)chosen=chosen.slice(0,1);selection=[...new Set([...(g.append?selection:[]),...chosen.map(s=>Loading.token('SLAB',s))])];folds.slab=true;host.clearSelection();host.refresh();return true;}
 function overlay(ctx,plot){
  const h=sync(),m=Engine.floorModel(h.result,h.floor,h.key),xy=(x,y)=>[plot.ox+x*plot.scale,plot.oy+y*plot.scale];ctx.save();
  if(draft){ctx.strokeStyle='#16899d';ctx.lineWidth=2.5;ctx.setLineDash([7,4]);for(const b of Engine.floorModel(draft.result,h.floor,h.key).beams.filter(b=>b.source==='auto'&&(draft.step==='main'?b.kind==='MB':b.kind==='SB'||b.secondaryCantilever101))){ctx.beginPath();ctx.moveTo(...xy(...b.a));ctx.lineTo(...xy(...b.z));ctx.stroke();}ctx.setLineDash([]);}
  for(const s of m.slabs){if(selection.includes(Loading.token('SLAB',s))){ctx.fillStyle='rgba(0,130,210,.20)';ctx.strokeStyle='#0082d2';ctx.lineWidth=2;for(const r of s.rects){const a=xy(r.x0,r.y0),w=(r.x1-r.x0)*plot.scale,h=(r.y1-r.y0)*plot.scale;ctx.fillRect(...a,w,h);ctx.strokeRect(...a,w,h);}}
  }
  plot.slabDirections=showDirections?BeamLayout116.drawDirections(h.p,m,h.floor,ctx,plot):[];
  if(gesture){ctx.strokeStyle='#0082d2';ctx.fillStyle='rgba(0,130,210,.12)';ctx.setLineDash([5,3]);const a=xy(...gesture.from),b=xy(...gesture.to);ctx.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);ctx.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);}ctx.restore();
 }
 function reset(){draft=null;selection=[];gesture=null;context='';form=null;}
 const clone=BeamLayout116Clone=>JSON.parse(JSON.stringify(BeamLayout116Clone));
 return {render,restore,overlay,begin,move,finish,reset};
}
