/* E2.109: planar, pin-jointed, parallel-chord transfer truss. kN / m / MPa.
   The pure solver is independent of the framing model, UI and Excel.
   HK Steel 2011 (2023 edition), April 2026 amendments: 3.1.2, 4.3, 7, 8.6,
   8.7 and Appendix 8.4. Joint/anchorage, fire and whole-truss torsion excluded. */
const TransferTruss109=(()=>{
 'use strict';
 const catalog=typeof TrussCatalog109!=='undefined'?TrussCatalog109:require('./truss-catalog.js');
 const E=205000,gravity=9.80665,groups=['top','bottom','diagonal','vertical'],eps=1e-8;
 const finite=x=>typeof x==='number'&&Number.isFinite(x),positive=x=>finite(x)&&x>0;
 const unique=a=>[...new Set(a)],sum=a=>a.reduce((s,x)=>s+x,0),zeros=n=>Array(n).fill(0);
 const section=id=>catalog.sections.find(s=>s.id===id);
 function py(t){if(!positive(t))throw Error('Invalid section thickness');return t<=16?460:t<=40?440:t<=63?430:t<=80?410:t<=100?400:null;}
 function pc(strength,slenderness,curve){if(!positive(strength)||!finite(slenderness)||slenderness<0)throw Error('Invalid buckling input');if(slenderness<1e-8)return strength;const alpha={a0:1.8,a:2,b:3.5,c:5.5,d:8}[curve];if(!alpha)throw Error('Invalid buckling curve');const pe=Math.PI**2*E/slenderness**2,l0=.2*Math.sqrt(Math.PI**2*E/strength),eta=Math.max(0,alpha*(slenderness-l0)/1000),phi=(strength+(1+eta)*pe)/2;return Math.min(strength,strength*pe/(phi+Math.sqrt(Math.max(0,phi*phi-strength*pe))));}
 function capacity(s,lx,ly){const strength=py(Math.max(s.tf,s.tw));if(!strength)throw Error('S460 厚度超出本工具 100 mm 范围');const epsilon=Math.sqrt(275/strength),flange=s.B/2/s.tf,web=s.d/s.tw,nonSlender=flange<=13*epsilon+eps&&web<=40*epsilon+eps;
  // B/2 is conservative for rolled flange outstands; d is clear between fillets.
  const curves=s.family==='UB'?(s.tf<=40?['a','b']:['b','c']):(s.tf<=40?['b','c']:['c','d']);
  const lambdaX=lx*1000/s.rx,lambdaY=ly*1000/s.ry,pcX=pc(strength,lambdaX,curves[0]),pcY=pc(strength,lambdaY,curves[1]);
  return {py:strength,epsilon,flange,web,nonSlender,curves,lambdaX,lambdaY,pcX,pcY,Pt:s.A*strength/1000,Pc:s.A*Math.min(pcX,pcY)/1000,lx,ly};
 }
 function cholesky(K){const n=K.length,L=Array.from({length:n},()=>zeros(n)),scale=Math.max(...K.map((r,i)=>Math.abs(r[i])));if(!positive(scale))throw Error('桁架刚度为零');for(let i=0;i<n;i++)for(let j=0;j<=i;j++){let x=K[i][j];for(let k=0;k<j;k++)x-=L[i][k]*L[j][k];if(i===j){if(x<scale*1e-12)throw Error('桁架机构／刚度奇异，请检查杆件和支承');L[i][j]=Math.sqrt(x);}else L[i][j]=x/L[j][j];}return L;}
 function backsolve(L,P){const n=P.length,y=zeros(n),x=zeros(n);for(let i=0;i<n;i++){let a=P[i];for(let j=0;j<i;j++)a-=L[i][j]*y[j];y[i]=a/L[i][i];}for(let i=n-1;i>=0;i--){let a=y[i];for(let j=i+1;j<n;j++)a-=L[j][i]*x[j];x[i]=a/L[i][i];}return x;}
 function mesh(input){const {span:L,depth:h}=input;if(!positive(L)||!positive(h))throw Error('跨度、弦杆标高差须大于 0');const n=input.panels??4;if(!Number.isInteger(n)||n<2||n>12)throw Error('分格数须为 2–12');if(!Array.isArray(input.loads)||!input.loads.length||input.loads.length>12)throw Error('须指定 1–12 根上层受托柱');
  for(const a of input.loads)if(!finite(a.x)||a.x<-eps||a.x>L+eps||!finite(a.g)||a.g<0||!finite(a.q)||a.q<0)throw Error('柱的特征荷载 G/Q 或位置无效');
  const xs=unique([...Array.from({length:n+1},(_,i)=>L*i/n),...input.loads.map(a=>Math.max(0,Math.min(L,a.x)))].map(x=>Math.round(x*1e7)/1e7)).sort((a,b)=>a-b);
  if(xs.some((x,i)=>i&&x-xs[i-1]<.15))throw Error('节点相距小于 150 mm，请调整分格或柱位');
  const nodes=[...xs.map((x,i)=>({id:'B'+i,x,y:0})),...xs.map((x,i)=>({id:'T'+i,x,y:h}))],count=xs.length,members=[];
  function add(group,i,j){members.push({id:({top:'TC',bottom:'BC',diagonal:'D',vertical:'V'}[group])+(members.filter(m=>m.group===group).length+1),group,i,j});}
  for(let i=0;i<count-1;i++){add('bottom',i,i+1);add('top',i+count,i+1+count);add('diagonal',xs[i]+xs[i+1]<=L?i+count:i,xs[i]+xs[i+1]<=L?i+1:i+1+count);}
  for(let i=0;i<count;i++)add('vertical',i,i+count);
  for(const m of members){const dx=nodes[m.j].x-nodes[m.i].x,dy=nodes[m.j].y-nodes[m.i].y;m.L=Math.hypot(dx,dy);m.c=dx/m.L;m.s=dy/m.L;m.dofs=[2*m.i,2*m.i+1,2*m.j,2*m.j+1];m.v=[-m.c,-m.s,m.c,m.s];}
  return {nodes,members,xs,count,fixed:[0,1,2*(count-1)+1],loadNodes:input.loads.map(a=>count+xs.findIndex(x=>Math.abs(x-a.x)<1e-6))};
 }
 function lengths(m,input){const chord=['top','bottom'].includes(m.group),requested=input.restraints?.[m.group],ly=chord?(positive(requested)?requested:input.span):m.L;if(chord&&(ly<m.L-eps||ly>input.span+eps))throw Error('弦杆平面外无支承长度须不小于最长分格，且不大于跨度');return [m.L,ly];}
 // Structural depth is the outside envelope, not the distance between chord axes.
 // Include the vertical projection of diagonal sections where it exceeds a chord.
 function fitGeometry(input,chosen){
  if(input.structuralDepth===undefined)return input;
  const H=input.structuralDepth,top=section(chosen.top),bottom=section(chosen.bottom),diagonal=section(chosen.diagonal);
  if(!positive(H)||!top||!bottom||!diagonal)throw Error('同层桁架须有有效 Structural depth 及上下弦／腹杆截面');
  let topInset=top.D/2000,bottomInset=bottom.D/2000,h=H-topInset-bottomInset;
  if(h<=eps)throw Error('上下弦截面无法放入指定 Structural depth');
  const model=mesh({...input,depth:h}),runs=model.members.filter(m=>m.group==='diagonal').map(m=>Math.abs(model.nodes[m.j].x-model.nodes[m.i].x));
  for(let i=0;i<100;i++){
   const webInset=Math.max(0,...runs.map(dx=>diagonal.D/2000*dx/Math.hypot(dx,h)));
   topInset=Math.max(top.D/2000,webInset);bottomInset=Math.max(bottom.D/2000,webInset);
   const next=H-topInset-bottomInset;
   if(next<=eps)throw Error('弦杆／腹杆截面外包无法放入指定 Structural depth');
   if(Math.abs(next-h)<1e-10)return {...input,depth:next,structuralEnvelope:{depth:H,topInset,bottomInset}};
   h=next;
  }
  throw Error('Structural zone 内的杆件外包高度未收敛，请调整截面或结构高度');
 }
 function analyse(input,chosen){input=fitGeometry(input,chosen);const model=mesh(input),{nodes,members,fixed,loadNodes}=model,nd=nodes.length*2,free=Array.from({length:nd},(_,i)=>i).filter(i=>!fixed.includes(i)),K=Array.from({length:nd},()=>zeros(nd)),self=zeros(nd),joint=zeros(nd);
  for(const m of members){m.section=section(chosen[m.group]);if(!m.section)throw Error('截面不存在：'+chosen[m.group]);m.k=E*m.section.A/1000/m.L;m.weight=m.L*m.section.mass*gravity/1000;m.capacity=capacity(m.section,...lengths(m,input));for(let i=0;i<4;i++)for(let j=0;j<4;j++)K[m.dofs[i]][m.dofs[j]]+=m.k*m.v[i]*m.v[j];self[2*m.i+1]-=m.weight/2;self[2*m.j+1]-=m.weight/2;}
  const volumes=input.jointVolumes??{};for(const v of Object.values(volumes))if(!finite(v)||v<0)throw Error('接驳区新增混凝土体积须明确填 0 或正值');
  joint[1]-=(volumes.left??0)*24.5;joint[2*(model.count-1)+1]-=(volumes.right??0)*24.5;input.loads.forEach((a,i)=>joint[2*loadNodes[i]+1]-=(volumes[a.id]??0)*24.5);
  const Kff=free.map(i=>free.map(j=>K[i][j])),C=cholesky(Kff);
  function solve(P){const U=zeros(nd),v=backsolve(C,free.map(i=>P[i]));free.forEach((d,i)=>U[d]=v[i]);const N=members.map(m=>m.k*sum(m.v.map((v,i)=>v*U[m.dofs[i]]))),R=fixed.map(d=>sum(K[d].map((v,i)=>v*U[i]))-P[d]);return {P,U,N,R};}
  const cases=[{id:'Steel self-weight',kind:'G',...solve(self)},{id:'Joint concrete (additional)',kind:'G',...solve(joint)}];
  input.loads.forEach((a,i)=>{for(const [kind,key]of [['G','g'],['Q','q']]){const P=zeros(nd);P[2*loadNodes[i]+1]=-a[key];cases.push({id:a.id+' '+kind,kind,...solve(P)});}});
  const total=key=>solve(cases.filter(x=>key.includes(x.kind)).reduce((P,x)=>P.map((v,i)=>v+x.P[i]),zeros(nd))),dead=total('G'),live=total('Q'),sls=total('GQ');
  // Independent variable actions; each G component is adverse 1.4 / beneficial 1.0.
  function envelope(field,i){let min=0,max=0;const minFactors=[],maxFactors=[];for(const a of cases){const v=a[field][i],low=a.kind==='G'?1:0,high=a.kind==='G'?1.4:1.6;const fmin=v<0?high:low,fmax=v>0?high:low;min+=v*fmin;max+=v*fmax;minFactors.push(fmin);maxFactors.push(fmax);}return {min,max,minFactors,maxFactors};}
  const checks=members.map((m,i)=>{const env=envelope('N',i),Nc=Math.max(0,-env.min),Nt=Math.max(0,env.max),c=m.capacity,lambda=Math.max(c.lambdaX,c.lambdaY),fail=[];if(Nc>eps&&!c.nonSlender)fail.push('Class 4 压杆不支持');if(Nc>eps&&lambda>200+eps)fail.push('压杆长细比 > 200');if(Nt>eps&&lambda>300+eps)fail.push('拉杆长细比 > 300');const util=Math.max(Nc/c.Pc,Nt/c.Pt);if(util>1+1e-7)fail.push('轴力承载力不足');return {...m,env,Nc,Nt,util,fail,ok:!fail.length};});
  // Compression-only geometric stiffness at ten times the worst compression
  // envelope is a conservative in-plane first-order screening, not a 3D check.
  const K10=K.map(r=>r.slice());for(const m of checks){const v=[m.s,-m.c,-m.s,m.c],k=-10*m.Nc/m.L;for(let i=0;i<4;i++)for(let j=0;j<4;j++)K10[m.dofs[i]][m.dofs[j]]+=k*v[i]*v[j];}
  let stable=true;try{cholesky(free.map(i=>free.map(j=>K10[i][j])));}catch{stable=false;}
  const vertical=nodes.map((n,i)=>({node:n.id,total:-sls.U[2*i+1]*1000,live:-live.U[2*i+1]*1000})),maxTotal=Math.max(...vertical.map(x=>Math.abs(x.total))),maxLive=Math.max(...vertical.map(x=>Math.abs(x.live)));
  // SLS pattern envelope, including differential movement of the supported columns.
  function slsEnvelope(coeff){let g=0,lo=0,hi=0;for(const a of cases){const x=sum(coeff.map(([i,c])=>a.U[i]*c))*1000;if(a.kind==='G')g+=x;else{lo+=Math.min(0,x);hi+=Math.max(0,x);}}return {total:Math.max(Math.abs(g+lo),Math.abs(g+hi)),live:Math.max(Math.abs(lo),Math.abs(hi))};}
  const deflection=nodes.map((n,i)=>slsEnvelope([[2*i+1,1]]));let differential=0;for(let i=0;i<loadNodes.length;i++)for(let j=0;j<i;j++)differential=Math.max(differential,slsEnvelope([[2*loadNodes[i]+1,1],[2*loadNodes[j]+1,-1]]).total);
  const slsTotal=Math.max(...deflection.map(d=>d.total)),slsLive=Math.max(...deflection.map(d=>d.live)),errors=[];
  for(const key of ['total','live','differential'])if(!positive(input.limits?.[key]))errors.push('请填写 '+key+' 项目位移限值（mm）');
  if(slsTotal>input.limits?.total+eps)errors.push('G+Q 挠度包络超限');if(slsLive>input.limits?.live+eps)errors.push('Q 增量挠度包络超限');if(differential>input.limits?.differential+eps)errors.push('受托柱差异位移超限');
  if(!stable)errors.push('平面内 10 倍压轴力几何刚度筛查未通过；需二阶／整体稳定分析');if(!input.bracingConfirmed)errors.push('待确认上下弦及腹杆节点的平面外侧向支承布置');
  const reactions={dead:[dead.R[1],dead.R[2]],live:[live.R[1],live.R[2]],uls:[envelope('R',1),envelope('R',2)]},totalG=-sum(dead.P),totalQ=-sum(live.P),moment=sum(nodes.map((n,i)=>-(dead.P[2*i+1]+live.P[2*i+1])*n.x)),forceResidual=sum(reactions.dead)+sum(reactions.live)-totalG-totalQ,momentResidual=(reactions.dead[1]+reactions.live[1])*input.span-moment;
  if(Math.abs(forceResidual)>1e-6*Math.max(1,totalG+totalQ)||Math.abs(momentResidual)>1e-6*Math.max(1,Math.abs(moment)))throw Error('桁架平衡校核失败');
  const fail=unique([...errors,...checks.filter(m=>!m.ok).map(m=>m.id+' '+m.fail.join('、'))]);
  return {...model,members:checks,cases,free,Kff,dead,live,sls,vertical,slsEnvelopes:deflection,deflection:{total:slsTotal,live:slsLive,differential,fullLoadTotal:maxTotal,fullLoadLive:maxLive},reactions,totalG,totalQ,steelWeight:-sum(self),concreteWeight:-sum(joint),mass:sum(members.map(m=>m.weight))*1000/gravity,stable,forceResidual,momentResidual,input,chosen:{...chosen},status:fail.length?'NOT OK':'OK',fail};
 }
 function design(input){const selectable=catalog.sections.filter(s=>py(Math.max(s.tw,s.tf))),choices={},auto=groups.filter(g=>!input.sections?.[g]||input.sections[g]==='auto');for(const g of groups)choices[g]=auto.includes(g)?selectable[0].id:input.sections[g];let output,iterations=0;
  function fits(group,s){if(input.structuralDepth===undefined)return true;try{fitGeometry(input,{...choices,[group]:s.id});return true;}catch{return false;}}
  for(;iterations<50;iterations++){output=analyse(input,choices);let changed=false;for(const g of auto){const members=output.members.filter(m=>m.group===g),current=section(choices[g]);const candidates=selectable.filter(s=>s.mass>=current.mass-1e-8);const next=candidates.find(s=>fits(g,s)&&members.every(m=>{const c=capacity(s,...lengths(m,input)),lambda=Math.max(c.lambdaX,c.lambdaY);return (m.Nc<eps||c.nonSlender&&lambda<=200&&m.Nc<=.97*c.Pc)&&(m.Nt<eps||lambda<=300&&m.Nt<=.97*c.Pt);}));if(next&&next.id!==choices[g]){choices[g]=next.id;changed=true;}}
   if(changed)continue;
   const ratio=Math.max(output.deflection.total/(input.limits?.total||Infinity),output.deflection.live/(input.limits?.live||Infinity),output.deflection.differential/(input.limits?.differential||Infinity));
   if(ratio>1.000001||!output.stable){for(const g of auto){const current=section(choices[g]),next=selectable.find(s=>s.A>current.A*Math.min(1.2,Math.max(1.05,ratio))&&s.mass>current.mass&&capacity(s,1,1).nonSlender&&fits(g,s));if(next){choices[g]=next.id;changed=true;}}}
   if(!changed)break;
  }
  output=analyse(input,choices);output.iterations=iterations+1;if(iterations===50){output.status='NOT OK';output.fail.unshift('自动选型未收敛；请手动选定截面后复核');}return output;
 }
 return {E,gravity,groups,catalog,section,py,pc,capacity,cholesky,backsolve,mesh,fitGeometry,analyse,design};
})();
if(typeof module!=='undefined')module.exports=TransferTruss109;
