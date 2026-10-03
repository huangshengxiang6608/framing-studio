// Foundation v8 source methods; one shared area-load input for both copies.
window.Foundation=(()=>{
 const sheets=['A Bored Pile Checking','A Socket H Checking','A Driven H Checking','A Mini Pile Checking','B Bored Pile Checking','B Socket H Checking'];
 const types=[['bored','Bored pile'],['socket','Socket H-pile'],['driven','Driven H-pile'],['mini','Mini pile']];
 const rocks={'1(a)':10000,'1(b)':7500,'1(c)':5000,'1(d)':3000,'2':3000,'3':1000};
 const defaults={column:'',pile:'bored',reportA:true,reportB:true,fcu:45,cover:75,h:null,rock:'',bell:2500,shaft:1800,section:'305 × 305 × 223',fy:430,area:28400,socket:6700,bore:550,perimeter:1918,rockBond:.7,steelBond:.48,miniBars:5,miniDia:50,miniFy:500,bond:5.5,pileFcu:48,pileBars:24,pileDia:20};
 const settings=p=>({...defaults,...p.foundation});
 function columns(p,model){return model.floors.flatMap(f=>Loading.members(p,model,f.n).filter(m=>m.kind==='COL').map(m=>({key:f.n+'|'+m.token,label:FloorLevels.name(p,f.n)+' · '+m.id,floor:f.n,...m})));}
 let loadCacheKey='',loadCache;
 function load(project){const s=settings(project),stamp=JSON.stringify([project,s.column]);if(stamp===loadCacheKey)return loadCache;let value;try{
  if(!s.column)throw Error('请选择柱');const p=Engine.clone(project),e=Loading.init(p),model=Engine.generate(p),m=columns(p,model).find(m=>m.key===s.column);if(!m)throw Error('所选柱已删除或楼层改变，请重新选择');
  e.selected[s.column]=true;const out=Loading.run(p,model,'A'),r=out.rows.find(r=>r.floor+'|'+r.token===s.column);if(!r)throw Error('柱荷载尚未生成');const a=r.columnA||Reports.columnA(p,r);if(a.errors.length)throw Error(a.errors.join('；'));
  const dl=a.rows.reduce((v,x)=>v+(x.dl+x.sdl)*x.area*x.count,0),ll=a.rows.reduce((v,x)=>v+x.ll*x.area*x.count,0),floors=new Set(a.rows.flatMap(x=>Array.from({length:x.hi-x.lo+1},(_,i)=>x.lo+i))).size,b=r.member.b*1000,d=r.member.d*1000;
  if(![dl,ll,b,d,floors].every(Number.isFinite)||dl<0||ll<0||dl+ll<=0)throw Error('柱面积法荷载／尺寸未完整');
  value={ok:true,dl,ll,floors,b,d,floor:m.floor,label:m.label,rows:a.rows};
 }catch(e){value={ok:false,error:e.message};}loadCacheKey=stamp;return loadCache=value;}
 function calculate(p){const s=settings(p),l=load(p),errors=[];if(!l.ok)errors.push(l.error);else if(Math.abs(l.b-l.d)>.001)errors.push('原表采用方柱：当前柱为 '+l.b+' × '+l.d+' mm，尚不能套用方柱周长');
  const positive=['fcu','h'];if(!(s.cover>=0&&s.cover!==null))errors.push('请填写 Cover');
  if(s.pile==='bored')positive.push('bell','shaft','pileFcu','pileBars','pileDia');else if(['socket','driven'].includes(s.pile))positive.push('fy','area');else if(s.pile==='mini')positive.push('miniBars','miniDia','miniFy','bond');else errors.push('请选择桩型');
  if(s.pile==='socket')positive.push('socket','bore','perimeter','rockBond','steelBond');
  if(s.pile==='driven'&&!Number.isFinite(s.founding))errors.push('请填写 Dense sand / founding level · mPD');
  const labels={h:'Pile-cap 厚度 h',fcu:'Pile-cap fcu',bell:'Bell-out 直径',shaft:'桩身直径',pileFcu:'有效桩混凝土强度',pileBars:'桩主筋数量',pileDia:'桩主筋直径',fy:'钢材 fy',area:'钢截面面积',miniBars:'Mini pile 钢筋数量',miniDia:'Mini pile 钢筋直径',miniFy:'Mini pile fy',bond:'Bond length',socket:'Socket length',bore:'Borehole diameter',perimeter:'钢截面周长',rockBond:'Rock / grout bond stress',steelBond:'Grout / steel bond stress'};
  for(const k of positive)if(!(Number.isFinite(s[k])&&s[k]>0))errors.push('请填写 '+labels[k]);
  if(s.h!=null&&s.h<=s.cover)errors.push('厚度 h 必须大于 Cover');if(s.pile==='bored'&&!rocks[s.rock])errors.push('请选择 Rock category');
  for(const k of s.pile==='bored'?['pileBars']:s.pile==='mini'?['miniBars']:[])if(s[k]>0&&!Number.isInteger(s[k]))errors.push(labels[k]+' 必须是整数');
  if(errors.length)return {s,l,errors,ok:false};
  const N=l.dl+l.ll,U=1.6*N,UB=1.4*l.dl+1.6*l.ll,dep=s.h-s.cover,u=4*l.b,lim=.8*Math.sqrt(s.fcu),v=U*1000/u/dep,vB=UB*1000/u/dep;
  const cap=s.pile==='bored'?Math.PI/4*(s.bell/1000)**2*rocks[s.rock]:s.pile==='mini'?s.miniBars*Math.PI/4*s.miniDia**2*s.miniFy*.475/1000:s.fy*s.area*(s.pile==='socket'?.5:.3)/1000,n=Math.ceil(N/cap);
  const a={n,cap,total:n*cap,U,v,limit:lim,d:dep,punch:(s.pile==='bored'?v<=lim:v<lim)?'OK':'NG',capacity:N<=n*cap?'OK':'NG'},b={n,U:UB,v:vB,limit:lim,d:dep,punch:vB<=lim?'OK':'NG',capacity:a.capacity};
  const expected={},inputs={},set=(name,cells)=>{inputs[name]={...inputs[name],...cells};};
  set(sheets[0],{C9:l.floors,C10:N,C13:s.bell,C14:s.rock||null,C23:s.shaft,C30:l.b,C33:s.fcu,C38:s.cover,C39:s.h});set(sheets[4],{C9:l.dl,C10:l.ll,C21:s.pileFcu,C22:s.pileBars,C23:s.pileDia});
  if(s.pile==='bored'){
   a.shaft=s.bell/1.5<=s.shaft?'OK':'NG';expected[sheets[0]]={C15:rocks[s.rock],C16:n,C17:cap,C18:n*cap,C19:N/(n*cap),C20:a.capacity,C22:s.bell/1.5,C24:a.shaft,C25:n<5?'n < 5':'Review group effects',C29:U,C32:u,C35:lim,C36:U*1000/u/lim,C37:dep,C40:v,C41:a.punch,C42:n===4?4*s.shaft+300:'Layout required',C43:n===4?4*s.shaft+300:'Layout required'};
   const Ac=Math.PI/4*s.shaft**2,As=s.pileBars*Math.PI/4*s.pileDia**2,min=.004*Ac,capacity=.35*s.pileFcu*Ac/1000;
   b.steel=As>=min?'OK':'NG';b.concrete=UB/n<=capacity?'OK':'NG';
   expected[sheets[4]]={C13:N,C14:UB,C17:s.shaft,C18:s.bell,C19:n,C20:rocks[s.rock],C26:Ac,C27:As,C28:min,C29:As/Ac,C30:b.steel,C31:n*cap,C32:b.capacity,C33:capacity,C34:UB/n,C35:b.concrete,C41:u,C42:s.h,C44:dep,C46:lim,C47:vB,C48:b.punch,C49:UB*1000/u/lim};
  }else if(['socket','driven'].includes(s.pile)){
   const sh=sheets[s.pile==='socket'?1:2];set(sh,{C13:s.section,C14:s.fy,C15:s.area,C24:s.pile==='socket'?s.socket/1000:s.founding});
   expected[sh]={C17:cap,C18:N/cap,C19:n,C20:n*cap,C21:N/(n*cap),C22:a.capacity,C27:U,C29:u,C32:lim,C33:s.h,C35:dep,C36:U*1000/u/lim,C37:v,C38:a.punch};
   if(s.pile==='socket'){
    set(sheets[5],{C17:s.section,C18:s.fy,C19:s.area,C26:s.socket,C27:s.bore,C28:s.perimeter,C29:s.rockBond,C30:s.steelBond});
    const rg=s.rockBond*Math.PI*s.bore*s.socket/1000,gs=s.steelBond*s.perimeter*s.socket/1000,gov=Math.min(cap,rg,gs);b.capacity=N<=n*gov?'OK':'NG';b.rock=cap<=rg?'OK':'NG';b.bond=cap<=gs?'OK':'NG';b.cap=gov;
    expected[sheets[5]]={C13:N,C14:UB,C21:cap,C22:n,C23:n*cap,C24:a.capacity,C31:rg,C32:gs,C33:b.rock,C34:b.bond,C35:gov,C36:n*gov,C37:b.capacity,C38:cap*1000/(s.rockBond*Math.PI*s.bore),C39:cap*1000/(s.steelBond*s.perimeter),C46:u,C47:s.h,C49:dep,C51:lim,C52:vB,C53:b.punch,C54:UB*1000/u/lim};
   }
  }else{
   set(sheets[3],{C13:s.miniBars,C14:s.miniDia,C15:s.miniFy,C25:s.bond});expected[sheets[3]]={C17:s.miniBars*Math.PI/4*s.miniDia**2,C18:cap,C19:N/cap,C20:n,C21:n*cap,C22:N/(n*cap),C23:a.capacity,C29:U,C31:u,C34:lim,C35:s.h,C37:dep,C38:U*1000/u/lim,C39:v,C40:a.punch};
  }
  return {ok:true,s,l,errors,a,b:types.slice(0,2).some(x=>x[0]===s.pile)?b:null,inputs,expected};
 }
 function jobs(p,section=null,report=false){const s=settings(p);if(report&&(!s.column||s['report'+section]===false))return {batches:[],issues:[]};const r=calculate(p);if(!r.ok)throw Error(r.errors.join('；'));if(section==='B'&&!r.b)return {batches:[],issues:[{id:'Foundation',reason:'原 Excel 的 Section B 仅有 Bored pile／Socket H-pile；所选桩型没有 B 抄'}]};
  const sections=section?[section]:['A',...(r.b?['B']:[])];return {batches:[{type:'Foundation',label:'Foundation · '+r.l.label+' · '+types.find(x=>x[0]===s.pile)[1],pile:s.pile,section,sections,cells:r.inputs,expected:r.expected,column:r.l.label,reportOrder:90}],issues:[]};}
 return {settings,columns,load,calculate,jobs,types,rocks};
})();
window.FoundationUI=(()=>{
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),n=x=>Number.isFinite(x)?x.toLocaleString('en-US',{maximumFractionDigits:1}):'—';
 const field=(label,key,value,options)=>`<label>${label}${options?`<select data-fn="${key}">${options.map(([v,t])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(t)}</option>`).join('')}</select>`:`<input data-fn="${key}" type="${key==='section'?'text':'number'}" step="any" value="${esc(value??'')}" placeholder="请填写">`}</label>`;
 const read=(label,value)=>`<label>${label}<output>${esc(value)}</output></label>`;
 function render(p,model){const r=Foundation.calculate(p),s=r.s,l=r.l,selectedFloor=Number(s.column?.split('|')[0])||s.loadFloor||1,F=(label,k)=>field(label,k,s[k]);
  let html=`<style>.fn-page input:not([type=checkbox]),.fn-page select{background:#fff4c8!important;border:1px solid #dec87e!important}.fn-page output{padding:10px;background:#edf5f8;border-radius:6px;color:#24576d;min-height:39px}.fn-page .wp-grid{grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}</style><div class="fn-page"><div class="wp-head"><div><h1>Foundation</h1><p>选柱带入面积法荷载，按原 Excel 验算并生成 A／B 抄。</p></div></div><section class="wp-card"><h2>柱与荷载</h2><div class="wp-grid">${field('取荷载楼层','loadFloor',String(selectedFloor),model.floors.map(f=>[String(f.n),FloorLevels.name(p,f.n)]))}${field('柱','column',s.column,[['','选择柱'],...Foundation.columns(p,model).filter(x=>x.floor===selectedFloor).map(x=>[x.key,x.label])])}${read('取荷载层标高 · mPD',Number.isFinite(FloorLevels.base(p))?n(FloorLevels.base(p)+model.floors.filter(f=>f.n<=selectedFloor).reduce((v,f)=>v+f.h,0)):'请在楼层页填写模型底标高')}${read('DL + SDL · kN',n(l.dl))}${read('LL · kN',n(l.ll))}${read('柱尺寸 · mm',l.ok?n(l.b)+' × '+n(l.d):'—')}${read('面积法累计楼层数',n(l.floors))}</div>${!l.ok?`<p class="wp-alert">${esc(l.error)}</p>`:''}<p class="wp-sub">DL、SDL、LL 和受荷面积取自所选柱的 Section A／B 共用输入。楼层按实际模型计算，B1 名称不会额外增加荷载。</p>${selectedFloor>1?'<p class="wp-alert">所选取荷载层下方还有模型楼层；这些楼层不自动计入此柱，请核对基础取荷载位置。</p>':''}${FloorLevels.isBasement(FloorLevels.name(p,0))?'<p class="wp-sub">'+esc(FloorLevels.name(p,0))+' 当前是模型底标高点，不是独立受荷楼层。</p>':''}${l.ok?'<details open><summary>已计入楼层与面积</summary><div class="table-wrap"><table class="wp-table"><tr><th>楼层／区域</th><th>面积 m²</th><th>DL + SDL kPa</th><th>LL kPa</th><th>层数</th></tr>'+l.rows.map(x=>'<tr><td>'+esc(FloorLevels.range(p,x.lo,x.hi))+' · '+esc(x.areaName||x.usage||'整层')+'</td><td>'+n(x.area)+'</td><td>'+n(x.dl+x.sdl)+'</td><td>'+n(x.ll)+'</td><td>'+x.count+'</td></tr>').join('')+'</table></div></details>':''}</section><section class="wp-card"><h2>桩型与参数</h2><div class="wp-grid">${field('桩型','pile',s.pile,Foundation.types)}`;
  if(s.pile==='bored')html+=field('Rock category','rock',s.rock,[['','请选择'],...Object.keys(Foundation.rocks).map(k=>[k,k])])+read('容许承压 qb · kPa',n(Foundation.rocks[s.rock]))+F('Bell-out 直径 · mm','bell')+F('桩身直径 · mm','shaft')+F('有效桩混凝土强度 · N/mm²','pileFcu')+F('桩主筋数量','pileBars')+F('桩主筋直径 · mm','pileDia');
  if(['socket','driven'].includes(s.pile))html+=F('钢截面','section')+F('fy · N/mm²','fy')+F('钢截面面积 · mm²','area');
  if(s.pile==='socket')html+=F('Rock socket length · mm','socket')+F('Borehole 直径 · mm','bore')+F('钢截面周长 · mm','perimeter')+F('Rock / grout bond · N/mm²','rockBond')+F('Grout / steel bond · N/mm²','steelBond');
  if(s.pile==='mini')html+=F('钢筋数量','miniBars')+F('钢筋直径 · mm','miniDia')+F('fy · N/mm²','miniFy')+F('Bond length · m','bond');
  if(s.pile==='driven')html+=F('Dense sand / founding level · mPD','founding');
  html+=`</div></section><section class="wp-card"><h2>Pile-cap</h2><div class="wp-grid">${F('混凝土 fcu · N/mm²','fcu')}${F('Cover · mm','cover')}${F('厚度 h · mm','h')}${read('有效厚度 d · mm',s.h>s.cover?n(s.h-s.cover):'—')}</div></section>`;
  if(!r.ok)html+=`<div class="wp-alert">${r.errors.map(esc).join('<br>')}</div>`;
  else html+=`<section class="wp-card"><h2>验算结果</h2><table class="wp-table"><tr><th>原表检查</th><th>Section A</th><th>Section B</th></tr>${[['自动桩数',r.a.n,r.b?.n],['单桩容许承载力 · kN',n(r.a.cap),r.b?n(r.b.cap??r.a.cap):null],['承载检查',r.a.capacity,r.b?.capacity],['Pile-cap 冲切 · N/mm²',n(r.a.v)+' / '+n(r.a.limit),r.b?n(r.b.v)+' / '+n(r.b.limit):null],['Pile-cap Check',r.a.punch,r.b?.punch],...(r.a.shaft?[['桩身直径检查',r.a.shaft,'—']]:[]),...(r.b?.steel?[['最小配筋','—',r.b.steel],['桩混凝土承压','—',r.b.concrete]]:[]),...(r.b?.rock?[['Rock / grout bond','—',r.b.rock],['Grout / steel bond','—',r.b.bond]]:[])].map(x=>`<tr>${x.map((v,i)=>`<${i?'td':'th'}>${esc(v??'原表无此项')}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</table>${s.pile==='bored'?`<p class="wp-sub">${r.a.n===4?'原表四桩布置：cap side = '+n(4*s.shaft+300)+' mm':'当前为 '+r.a.n+' 桩，原表仅提供四桩承台平面尺寸，布桩尺寸需另行确定。'}${r.a.n>=5?' 原表要求复核群桩效应。':''}</p>`:''}<p class="wp-sub">原表采用轴心竖向荷载和柱面冲切；A 按 1.6 × SLS，B 按 1.4 DL + 1.6 LL。</p></section>`;
  html+=`<section class="wp-card"><h2>加入抄</h2><div class="wp-row"><label><input data-fn="reportA" type="checkbox" ${s.reportA?'checked':''}> Section A</label><label><input data-fn="reportB" type="checkbox" ${s.reportB?'checked':''} ${['mini','driven'].includes(s.pile)?'disabled':''}> Section B</label></div>${['mini','driven'].includes(s.pile)?'<p class="wp-sub">原 Excel 未提供这类桩的 Section B 验算和抄。</p>':''}<p class="wp-sub">Excel 随 Section A/B 抄生成，可在对应抄页打开。</p></section></div>`;return html;
 }
 function change(e,host){const k=e.target.dataset.fn;if(!k)return false;const {p}=host.get();host.transact(()=>{const s=p.foundation??={};if(k==='loadFloor'){s.loadFloor=Number(e.target.value);s.column='';return;}s[k]=e.target.type==='checkbox'?e.target.checked:['column','pile','rock','section'].includes(k)?e.target.value:e.target.value===''?null:Number(e.target.value);});return true;}
 return {render,change};
})();
