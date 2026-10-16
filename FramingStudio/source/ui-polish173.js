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
 function syncReportScope287(){
  const report=['reportA','reportB'].includes(document.querySelector('.layout')?.dataset.tab)||!!document.querySelector('#ex-report-dialog[open]');
  document.documentElement.dataset.uiShell287=String(!report);
  return report;
 }
 function decorate(){
  queued=false;
  if(syncReportScope287())return;
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
  function mountEnhancements(){
   const nav=document.getElementById('nav');
   if(nav&&!nav.querySelector('.nav-search-wrap')){
    const wrap=document.createElement('div');wrap.className='nav-search-wrap';
    const inp=document.createElement('input');inp.type='search';inp.className='nav-search-input';
    inp.placeholder='搜尋工作流 (Ctrl+K)…';inp.setAttribute('aria-label','搜尋左側工作流選單');
    inp.dataset.inputState='default';
    inp.addEventListener('input',()=>{
     const q=inp.value.trim().toLowerCase();
     const buttons=[...nav.querySelectorAll('button[data-tab]')];
     buttons.forEach(b=>{b.hidden=!!q&&!b.textContent.toLowerCase().includes(q)&&!(b.dataset.tab||'').toLowerCase().includes(q);});
     nav.querySelectorAll('.scheme-label').forEach(lbl=>{
      let el=lbl.nextElementSibling,any=false;
      while(el&&!el.classList.contains('scheme-label')&&!el.classList.contains('nav-bottom')){
       if(el.tagName==='BUTTON'&&!el.hidden)any=true;
       el=el.nextElementSibling;
      }
      lbl.hidden=!!q&&!any;
     });
    });
    inp.addEventListener('keydown',e=>{
     if(e.key==='Escape'&&inp.value){e.stopPropagation();inp.value='';inp.dispatchEvent(new Event('input'));}
     if(e.key==='Enter'){const first=nav.querySelector('button[data-tab]:not([hidden])');if(first){first.click();inp.blur();}}
    });
    wrap.append(inp);nav.prepend(wrap);
   }
   const bar=document.getElementById('layout-tools');
   if(bar&&!bar.querySelector('.ui-quick-bar')){
    const qb=document.createElement('span');qb.className='ui-quick-bar';
    const cmdBtn=document.createElement('button');cmdBtn.type='button';cmdBtn.className='ui-cmd-btn';
    cmdBtn.title='快速跳轉模組或搜尋構件（Ctrl+K）';
    cmdBtn.innerHTML='<span>快速跳轉</span><kbd class="ui-kbd">Ctrl+K</kbd>';
    cmdBtn.addEventListener('click',openCommandPalette);

    const scaleWrap=document.createElement('label');scaleWrap.className='ui-scale-wrap';
    scaleWrap.title='針對 13.3" 2880×1800、14.6" 3120×2080、16" 2560×1600 筆電螢幕最佳化，或手動指定縮放';
    const scaleText=document.createElement('span');scaleText.textContent='螢幕適配';
    const scaleSelect=document.createElement('select');scaleSelect.className='ui-scale-select';
    scaleSelect.setAttribute('aria-label','螢幕適配與 UI 縮放');
    scaleSelect.dataset.inputState='default';
    const validModes=['auto','p-133','p-146','p-160','90','95','100','105','110'];
    [['auto','自動識別螢幕'],['p-133','13.3" 2880×1800 (16:10)'],['p-146','14.6" 3120×2080 (3:2)'],['p-160','16" 2560×1600 (16:10)'],['90','手動 90% (超緊湊)'],['95','手動 95% (適中)'],['100','手動 100% (標準)'],['105','手動 105% (舒適)'],['110','手動 110% (放大)']].forEach(([v,t])=>{
     const opt=document.createElement('option');opt.value=v;opt.textContent=t;scaleSelect.append(opt);
    });
    let savedScale='auto';
    try{savedScale=localStorage.getItem('framing-studio-ui-scale173')||'auto';}catch{}
    if(!validModes.includes(savedScale))savedScale='auto';
    scaleSelect.value=savedScale;
    scaleSelect.addEventListener('change',()=>{
     try{localStorage.setItem('framing-studio-ui-scale173',scaleSelect.value);sessionStorage.removeItem('framing-studio-user-resized173');}catch{}
     applyLaptopOptimization(true);
    });
    scaleWrap.append(scaleText,scaleSelect);

    const badge=document.createElement('span');badge.className='ui-laptop-badge';badge.id='ui-laptop-badge173';
    qb.append(cmdBtn,scaleWrap,badge);
    const tip=bar.querySelector('.layout-tip');
    if(tip)bar.insertBefore(qb,tip);else bar.append(qb);
    applyLaptopOptimization();
   }
  }
  const LAPTOP_PROFILES={
   '133-2880x1800':{id:'133-2880x1800',label:'13.3" 2880×1800 (16:10)',autoScale:92,nav:138,sideRatio:.33,sideCap:400},
   '146-3120x2080':{id:'146-3120x2080',label:'14.6" 3120×2080 (3:2)',autoScale:95,nav:144,sideRatio:.32,sideCap:420},
   '160-2560x1600':{id:'160-2560x1600',label:'16" 2560×1600 (16:10)',autoScale:98,nav:152,sideRatio:.35,sideCap:456},
   'desktop':{id:'desktop',label:'大螢幕桌機模式',autoScale:100,nav:160,sideRatio:.37,sideCap:500}
  };
  function detectLaptopProfile(w,h,modeOverride='auto'){
   if(modeOverride==='p-133')return LAPTOP_PROFILES['133-2880x1800'];
   if(modeOverride==='p-146')return LAPTOP_PROFILES['146-3120x2080'];
   if(modeOverride==='p-160')return LAPTOP_PROFILES['160-2560x1600'];
   const dpr=window.devicePixelRatio||1,sw=window.screen?.width||w,sh=window.screen?.height||h;
   const pw=Math.round(sw*dpr),ph=Math.round(sh*dpr);
   const sRatio=sw/Math.max(1,sh),wRatio=w/Math.max(1,h);
   // 1. Exact or near physical pixel match for the 3 target high-DPI laptop panels
   if((Math.abs(pw-3120)<=64&&Math.abs(ph-2080)<=64)||(Math.abs(w-3120)<=32&&Math.abs(h-2080)<=32))return LAPTOP_PROFILES['146-3120x2080'];
   if((Math.abs(pw-2880)<=64&&Math.abs(ph-1800)<=64)||(Math.abs(w-2880)<=32&&Math.abs(h-1800)<=32))return LAPTOP_PROFILES['133-2880x1800'];
   if((Math.abs(pw-2560)<=64&&Math.abs(ph-1600)<=64)||(Math.abs(w-2560)<=32&&Math.abs(h-1600)<=32)){
    return LAPTOP_PROFILES['160-2560x1600'];
   }
   // 2. Aspect-ratio & CSS viewport classification (covers 125% / 150% / 175% / 200% / 225% Windows scaling)
   const is32=(wRatio>=1.44&&wRatio<=1.54)||(sRatio>=1.46&&sRatio<=1.53&&w<=1820);
   if(is32&&w<=1820)return LAPTOP_PROFILES['146-3120x2080'];
   if(w<=1460||h<=830)return LAPTOP_PROFILES['133-2880x1800'];
   if(w<=1800||h<=1080)return LAPTOP_PROFILES['160-2560x1600'];
   return LAPTOP_PROFILES['desktop'];
  }
  function syncLaptopPanels(forceLayout=false){
   const w=window.innerWidth||1440,h=window.innerHeight||900;
   const pref=document.querySelector('.ui-scale-select')?.value||'auto';
   const profile=detectLaptopProfile(w,h,pref);
   const layout=document.querySelector('.layout');
   if(!layout||w<760||document.body.dataset.resizing==='true')return;
   const navHidden=layout.dataset.navHidden==='true',sideHidden=layout.dataset.sideHidden==='true';
   let userResized=false;
   try{userResized=sessionStorage.getItem('framing-studio-user-resized173')==='true'||!!localStorage.getItem('framing-studio-layout-v1');}catch{}
   if(forceLayout||!userResized){
    const navW=navHidden?0:profile.nav;
    const sideW=sideHidden?0:Math.round(Math.max(310,Math.min(profile.sideCap,w*profile.sideRatio)));
    window.FramingPanelLayout287?.fit(navW,sideW,forceLayout);
   }
  }
  function applyLaptopOptimization(forceLayout=false){
   const w=window.innerWidth||1440,h=window.innerHeight||900;
   const select=document.querySelector('.ui-scale-select');
   const pref=select?.value||'auto';
   const profile=detectLaptopProfile(w,h,pref);
   const badge=document.getElementById('ui-laptop-badge173');
   const pct=(pref==='auto'||pref.startsWith('p-'))?profile.autoScale:(Number(pref)||100);
   if(badge){badge.textContent=profile.label;badge.title=`當前視窗 ${w}×${h} (DPR ${Number((window.devicePixelRatio||1).toFixed(2))}) · 適配檔案：${profile.label} · UI 縮放 ${pct}%`;}
   document.documentElement.dataset.uiScale=String(pct);
   document.documentElement.style.setProperty('--ui-scale',String(pct/100));
   document.documentElement.dataset.laptopProfile=profile.id;

   // Auto-collapse verbose Mark & Size row on <=840px height laptops unless user explicitly opened Legend
   try{
    if(h<=840&&localStorage.getItem('framing-studio-legend-collapsed206')===null&&!document.body.classList.contains('legend-collapsed206')){
     document.getElementById('legend-toggle206')?.click();
    }
   }catch{}

   syncLaptopPanels(forceLayout);
   requestAnimationFrame(()=>syncLaptopPanels(forceLayout));
  }
  let cmdDialog=null,cmdActive=0,cmdItems=[];
  function ensureCommandDialog(){
   if(cmdDialog)return cmdDialog;
   cmdDialog=document.createElement('dialog');cmdDialog.id='ui-cmd-dialog173';
   cmdDialog.setAttribute('aria-label','快速跳轉與指令面板');
   cmdDialog.innerHTML='<div class="cmd-head"><input type="search" class="cmd-input" placeholder="輸入功能名稱（如：梁布置、Member Check、Section A）或構件編號（如：MB1、A-1）…" aria-label="搜尋功能或構件"><button type="button" class="cmd-close" aria-label="關閉">Esc</button></div><div class="cmd-list" role="listbox"></div>';
   document.body.append(cmdDialog);
   const input=cmdDialog.querySelector('.cmd-input'),list=cmdDialog.querySelector('.cmd-list');
   cmdDialog.querySelector('.cmd-close').addEventListener('click',()=>cmdDialog.close());
   cmdDialog.addEventListener('click',e=>{if(e.target===cmdDialog)cmdDialog.close();});
   input.addEventListener('input',()=>renderCommandList(input.value));
   input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();cmdActive=Math.min(cmdItems.length-1,cmdActive+1);highlightCommand(list);}
    else if(e.key==='ArrowUp'){e.preventDefault();cmdActive=Math.max(0,cmdActive-1);highlightCommand(list);}
    else if(e.key==='Enter'&&cmdItems[cmdActive]){e.preventDefault();cmdItems[cmdActive].run();cmdDialog.close();}
   });
   return cmdDialog;
  }
  function highlightCommand(list){
   [...list.querySelectorAll('.cmd-item')].forEach((el,i)=>{
    const active=i===cmdActive;el.dataset.active=String(active);
    if(active)el.scrollIntoView({block:'nearest'});
   });
  }
  function renderCommandList(query){
   const d=ensureCommandDialog(),list=d.querySelector('.cmd-list'),q=String(query||'').trim().toLowerCase();
   const items=[];
   document.querySelectorAll('#nav button[data-tab]').forEach(b=>{
    const label=clean(b.textContent),tab=b.dataset.tab;
    let group='';let p=b.previousElementSibling;while(p){if(p.classList.contains('scheme-label')){group=clean(p.textContent);break;}p=p.previousElementSibling;}
    items.push({label,sub:group||'導航模組',keywords:(label+' '+tab+' '+group).toLowerCase(),run:()=>b.click()});
   });
   if(window.StudioHost?.get&&typeof Engine!=='undefined'){
    try{
     const {p,result,floor,key}=window.StudioHost.get();
     const m=Engine.floorModel(result,floor,key);
     for(const c of m.columns||[])items.push({label:`柱 ${c.id} (${Math.round(c.b*1000)}×${Math.round(c.d*1000)} mm)`,sub:`${key} · Summary Check · 選取此柱`,keywords:`col column ${c.id}`.toLowerCase(),run:()=>window.StudioHost.focusMember287({kind:'COL',id:c.id,f:floor})});
     for(const b of m.beams||[])items.push({label:`${b.displayKind||b.kind} ${b.displayId||b.id} (${Math.round(b.b*1000)}×${Math.round(b.d*1000)} mm)`,sub:`${key} · 跳轉至 Summary Check`,keywords:`beam ${b.kind} ${b.id} ${b.displayId||''}`.toLowerCase(),run:()=>window.StudioHost.focusMember287({kind:b.kind,id:b.id,f:floor})});
    }catch{}
   }
   cmdItems=q?items.filter(x=>x.keywords.includes(q)):items.slice(0,22);
   cmdActive=0;list.innerHTML='';
   if(!cmdItems.length){list.innerHTML='<div style="padding:16px;text-align:center;color:#6c8494;font-size:13px">未找到相符的功能或構件</div>';return;}
   cmdItems.forEach((item,i)=>{
    const btn=document.createElement('button');btn.type='button';btn.className='cmd-item';btn.dataset.active=String(i===0);
    const title=document.createElement('span');title.textContent=item.label;
    const sub=document.createElement('small');sub.textContent=item.sub;
    btn.append(title,sub);
    btn.addEventListener('click',()=>{item.run();d.close();});
    list.append(btn);
   });
  }
  function openCommandPalette(){
   const d=ensureCommandDialog(),input=d.querySelector('.cmd-input');
   input.value='';renderCommandList('');
   if(!d.open)d.showModal();
   input.focus();
  }
  document.addEventListener('keydown',e=>{
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();openCommandPalette();
   }
  });
  const start=()=>{
   mountEnhancements();
   new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
   const reportObserver287=new MutationObserver(()=>{syncReportScope287();schedule();});
   const layout287=document.querySelector('.layout'),report287=document.getElementById('ex-report-dialog');
   if(layout287)reportObserver287.observe(layout287,{attributes:true,attributeFilter:['data-tab']});
   if(report287)reportObserver287.observe(report287,{attributes:true,attributeFilter:['open']});
   syncReportScope287();
   document.addEventListener('toggle',schedule,true);
   window.addEventListener('resize',()=>{applyLaptopOptimization(false);schedule();});
   for(const id of ['nav-divider','side-divider']){
    const el=document.getElementById(id);
    el?.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){try{sessionStorage.setItem('framing-studio-user-resized173','true');}catch{}}});
    el?.addEventListener('pointerdown',()=>{try{sessionStorage.setItem('framing-studio-user-resized173','true');}catch{}});
    el?.addEventListener('dblclick',()=>{try{sessionStorage.removeItem('framing-studio-user-resized173');}catch{}setTimeout(()=>applyLaptopOptimization(true),0);});
   }
   const header=document.querySelector('body > header');
   if(header&&typeof ResizeObserver!=='undefined'){
    new ResizeObserver(()=>syncLaptopPanels(false)).observe(header);
    new ResizeObserver(()=>syncLaptopPanels(false)).observe(document.getElementById('layout-tools')||header);
   }
   document.getElementById('reset-layout')?.addEventListener('click',()=>setTimeout(()=>{try{localStorage.removeItem('framing-studio-layout-v1');sessionStorage.removeItem('framing-studio-user-resized173');}catch{}applyLaptopOptimization(true);},0));
   document.addEventListener('pointerup',schedule,true);
   schedule();
  };
  document.addEventListener('change',onChange,true);
  document.addEventListener('input',e=>clearWarning(e.target),true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
 }
 return {unitOf,suspicious,labelText,decorate};
})();
if(typeof module!=='undefined')module.exports=UiPolish173;
