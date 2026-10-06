// E2.104: columns and column defaults are shared by a framing, independent of other framings.
const FloorColumns101=(()=>{
 const fields=['mode','columns','columnSizes','columnAxisPositions','columnPlacements','suppressedColumns','transferColumns','autoBeamSnapshot'];
 function record(p,key,f){if(!p.types[key])throw Error('Framing 已不存在');const t=p.types[key];t.columnDefaults101??={cb:p.defaults.cb,cd:p.defaults.cd};return t;}
 function view(p,key,f){const t=p.types[key];return {...p,defaults:{...p.defaults,...t.columnDefaults101}};}
 function mutate(p,key,f,fn){record(p,key,f);const q=view(p,key,f),t={...p.types[key]};for(const k of fields)t[k]=Engine.clone(t[k]??(k==='mode'?'manual':[]));q.types={...p.types,[key]:t};if(p.types[key].autoBeamSnapshot===undefined)delete t.autoBeamSnapshot;const out=fn(q);Engine.validate(q);for(const k of fields){if(k==='autoBeamSnapshot'&&t[k]===undefined)delete p.types[key][k];else p.types[key][k]=Engine.clone(t[k]??[]);}return out;}
 function defaults(p,key,f,k,v){if(!['cb','cd'].includes(k)||!Number.isFinite(v)||v<1||v>20000)throw Error('默认柱尺寸须为 1–20000 mm');record(p,key,f).columnDefaults101[k]=v;}
 function mode(p,key,f,value){const before=Engine.model(p,key);if(value==='auto'){mutate(p,key,f,q=>{Engine.freezeAutoBeams(q,key,before);const t=q.types[key];t.mode='auto';for(const k of fields.filter(k=>!['mode','autoBeamSnapshot'].includes(k)))t[k]=[];});p.types[key].autoBeams101=false;}else mutate(p,key,f,q=>{Engine.freezeAutoBeams(q,key,before);Engine.setColumnMode(q,key,value);});}
 function models(){return {};}
 const isReference=(hit,f)=>hit?.kind==='COL'&&hit.f!=null&&hit.f!==f;
 function assertEditable(hit,f){if(isReference(hit,f))throw Error('非當層的柱只供參考，請切換至所屬樓層修改。');}
 function panel(p,result,key,f,hit){const q=view(p,key,f),t=q.types[key],c=hit?.kind==='COL'&&Engine.floorModel(result,hit.f||f,hit.f&&hit.f!==f?result.floors[hit.f-1]?.type:key).columns.find(c=>c.id===hit.id);if(!c)return '<p class="muted">点击图中的柱，在这里修改当前 Framing 的柱参数。</p>';const cf=hit.f||f,ck=cf!==f?result.floors[cf-1]?.type:key,r=Engine.columnRect(c),pos=c.axisPosition||'',esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));if(isReference(hit,f))return '<section class="column-reference101"><h3>'+esc(FloorLevels.name(p,cf))+' · '+esc(c.id)+'</h3><p>非當層的柱 · 只供參考</p><p>B × D：'+Math.round(c.b*1000)+' × '+Math.round(c.d*1000)+' mm</p><p class="muted">請切換至 '+esc(FloorLevels.name(p,cf))+' 修改此柱。</p></section>';return '<section class="column-edit101" data-column-floor="'+cf+'" data-column-framing="'+esc(ck)+'" data-column-id="'+esc(c.id)+'"><h3>'+esc(FloorLevels.name(p,cf))+' · '+esc(c.id)+'</h3><div class="row">'+['b','d'].map(k=>'<label class="field">'+k.toUpperCase()+' mm<input type="number" min="1" max="20000" data-c101="'+k+'" value="'+Math.round(c[k]*1000)+'"></label>').join('')+'</div><div class="row"><label class="field">截面中心 X m<input type="number" step="0.001" data-c101="x" value="'+r.x+'"></label><label class="field">截面中心 Y m<input type="number" step="0.001" data-c101="y" value="'+r.y+'"></label></div><label class="field">截面相对轴线位置<select data-c101="position"><option value="">保持原位</option>'+[['center','居中'],['up','↑ 上'],['down','↓ 下'],['left','← 左'],['right','→ 右'],['up-left','↖ 左上'],['up-right','↗ 右上'],['down-left','↙ 左下'],['down-right','↘ 右下']].map(([v,n])=>'<option value="'+v+'" '+(pos===v?'selected':'')+'>'+n+'</option>').join('')+'</select></label><div class="row"><button type="button" data-c101-copy="1" '+(f>=result.floors.length?'disabled':'')+'>複製至上層</button><button type="button" data-c101-copy="-1" '+(f<=1?'disabled':'')+'>複製至下層</button></div><p class="muted">複製中心座標及尺寸；目標層同一 Framing 亦會共用。</p><button data-c101-delete>删除本柱（共用 Framing）</button><p class="muted">同一套 '+esc(ck)+' 的各层共用柱尺寸和位置；B / D 为柱截面尺寸。中心坐标可用于对齐梁端。</p></section>';}
 function copyAdjacent(p,result,key,f,hit,step){
  assertEditable(hit,f);if(hit?.kind!=='COL'||![-1,1].includes(step))throw Error('請先選擇當層柱');
  const target=f+step,fs=result.floors;if(target<1||target>fs.length)throw Error('沒有對應的樓層');
  const source=Engine.floorModel(result,f,key).columns.find(c=>c.id===hit.id);if(!source)throw Error('柱已不存在');
  const targetKey=fs[target-1].type,label=FloorLevels.name(p,target);
  if(targetKey===key)return {copied:false,message:label+' 與當層共用 '+key+'，此柱已共用，無須重複複製。'};
  const m=Engine.floorModel(result,target,targetKey),r=Engine.columnRect(source),ref=Engine.columnReference(p,key,source),position=source.axisPosition||'',t=p.types[targetKey];
  const identical=m.columns.find(c=>{const q=Engine.columnRect(c);return ['x','y','w','d'].every(k=>Math.abs(q[k]-r[k])<1e-7);});
  if(identical)return {copied:false,message:label+' 已有相同座標及尺寸的柱 '+identical.id+'，未重複新增。'};
  if(!Engine.rectAllowed(m.ts,r.x,r.y,r.w,r.d,true)||Engine.noColumn(t,r.x,r.y))throw Error('目標層此位置不允許放柱');
  if(m.columns.some(c=>Engine.overlap(r,Engine.columnRect(c)))||m.walls.some(w=>Engine.overlap(r,Engine.rect(w))))throw Error('目標層此位置與現有柱或牆重疊，未複製');
  const used=new Set([...t.columns,...m.columns].map(c=>c.id));let id=source.id,n=1;while(used.has(id))id='C'+n++;
  mutate(p,targetKey,target,q=>{const to=q.types[targetKey];Engine.freezeAutoBeams(q,targetKey,Engine.model(q,targetKey));to.columns.push({id,x:ref[0],y:ref[1],b:source.b*1000,d:source.d*1000,status:source.status,on:true,...(to.mode==='auto'?{autoAdded:true}:{})});to.columnAxisPositions=(to.columnAxisPositions||[]).filter(v=>v.key!=='id:'+id);if(position)to.columnAxisPositions.push({key:'id:'+id,position});to.columnPlacements=(to.columnPlacements||[]).filter(v=>v.key!=='id:'+id);const offset=Engine.columnDirections[position];if(!offset||Math.abs(ref[0]+offset[0]*source.b/2-r.x)>1e-7||Math.abs(ref[1]+offset[1]*source.d/2-r.y)>1e-7)to.columnPlacements.push({key:'id:'+id,x:r.x,y:r.y});const built=Engine.model(q,targetKey).columns.find(c=>c.id===id);if(!built||['x','y','w','d'].some(k=>Math.abs(Engine.columnRect(built)[k]-r[k])>1e-7))throw Error('未能保留柱的中心座標及尺寸，已取消複製');});
  return {copied:true,id,target,message:'已複製至 '+label+' · '+id+'（'+targetKey+' 共用），可撤銷。'};
 }
 function copyManyAdjacent(p,result,key,f,hits,step){
  if(!Array.isArray(hits)||!hits.length)throw Error('請先框選當層柱');
  const unique=[...new Map(hits.map(hit=>[hit.id,hit])).values()];
  for(const hit of hits){assertEditable(hit,f);if(hit.kind!=='COL')throw Error('只能複製當層柱');}
  const trial=Engine.clone(p);let current=result,copied=0,skipped=0;
  for(const hit of unique){let out;try{out=copyAdjacent(trial,current,key,f,hit,step);}catch(e){throw Error(hit.id+'：'+e.message+'；整批未複製');}if(out.copied){copied++;current=Engine.generate(trial);}else skipped++;}
  const target=f+step,targetKey=result.floors[target-1]?.type;
  if(copied)p.types[targetKey]=trial.types[targetKey];
  return {copied,skipped,target,message:FloorLevels.name(p,target)+'：已複製 '+copied+' 支柱'+(skipped?'；'+skipped+' 支已存在／共用 Framing，略過':'')+'。'};
 }
 function removeMany(p,result,key,f,hits){
  if(!Array.isArray(hits)||!hits.length)throw Error('請先選取當層柱');
  const model=Engine.floorModel(result,f,key),ids=new Set();
  const columns=hits.map(hit=>{assertEditable(hit,f);if(hit.kind!=='COL')throw Error('只能刪除當層柱');const c=model.columns.find(c=>c.id===hit.id);if(!c)throw Error('所選柱已不存在');ids.add(c.id);return c;});
  const keys=new Set(columns.map(Engine.columnPositionKey));
  mutate(p,key,f,q=>{const t=q.types[key];Engine.freezeAutoBeams(q,key,Engine.model(q,key));
   const auto=columns.filter(c=>t.mode==='auto'&&c.anchorX!==undefined),manual=new Set(columns.filter(c=>!auto.includes(c)).map(c=>c.id));
   t.columns=t.columns.filter(c=>!manual.has(c.id));
   t.suppressedColumns=[...(t.suppressedColumns||[]),...auto.filter((c,i)=>auto.findIndex(a=>a.anchorX===c.anchorX&&a.anchorY===c.anchorY)===i&&!(t.suppressedColumns||[]).some(a=>a.ax===c.anchorX&&a.ay===c.anchorY)).map(c=>({ax:c.anchorX,ay:c.anchorY}))];
   for(const field of ['columnAxisPositions','columnPlacements'])if(t[field])t[field]=t[field].filter(v=>!keys.has(v.key));
  });return ids.size;
 }
 function snap(c){const r=Engine.columnRect(c);return [[r.x,r.y]];}
 function viewport(p){const xs=Object.keys(p.types).flatMap(k=>Engine.axes(p,'x',k).map(a=>a.v)),ys=Object.keys(p.types).flatMap(k=>Engine.axes(p,'y',k).map(a=>a.v));return {x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};}
 document.addEventListener('change',e=>{const a=e.target,k=a.dataset.c101;if(!k)return;const box=a.closest('[data-column-floor]'),f=+box.dataset.columnFloor,id=box.dataset.columnId;StudioHost.transact(()=>{assertEditable({kind:'COL',f},StudioHost.get().floor);const {p,result}=StudioHost.get(),key=box.dataset.columnFraming,c=Engine.floorModel(result,f,key).columns.find(c=>c.id===id);if(!c)throw Error('柱已不存在');const v=k==='position'?a.value:+a.value;if(k==='position')mutate(p,key,f,q=>Engine.setColumnPosition(q,key,Engine.columnPositionKey(c),v));else if(['b','d'].includes(k))mutate(p,key,f,q=>Engine.editSize(q,key,{kind:'COL',id},{b:k==='b'?v:c.b*1000,d:k==='d'?v:c.d*1000}));else{if(a.value.trim()===''||!Number.isFinite(v))throw Error('請填寫有效的柱中心座標');mutate(p,key,f,q=>{const r=Engine.columnRect(c),t=q.types[key],pk=Engine.columnPositionKey(c);t.columnPlacements=(t.columnPlacements||[]).filter(x=>x.key!==pk);t.columnPlacements.push({key:pk,x:k==='x'?v:r.x,y:k==='y'?v:r.y});});}});});
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing&&e.target.matches?.('.column-edit101 input[data-c101]')){e.preventDefault();e.target.blur();}});
 document.addEventListener('click',e=>{const a=e.target.closest('[data-c101-copy]');if(!a||a.disabled)return;const box=a.closest('[data-column-floor]'),f=Number(box.dataset.columnFloor),step=Number(a.dataset.c101Copy),h=StudioHost.get();if(f!==h.floor||box.dataset.columnFraming!==h.key){h&&StudioHost.toast('請先選擇當層柱');return;}const hit={kind:'COL',id:box.dataset.columnId,f};let outcome;if(StudioHost.transact(()=>{const now=StudioHost.get();outcome=copyAdjacent(now.p,now.result,now.key,now.floor,hit,step);}))StudioHost.toast(outcome.message);});
 document.addEventListener('click',e=>{const a=e.target.closest('[data-c101-delete]');if(!a)return;const b=a.closest('[data-column-floor]'),f=+b.dataset.columnFloor;StudioHost.transact(()=>{assertEditable({kind:'COL',f},StudioHost.get().floor);const {p,result}=StudioHost.get(),key=b.dataset.columnFraming;mutate(p,key,f,q=>Engine.removeMember(q,key,{kind:'COL',id:b.dataset.columnId}));});});
 for(const name of ['editSize','removeMember','setTransferColumn']){const original=Engine[name];Engine[name]=function(p,key,hit,...args){if(hit.kind==='COL'&&hit.f){const f=hit.f,k=key||Engine.floors(p)[f-1]?.type;if(!k)throw Error('柱楼层不存在');return mutate(p,k,f,q=>original(q,k,{...hit,f:undefined},...args));}return original(p,key,hit,...args);};}
 return {record,view,mutate,defaults,mode,models,panel,copyAdjacent,copyManyAdjacent,removeMany,snap,viewport,isReference,assertEditable};
})();