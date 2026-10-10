const BeamLoadUI=(()=>{
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=x=>typeof x==='number'&&Number.isFinite(x)?x.toFixed(2):'',drafts=new Map();let active=null;
 const rounded=r=>r.auto&&r.spanAdjusted130?{...r}:BeamLoads.normalized(r);
 // Presentation only: stored distances remain measured from the original A end.
 function orientation(c){const a=c.rawA||c.a,z=c.rawZ||c.z,axis=Math.abs(z[0]-a[0])>=Math.abs(z[1]-a[1])?0:1,reverse=z[axis]<a[axis];return {reverse,start:reverse?'B':'A',end:reverse?'A':'B',startSide:axis?'上端':'左端',endSide:axis?'下端':'右端'};}
 // Read-only sectional equilibrium of the displayed ULS loads. Coordinates run
 // left-to-right (top-to-bottom in plan); positive M is sagging, dM/dx = V.
 // Do not integrate rounded reaction labels: that would leave a residual at B.
 function diagram207(L,rows,{reverse=false,cb=false,fixedEnd=null,service=false}={}){
  if(!Number.isFinite(L)||L<=0||cb&&!['a','z'].includes(fixedEnd))throw Error('跨度／固定端待確認');
  const points=[],lines=[],position=x=>reverse?L-x:x;
  for(const r of rows){const f=service?r:BeamLoads.factored(r),v=f.g+f.q;
   if(!Number.isFinite(v)||v<0)throw Error('荷載待確認');
   if(r.x!=null){if(!Number.isFinite(r.x)||r.x<0||r.x>L)throw Error('荷載位置待確認');points.push({x:position(r.x),v});}
   else{if(!Number.isFinite(r.start)||!Number.isFinite(r.end)||r.start<0||r.end>L+1e-8||r.end<=r.start)throw Error('荷載位置待確認');const a=position(r.start),b=position(Math.min(L,r.end));lines.push({a:Math.min(a,b),b:Math.max(a,b),v});}
  }
  const total=points.reduce((s,p)=>s+p.v,0)+lines.reduce((s,l)=>s+l.v*(l.b-l.a),0),moment=points.reduce((s,p)=>s+p.v*p.x,0)+lines.reduce((s,l)=>s+l.v*(l.b*l.b-l.a*l.a)/2,0),fixedLeft=cb&&((fixedEnd==='a')!==reverse),RA=cb?(fixedLeft?total:0):total-moment/L,RB=total-RA,M0=fixedLeft?-moment:0;
  const clean=v=>Math.abs(v)<1e-8?0:v;
  function at(x){x=Math.max(0,Math.min(L,x));const distributed=lines.reduce((s,l)=>s+l.v*Math.max(0,Math.min(x,l.b)-l.a),0),before=RA-distributed-points.reduce((s,p)=>s+(p.x<x?p.v:0),0),after=RA-distributed-points.reduce((s,p)=>s+(p.x<=x?p.v:0),0),M=M0+RA*x-points.reduce((s,p)=>s+p.v*Math.max(0,x-p.x),0)-lines.reduce((s,l)=>{const t=Math.max(0,Math.min(x,l.b)-l.a);return s+l.v*t*(x-l.a-t/2);},0);return {x,before:clean(before),after:clean(after),M:clean(M)};}
  const cuts=[...new Set([0,L,...points.map(p=>p.x),...lines.flatMap(l=>[l.a,l.b])])].sort((a,b)=>a-b),critical=[...cuts],segments=[];
  for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],mid=(a+b)/2,q=lines.filter(l=>l.a<mid&&l.b>mid).reduce((s,l)=>s+l.v,0);segments.push({a:at(a),b:at(b),mid:at(mid)});if(q>0){const x=a+at(a).after/q;if(x>a&&x<b)critical.push(x);}}
  const sections=critical.sort((a,b)=>a-b).map(at),shears=sections.flatMap(s=>[...(s.x>0?[{x:s.x,value:s.before}]:[]),...(s.x<L?[{x:s.x,value:s.after}]:[])]),moments=sections.map(s=>({x:s.x,value:s.M})),extreme=values=>({min:values.reduce((a,b)=>a.value<b.value?a:b),max:values.reduce((a,b)=>a.value>b.value?a:b)});
  return {L,RA,RB,M0,cb,fixedLeft,cuts,sections,segments,at,V:extreme(shears),M:extreme(moments)};
 }
 // HK Concrete COP 2013 (2020), Table 3.2, For general use, kN/mm².
 // Use the published table values, not the overall-building column or an equation approximation.
 const elastic210=Object.freeze({20:18.7,25:20.5,30:22.2,35:23.7,40:25.1,45:26.4,50:27.7,55:28.9,60:30,65:31.1,70:32.2,75:33.2,80:34.2,85:35.1,90:36,95:36.9,100:37.8});
 function material210(p,c){const cfg=Loading.settings(p),fcu=(c.displayKind||c.kind)==='TB'?cfg.tbFcu:cfg.fcu;return {fcu,E:elastic210[fcu]};}
 // Exact piecewise double integration of characteristic G+Q bending moments.
 // Geometry in m, loads in kN, E in kN/mm²; output displacement mm, positive down.
 // Constant gross rectangular EI: no cracking, creep, shrinkage or RC pass/fail inference.
 function deflection210(L,rows,{B,D,E,...support}={}){
  if(![B,D,E].every(v=>Number.isFinite(v)&&v>0))throw Error('請補齊梁 B／D 及 Table 3.2 混凝土等級');
  const d=diagram207(L,rows,{...support,service:true}),I=B*D**3/12,EI=E*1e6*I;
  if(!Number.isFinite(EI)||EI<=0)throw Error('梁剛度 EI 無效');
  let theta=0,y=0;
  const pieces=d.segments.map(s=>{const length=s.b.x-s.a.x,q=(s.a.after-s.b.before)/length,m=s.a.M,v=s.a.after;
   const part={a:s.a.x,b:s.b.x,at(t){return {theta:part.theta+m*t+v*t*t/2-q*t**3/6,y:part.y+part.theta*t+m*t*t/2+v*t**3/6-q*t**4/24};},theta,y};
   const end=part.at(length);theta=end.theta;y=end.y;return part;});
  const C1=d.cb?(d.fixedLeft?0:-theta):-y/L,C2=d.cb&&!d.fixedLeft?-y-C1*L:0;
  function at(x){x=Math.max(0,Math.min(L,x));const p=pieces.find(s=>x<=s.b)||pieces.at(-1),r=p.at(x-p.a),delta=-(r.y+C1*x+C2)/EI*1000,slope=-(r.theta+C1)/EI;
   return {x,delta:(d.cb?x===(d.fixedLeft?0:L):x===0||x===L)?0:delta,slope:d.cb&&x===(d.fixedLeft?0:L)?0:slope};}
  // Non-negative downward loads on these two models give a single interior maximum
  // for simple spans; cantilevers reach their maximum at the free end.
  const candidates=[at(0),at(L)];
  if(!d.cb&&at(0).slope*at(L).slope<0){let lo=0,hi=L;for(let i=0;i<70;i++){const mid=(lo+hi)/2;if(at(mid).slope>0)lo=mid;else hi=mid;}candidates.push(at((lo+hi)/2));}
  const peak=candidates.reduce((a,b)=>Math.abs(a.delta)>=Math.abs(b.delta)?a:b),xs=[...new Set([...d.cuts,...candidates.map(s=>s.x),...Array.from({length:161},(_,i)=>L*i/160)])].sort((a,b)=>a-b),samples=xs.map(at);
  if(samples.some(s=>!Number.isFinite(s.delta)||!Number.isFinite(s.slope)))throw Error('撓度超出可計算範圍');
  return {L,E,I,EI,B,D,peak,samples,at};
 }
 // Summary companion only: consume the completed audit's saved loading snapshot.
 // loading.lines/points use root-based coordinates for right-root CB; restore raw A
 // before applying the same screen orientation and solver as the member graph.
 // User-approved Summary-only short-term criterion; never changes report/RC results.
 // Independent axes for Summary filters; unknown inputs are never a pass/fail.
 function deflectionResult214(d){return d?.state==='available'&&Number.isFinite(d.max)&&d.max>=0&&Number.isFinite(d.L)&&d.L>0?{limit:d.L*1000/250,pass:d.max<d.L*1000/250}:null;}
 function beamResult214(i){
  if(!i.checks205||!['MB','SB','TB','CB'].includes(i.kind))return null;
  const classify=s=>/^OK(?:$|[ (])/.test(s)?'P':s==='NOT OK'?'F':'U',v=deflectionResult214(i.deflection211),a=classify(i.checks205.a.status),d=v?(v.pass?'P':'F'):'U',b=classify(i.checks205.b.status),failed=d==='F'||b==='F';
  return {a,d,b,failed,key:[a,d,b].includes('U')?(failed?'pending-fail':'pending'):a+d+b};
 }
 function auditStatus214(i){const v=beamResult214(i);if(!v)return i.status;if(v.failed)return 'NOT OK';if(v.d==='U'||v.b==='U')return 'INPUT REQUIRED';return auditStatus212(i);}
 const combinations214=Object.freeze(['PPP','PPF','PFP','PFF','FPP','FPF','FFP','FFF','pending-fail','pending','other']);
 function defaultCombinations214(){return combinations214.filter(k=>k==='pending-fail'||k.length===3&&k!=='PFP'&&(k[1]==='F'||k[2]==='F'));}
 function combinationKey214(i){return beamResult214(i)?.key||'other';}
 function criterion212(i){
  const a=i.checks205?.a,d=i.deflection211;
  if(!['MB','SB','TB','CB'].includes(i.kind)||!['NOT OK','CALC. REQUIRED'].includes(a?.status)||d?.state!=='available'||!Number.isFinite(d.max)||d.max<0||!Number.isFinite(d.L)||d.L<=0)return null;
  const limit=d.L*1000/250;return {limit,pass:d.max<limit};
 }
 function auditStatus212(i){const v=criterion212(i);return v?.pass&&/^OK(?:$|[ (])/.test(i.checks205.b.status)?'OK (SHORT-TERM)':i.status;}
 function summary211(p,row){
  if(!['MB','SB','TB','CB'].includes(row.kind))return null;
  const c=row.member,l=row.loading;
  try{
   if(!row.actions||!l)throw Error((row.loadErrors||[]).join('；')||'荷載／支承待確認');
   const cb=l.support==='Cantilever',fixedEnd=l.fixedEnd,o=orientation(c),{fcu,E}=material210(p,c),flip=cb&&fixedEnd==='z';
   const rows=[{start:0,end:l.L,g:l.udlDead,q:l.udlLive},...(l.lines||[]).map(r=>flip?{...r,start:l.L-r.end,end:l.L-r.start}:r),...(l.points||[]).map(r=>flip?{...r,x:l.L-r.x}:r)];
   const v=deflection210(l.L,rows,{B:c.b,D:c.d,E,cb,fixedEnd,reverse:o.reverse});
   return {state:'available',max:Math.abs(v.peak.delta),x:v.peak.x,L:v.L,B:v.B,D:v.D,I:v.I,E,fcu,start:o.start,startSide:o.startSide,model:cb?'固定端懸臂':'簡支梁',fixedEnd:cb?(fixedEnd==='a'?'A':'B'):null,warnings:[...(row.loadErrors||[])]};
  }catch(e){return {state:'pending',reason:e.message};}
 }
 function deflectionPlot210(d,rows,cb,fe,o,w){
  delete d.deflection210;const c=d.h.selected.member,{fcu,E}=material210(d.h.p,c);let v;
  try{v=deflection210(d.L,rows,{B:c.b,D:c.d,E,cb,fixedEnd:fe,reverse:o.reverse});}catch(e){return '<p class="bl-note" data-deflection-error210 role="status">撓度圖待確認：'+esc(e.message)+'</p>';}
  d.deflection210=v;const a=32,b=w-32,base=56,scale=Math.abs(v.peak.delta)>0?102/Math.abs(v.peak.delta):0,xx=x=>a+(b-a)*x/v.L,yy=delta=>base+delta*scale,path=v.samples.map((s,i)=>(i?'L':'M')+xx(s.x)+','+yy(s.delta)).join(' ');
  return '<section class="bl-diagram207" data-kind="D"><h4>撓度圖 · DL＋LL <small>mm</small></h4><p class="bl-note">短期未開裂彈性撓度 · 雙重積分<br>C'+esc(fcu)+' · E = '+E.toFixed(1)+' kN/mm²（'+(E*1000)+' N/mm²）<br>HK Concrete COP Table 3.2 · For general use<br>B × D = '+precise207(c.b*1000)+' × '+precise207(c.d*1000)+' mm<br>I = BD³/12 = '+v.I.toExponential(6)+' m⁴<br>'+(cb?'固定端懸臂':'簡支梁')+' · 向下為正；圖形變形已放大。</p><svg role="img" aria-label="短期彈性撓度圖，單位 mm" viewBox="0 0 '+w+' 204" data-plot207="D" data-left="'+a+'" data-right="'+b+'" data-scale="'+scale+'" data-base="'+base+'"><title>撓度圖；最大絕對撓度 '+precise207(Math.abs(v.peak.delta))+' mm</title><path d="M'+a+','+base+'H'+b+'" stroke="#7d919e" stroke-dasharray="4 3"/><path d="'+path+' L'+b+','+base+' L'+a+','+base+' Z" fill="#e1f1e7"/><path d="'+path+'" stroke="#28714e" stroke-width="2" fill="none"/><circle cx="'+xx(v.peak.x)+'" cy="'+yy(v.peak.delta)+'" r="3" fill="#28714e"/><path class="bl-cursor207" stroke="#c97724" stroke-dasharray="4 3"/><circle class="bl-dot207" r="4" fill="#c97724"/><text x="8" y="60" font-size="11" fill="#637d8b">0</text><text x="'+a+'" y="192" font-size="12" fill="#244558">'+o.start+' · 0 m</text><text x="'+b+'" y="192" text-anchor="end" font-size="12" fill="#244558">'+o.end+' · '+fmt(v.L)+' m</text></svg><p class="bl-extrema207">最大 |δ| = '+precise207(Math.abs(v.peak.delta))+' mm · x = '+precise207(v.peak.x)+' m</p><p class="bl-note">未計開裂、徐變、收縮或支承位移；不取代 Section B 撓度驗算。</p></section>';
 }
 function diagrams207(d,el,rows,reaction,cb,fe,o){
  const host=el.querySelector('.bl-diagrams207');if(!host)return;
  delete d.diagram207;delete d.deflection210;
  if(!reaction){host.innerHTML='<p class="bl-note" role="status">剪力／彎矩圖待確認：請先完成有效荷載、跨度及支承。</p>';return;}
  let data;try{data=diagram207(d.L,rows,{reverse:o.reverse,cb,fixedEnd:fe});}catch(e){host.innerHTML='<p class="bl-note" role="status">'+esc(e.message)+'</p>';return;}
  d.diagram207=data;const w=Math.max(260,el.querySelector('.bl-plot').clientWidth),a=32,b=w-32,xx=x=>a+(b-a)*x/data.L,model=cb?(data.fixedLeft?o.start:o.end)+' 端固定懸臂':'簡支梁';
  let html='<h4>剪力及彎矩圖 · ULS</h4><p class="bl-note">目前荷載的設計用值：|M| = '+precise207(reaction.M)+' kN·m；V = '+precise207(reaction.V)+' kN。</p><p class="bl-note">模型：'+model+' · 1.4 DL + 1.6 LL<br>x 從'+o.start+'（'+o.startSide+'）量起，與上圖同方向。<br>V 正值畫在基線上方；M 正值為下緣受拉（Sagging），畫在基線下方。</p>';
  for(const kind of ['V','M']){const shear=kind==='V',title=shear?'剪力圖 SFD':'彎矩圖 BMD',unit=shear?'kN':'kN·m',ext=data[kind],peak=Math.max(Math.abs(ext.min.value),Math.abs(ext.max.value)),scale=peak?62/peak:0,base=100,yy=v=>base+(shear?-1:1)*v*scale;
   let path='M'+xx(0)+','+yy(shear?data.at(0).after:data.at(0).M);
   for(const s of data.segments){if(shear)path+=' L'+xx(s.b.x)+','+yy(s.b.before)+' L'+xx(s.b.x)+','+yy(s.b.x===data.L?s.b.before:s.b.after);else path+=' Q'+xx(s.mid.x)+','+yy(2*s.mid.M-(s.a.M+s.b.M)/2)+' '+xx(s.b.x)+','+yy(s.b.M);}
   html+='<section class="bl-diagram207" data-kind="'+kind+'"><h4>'+title+' <small>'+unit+'</small></h4><svg role="img" aria-label="'+title+'，單位 '+unit+'" viewBox="0 0 '+w+' 204" data-plot207="'+kind+'" data-left="'+a+'" data-right="'+b+'" data-scale="'+scale+'" data-base="'+base+'"><title>'+title+'；最小 '+precise207(ext.min.value)+'，最大 '+precise207(ext.max.value)+' '+unit+'</title>';
   for(const x of data.cuts)html+='<path d="M'+xx(x)+',26V174" stroke="#e0e7eb" stroke-dasharray="3 4"/>';
   html+='<path d="'+path+' L'+xx(data.L)+','+base+' L'+xx(0)+','+base+' Z" fill="'+(shear?'#dceff4':'#ede5f7')+'"/><path d="M'+a+','+base+'H'+b+'" stroke="#7d919e"/><path d="'+path+'" stroke="'+(shear?'#176b80':'#78529d')+'" stroke-width="2" fill="none"/>';
   for(const e of [ext.min,ext.max])html+='<circle cx="'+xx(e.x)+'" cy="'+yy(e.value)+'" r="3" fill="'+(shear?'#176b80':'#78529d')+'"><title>'+kind+' = '+precise207(e.value)+' '+unit+'；x = '+fmt(e.x)+' m</title></circle>';
   html+='<path class="bl-cursor207" stroke="#c97724" stroke-dasharray="4 3"/><circle class="bl-dot207" r="4" fill="#c97724"/><text x="8" y="104" font-size="11" fill="#637d8b">0</text><text x="'+a+'" y="192" font-size="12" fill="#244558">'+o.start+' · 0 m</text><text x="'+b+'" y="192" text-anchor="end" font-size="12" fill="#244558">'+o.end+' · '+fmt(data.L)+' m</text></svg><p class="bl-extrema207">最小 '+precise207(ext.min.value)+' '+unit+' · x = '+fmt(ext.min.x)+' m<br>最大 '+precise207(ext.max.value)+' '+unit+' · x = '+fmt(ext.max.x)+' m</p></section>';
  }
  html+=deflectionPlot210(d,rows,cb,fe,o,w);
  html+='<div class="bl-station207"><label class="bl-station-number209">截面位置 x · m<input type="number" min="0" max="'+data.L+'" step="any" data-station-number209 aria-label="截面位置 x · m" aria-describedby="bl-station-error209"></label><small>範圍 0–'+data.L+' m</small><input type="range" min="0" max="'+data.L+'" step="any" data-station207 aria-label="剪力彎矩截面位置"><small id="bl-station-error209" class="bl-error" data-station-error209 role="status" hidden></small></div><output class="bl-readout207" aria-live="polite"></output><p class="bl-note">輸入 x、移動圖上游標或滑桿查看截面；集中力處顯示左右兩側剪力。端點讀值為梁內側。曲線保留計算精度；荷載、反力及彎矩不取整；畫面截示三位小數，有餘數以「…」表示。跟隨目前輸入預覽，保存後生效。</p>';
  host.innerHTML=html;inspect207(d,el,d.station207??0,false,true);
 }
 function inspect207(d,el,x,snapToCuts=false,keepDraft=false){const data=d.diagram207;if(!data||!Number.isFinite(x))return;const snap=snapToCuts?data.cuts.find(a=>Math.abs(a-x)<data.L/250):null;x=snap??Math.max(0,Math.min(data.L,x));d.station207=x;const s=data.at(x),val=x===data.L?s.before:s.after,host=el.querySelector('.bl-diagrams207');host.querySelector('[data-station207]').value=x;if(!keepDraft){delete d.stationDraft209;delete d.stationError209;}stationField209(d,host,x);host.querySelector('output').textContent='x = '+precise207(x)+' m · '+(x>0&&x<data.L&&Math.abs(s.before-s.after)>1e-8?'V 左 = '+precise207(s.before)+' / 右 = '+precise207(s.after):'V = '+precise207(val))+' kN · M = '+precise207(s.M)+' kN·m（ULS）'+(d.deflection210?' · δ = '+precise207(d.deflection210.at(x).delta)+' mm（DL＋LL）':'');
  for(const svg of host.querySelectorAll('[data-plot207]')){const shear=svg.dataset.plot207==='V',a=Number(svg.dataset.left),b=Number(svg.dataset.right),xx=a+(b-a)*x/data.L,yy=Number(svg.dataset.base)+(shear?-1:1)*(svg.dataset.plot207==='D'?d.deflection210.at(x).delta:shear?val:s.M)*Number(svg.dataset.scale);svg.querySelector('.bl-cursor207').setAttribute('d','M'+xx+',26V174');svg.querySelector('.bl-dot207').setAttribute('cx',xx);svg.querySelector('.bl-dot207').setAttribute('cy',yy);}
 }
 function stationField209(d,host,x){const input=host.querySelector('[data-station-number209]'),error=host.querySelector('[data-station-error209]');const value=d.stationDraft209??String(x);if(input.value!==value)input.value=value;input.setAttribute('aria-invalid',String(!!d.stationError209));error.textContent=d.stationError209||'';error.hidden=!d.stationError209;}
 function displayRows(rows){const out=[];for(const row of rows){let r={...row};if(r.surface126&&r.x==null){let index;do{index=out.findIndex(q=>q.surface126&&q.x==null&&q.auto===r.auto&&q.label===r.label&&['g','q','sw','dl','sdl','ug183','uq183'].every(k=>q[k]===r[k]||Number.isFinite(q[k])&&Number.isFinite(r[k])&&Math.abs(q[k]-r[k])<1e-9)&&(Math.abs(q.end-r.start)<1e-8||Math.abs(q.start-r.end)<1e-8));if(index>=0){const q=out.splice(index,1)[0];r={...r,start:Math.min(q.start,r.start),end:Math.max(q.end,r.end),merged129:(q.merged129||1)+(r.merged129||1)};}}while(index>=0);}out.push(r);}return out;}
 function entry(h){
  const key=h.floor+'|'+h.selected.token,L=Loading.beamSpan(h.selected.member,h.data).value,stamp=JSON.stringify(BeamLoads.draft(h.data,0));let d=drafts.get(key);
  if(!d||d.stamp!==stamp){d={key,stamp,L,value:BeamLoads.draft(h.data,L)};drafts.set(key,d);}
  else if(d.L!==L){const dirty=JSON.stringify(d.value)!==JSON.stringify(BeamLoads.draft(h.data,d.L));if(!dirty)d.value=BeamLoads.draft(h.data,L);d.L=L;delete d.cached;}
  d.h=h;return d;
 }
 const precise207=BeamLoads.display208;
 const css=`.bl-diagrams207{margin:18px 0;border-top:1px solid #dce5e9;padding-top:4px}.bl-diagram207{border:1px solid #dce5e9;border-radius:7px;margin:12px 0;padding:10px}.bl-diagram207 h4{margin:0!important}.bl-diagram207 svg{display:block;width:100%;cursor:crosshair}.bl-extrema207,.bl-readout207{font-size:12px;line-height:1.8;overflow-wrap:anywhere}.bl-extrema207{margin:0}.bl-readout207{display:block;background:#edf5f7;padding:10px;border-radius:5px}.bl-station207{display:block}.bl-station-number209{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.beam-load-editor .bl-station-number209 input{width:130px;max-width:100%;margin:0}.bl-station207>small{display:block;margin-top:6px}.bl-station-number209 input[aria-invalid=true]{border-color:#a73a26}.bl-diagrams207 input[type=range]{width:100%;margin:10px 0}.bl-diagrams207 small{font-weight:normal;color:#637d8b}.beam-load-editor{container-type:inline-size;margin:12px 0}.beam-load-editor .bl-modes{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.beam-load-editor .bl-modes button{padding:8px 10px;font-size:14px}.beam-load-editor button[aria-pressed=true]{background:#176b80;color:#fff}.beam-load-editor .bl-grid{display:grid;grid-template-columns:1.3fr 1.35fr 1fr 1fr .9fr .9fr 32px;gap:6px;align-items:start;border-bottom:1px solid #d8e3e8;padding:10px 0}.beam-load-editor label{font-size:12px;min-width:0}.beam-load-editor input,.beam-load-editor select{box-sizing:border-box;width:100%;min-width:0;padding:7px 4px;font-size:14px;margin-top:4px}.beam-load-editor .bl-grid button{padding:6px;margin-top:20px;min-width:28px}.beam-load-editor .bl-note{color:#637d8b;font-size:12px}.beam-load-editor .bl-self{display:flex;gap:7px;align-items:center;margin:12px 0;font-size:13px}.beam-load-editor .bl-self input{width:18px;margin:0}.beam-load-editor .bl-plot{display:block;width:100%}.beam-load-editor .bl-title{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:16px}.beam-load-editor .bl-title button{padding:6px;font-size:12px}.beam-load-editor .bl-error{color:#a73a26;font-size:13px}.beam-load-editor [hidden]{display:none!important}@container(max-width:600px){.beam-load-editor .bl-grid{grid-template-columns:1fr 1fr}.beam-load-editor input,.beam-load-editor select{font-size:16px;min-height:40px}.beam-load-editor .bl-grid button{margin:0;min-height:40px}}`;
 function field(r,i,k,label){return '<label>'+label+'<input data-bl-field="'+k+'" aria-label="第 '+(i+1)+' 项 '+label+'" '+(k==='name'?'type="text" maxlength="80"':'type="number" step="any" min="0"')+' value="'+esc(k==='name'?r[k]:(r[k]??''))+'"></label>';}
 function table(d){return d.value.rows.map((r,i)=>'<div class="bl-grid" data-bl-row="'+i+'">'+field(r,i,'name','名称')+'<label>类型<select data-bl-field="type" aria-label="第 '+(i+1)+' 项类型"><option value="point" '+(r.type==='point'?'selected':'')+'>集中 · kN</option><option value="line" '+(r.type==='line'?'selected':'')+'>线荷载 · kN/m</option></select></label>'+field(r,i,'dl','DL')+field(r,i,'ll','LL')+field(r,i,'a',r.type==='point'?'位置 m':'起点 m')+(r.type==='line'?field(r,i,'b','终点 m'):'<span></span>')+'<button type="button" data-bl-delete="'+i+'" aria-label="删除第 '+(i+1)+' 项">×</button></div>').join('');}
 function body(d){const v=d.value,manual=v.mode==='manual';return '<h4>荷载来源</h4><div class="bl-modes">'+[['auto','自动传荷'],['extra','自动＋补充'],['manual','手动荷载']].map(([k,t])=>'<button type="button" data-bl-mode="'+k+'" aria-pressed="'+(k===v.mode)+'">'+t+'</button>').join('')+'</div><p class="bl-note">'+({auto:'自动接收板、梁及柱传荷。手动表已隐藏；保存后生效。',extra:'下表只填额外荷载，与自动传荷叠加；保存后生效。',manual:'下表替代自动传荷，请包含所需的板、梁、柱及墙荷载。'})[v.mode]+'</p><div '+(v.mode==='auto'?'hidden':'')+'><h4>'+(manual?'手动荷载':'补充荷载')+'</h4><div class="bl-rows">'+table(d)+'</div><button type="button" data-bl-add>＋ 添加荷载</button><p class="bl-note">输入位置从 A 端量起，范围 0–'+fmt(d.L)+' m。图按平面左→右／上→下排列；输入距离仍从 A 端量起。</p></div><label class="bl-self"><input type="checkbox" data-bl-self '+((!manual||v.self)?'checked':'')+' '+(!manual?'disabled':'')+'>自动计入梁自重'+(manual?'（全截面）':'')+'</label><p class="bl-note">'+(manual?(v.self?'手动 DL 不含梁自重。':'手动 DL 须已包含梁自重。'):(Loading.beamSpan(d.h.selected.member,d.h.data).manual?'板反力按各板支承中心線區段施加，區段隨指定跨度換算；其他既有荷載按跨度換算保留合力。梁自重按完整截面及 Span 計算。':'梁按完整截面計自重，不扣板層；各板反力按自身支承中心線區段施加，梁寬不形成空隙。DL／LL 及傳荷保留計算精度。'))+'</p><div class="bl-error" role="alert"></div><div class="bl-title"><h4>荷載及反力圖 · Factored (ULS)</h4>'+(!manual?'<button type="button" data-bl-calc>更新自动荷载</button>':'')+'</div><p class="bl-note">'+(manual?'蓝色：手动输入；灰色：梁自重。':'灰色：自动传荷；蓝色：手动补充。自动图按 Section B 口径。')+'</p><p class="bl-note">自重按 1.4 × 24.5 × B × D 計算，計算保留精度。圖示及反力分項均為 Factored：DL × 1.4／LL × 1.6；DL／LL、反力及中間傳荷均不取整。畫面截示三位小數，有餘數以「…」表示；不影響計算。手動輸入及明細保留未加係數值。</p><p class="bl-direction bl-note"></p><svg class="bl-plot" role="img" aria-label="梁荷载位置示意图"></svg><section class="bl-diagrams207" aria-label="剪力及彎矩"></section><div class="bl-auto-note bl-note"></div><details><summary>自動荷載明細 · 未加係數 DL／LL</summary><div class="bl-auto-list bl-note"></div></details>';}
 // Design-only warnings must not suppress already-resolved vertical reactions.
 function cachedRow(p,row){return {project:JSON.stringify(p),loading:row.loading,errors:row.actions?[]:[...(row.loadErrors||[])],designWarnings:row.actions?[...(row.loadErrors||[])]:[]};}
 function render(h,rr){const d=entry(h);active=d;if(rr?.loading&&rr.actions&&rr.input?.mode!=='manual')d.cached=cachedRow(h.p,rr);setTimeout(()=>{mount(d);if(d.value.mode!=='manual'&&d.cached?.project!==JSON.stringify(h.p))calculate(d);},0);return '<style>'+css+'</style><section class="beam-load-editor" data-bl-key="'+esc(d.key)+'">'+body(d)+'</section>';}
 function root(d){if(active!==d||drafts.get(d.key)!==d)return null;const el=document.querySelector('.beam-load-editor');return el?.dataset.blKey===d.key?el:null;}
 function paint(d){const el=root(d);if(!el)return;el.innerHTML=body(d);draw(d);}
 function draw(d){const el=root(d);if(!el)return;const svg=el.querySelector('svg'),w=Math.max(260,svg.clientWidth),left=28,right=w-28,orientation129=orientation(d.h.selected.member),station=n=>orientation129.reverse?d.L-n:n,x=n=>left+(right-left)*station(n)/d.L,mode=d.value.mode;let list=[],notes=[],parts=[],y=18;const cached=d.cached?.project===JSON.stringify(d.h.p)?d.cached.loading:null;
  if(mode!=='manual'&&cached){const l=cached;list=[...(l.automaticLines||[]),...(l.automaticPoints||[])].map(r=>({...r,auto:true}));if(l.sw)list.unshift({...Loading.beamSelfWeight(d.h.selected.member,d.L)[0],g:l.sw,label:'梁自重（全截面）',auto:true});}
  if(mode!=='auto')list.push(...d.value.rows.filter(r=>!BeamLoads.errors([r],d.L).length).map(r=>r.type==='point'?{x:r.a,g:r.dl,q:r.ll,label:r.name}:{start:r.a,end:r.b,g:r.dl,q:r.ll,label:r.name}));
  if(mode==='manual'&&d.value.self)list.push({...Loading.beamSelfWeight(d.h.selected.member,d.L)[0],label:'梁自重（全截面）',auto:true});
  const visible=displayRows(list),surface=visible.filter(r=>r.surface126).sort((a,b)=>Math.min(station(a.start),station(a.end))-Math.min(station(b.start),station(b.end))),shown=visible.map(r=>r.surface126?surface.shift():r).map(rounded);list=list.map(rounded);
  el.querySelector('.bl-direction').textContent='平面'+orientation129.startSide+' → '+orientation129.endSide+' · 距离从'+orientation129.startSide+'量起';
  svg.dataset.startEnd=orientation129.start;svg.dataset.diagramLength=String(d.L);
  for(const r of list)if(r.auto)notes.push(esc(r.label||'荷载')+' · '+precise207(r.g)+' / '+precise207(r.q)+' '+(r.x!=null?'kN':'kN/m')+' · 距 A '+(r.x!=null?fmt(r.x):fmt(r.start)+'–'+fmt(r.end))+' m');
  const text=(xx,yy,s,anchor='start')=>'<text x="'+xx+'" y="'+yy+'" text-anchor="'+anchor+'" font-size="12" fill="#244558">'+esc(s)+'</text>',arrow=(xx,yy,c)=>'<path d="M'+xx+','+yy+'v20m-4,-6l4,6l4,-6" stroke="'+c+'" stroke-width="1.6" fill="none"/>';
  const measure=document.createElement('canvas').getContext('2d');measure.font='12px '+getComputedStyle(svg).fontFamily;
  const wrapText=(value,width)=>{const lines=[];let line='';for(const token of value.match(/\d+(?:\.\d+)?\s*(?:kN\/m|kN|mm|m)\b|[A-Za-z0-9_.]+|[^\s]|\s+/g)||[]){if(line&&measure.measureText(line+token).width>width){lines.push(line.trim());line='';}line+=token;}if(line)lines.push(line);return lines;};
  const guideTop=y;
  for(const r of shown){const point=r.x!=null,color=r.auto?'#829fa9':'#176b80',name=r.surface126?'梁頂 SDL / LL':String(r.label||'荷载'),u=BeamLoads.factored(r),unit=point?'kN':'kN/m',loadText='Factored: '+precise207(u.g)+' / '+precise207(u.q)+' '+unit,lines=[...wrapText(name,right-left),...(r.selfWeight185?wrapText('1.4 × 24.5 × '+d.h.selected.member.b+' × '+d.h.selected.member.d+' = '+precise207(u.g)+' kN/m',right-left):[]),...(measure.measureText(loadText).width<=right-left?[loadText]:['Factored DL: '+precise207(u.g)+' '+unit,'Factored LL: '+precise207(u.q)+' '+unit])];parts.push('<g class="bl-load129" data-start="'+(point?r.x:r.start)+'" data-end="'+(point?r.x:r.end)+'" data-merged="'+(r.merged129||1)+'">');for(const line of lines){parts.push(text(left,y,line));y+=17;}
   const a=point?r.x:r.start,b=point?r.x:r.end,lo=Math.min(station(a),station(b)),hi=Math.max(station(a),station(b));
   if(point)parts.push(arrow(x(a),y,color));else{parts.push('<path class="bl-length129" d="M'+x(a)+','+y+'H'+x(b)+'" stroke="'+color+'"/>');const n=Math.max(1,Math.floor(Math.abs(x(b)-x(a))/28));for(let i=0;i<=n;i++)parts.push(arrow(x(a+(b-a)*i/n),y,color));}
   const labelX=point?(x(a)+x(b))/2:Math.max(left+48,Math.min(right-48,(x(a)+x(b))/2)),anchor=lo<.1&&point?'start':hi>d.L-.1&&point?'end':'middle';parts.push(text(labelX,y+35,point?fmt(lo)+' m':fmt(lo)+'–'+fmt(hi)+' m',anchor));parts.push('</g>');y+=52;
  }
  parts.unshift('<path d="M'+left+','+guideTop+'V'+y+'M'+right+','+guideTop+'V'+y+'" stroke="#dce5e9" stroke-dasharray="3 5" fill="none"/>');
  const c=d.h.selected.member,cb=c.displayKind==='CB',fixed=document.getElementById('ex-fixedEnd')?.value||d.h.data.fixedEnd,cbRoot=cb?Loading.cbRoot(d.h.p,d.h.result,d.h.floor,c):null,fe=['a','z'].includes(fixed)?fixed:cbRoot?.fixedEnd;
  parts.push('<path d="M'+left+','+y+'H'+right+'" stroke="#244558" stroke-width="4"/>');if(cb){if(fe)parts.push('<path d="M'+x(fe==='z'?d.L:0)+','+(y-16)+'v32" stroke="#244558" stroke-width="5"/>');}else for(const xx of [left,right])parts.push('<path d="M'+xx+','+(y+2)+'l-7,12h14z" stroke="#244558" fill="none"/>');let reaction=null;const error=mode==='manual'?BeamLoads.errors(d.value.rows,d.L):(!cached?['自动荷载待计算']:[...(d.cached.errors||[])]);
  if(mode==='manual'&&!d.value.rows.length)error.push('手動模式請至少填寫一項荷載');
  const spanError=Loading.beamSpan(d.h.selected.member,d.h.data).error;if(spanError)error.push(spanError);if(mode==='extra')error.push(...BeamLoads.errors(d.value.rows,d.L));
  if(mode==='manual'&&Loading.supportSummary(d.h.p,d.h.result,d.h.floor,c).some(s=>/未确认|待确认|失效|未找到/.test(s.text)))error.push('实际支承未完整');
  if(!error.length&&(!cb||fe))try{const points=list.filter(r=>r.x!=null).map(r=>({...r,x:cb&&fe==='z'?d.L-r.x:r.x})),lines=list.filter(r=>r.x==null).map(r=>cb&&fe==='z'?{...r,start:d.L-r.end,end:d.L-r.start}:r);reaction=Loading.actions(d.L,0,0,points,cb,lines,{});}catch(e){error.push(e.message);}
  const beamY=y;let reactionBottom=beamY+68;y+=58;if(reaction){const ends={A:cb&&fe==='z'?'right':'left',B:cb&&fe==='z'?'left':'right'};
   for(const end of [orientation129.start,orientation129.end]){const key=ends[end],value=reaction[key],xx=x(end==='A'?0:d.L),anchor=end===orientation129.start?'start':'end',labelX=xx+(anchor==='start'?14:-14),isFixed=!cb||(end==='A'?fe==='a':fe==='z');
    if(!isFixed)continue;const up=value>=0,tip=up?beamY+17:beamY+41,tail=up?beamY+41:beamY+17;
    parts.push('<g class="bl-reaction180" data-end="'+end+'" data-value="'+value+'" data-direction="'+(up?'up':'down')+'"><path d="M'+xx+','+tail+'V'+tip+'m-5,'+(up?7:-7)+'l5,'+(up?-7:7)+'l5,'+(up?7:-7)+'" stroke="#176b80" stroke-width="2.4" fill="none"/>'+(()=>{let yy=beamY+33,out='';for(const label of ['R'+end+' = '+precise207(value)+' kN','DL = '+precise207(reaction.factoredDead[key])+' kN','LL = '+precise207(reaction.factoredLive[key])+' kN'])for(const line of wrapText(label,Math.max(65,(right-left)/2-18))){out+=text(labelX,yy,line,anchor);yy+=17;}reactionBottom=Math.max(reactionBottom,yy);return out;})()+'</g>');
   }
  }else{parts.push(text(left+14,beamY+33,'反力待確認：荷載／支承未完整'));}
  // Keep each support beside its reaction. Wrap within its own half of the diagram.
  const supports=Loading.supportSummary(d.h.p,d.h.result,d.h.floor,c),labelWidth=Math.max(60,(right-left)/2-24),wrap=value=>wrapText(value,labelWidth);
  const captionTop=reaction?reactionBottom+18:beamY+55;let captionBottom=captionTop;
  for(const end of [orientation129.start,orientation129.end]){const first=end===orientation129.start,xx=(first?left+14:right-14),anchor=first?'start':'end',support=supports.find(s=>s.end===end),lines=[...wrap('支承：'+(support?.text||'待確認')),...wrap(end+' · '+(first?orientation129.startSide:orientation129.endSide)+' · '+fmt(first?0:d.L)+' m')];let yy=captionTop;parts.push('<g class="bl-support181" data-end="'+end+'">');for(const line of lines){parts.push(text(xx,yy,line,anchor));yy+=17;}parts.push('</g>');captionBottom=Math.max(captionBottom,yy);}
  y=captionBottom+8;parts.push(text((left+right)/2,y,'ULS: 1.4 DL + 1.6 LL','middle'));y+=24;
  if(reaction&&cb){for(const line of ['固定端 |M| = '+precise207(reaction.M)+' kN·m (ULS)','DL = '+precise207(reaction.factoredDead.M)+' kN·m','LL = '+precise207(reaction.factoredLive.M)+' kN·m']){for(const wrapped of wrapText(line,right-left)){parts.push(text(left,y,wrapped));y+=18;}}y+=4;}
  svg.setAttribute('viewBox','0 0 '+w+' '+(y+12));svg.innerHTML=parts.join('');el.querySelector('.bl-auto-note').textContent=mode!=='manual'&&!cached?'自动荷载尚未更新，图中仅显示手动输入。':mode!=='manual'&&d.cached?.errors?.length?'已识别的荷载如下；传荷／支承待补：'+d.cached.errors.join('；'):mode!=='manual'&&d.cached?.designWarnings?.length?'竖向反力已计算；构件验算待补：'+d.cached.designWarnings.join('；'):cb&&!fe?'CB 固定端尚未确认。':'';el.querySelector('.bl-auto-list').innerHTML=(notes.length?notes.join('<br>'):'—');el.querySelector('details').hidden=mode==='manual';el.querySelector('.bl-error').textContent=mode==='auto'?'':BeamLoads.errors(d.value.rows,d.L).join('；');diagrams207(d,el,list,reaction,cb,fe,orientation129);
 }
 function calculate(d){if(!root(d)||d.value.mode==='manual')return;const button=root(d).querySelector('[data-bl-calc]');if(button){button.disabled=true;button.textContent='计算中…';}setTimeout(()=>{if(!root(d))return;try{const p=Engine.clone(d.h.p),ex=Loading.init(p);ex.selected={};const o=ex.members[d.key]??={};Object.assign(o,{mode:'auto',beamLoadMode:'auto',beamLoads:[],points:[],extraDead:0});const row=Loading.run(p,d.h.result,'B').rows.find(r=>r.floor+'|'+r.token===d.key);if(!row?.loading)throw Error('荷载或支承待补');d.cached=cachedRow(d.h.p,row);paint(d);}catch(e){if(root(d)){root(d).querySelector('.bl-error').textContent=e.message;if(button){button.disabled=false;button.textContent='更新自动荷载';}}}},20);}
 let observer=null;
 function mount(d){const el=root(d);if(!el)return;observer?.disconnect();let width=el.clientWidth;observer=new ResizeObserver(()=>{if(el.clientWidth!==width){width=el.clientWidth;draw(d);}});observer.observe(el);draw(d);}
 function read(h){const d=entry(h);return BeamLoads.pack(d.value,d.L);}
 document.addEventListener('input',e=>{const el=e.target;if(!el.closest('.beam-load-editor')||!active)return;if(el.hasAttribute('data-station-number209')){const data=active.diagram207;if(!data)return;const x=el.valueAsNumber;active.stationDraft209=el.value;active.stationError209=!Number.isFinite(x)||x<0||x>data.L?'請輸入 0–'+data.L+' m 之間的位置。':'';if(active.stationError209)stationField209(active,el.closest('.bl-diagrams207'),active.station207??0);else inspect207(active,el.closest('.beam-load-editor'),x,false,true);return;}if(el.hasAttribute('data-station207')){inspect207(active,el.closest('.beam-load-editor'),Number(el.value));return;}const k=el.dataset.blField;if(!k||k==='type')return;const r=active.value.rows[Number(el.closest('[data-bl-row]').dataset.blRow)];r[k]=k==='name'?el.value:el.value===''?'':Number(el.value);draw(active);});
 document.addEventListener('change',e=>{const el=e.target;if(!el.closest('.beam-load-editor')||!active)return;if(el.dataset.blField==='type'){active.value.rows[Number(el.closest('[data-bl-row]').dataset.blRow)].type=el.value;paint(active);}if(el.hasAttribute('data-bl-self')){active.value.self=el.checked;paint(active);}});
 document.addEventListener('focusin',e=>{const k=e.target.dataset.blField;if(!active||!k||['name','type'].includes(k))return;const row=e.target.closest('[data-bl-row]');if(row){const v=active.value.rows[Number(row.dataset.blRow)][k]??'';if(e.target.value!==String(v)){e.target.value=v;e.target.select();}}});
 document.addEventListener('focusout',e=>{const k=e.target.dataset.blField;if(!active||!k||['name','type'].includes(k))return;const row=e.target.closest('[data-bl-row]');if(row)e.target.value=active.value.rows[Number(row.dataset.blRow)][k]??'';});
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b?.closest('.beam-load-editor')||!active)return;const d=active;if(b.dataset.blMode){d.value.mode=b.dataset.blMode;paint(d);}if(b.hasAttribute('data-bl-add')){d.value.rows.push({name:'新荷载',type:'line',dl:0,ll:0,a:0,b:d.L});paint(d);}if(b.dataset.blDelete!==undefined){d.value.rows.splice(Number(b.dataset.blDelete),1);paint(d);}if(b.hasAttribute('data-bl-calc'))calculate(d);});

 document.addEventListener('pointermove',e=>{const svg=e.target.closest?.('[data-plot207]');if(!svg||!active)return;const box=svg.getBoundingClientRect(),x=(e.clientX-box.left)*svg.viewBox.baseVal.width/box.width,a=Number(svg.dataset.left),b=Number(svg.dataset.right);inspect207(active,svg.closest('.beam-load-editor'),(x-a)/(b-a)*active.L,true);});
 return {deflectionResult214,beamResult214,auditStatus214,combinations214,defaultCombinations214,combinationKey214,criterion212,auditStatus212,summary211,diagram207,deflection210,elastic210,material210,render,read,orientation,displayRows,clear(){drafts.clear();active=null;observer?.disconnect();}};
})();
