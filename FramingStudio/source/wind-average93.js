// One authoritative equivalent-uniform summary for Wind Load Check and Deflection.
window.WindAverage93=(()=>{
 const finite=Number.isFinite,EPS=1e-7;
 function summarize(layers,height){
  if(!finite(height)||height<=0)throw Error('受风高度须大于 0');
  if(!layers.length)throw Error('缺少受风层段');
  let end=0,area=0,force=0;
  for(const l of layers){if(!['a','b','q','breadth'].every(k=>finite(l[k]))||l.b<=l.a||l.q<0||l.breadth<=0)throw Error('层段高度、风压或宽度未完成');if(Math.abs(l.a-end)>EPS)throw Error('受风层段存在缺口或重叠');end=l.b;const A=(l.b-l.a)*l.breadth;area+=A;force+=l.q*A;}
  if(Math.abs(end-height)>1e-3)throw Error('受风层段高度合计须等于楼顶减受风面底');
  return {height,area,force,q:force/area,breadth:area/height,w:force/height,layers};
 }
 function fromInput(n,face){try{
  if(!finite(n?.leftEL)||!finite(n?.height))throw Error('请填写受风面底与楼顶标高');
  if(n._auto?.windError)throw Error(n._auto.windError);
  const height=n.height-n.leftEL,m=Overall.machine(n,face),sheet=Overall.roles[1],layers=[];
  if(n.mode==='UNIFORM')layers.push({id:'Uniform',a:0,b:height,q:m.safe(sheet,'B36'),breadth:n.breadth});
  else if(n.mode==='LAYERED')for(let i=0;i<100;i++){if(n['layerH'+i]==null&&n['layerB'+i]==null)continue;const r=i+24;if(m.safe(sheet,'BO'+r)!=='OK')throw Error('第 '+(i+1)+' 段风荷载未完成');layers.push({id:n._auto?.layers?.[i]?.name||'Wind '+(i+1),a:m.safe(sheet,'BG'+r),b:m.safe(sheet,'BH'+r),q:m.safe(sheet,'BK'+r),breadth:n['layerB'+i]});}
  else throw Error('请选择风压计算模式');
  return {ok:true,face,mode:n.mode,base:n.leftEL,roof:n.height,...summarize(layers,height),errors:[]};
 }catch(e){return {ok:false,face,q:null,breadth:null,w:null,area:null,force:null,height:null,layers:[],errors:[e.message]};}}
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=x=>finite(x)?Overall.format(x,'0.000'):'—';
 function render(n,face,detail=true){const a=fromInput(n,face);return `<section class="wind-average93" data-wind-average="${face}"><h3>${face} 面 · 平均风压 → Deflection</h3>${a.ok?`<div class="wind-average-metrics">${[['平均风压',a.q,'kPa','q'],['受风面积',a.area,'m²','area'],['总风力',a.force,'kN','force'],['等效宽度',a.breadth,'m','breadth'],['等效线荷载',a.w,'kN/m','w']].map(([s,v,u,k])=>`<label>${s}<output data-wind-result="${k}">${fmt(v)} ${u}</output></label>`).join('')}</div>`:`<p class="notice">${esc(a.errors.join('；'))}</p>`}${detail?`<details><summary>平均风压公式与逐层明细</summary><p>p平均 = Σ(pᵢBᵢhᵢ) / Σ(Bᵢhᵢ)；B等效 = Σ(Bᵢhᵢ) / H；w等效 = ΣFᵢ / H。</p><p>面积加权，非逐层风压的算术平均。Deflection 自动读取同面结果。</p>${a.ok?`<div class="wind-average-table"><table><tr><th>层段</th><th>pᵢ kPa</th><th>Bᵢ m</th><th>hᵢ m</th><th>面积 m²</th><th>Fᵢ kN</th></tr>${a.layers.map(l=>`<tr><td>${esc(l.id)}</td><td>${fmt(l.q)}</td><td>${fmt(l.breadth)}</td><td>${fmt(l.b-l.a)}</td><td>${fmt(l.breadth*(l.b-l.a))}</td><td>${fmt(l.q*l.breadth*(l.b-l.a))}</td></tr>`).join('')}</table></div>`:''}<p>此等效均布荷载用于指定轴挠度估算；Overall 的风力矩仍按原逐层力臂求和。</p></details>`:''}</section>`;}
 return {summarize,fromInput,render};
})();
