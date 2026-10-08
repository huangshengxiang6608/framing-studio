// Characteristic DL/LL loads, measured from the member's raw A end in metres.
const BeamLoads=(()=>{
 const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
 // Round characteristic loads once at each receiving beam, never its dimensions.
 function up(n){if(!valid(n))return n;const x=n*100,near=Math.round(x);return (Math.abs(x-near)<=Number.EPSILON*Math.max(1,Math.abs(x))*8?near:Math.ceil(x))/100;}
 // Explicit factored components survive transfer; never factor them a second time.
 const factored=r=>({g:up(r.ug183??(1.4*up(r.g))),q:up(r.uq183??(1.6*up(r.q)))});
 // A complete self-weight equation is factored before its single rounding boundary.
 const selfWeight=raw=>({g:up(raw),q:0,ug183:up(1.4*raw),uq183:0});
 const surface=r=>({sw:selfWeight(r.swUnrounded185??r.sw??0).ug183,dl:up(1.4*up(r.dl||0)),sdl:up(1.4*up(r.sdl||0)),ll:up(1.6*up(r.ll||0))});
 const rounded=r=>({...r,g:up(r.g),q:up(r.q),...(r.ug183!=null?{ug183:up(r.ug183),uq183:up(r.uq183)}:{})});
 function draft(o,L){
  if(Array.isArray(o.beamLoads))return {mode:o.beamLoadMode|| (o.mode==='manual'?'manual':'extra'),self:o.beamSelfWeight===true,rows:o.beamLoads.map(r=>({...r}))};
  const rows=[];
  if(o.mode==='manual')rows.push({name:'原手动总荷载',type:'line',dl:o.udlDead??'',ll:o.udlLive??'',a:0,b:L});
  if(o.extraDead!=null&&o.extraDead!==0)rows.push({name:'原附加恒载',type:'line',dl:o.extraDead,ll:0,a:0,b:L});
  if(o.points!=null&&!Array.isArray(o.points))rows.push({name:'旧集中荷载待修正',type:'point',dl:'',ll:'',a:''});
  for(const r of Array.isArray(o.points)?o.points:[])rows.push({name:r?.label||'集中荷载',type:'point',dl:r?.g??'',ll:r?.q??'',a:r?.x??''});
  return {mode:o.mode==='manual'?'manual':rows.length?'extra':'auto',self:o.mode!=='manual',rows};
 }
 function errors(rows,L){const out=[];rows.forEach((r,i)=>{const prefix='第 '+(i+1)+' 项：';if(!r||!['line','point'].includes(r.type)){out.push(prefix+'请选择荷载类型');return;}if(!['dl','ll','a',...(r.type==='line'?['b']:[])].every(k=>valid(r[k])))out.push(prefix+'请填齐非负数值；无荷载请填 0');else if(r.a>L+1e-6||r.type==='line'&&(r.b>L+1e-6||r.b<=r.a))out.push(prefix+'位置须在 0–'+L.toFixed(3)+' m 内，终点须大于起点');});return out;}
 function resolve(o,L){
  const d=draft(o,L),rows=d.mode==='auto'?[]:d.rows,err=errors(rows,L);
  if(!['auto','extra','manual'].includes(d.mode))err.push('荷载来源无效');
  if(d.mode==='manual'&&!rows.length)err.push('手动模式请至少填写一项荷载（可明确填 0）');
  return {mode:d.mode,selfWeight:d.mode==='manual'&&d.self,errors:err,points:rows.filter(r=>r?.type==='point'&&!errors([r],L).length).map(r=>({x:r.a,g:r.dl,q:r.ll,label:r.name||'手动集中荷载',origin:'manual'})),lines:rows.filter(r=>r?.type==='line'&&!errors([r],L).length).map(r=>({start:r.a,end:r.b,g:r.dl,q:r.ll,label:r.name||'手动线荷载',origin:'manual'}))};
 }
 function pack(d,L){const o={beamLoads:d.rows.map(r=>({...r})),beamLoadMode:d.mode,beamSelfWeight:d.self===true,mode:d.mode==='manual'?'manual':'auto',udlDead:null,udlLive:null,extraDead:0,points:[]},v=resolve(o,L);if(v.errors.length)throw Error(v.errors.join('；'));return o;}
 return {factored,surface,selfWeight,draft,errors,resolve,pack,up,rounded};
})();
