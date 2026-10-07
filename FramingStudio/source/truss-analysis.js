// Force-solution audit independent of the stiffness assembly and displacement solve.
// Method of joints is applicable to the determinate triangulated mesh used here.
const TrussAnalysis122=(()=>{
 const cache=new WeakMap(),sum=a=>a.reduce((x,y)=>x+y,0),maxAbs=a=>Math.max(0,...a.map(Math.abs));
 const fmt=(x,d=3)=>Math.abs(x)<.5*10**(-d)?(0).toFixed(d):x.toFixed(d);
 function joints(c,a){
  const left=c.nodes[0],right=c.nodes[c.count-1],span=right.x-left.x;
  const px=sum(c.nodes.map((n,i)=>a.P[2*i])),py=sum(c.nodes.map((n,i)=>a.P[2*i+1]));
  const moment=sum(c.nodes.map((n,i)=>(n.x-left.x)*a.P[2*i+1]-(n.y-left.y)*a.P[2*i]));
  const R=[-px,-py+moment/span,-moment/span],external=c.nodes.map((n,i)=>[a.P[2*i],a.P[2*i+1]]);
  c.fixed.forEach((d,i)=>external[Math.floor(d/2)][d%2]+=R[i]);
  const N=Array(c.members.length).fill(null),steps=[],scale=Math.max(1,maxAbs(a.P),maxAbs(R));
  const incident=c.nodes.map((node,i)=>c.members.flatMap((m,j)=>m.i===i||m.j===i?[{j,id:m.id,x:(m.i===i?1:-1)*m.c,y:(m.i===i?1:-1)*m.s}]:[]));
  for(let pass=0;pass<c.members.length&&N.some(n=>n===null);pass++){
   let progressed=false;
   for(let i=0;i<c.nodes.length;i++){
    const unknown=incident[i].filter(m=>N[m.j]===null);if(!unknown.length||unknown.length>2)continue;
    const known=incident[i].filter(m=>N[m.j]!==null).map(m=>({...m,N:N[m.j]}));
    const fx=external[i][0]+sum(known.map(m=>m.N*m.x)),fy=external[i][1]+sum(known.map(m=>m.N*m.y));
    let answers;
    if(unknown.length===1){const m=unknown[0];answers=[Math.abs(m.x)>=Math.abs(m.y)?-fx/m.x:-fy/m.y];}
    else{const [u,v]=unknown,det=u.x*v.y-v.x*u.y;if(Math.abs(det)<1e-10)continue;answers=[(-fx*v.y+v.x*fy)/det,(-u.x*fy+fx*u.y)/det];}
    if(Math.abs(fx+sum(unknown.map((m,j)=>m.x*answers[j])))>scale*1e-7||Math.abs(fy+sum(unknown.map((m,j)=>m.y*answers[j])))>scale*1e-7)throw Error('节点 '+c.nodes[i].id+' 的独立平衡解不成立');
    unknown.forEach((m,j)=>N[m.j]=answers[j]);
    steps.push({node:c.nodes[i].id,external:external[i],known,unknown:unknown.map((m,j)=>({...m,N:answers[j]})),rhs:[-fx,-fy]});progressed=true;
   }
   if(!progressed)break;
  }
  if(N.some(n=>n===null))throw Error('节点法未能求完全部杆件，请核对桁架拓扑');
  const residuals=incident.map((members,i)=>({node:c.nodes[i].id,x:external[i][0]+sum(members.map(m=>m.x*N[m.j])),y:external[i][1]+sum(members.map(m=>m.y*N[m.j]))}));
  const difference=maxAbs(N.map((n,i)=>n-a.N[i])),reactionDifference=maxAbs(R.map((v,i)=>v-a.R[i])),residual=maxAbs(residuals.flatMap(n=>[n.x,n.y]));
  if(Math.max(difference,reactionDifference,residual)>scale*1e-6)throw Error('节点法与刚度法不一致，不能输出已核对的内力');
  return {N,R,px,py,moment,steps,residuals,difference,reactionDifference,residual};
 }
 function combine(c,factors,id,label){
  const collect=key=>c.cases[0][key].map((v,i)=>sum(c.cases.map((a,k)=>a[key][i]*factors[k])));
  return {id,label,factors,P:collect('P'),U:collect('U'),N:collect('N'),R:collect('R')};
 }
 function build(c){
  if(cache.has(c))return cache.get(c);
  const cases=[
   {id:'G',label:'G · 全部恒载',...c.dead},
   {id:'Q',label:'Q · 全部活载',...c.live},
   {id:'SLS',label:'G + Q · 全加载使用状态',...c.sls},
   combine(c,c.cases.map(a=>a.kind==='G'?1.4:1.6),'ULS','1.4G + 1.6Q · 全加载 ULS'),
   ...c.cases.map((a,i)=>({...a,id:'CASE'+i,label:a.id}))
  ];
  for(const a of cases)a.audit=joints(c,a);
  const forceRows=c.members.map((m,i)=>({id:m.id,group:m.group,L:m.L,c:m.c,s:m.s,G:c.dead.N[i],Q:c.live.N[i],ULS:cases[3].N[i],min:m.env.min,max:m.env.max,minFactors:m.env.minFactors,maxFactors:m.env.maxFactors}));
  const result={cases,forceRows,dofs:c.free.map(d=>c.nodes[Math.floor(d/2)].id+'.'+(d%2?'uy':'ux')),maxDifference:Math.max(...cases.map(a=>a.audit.difference)),maxResidual:Math.max(...cases.map(a=>a.audit.residual))};
  cache.set(c,result);return result;
 }
 function equations(step){
  const axis=k=>step.unknown.map(m=>fmt(m[k],6)+' N('+m.id+')').join(' + ')+' = '+fmt(step.rhs[k==='x'?0:1]);
  return ['ΣFx: '+axis('x'),'ΣFy: '+axis('y'),...step.unknown.map(m=>'N('+m.id+') = '+fmt(m.N)+' kN '+(Math.abs(m.N)<1e-7?'(zero)':m.N>0?'(T)':'(C)'))];
 }
 function reactionLines(c,a){const q=a.audit;return [
  'ΣFx = 0: Rx,L = −ΣPx = '+fmt(q.R[0])+' kN.',
  'ΣM,L = 0: Ry,R = −Σ(x Py − y Px) / L = −('+fmt(q.moment)+') / '+fmt(c.input.span)+' = '+fmt(q.R[2])+' kN.',
  'ΣFy = 0: Ry,L = −ΣPy − Ry,R = −('+fmt(q.py)+') − '+fmt(q.R[2])+' = '+fmt(q.R[1])+' kN.'
 ];}
 function elementLines(c,a){const m=c.members.find(m=>m.group==='diagonal')||c.members[0],i=c.members.indexOf(m),extension=m.c*(a.U[2*m.j]-a.U[2*m.i])+m.s*(a.U[2*m.j+1]-a.U[2*m.i+1]);return [
  m.id+': L = '+fmt(m.L,6)+' m; c = '+fmt(m.c,6)+'; s = '+fmt(m.s,6)+'; A = '+fmt(m.section.A,0)+' mm².',
  'EA/L = 205000 × '+fmt(m.section.A,0)+' / (1000 × '+fmt(m.L,6)+') = '+fmt(m.k)+' kN/m.',
  'v = [−c, −s, c, s]; k_e = (EA/L) vᵀv; assemble Kff uf = Pf ('+c.free.length+' free DOF).',
  'ΔL = c(ux,j − ux,i) + s(uy,j − uy,i) = '+extension.toExponential(6)+' m.',
  'N = (EA/L) ΔL = '+fmt(a.N[i])+' kN; + tension / − compression.'
 ];}
 return {build,joints,combine,equations,reactionLines,elementLines,fmt};
})();
if(typeof module!=='undefined')module.exports=TrussAnalysis122;
