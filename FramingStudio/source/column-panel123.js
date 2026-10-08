// Read-only column inspection. Reuse the existing area schedule and Member Check.
const ColumnPanel123=(()=>{
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=x=>Number.isFinite(x)?x.toFixed(2):'—';
 let active=null,stamp='',cache=new Map(),pending='';
 const folds={loads:true,schedule:false};
 const style='.column-panel123{min-width:0}.column-panel123 details{margin:10px 0}.column-panel123 .cp-content{padding:12px;min-width:0}.column-panel123 .cp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.column-panel123 .cp-meta{font-size:13px;color:#637d8b;line-height:1.6}.column-panel123 .cp-plot{display:block;width:100%;max-width:570px;margin:auto}.column-panel123 .cp-total{background:#edf5f7;padding:12px;border-left:4px solid #196d80}.column-panel123 .cp-table{width:100%;font-size:13px}.column-panel123 .cp-table th,.column-panel123 .cp-table td{text-align:left;vertical-align:top;overflow-wrap:anywhere}.column-panel123 .cp-forces{white-space:nowrap}.column-panel123 .cp-pending{color:#9c3c2b}.column-panel123 .cp-actions{display:flex;flex-wrap:wrap;gap:8px}.column-panel123 .cp-current{margin:12px 0 4px;padding:14px 16px;background:#e3f3f8;border:1px solid #91c4d1;border-left:5px solid #087790;border-radius:8px;color:#075f76}.column-panel123 .cp-current .cp-grid{margin-top:12px}.column-panel123 .cp-current small{display:block;margin-bottom:5px}.column-panel123 .cp-current strong{display:block;font-size:clamp(20px,2vw,27px);line-height:1.3;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.column-panel123 .cp-current-row{background:#e3f3f8;font-weight:600;color:#075f76}.column-panel123 .cp-current-row td:first-child{border-left:4px solid #087790}';
 const section=(key,title,body)=>'<details data-cp-fold="'+key+'" '+(folds[key]?'open':'')+'><summary>'+title+'</summary><div class="cp-content">'+body+'</div></details>';
 const pair=(g,q)=>'<span class="cp-forces">DL '+num(g)+'<br>LL '+num(q)+'</span>';
 function inspect(h){
  const p=Engine.clone(h.p),key=h.floor+'|'+h.selected.token;
  p.explorer={...(p.explorer||{}),selected:{[key]:true}};
  const row=Loading.run(p,h.result,'B').rows.find(r=>r.floor===h.floor&&r.token===h.selected.token);
  if(!row)throw Error('当前楼层没有这根承重柱，请重新选择');
  if(row.truss109?.length)return {row,schedule:null};
  const auto=!String(h.data.sectionAAreas||'').trim()||h.data.sectionAAreaMode==='auto';
  const schedule=ColumnLoads101.schedule(p,h.result,h.floor,h.selected.token,auto);
  return {row,schedule};
 }
 function render(h,host){
  const m=h.selected,key=h.floor+'|'+m.token,project=JSON.stringify(h.p),id=key+'|'+project;
  if(project!==stamp){stamp=project;cache=new Map();}
  active={h,host,key,id};
  const heading='<h3>'+esc(m.id)+' · 柱受力</h3><p class="cp-meta">'+esc(FloorLevels.name(h.p,h.floor))+' · '+esc(h.key)+' · '+esc(m.member.displayKind||'Column')+' · 与 Member Check 共用数据</p>';
  const wrap=body=>'<style>'+style+'</style><section class="column-panel123" data-cp-key="'+esc(key)+'" aria-busy="'+(!cache.has(key)&&m.member.status!=='上层柱')+'">'+heading+body+'</section>';
  if(m.member.status==='上层柱')return wrap('<p class="notice">这是上层柱的投影，当前层没有对应的下方承重柱。请切换到该柱所在楼层查看受力。</p>');
  if(!cache.has(key)&&pending!==id){pending=id;setTimeout(()=>{
   if(active?.id!==id){if(pending===id)pending='';return;}
   try{cache.set(key,inspect(h));}catch(e){cache.set(key,{error:e.message});}
   finally{if(pending===id)pending='';if(active?.id===id)host.refresh();}
  },25);}
  const value=cache.get(key),rr=value?.row,d=value?.schedule,current=d?.rows.find(r=>r.floor===h.floor),cfg=Loading.settings(h.p),c=m.member,v={...rr?.result?.inputs,...rr?.result?.values},errors=[...new Set([...(d?.errors||[]),...(rr?.loadErrors||[]),...(value?.error?[value.error]:[])])];
  if(rr?.truss109?.length){
   const g=rr.loading.dead,q=rr.loading.live,fail=[...new Set([...(rr.loadErrors||[]),...(rr.result.fail||[])])];
   return wrap(section('loads','① 柱受力 · Truss DL / LL','<div class="cp-current"><b>'+esc(FloorLevels.name(h.p,h.floor))+' · 桁架反力及向下累计</b><div class="cp-grid"><div><small>恒载 DL · kN</small><strong>'+num(g)+'</strong></div><div><small>活载 LL · kN</small><strong>'+num(q)+'</strong></div></div></div><p class="cp-meta">来源：'+rr.truss109.map(esc).join('、')+'。包括本层及上部实际传荷。</p><div class="cp-total">1.4DL + 1.6LL = '+num(1.4*g+1.6*q)+' kN<br>验算轴力 N = '+num(v.C28)+' kN</div>'+(fail.length?'<p class="cp-pending">'+fail.map(esc).join('；')+'</p>':''))+'<div class="cp-actions"><button type="button" data-cp-member>打开此柱 Member Check</button></div>');
  }
  const G=d?.totalG,Q=d?.totalQ,combination=Number.isFinite(G)&&Number.isFinite(Q)?1.4*G+1.6*Q:null;
  const floorLabel=esc(FloorLevels.name(h.p,h.floor)),currentCard='<div class="cp-current"><b>当前层 '+floorLabel+' · 本层荷载</b><div class="cp-grid"><div><small>恒载 DL · kN</small><strong>'+num(current?.G)+'</strong></div><div><small>活载 LL · kN</small><strong>'+num(current?.Q)+'</strong></div></div></div>';
  const loads=currentCard+'<p class="cp-meta">面积法累计 · DL / LL 单位 kN · DL 已含自重</p>'+diagram(current,m.id)+'<div class="cp-total"><small>本层柱累计 · '+floorLabel+' · 本层＋上部</small><br><b>总计 DL '+num(G)+' / LL '+num(Q)+' kN</b><br>荷载组合 1.4DL + 1.6LL = '+num(combination)+' kN<br>柱项目系数 '+num(cfg.columnProject)+' · 验算轴力 N = <b>'+num(v.C28)+' kN</b></div>'+(errors.length?'<p class="cp-pending">'+(value?.error?'计算待确认':'荷载／传荷待确认')+'：'+errors.map(esc).join('；')+'</p>':'')+'<p class="cp-meta">本层荷载加上部累计得到本柱总荷载；验算轴力再采用原柱项目系数。</p>';
  const schedule=d?'<div class="table-wrap"><table class="cp-table"><thead><tr><th>楼层</th><th>面积 m²</th><th>本层 kN</th><th>上部 kN</th><th>累计 kN</th></tr></thead><tbody>'+[...d.rows].reverse().map(r=>'<tr'+(r.floor===h.floor?' class="cp-current-row" aria-current="true"':'')+'><td>'+esc(FloorLevels.name(h.p,r.floor))+'</td><td>'+num(r.area)+'</td><td>'+pair(r.G,r.Q)+'</td><td>'+pair(r.upperG,r.upperQ)+'</td><td>'+pair(r.totalG,r.totalQ)+'</td></tr>').join('')+'</tbody></table></div><p class="cp-meta">上部累计不含本层。受荷面积读取现有自动面积或已保存的逐层手动面积。</p>':'<p>'+(value?'受荷明细待确认。':'正在汇总逐层荷载…')+'</p>';
  const memberLink='<p class="cp-meta">荷载读取 Loading；受荷面积与已保存设置共用。柱验算及配筋在 Member Check 查看。</p><div class="cp-actions"><button type="button" data-cp-member>打开此柱 Member Check</button></div>';
  return wrap(section('loads','① 柱受力 · DL / LL',loads)+section('schedule','② 逐层受荷明细',schedule)+memberLink);
 }
 function diagram(r,id){return '<svg class="cp-plot" viewBox="0 0 440 260" role="img" aria-label="柱面积法荷载累加示意，突出当前层传入荷载"><rect x="9" y="73" width="422" height="93" rx="8" fill="#e3f3f8"/><rect x="195" y="69" width="50" height="134" fill="#edf5f7" stroke="#196d80" stroke-width="2"/><path d="M220 24v38m-6-9l6 9 6-9 M220 205v27m-6-9l6 9 6-9" fill="none" stroke="#829ba7" stroke-width="2"/><path d="M151 151h37m-9-6l9 6-9 6" fill="none" stroke="#087790" stroke-width="3.5"/><text x="26" y="25" fill="#637d8b" font-size="14">上部累计</text><text x="26" y="47" fill="#637d8b" font-size="14">DL '+num(r?.upperG)+' / LL '+num(r?.upperQ)+'</text><text x="26" y="98" fill="#075f76" font-size="16" font-weight="700">本层荷载</text><text x="26" y="123" fill="#075f76" font-size="18" font-weight="700">DL '+num(r?.G)+'</text><text x="26" y="148" fill="#075f76" font-size="18" font-weight="700">LL '+num(r?.Q)+'</text><text x="257" y="133" fill="#075f76" font-size="16" font-weight="600">'+esc(id)+'</text><text x="26" y="212" fill="#637d8b" font-size="14">本层 + 上部</text><text x="26" y="234" fill="#637d8b" font-size="14">DL '+num(r?.totalG)+' / LL '+num(r?.totalQ)+'</text></svg>';}
 function live(){return active&&document.querySelector('.column-panel123')?.dataset.cpKey===active.key;}
 document.addEventListener('toggle',e=>{if(e.target.matches?.('.column-panel123 [data-cp-fold]'))folds[e.target.dataset.cpFold]=e.target.open;},true);
 document.addEventListener('click',e=>{if(e.target.closest('[data-cp-member]')&&live()){const {h,host}=active;host.focusMember(h.selected.token,h.floor);}});
 return {render,inspect,planArea(p,result,floor){if(!live()||active.h.selected.member.status==='上层柱')return null;const area=ColumnLoads101.viewData(p,result,floor);return area?{...area,compact:true}:null;},clear(){active=null;pending='';}};
})();
