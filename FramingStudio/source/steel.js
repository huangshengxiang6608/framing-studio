/* Scheme 2. V094 composite section method; equal-spacing sums support any non-negative integer count. */
const Steel=(()=>{
 const finite=v=>typeof v==='number'&&Number.isFinite(v),nonneg=v=>finite(v)&&v>=0;
 const defaults={E:205000,limit1:360,limit2:360,limit3:180,grade:'S355',fcu:60,py:355,wind:1.25};
 function init(p){p.scheme2??={};p.scheme2.bays??=[];p.scheme2.columns??=[];p.scheme2.settings??={};return p.scheme2;}
 function settings(p){return {...defaults,...p.scheme2?.settings};}
 function count(v){return Number.isSafeInteger(v)&&v>=0;}
 function coefficient(n){const k=Math.floor(n/2),s=n+1,a=k*(k+1)/2;return (3*a/s-4*a*a/(s*s*s))/24+(n%2)/48;}
 function capacity(s,V,grade='S355'){
  const t=Math.max(s.F,s.G),tier=t<=16?0:t<=40?1:t<=63?2:t<=80?3:t<=100?4:t<=150?5:-1;
  const py=SteelCatalog.grades[grade]?.[tier];if(!finite(py)||py<=0)return null;
  const e=Math.sqrt(275/py),ft=s.J<=8*e?8:s.J<=9*e?9:13,wt=s.K<=80*e?80:s.K<=100*e?100:120;
  const Av=s.F*s.D,Vc=py*Av/Math.sqrt(3)/1000,rho=V<=.6*Vc?0:(2*V/Vc-1)**2,sv=(s.F/10)*(s.D/10)**2/4;
  if(V>Vc||s.J>13*e||s.K>120*e)return null;
  const elastic=ft===13||wt===120,mod=V<=.6*Vc?(elastic?s.U:Math.min(s.W,1.2*s.U)):(elastic?s.U-rho*sv/1.5:Math.min(s.W-rho*sv,1.2*(s.U-rho*sv/1.5)));
  return {M:mod*py/1000,I:s.Q,Vc,py,rho,flange:ft,web:wt};
 }
 function choose(member,M,I,V,grade){
  const candidates=SteelCatalog.sections.map(s=>{const cap=capacity(s,V,grade);return cap&&cap.M>0&&cap.I>0?{section:s.B,family:s.family,weight:s.C,area:s.AC*100,...cap,mUtil:M/cap.M,iUtil:I/cap.I,row:s.row}:null;}).filter(x=>x&&x.mUtil>=0&&x.iUtil>=0&&x.mUtil<=.95&&x.iUtil<=.95);
  const uc=candidates.filter(x=>x.family==='UC'),eligible=uc.length?uc:member==='SB1'?candidates.filter(x=>x.family==='UB'):[];
  return eligible.sort((a,b)=>a.weight-b.weight||a.row-b.row)[0]||null;
 }
 function calculate(v){
  const e=[];for(const k of ['x1','y','E','limit1','limit2','limit3'])if(!finite(v[k])||v[k]<=0)e.push(k+' 须大于 0');
  if(!count(v.n)||!count(v.nc))e.push('次梁数量须为非负整数');
  if(![0,90].includes(v.angle))e.push('选择横向或纵向');if(!['ss','cantilever'].includes(v.type))e.push('选择布置类型');
  if(!nonneg(v.dl)||!nonneg(v.ll))e.push('公用 DL、SDL、LL 尚未填齐');
  const cant=v.type==='cantilever';if(cant&&(!finite(v.x2)||v.x2<=0))e.push('填写悬挑长度 X2');
  if(e.length)return {ok:false,errors:[...new Set(e)]};
  const n=v.n,nc=v.nc,l1=v.angle===90?v.y:v.x1,l2=v.angle===90?v.x1:v.y,s=l2/(n+1),sc=cant?(v.angle===90?v.x2:v.y)/(nc+1):0;
  const w=1.4*v.dl+1.6*v.ll,k=cant&&v.angle===0&&nc>=1?2:1,boundary=cant&&nc>0?(v.angle===90?(s+sc)/2:sc):0;
  const width=Math.max(s,boundary,cant&&nc>0?sc:0),w1=w*width,q1=v.ll*width,P=w*s*l1/2*k,Q=v.ll*s*l1/2*k;
  const M1=w1*l1*l1/8,V1=w1*l1/2,Imin1=5/384*q1*l1**3*v.limit1*1e5/v.E;
  const M2=P*l2*Math.floor((n+1)**2/4)/(2*(n+1)),V2=n*P/2,Imin2=coefficient(n)*Q*l2*l2*v.limit2*1e5/v.E;
  const rows=[{id:'SB1',L:l1,Mmax:M1,V:V1,Imin:Imin1,w:w1,q:q1,width,n:0,P:0,Q:0},{id:'SB2',L:l2,Mmax:M2,V:V2,Imin:Imin2,w:0,q:0,n,P,Q}];
  let w3=0,q3=0,P3=0,Q3=0,Pe=0,Qe=0;
  if(cant){w3=nc===0?w*v.y/2:v.angle===0?w*sc:0;q3=nc===0?v.ll*v.y/2:v.angle===0?v.ll*sc:0;
   P3=v.angle===90&&nc>0?w*sc*l1/2:0;Q3=v.angle===90&&nc>0?v.ll*sc*l1/2:0;
   Pe=nc===0?0:v.angle===90?w*(sc/2)*v.y/2:nc*w*sc*v.x2/4;Qe=nc===0?0:v.angle===90?v.ll*(sc/2)*v.y/2:nc*v.ll*sc*v.x2/4;
   const L=v.x2,points=v.angle===90?nc:0,M=P3*points*L/2+w3*L*L/2+Pe*L,V=P3*points+w3*L+Pe;
   const imin=(q3*L**3/8+Q3*L*L*points*(3*points+2)/(24*(points+1))+Qe*L*L/3)*v.limit3*1e5/v.E;
   rows.push({id:'CSB3',L,Mmax:M,V,Imin:imin,w:w3,q:q3,n:points,P:P3,Q:Q3,Pe,Qe});
  }
  for(const r of rows){r.Mreq=r.Mmax/1.6;r.Ireq=r.Imin/2.8;r.selected=choose(r.id,r.Mreq,r.Ireq,r.V,v.grade);r.status=r.selected?'OK':'No match';}
  const cells={B4:v.x1,E4:v.y,H4:v.angle,B6:n,H6:nc,B7:v.dl,B8:v.ll,D11:s,D13:w*s,B26:l1,N26:w1,O26:M1,P26:q1,B27:l2,O27:M2,Q27:n>0?Q:0,D7003:rows[0].Mreq,D7021:Imin1,D7027:rows[0].Ireq,D7043:rows[1].Mreq,D7061:Imin2,D7067:rows[1].Ireq,D7075:coefficient(n),B3511:V1,B4511:V2};
  if(cant)Object.assign(cells,{B28:v.x2,N28:w3,P28:q3,O28:rows[2].Mmax,Q28:Q3,R28:Pe,S28:Qe,O74:rows[2].Imin,O80:rows[2].Ireq,H2064:rows[2].V});
  rows.forEach((r,i)=>{const a=21+i;cells['C'+a]=r.selected?.section||'';cells['S'+a]=r.status;if(r.selected){cells['I'+a]=r.selected.M;cells['M'+a]=r.selected.I;cells['O'+a]=r.selected.mUtil;cells['Q'+a]=r.selected.iUtil;}});
  return {ok:true,errors:[],rows,cells,s,sc,k,input:v};
 }
 const rectArea=r=>(r.x1-r.x0)*(r.y1-r.y0),intersect=(a,b)=>({x0:Math.max(a.x0,b.x0),x1:Math.min(a.x1,b.x1),y0:Math.max(a.y0,b.y0),y1:Math.min(a.y1,b.y1)});
 function rectangle(p,result,item,f=item.floor??item.from){
  if(!item.axisRefs)return item.rect;
  const key=result.floors[f-1]?.type;if(!key)return null;const rect={};
  for(const k of ['x0','x1','y0','y1'])rect[k]=Engine.axes(p,k[0],key).find(a=>a.id===item.axisRefs[k])?.v;
  return Object.values(rect).every(finite)&&rect.x1>rect.x0&&rect.y1>rect.y0?rect:null;
 }
 function shared(p,result,f,rect){
  if(!rect||!Object.values(rect).every(finite)||!(rect.x1>rect.x0&&rect.y1>rect.y0))return {error:'区域轴线已改变，请重新选择有效范围'};
  const model=Engine.floorModel(result,f);if(!model)return {error:'楼层已删除，请重新选择'};
  const values=[],errors=[];let covered=0;
  for(const slab of model.slabs){let area=0;for(const r of slab.rects){const q=intersect(r,rect);if(q.x1>q.x0&&q.y1>q.y0)area+=rectArea(q);}if(!area)continue;
   const load=LoadData.effective(p,f,Loading.token('SLAB',slab));covered+=area;
   if(load.basis!=='total')errors.push('请先在公用 Loading 确认总 DL');
   if(![load.dl,load.sdl,load.ll].every(nonneg))errors.push('公用 Loading 的 DL、SDL、LL 未填齐');values.push({...load,area});
  }
  if(Math.abs(covered-rectArea(rect))>Math.max(1e-6,rectArea(rect)*1e-7))errors.push('所选区域包含 Opening 或不在建筑范围内');
  if(!values.length)errors.push('区域没有有效 Loading');
  const stamps=new Set(values.map(v=>JSON.stringify([v.dl,v.sdl,v.ll])));if(stamps.size>1)errors.push('该区域有不同荷载，请按公用 Loading 分成独立计算区域');
  return errors.length?{error:[...new Set(errors)].join('；')}:{...values[0],area:covered};
 }
 function bay(p,result,b){const rect=rectangle(p,result,b),load=shared(p,result,b.floor,rect);if(load.error)return {ok:false,errors:[load.error]};return calculate({...settings(p),...b,rect,x1:rect.x1-rect.x0,y:rect.y1-rect.y0,dl:load.dl+load.sdl,ll:load.ll,loading:load});}
 function column(p,result,c){
  const errors=[],s=settings(p),section=SteelCatalog.sections.find(x=>x.family==='UC'&&x.B===c.section);
  if(!nonneg(c.b)||c.b<=0||!nonneg(c.d)||c.d<=0)errors.push('填写组合柱 B、D');if(!section)errors.push('选择 UC 截面');
  if(!Number.isInteger(c.from)||!Number.isInteger(c.to)||c.from<1||c.to<c.from||c.to>p.total)errors.push('选择有效楼层范围');
  if(!c.rect||rectArea(c.rect)<=0)errors.push('选择受荷范围');for(const k of ['fcu','py','wind'])if(!(finite(s[k])&&s[k]>0))errors.push(k+' 须大于 0');
  if(section&&(c.b<section.E||c.d<section.D))errors.push('混凝土截面放不下所选 UC 截面');
  if(errors.length)return {ok:false,errors};
  const rows=[];for(let f=c.from;f<=c.to;f++){const rect=rectangle(p,result,c,f),l=shared(p,result,f,rect);if(l.error){errors.push(FloorLevels.name(p,f)+'：'+l.error);continue;}rows.push({floor:FloorLevels.name(p,f),usage:l.usage,dl:l.dl,sdl:l.sdl,ll:l.ll,b:rect.x1-rect.x0,d:rect.y1-rect.y0,area:l.area,stories:1,load:l.area*(1.4*(l.dl+l.sdl)+1.6*l.ll)*s.wind});}
  if(errors.length)return {ok:false,errors};const A=section.AC*100,Ac=c.b*c.d-A,Pcp=(A*s.py+.45*Ac*s.fcu)/1000,N=rows.reduce((a,r)=>a+r.load,0),ratio=A*s.py/(Pcp*1000);
  return {ok:true,errors:[],rows,A,Ac,Pcp,N,ratio,status:Pcp>N&&ratio>=.2&&ratio<=.9?'Column design OK':'Column design Not OK',capacityOK:Pcp>N,ratioOK:ratio>=.2&&ratio<=.9};
 }
 function jobs(p,result){const batches=[],issues=[];for(const b of p.scheme2?.bays||[]){if(b.report===false)continue;const r=bay(p,result,b);if(!r.ok){issues.push({id:b.name,reason:r.errors.join('；')});continue;}batches.push({type:'Steel',label:'Scheme 2 · '+b.name,section:'A',reportScope:'beam',beam:r.input,expected:{'Steel Beam Design':r.cells}});}
  for(const c of p.scheme2?.columns||[]){if(c.report===false)continue;const r=column(p,result,c);if(!r.ok){issues.push({id:c.name,reason:r.errors.join('；')});continue;}batches.push({type:'Steel',label:'Scheme 2 · '+c.name,section:'A',reportScope:'column',column:{...c,...settings(p),rows:r.rows},expected:{'column design':{B27:r.A,B28:r.Ac,B29:r.Pcp,B31:r.ratio,J24:r.N,D29:r.capacityOK?'OK':'Not OK'}}});}
  return {batches,issues};
 }
 return {init,defaults,settings,coefficient,capacity,choose,calculate,rectangle,shared,bay,column,jobs};
})();
if(typeof module!=='undefined')module.exports=Steel;
