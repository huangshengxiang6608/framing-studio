// Presentation only (Issue #3 quick wins 4 and 6): unit suffixes, soft unit warnings,
// tooltips and readable accessible names. Never edits the project, never dispatches
// input/change events and never touches report pages or Excel output.
const UiPolish173=(()=>{
 const UNIT=/(?:^|[\s·(（:：])(mm|m|mPD|kPa|kN\/m²|kN\/m2|kN\/m|kN|N\/mm²|N\/mm2|MPa|%)\s*[)）]?$/;
 const INTERNAL=/^[A-Za-z][A-Za-z0-9_]*$/;
 const TIPS={
  undo:'撤销上一步修改（Ctrl＋Z）',newproject:'新建空白项目；当前项目请先保存',open:'打开 .framing.json 项目文件',save:'保存项目文件（Ctrl＋S）',help:'查看使用说明及快捷键',
  'toggle-nav':'收起／展开左侧菜单，让图面更宽','toggle-side':'收起／展开右侧输入区，让图面更宽','toggle-compact':'切换紧凑模式（减少间距）','reset-layout':'恢复菜单、图面和输入区的默认宽度',
  copytype:'复制当前 Framing 类型（含轴线及构件）',deletetype:'删除当前 Framing 类型（可撤销）',selecttool:'选择模式：单击／拖框选择构件，Delete 删除，Esc 清除',drawtool:'绘图模式：放柱、画墙／梁或涂选区域',
  plan:'平面编辑视图',three:'3D 查看视图',fit:'图面恢复居中并适合窗口',minus:'缩小图面（滚轮也可缩放）',plus:'放大图面（滚轮也可缩放）',paint:'在图上单击／拖动涂选格子',erase:'在图上单击／拖动擦除格子'
 };
 const ACTION_TIPS={
  delaxisx:'删除此 X 向轴线（可撤销）',delaxisy:'删除此 Y 向轴线（可撤销）',delgroup:'删除此楼层组（需“应用楼层分组”后生效）',delwalls:'删除此墙段（可撤销）',
  addaxisx:'在最后新增一条 X 向轴线',addaxisy:'在最后新增一条 Y 向轴线',addgroup:'新增一个楼层组',applygroups:'检查并应用楼层分组；重叠、漏层会提示',cancelgroups:'放弃未应用的楼层分组修改',
  newtype:'新增一个空白 Framing 类型','preview-column-grid':'按目标柱间距预览柱轴线（不改模型）','apply-column-grid':'采用预览的柱轴线（可撤销）','clear-column-grid':'取消柱轴线，恢复按建筑轴线布柱',
  'draw-column-grid':'在柱轴线上点选位置补柱',allregion:'把整层设为当前图层区域（可撤销）',clearregion:'清空当前图层的全部区域（可撤销）',endline:'结束当前连续绘制（Esc）','reset-columns101':'按当前规则重新自动布柱（可撤销）'
 };
 const DELETE_ROW='删除此行（可撤销）';
 let queued=false;
 // State lives in a WeakMap, not data-* attributes: InputFeedback172 builds selectors from data-* attributes.
 const state=new WeakMap(),info=e=>{let x=state.get(e);if(!x){x={};state.set(e,x);}return x;};
 const visible=e=>e.offsetParent!==null;
 const clean=s=>String(s||'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
 function labelText(e){
  const own=e.closest('label');
  if(own){const c=own.cloneNode(true);c.querySelectorAll('input,select,textarea,option,button').forEach(x=>x.remove());const t=clean(c.textContent);if(t)return t;}
  if(e.id){const l=document.querySelector('label[for="'+CSS.escape(e.id)+'"]');if(l)return clean(l.textContent);}
  const cell=e.closest('td');
  if(cell){const table=cell.closest('table'),i=[...cell.parentElement.children].indexOf(cell),th=table?.querySelector('thead tr')?.children[i];if(th)return clean(th.innerHTML);if(cell.dataset.label)return clean(cell.dataset.label);}
  return '';
 }
 function unitOf(text){const m=clean(text).match(UNIT);return m?m[1]:'';}
 const svg=new Map();
 function suffixImage(unit){if(!svg.has(unit)){const w=unitWidth(unit),t=unit.replace(/&/g,'&amp;').replace(/</g,'&lt;');svg.set(unit,'url("data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="16"><text x="${w}" y="12" text-anchor="end" font-family="Segoe UI,Microsoft YaHei,Arial,sans-serif" font-size="11" fill="#6b7785">${t}</text></svg>`)+'")');}return svg.get(unit);}
 function unitWidth(unit){return Math.ceil(unit.length*6.6)+2;}
 function decorateField(e){
  const text=labelText(e),aria=e.getAttribute('aria-label');
  if(text&&(!aria||INTERNAL.test(aria)||aria===e.dataset.f))e.setAttribute('aria-label',text);
  if(e.tagName!=='INPUT'||e.type!=='number')return;
  const unit=unitOf(text)||unitOf(e.getAttribute('aria-label'));if(!unit)return;
  const x=info(e);x.unit=unit;
  if(!e.title||x.title){e.title='单位：'+unit;x.title=true;}
  const w=unitWidth(unit);
  if(x.suffix===unit)return;
  if(e.offsetWidth-w-18<48)return;
  x.suffix=unit;
  e.style.setProperty('background-image',suffixImage(unit),'important');
  e.style.setProperty('background-repeat','no-repeat','important');
  e.style.setProperty('background-position','right 8px center','important');
  e.style.setProperty('padding-right',(w+14)+'px','important');
 }
 function decorateButton(b){
  if(b.title)return;
  const action=b.dataset.action,text=clean(b.textContent);
  const tip=TIPS[b.id]||ACTION_TIPS[action]||(text==='×'?DELETE_ROW:'');
  if(tip){b.title=tip;if(text.length<=1&&!b.getAttribute('aria-label'))b.setAttribute('aria-label',tip);return;}
  if(text&&b.scrollWidth>b.clientWidth+1)b.title=text;
 }
 function decorate(){
  queued=false;
  document.querySelectorAll('input[type=number],select').forEach(e=>{if(visible(e))decorateField(e);});
  document.querySelectorAll('button').forEach(b=>{if(visible(b))decorateButton(b);});
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(decorate);}
 // Soft warnings: only when a value looks like the wrong unit. Never blocks or changes input.
 function suspicious(unit,v){if(!Number.isFinite(v)||v===0)return '';if(unit==='m'&&Math.abs(v)>=200)return '此栏单位为 m，'+v+' 偏大，是否按 mm 输入？';if(unit==='mm'&&Math.abs(v)<5)return '此栏单位为 mm，'+v+' 偏小，是否按 m 输入？';return '';}
 function selectorOf(e){
  if(e.id)return '#'+CSS.escape(e.id);
  const a=[...e.attributes].filter(x=>x.name.startsWith('data-')&&!/^data-(input-state|input-note|feedback172|model-value172)$/.test(x.name));
  return a.length?e.tagName.toLowerCase()+a.map(x=>'['+CSS.escape(x.name)+'="'+CSS.escape(x.value)+'"]').join(''):null;
 }
 function clearWarning(e){const x=e&&state.get(e),id=x?.warning;if(!id)return;document.getElementById(id)?.remove();const rest=(e.getAttribute('aria-describedby')||'').split(/\s+/).filter(v=>v&&v!==id);if(rest.length)e.setAttribute('aria-describedby',rest.join(' '));else e.removeAttribute('aria-describedby');e.classList.remove('unit-warning-field173');delete x.warning;}
 let serial=0;
 function warn(snapshot){
  const found=snapshot.selector?document.querySelectorAll(snapshot.selector):[];
  const e=found.length===1?found[0]:(document.contains(snapshot.element)?snapshot.element:null);
  if(!e||e.getAttribute('aria-invalid')==='true'||Number(e.value)!==snapshot.value)return;
  clearWarning(e);const note=document.createElement('span'),id='unit-warning173-'+(++serial);
  note.id=id;note.className='unit-warning173';note.setAttribute('role','status');note.textContent='提示：'+snapshot.message+'如数值无误可忽略。';
  info(e).warning=id;e.classList.add('unit-warning-field173');e.setAttribute('aria-describedby',[e.getAttribute('aria-describedby'),id].filter(Boolean).join(' '));e.after(note);
 }
 function onChange(ev){
  const e=ev.target;if(!(e instanceof HTMLInputElement)||e.type!=='number')return;
  const unit=state.get(e)?.unit||unitOf(labelText(e));clearWarning(e);if(!unit)return;
  const value=Number(e.value),message=e.value.trim()===''?'':suspicious(unit,value);if(!message)return;
  const snapshot={selector:selectorOf(e),element:e,value,message};
  setTimeout(()=>warn(snapshot),0);
 }
 if(typeof document!=='undefined'&&typeof MutationObserver!=='undefined'){
  const start=()=>{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});document.addEventListener('toggle',schedule,true);window.addEventListener('resize',schedule);document.addEventListener('pointerup',schedule,true);schedule();};
  document.addEventListener('change',onChange,true);
  document.addEventListener('input',e=>clearWarning(e.target),true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
 }
 return {unitOf,suspicious,labelText,decorate};
})();
if(typeof module!=='undefined')module.exports=UiPolish173;
