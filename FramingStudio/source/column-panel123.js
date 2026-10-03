// Read-only column inspection. Reuse the existing area schedule and Member Check.
const ColumnPanel123=(()=>{
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=x=>Number.isFinite(x)?x.toFixed(2):'—';
 let active=null,stamp='',cache=new Map(),pending='',showArea=true;
 const folds={geometry:false,loads:true,schedule:false,check:true};
 const style='.column-panel123{min-width:0}.column-panel123 details{margin:10px 0}.column-panel123 .cp-content{padding:12px;min-width:0}.column-panel123 .cp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.column-panel123 .cp-value{padding:10px;background:#e7f1f5;border-radius:6px;overflow-wrap:anywhere}.column-panel123 .cp-value small{display:block;color:#637d8b;font-weight:normal;margin-bottom:4px}.column-panel123 .cp-meta{font-size:13px;color:#637d8b;line-height:1.6}.column-panel123 .cp-plot{display:block;width:100%;max-width:570px;margin:auto}.column-panel123 .cp-total{background:#edf5f7;padding:12px;border-left:4px solid #196d80}.column-panel123 .cp-table{width:100%;font-size:13px}.column-panel123 .cp-table th,.column-panel123 .cp-table td{text-align:left;vertical-align:top;overflow-wrap:anywhere}.column-panel123 .cp-forces{white-space:nowrap}.column-panel123 .cp-status{font-weight:600;color:#196d80}.column-panel123 .cp-pending{color:#9c3c2b}.column-panel123 .cp-actions{display:flex;flex-wrap:wrap;gap:8px}';
 const section=(key,title,body)=>'<details data-cp-fold="'+key+'" '+(folds[key]?'open':'')+'><summary>'+title+'</summary><div class="cp-content">'+body+'</div></details>';
 const pair=(g,q)=>'<span class="cp-forces">G '+num(g)+'<br>Q '+num(q)+'</span>';
 function inspect(h){
  const p=Engine.clone(h.p),key=h.floor+'|'+h.selected.token;
  p.explorer={...(p.explorer||{}),selected:{[key]:true}};
  const row=Loading.run(p,h.result,'B').rows.find(r=>r.floor===h.floor&&r.token===h.selected.token);
  if(!row)throw Error('当前楼层没有这根承重柱，请重新选择');
  const auto=!String(h.data.sectionAAreas||'').trim()||h.data.sectionAAreaMode==='auto';
  const schedule=ColumnLoads101.schedule(p,h.result,h.floor,h.selected.token,auto);
  return {row,schedule};
 }
 function render(h,host){
  const m=h.selected,key=h.floor+'|'+m.token,project=JSON.stringify(h.p),id=key+'|'+project;
  if(project!==stamp){stamp=project;cache=new Map();}
  active={h,host,key,id};
  const heading='<h3>'+esc(m.id)+' · 柱受力</h3><p class="cp-meta">'+esc(FloorLevels.name(h.p,h.floor))+' · '+esc(h.key)+' · '+esc(m.member.displayKind||'Column')+' · 与 Member Check 共用数据</p>';
  const wrap=body=>'<style>'+style+'</style><section class="column-panel123" data-cp-key="'+esc(key)+'">'+heading+body+'</section>';
  if(m.member.status==='上层柱')return wrap('<p class="notice">这是上层柱的投影，当前层没有对应的下方承重柱。请切换到该柱所在楼层查看受力。</p>');
  if(!cache.has(key)&&pending!==id){pending=id;setTimeout(()=>{
   if(active?.id!==id){if(pending===id)pending='';return;}
   try{cache.set(key,inspect(h));}catch(e){cache.set(key,{error:e.message});}
   finally{if(pending===id)pending='';if(active?.id===id)host.refresh();}
  },25);}
  const value=cache.get(key),rr=value?.row,d=value?.schedule,current=d?.rows.find(r=>r.floor===h.floor),cfg=Loading.settings(h.p),c=m.member,v={...rr?.result?.inputs,...rr?.result?.values},errors=[...new Set([...(d?.errors||[]),...(rr?.loadErrors||[]),...(value?.error?[value.error]:[])])];
  const geometry='<label><input type="checkbox" id="cp-area123" '+(showArea?'checked':'')+'>显示本层受荷范围</label><div class="cp-grid">'+[
   ['截面 B × D · mm',num(c.b*1000)+' × '+num(c.d*1000)],['柱高 · m',num(LocalHeights96.columnHeight(h.p,h.result,h.floor,c))],['Column system',esc(h.data.system||'Braced')],['有效长度系数',num(h.data.factor??cfg.columnFactor)],['混凝土 fcu · MPa',num(cfg.columnFcu)],['本层受荷面积 · m²',num(current?.area)]
  ].map(([label,n])=>'<div class="cp-value"><small>'+label+'</small>'+n+'</div>').join('')+'</div>';
  const G=d?.totalG,Q=d?.totalQ,combination=Number.isFinite(G)&&Number.isFinite(Q)?1.4*G+1.6*Q:null;
  const loads='<p class="cp-meta">面积法累计 · G / Q 单位 kN · DL 已含自重</p>'+diagram(current,m.id)+'<div class="cp-total"><b>总计 G '+num(G)+' / Q '+num(Q)+' kN</b><br>荷载组合 1.4G + 1.6Q = '+num(combination)+' kN<br>柱项目系数 '+num(cfg.columnProject)+' · 验算轴力 N = <b>'+num(v.C28)+' kN</b></div>'+(errors.length?'<p class="cp-pending">'+(value?.error?'计算待确认':'荷载／传荷待确认')+'：'+errors.map(esc).join('；')+'</p>':'')+'<p class="cp-meta">本层荷载加上部累计得到本柱总荷载；验算轴力再采用原柱项目系数。</p>';
  const schedule=d?'<div class="table-wrap"><table class="cp-table"><thead><tr><th>楼层</th><th>面积 m²</th><th>本层 kN</th><th>上部 kN</th><th>累计 kN</th></tr></thead><tbody>'+[...d.rows].reverse().map(r=>'<tr'+(r.floor===h.floor?' style="background:#e7f1f5"':'')+'><td>'+esc(FloorLevels.name(h.p,r.floor))+'</td><td>'+num(r.area)+'</td><td>'+pair(r.G,r.Q)+'</td><td>'+pair(r.upperG,r.upperQ)+'</td><td>'+pair(r.totalG,r.totalQ)+'</td></tr>').join('')+'</tbody></table></div><p class="cp-meta">上部累计不含本层。受荷面积读取现有自动面积或已保存的逐层手动面积。</p><details><summary>各荷载区域 · DL / SDL / LL</summary><div class="table-wrap"><table class="cp-table"><thead><tr><th>楼层 / 区域</th><th>面积 m²</th><th>DL</th><th>SDL</th><th>LL</th></tr></thead><tbody>'+d.rows.flatMap(r=>r.parts.map(x=>'<tr><td>'+esc(FloorLevels.name(h.p,r.floor))+'<br>'+esc(x.areaName||'整层')+'</td><td>'+num(x.area)+'</td><td>'+num(x.dl)+'</td><td>'+num(x.sdl)+'</td><td>'+num(x.ll)+'</td></tr>')).join('')+'</tbody></table></div><p class="cp-meta">面荷载单位 kPa；沿用 Loading 输入。</p></details>':'<p>'+(value?'受荷明细待确认。':'正在汇总逐层荷载…')+'</p>';
  const status=rr?.result?.status||(value?'INPUT REQUIRED':'计算中…'),check='<p class="cp-status '+(status==='INPUT REQUIRED'||status==='NOT OK'?'cp-pending':'')+'" data-cp-status>'+esc(status)+'</p><p>'+esc(rr?.result?.description||'')+'</p>'+(rr?.result?.fail||[]).filter(e=>!errors.includes(e)).map(e=>'<p class="cp-pending">'+esc(e)+'</p>').join('')+(Object.keys(v).length?'<table class="cp-table"><tbody>'+[['截面面积检查',v.C40],['长细比 / 柱体系',v.C38],['轴压检查',v.C41],['钢筋面积 As · mm²',num(v.C33)],['配筋率 · %',num(v.C34)]].map(([label,n])=>'<tr><td>'+label+'</td><td>'+esc(n)+'</td></tr>').join('')+'</tbody></table>':'')+'<p class="cp-meta">当前沿用原柱轴压验算；柱弯矩、剪力未在此计算。荷载在 Loading 修改，面积及配筋设置沿用 Member Check。</p><div class="cp-actions"><button type="button" data-cp-member>打开此柱 Member Check</button></div>';
  return wrap(section('geometry','① 柱尺寸与受荷范围',geometry)+section('loads','② 柱受力 · G / Q',loads)+section('schedule','③ 逐层受荷明细',schedule)+section('check','④ 柱验算',check));
 }
 function diagram(r,id){return '<svg class="cp-plot" viewBox="0 0 440 238" role="img" aria-label="柱面积法荷载累加示意"><rect x="195" y="69" width="50" height="115" fill="#e7f1f5" stroke="#196d80" stroke-width="2"/><path d="M220 24v38m-6-9l6 9 6-9 M140 126h48m-9-6l9 6-9 6 M220 186v28m-6-9l6 9 6-9" fill="none" stroke="#196d80" stroke-width="2"/><text x="26" y="25" fill="#244558" font-size="14">上部累计</text><text x="26" y="47" fill="#244558" font-size="14">G '+num(r?.upperG)+' / Q '+num(r?.upperQ)+'</text><text x="26" y="94" fill="#244558" font-size="14">本层</text><text x="26" y="116" fill="#244558" font-size="14">G '+num(r?.G)+' / Q '+num(r?.Q)+'</text><text x="257" y="138" fill="#244558" font-size="15">'+esc(id)+'</text><text x="26" y="189" fill="#244558" font-size="14">本层 + 上部</text><text x="26" y="211" fill="#244558" font-size="14">G '+num(r?.totalG)+' / Q '+num(r?.totalQ)+'</text></svg>';}
 function live(){return active&&document.querySelector('.column-panel123')?.dataset.cpKey===active.key;}
 document.addEventListener('toggle',e=>{if(e.target.matches?.('.column-panel123 [data-cp-fold]'))folds[e.target.dataset.cpFold]=e.target.open;},true);
 document.addEventListener('change',e=>{if(e.target.id==='cp-area123'&&live()){showArea=e.target.checked;active.host.repaint();}});
 document.addEventListener('click',e=>{if(e.target.closest('[data-cp-member]')&&live()){const {h,host}=active;host.focusMember(h.selected.token,h.floor);}});
 return {render,inspect,showArea:()=>!!live()&&showArea&&active.h.selected.member.status!=='上层柱',clear(){active=null;pending='';}};
})();
